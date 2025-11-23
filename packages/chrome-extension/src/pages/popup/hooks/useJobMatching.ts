import type { Resume } from "@/entities/resume";
import { JobExtractorFactory } from "@/features/extract-job";
import type { MatchResult } from "@/features/match-job";
import { matchJobWithResume } from "@/features/match-job";
import { clearCachedMatch } from "@/features/match-job";
import { useMatchingStore } from "@/features/match-job";
import { getOpenAIApiKey } from "@/shared/config";
import { sendTabMessage } from "@/shared/utils/messaging";
import { checkContentScriptReady, injectContentScript } from "@/shared/utils/scripting";
import { getActiveTab } from "@/shared/utils/tabs";
import type { DebugInfo } from "@/widgets/debug-panel";

import { MatchingDebugger } from "../utils/MatchingDebugger";

interface UseJobMatchingParams {
  resume: Resume | null;
  setLoading: (loading: boolean) => void;
  setMatchResult: (result: MatchResult | null) => void;
  setError: (error: string | null) => void;
  setDebugInfo: (info: DebugInfo) => void;
}

export function useJobMatching({ resume, setLoading, setMatchResult, setError, setDebugInfo }: UseJobMatchingParams) {
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

    const debug = new MatchingDebugger(resume, setDebugInfo);

    try {
      debug.addStep("Starting job match", "info");

      // Get current tab
      const tabStart = Date.now();
      const tab = await getActiveTab();
      debug.addStep("Got current tab", "success", tab.url, Date.now() - tabStart);

      // Check if content script is available
      const pingStart = Date.now();
      const contentScriptReady = await checkContentScriptReady(tab.id);

      debug.addStep(
        "Content script ping",
        contentScriptReady ? "success" : "info",
        contentScriptReady ? "Already loaded" : "Not available, will inject",
        Date.now() - pingStart
      );

      if (!contentScriptReady) {
        // Inject content script programmatically
        const injectStart = Date.now();
        try {
          await injectContentScript(tab.id);
          debug.addStep("Content script injection", "success", undefined, Date.now() - injectStart);
        } catch (injectError) {
          const errorMsg = injectError instanceof Error ? injectError.message : "Unknown error";
          debug.addStep("Content script injection", "error", errorMsg, Date.now() - injectStart);
          throw new Error(`Failed to inject content script. Please reload the page and try again. Error: ${errorMsg}`);
        }
      }

      // Send message to content script to extract job
      const extractStart = Date.now();
      const response = await sendTabMessage(tab.id, {
        action: JobExtractorFactory.ACTION,
      });

      if (!response || !response.success || !response.job) {
        debug.addStep("Job extraction", "error", response?.error || "Failed to extract job");
        throw new Error(response?.error || "Failed to extract job description");
      }

      const job = response.job;
      debug.setJob(job);
      debug.addStep(
        "Job extraction",
        "success",
        `Source: ${job.source}, Length: ${job.description.length} chars`,
        Date.now() - extractStart
      );

      // Match job with resume
      const matchStart = Date.now();
      debug.addStep("Starting API match", "info");

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
      debug.addStep(
        "API match complete",
        "success",
        `Match: ${result.matchPercentage}% (${cacheStatus})`,
        Date.now() - matchStart
      );
      debug.addStep("Job match complete", "success", `Total time: ${Date.now() - debug.getStartTime()}ms`);
      debug.complete();

      setMatchResult(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      debug.addStep("Error occurred", "error", error.message);
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
