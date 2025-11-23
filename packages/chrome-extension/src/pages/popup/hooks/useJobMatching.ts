import type { Resume } from "@/entities/resume";
import type { MatchResult } from "@/features/match-job";
import { matchJobWithResume } from "@/features/match-job";
import { getOpenAIApiKey } from "@/shared/config";
import { clearCachedMatch } from "@/shared/lib/match-cache";
import { useMatchingStore } from "@/shared/stores";
import type { DebugInfo } from "@/widgets/debug-panel";

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

    const startTime = Date.now();
    const steps: DebugInfo["steps"] = [];
    const currentDebugInfo: DebugInfo = {
      resume,
      steps,
      startTime,
    };

    const addStep = (step: string, status: "success" | "error" | "info", details?: string, duration?: number) => {
      steps.push({
        step,
        timestamp: Date.now(),
        status,
        details,
        duration,
      });
      setDebugInfo({ ...currentDebugInfo, steps: [...steps] });
    };

    try {
      addStep("Starting job match", "info");

      // Get current tab - try current window first, then last active tab
      const tabStart = Date.now();
      let tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];

      // If no active tab in current window (e.g., popup is detached), try to get last active tab
      if (!tab?.id || !tab?.url) {
        const tabs = await chrome.tabs.query({ active: true });
        tab = tabs[0];
      }

      // If still no tab, try to get any tab
      if (!tab?.id || !tab?.url) {
        const allTabs = await chrome.tabs.query({});
        tab =
          allTabs.find((t) => t.url && !t.url.startsWith("chrome://") && !t.url.startsWith("chrome-extension://")) ||
          allTabs[0];
      }

      if (!tab?.id || !tab?.url) {
        throw new Error("Could not get current tab. Please open a webpage and try again.");
      }
      addStep("Got current tab", "success", tab.url, Date.now() - tabStart);

      // Check if URL is valid for content scripts
      if (
        tab.url?.startsWith("chrome://") ||
        tab.url?.startsWith("chrome-extension://") ||
        tab.url?.startsWith("about:")
      ) {
        throw new Error("Content scripts cannot run on this page. Please navigate to a regular webpage.");
      }

      // Check if content script is available
      let contentScriptReady = false;
      const pingStart = Date.now();
      try {
        const pingResponse = await chrome.tabs.sendMessage(tab.id, { action: "ping" });
        contentScriptReady = pingResponse?.success === true;
        addStep(
          "Content script ping",
          "success",
          contentScriptReady ? "Already loaded" : "Not loaded",
          Date.now() - pingStart
        );
      } catch (error) {
        contentScriptReady = false;
        addStep("Content script ping", "info", "Not available, will inject", Date.now() - pingStart);
      }

      if (!contentScriptReady) {
        // Inject content script programmatically
        const injectStart = Date.now();
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["src/content.js"],
          });
          await new Promise((resolve) => setTimeout(resolve, 200));
          addStep("Content script injection", "success", undefined, Date.now() - injectStart);
        } catch (injectError) {
          const errorMsg = injectError instanceof Error ? injectError.message : "Unknown error";
          addStep("Content script injection", "error", errorMsg, Date.now() - injectStart);
          throw new Error(`Failed to inject content script. Please reload the page and try again. Error: ${errorMsg}`);
        }
      }

      // Send message to content script to extract job
      const extractStart = Date.now();
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "extractJob",
      });

      if (!response || !response.success || !response.job) {
        addStep("Job extraction", "error", response?.error || "Failed to extract job");
        throw new Error(response?.error || "Failed to extract job description");
      }

      const job = response.job;
      currentDebugInfo.job = job;
      addStep(
        "Job extraction",
        "success",
        `Source: ${job.source}, Length: ${job.description.length} chars`,
        Date.now() - extractStart
      );

      // Match job with resume
      const matchStart = Date.now();
      addStep("Starting API match", "info");

      const promptLength = job.description.length + resume.content.length;
      currentDebugInfo.apiRequest = {
        model: "gpt-4o-mini",
        promptLength,
        resumeLength: resume.content.length,
        jobDescriptionLength: job.description.length,
      };
      setDebugInfo({ ...currentDebugInfo });

      if (!apiKey) {
        throw new Error("API key not configured");
      }

      const result = await matchJobWithResume(job, resume, apiKey, skipCache);

      const endTime = Date.now();
      currentDebugInfo.endTime = endTime;
      currentDebugInfo.apiResponse = {
        matchPercentage: result.matchPercentage,
        analysis: result.analysis,
        checklist: result.checklist,
      };

      const cacheStatus = result.isCached ? "from cache" : "fresh";
      addStep(
        "API match complete",
        "success",
        `Match: ${result.matchPercentage}% (${cacheStatus})`,
        Date.now() - matchStart
      );
      addStep("Job match complete", "success", `Total time: ${endTime - startTime}ms`);

      setMatchResult(result);
      setDebugInfo({ ...currentDebugInfo });
    } catch (err) {
      const endTime = Date.now();
      const error = err instanceof Error ? err : new Error(String(err));
      currentDebugInfo.endTime = endTime;
      currentDebugInfo.error = {
        message: error.message,
        stack: error.stack,
      };
      addStep("Error occurred", "error", error.message);
      setError(error.message);
      setDebugInfo({ ...currentDebugInfo });
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
