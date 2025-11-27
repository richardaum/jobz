import type { Resume } from "@/entities/resume";
import { JobExtractorFactory } from "@/features/extract-job";
import { clearCachedMatch, matchJobWithResume, type MatchResult, useMatchingStore } from "@/features/match-job";
import { getOpenAIApiKey } from "@/shared/config";
import { logger } from "@/shared/utils/logger";
import { sendTabMessage } from "@/shared/utils/messaging";
import { ensureContentScriptReady } from "@/shared/utils/scripting";

import { MatchingDebugger } from "../utils/MatchingDebugger";

interface UseJobMatchingParams {
  resume: Resume | null;
  setLoading: (loading: boolean) => void;
  setMatchResult: (result: MatchResult | null) => void;
  setError: (error: string | null) => void;
}

import { devtools } from "@/shared/chrome-api";

export function useJobMatching({ resume, setLoading, setMatchResult, setError }: UseJobMatchingParams) {
  const tabId = devtools.getInspectedTabId();
  const { setJob } = useMatchingStore();

  const matchJob = async (skipCache: boolean = false) => {
    if (!resume) {
      setError("Resume not loaded. Please try reloading the extension.");
      return;
    }

    // Get API key from env
    const apiKey = await getOpenAIApiKey();

    setLoading(true);
    setError(null);
    setMatchResult(null);

    const debug = new MatchingDebugger(resume);

    try {
      logger.info("[Job Matching] Starting job match");

      // Get current tab URL from inspected window
      const url = await devtools.getInspectedUrl();
      if (devtools.isRestrictedUrl(url)) {
        throw new Error("Content scripts cannot run on this page. Please navigate to a regular webpage.");
      }

      logger.info(`[Job Matching] Got inspected tab, Tab ID: ${tabId}`);

      // Ensure content script is ready
      const injectStart = Date.now();
      const injectError = await ensureContentScriptReady(tabId);
      if (injectError) {
        logger.error(`[Job Matching] Content script injection failed: ${injectError} (${Date.now() - injectStart}ms)`);
        throw new Error(`Failed to inject content script. Please reload the page and try again. Error: ${injectError}`);
      }
      logger.info(`[Job Matching] Content script ready (${Date.now() - injectStart}ms)`);

      // Send message to content script to extract job
      const extractStart = Date.now();
      const response = await sendTabMessage(tabId, {
        action: JobExtractorFactory.ACTION,
      });

      if (!response || !response.success || !response.job) {
        logger.error(`[Job Matching] Job extraction failed: ${response?.error || "Failed to extract job"}`);
        throw new Error(response?.error || "Failed to extract job description");
      }

      const job = response.job;
      setJob(job);
      debug.setJob(job);
      logger.info(
        `[Job Matching] Job extraction successful: Source: ${job.source}, Length: ${job.description.length} chars (${Date.now() - extractStart}ms)`
      );

      // Match job with resume
      const matchStart = Date.now();
      logger.info("[Job Matching] Starting API match");

      const promptLength = job.description.length + resume.content.length;
      debug.setApiRequest({
        model: "gpt-4o-mini",
        promptLength,
        resumeLength: resume.content.length,
        jobDescriptionLength: job.description.length,
      });

      if (!apiKey) {
        throw new Error("API key not configured");
      }

      const result = await matchJobWithResume(job, resume, apiKey, skipCache);

      debug.setApiResponse({
        matchPercentage: result.matchPercentage,
        analysis: result.analysis,
        checklist: result.checklist,
      });

      const cacheStatus = result.isCached ? "from cache" : "fresh";
      logger.info(
        `[Job Matching] API match complete: Match: ${result.matchPercentage}% (${cacheStatus}) (${Date.now() - matchStart}ms)`
      );
      logger.info(`[Job Matching] Job match complete. Total time: ${Date.now() - debug.getStartTime()}ms`);
      debug.complete();

      setMatchResult(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error(`[Job Matching] Error occurred: ${error.message}`);
      debug.setError(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshMatch = async () => {
    // Get current job from match result
    const currentResult = useMatchingStore.getState().matchResult;
    if (!currentResult) {
      setError("No match result to refresh");
      return;
    }

    // Clear cache for this job
    await clearCachedMatch(currentResult.job);

    // Re-run match with skipCache = true
    await matchJob(true);
  };

  return { matchJob, refreshMatch };
}
