import { useState } from "react";

import { useMatchingStore } from "@/features/match-job";
import { Alert, Button, CodeBlock, LoadingSpinner } from "@/shared/ui";

import type { DebugInfo } from "../DebugPanel";

interface JobTabProps {
  debugInfo: DebugInfo;
  onJobExtracted?: () => void;
}

export function JobTab({ debugInfo, onJobExtracted }: JobTabProps) {
  const [extractingJob, setExtractingJob] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const setDebugInfo = useMatchingStore((state) => state.setDebugInfo);

  const handleGetJob = async () => {
    setExtractingJob(true);
    setExtractionError(null);

    try {
      // Get current tab - try current window first, then last active tab
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
      try {
        const pingResponse = await chrome.tabs.sendMessage(tab.id, { action: "ping" });
        contentScriptReady = pingResponse?.success === true;
      } catch {
        contentScriptReady = false;
      }

      // Inject content script if needed
      if (!contentScriptReady) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["src/content.js"],
          });
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (injectError) {
          const errorMsg = injectError instanceof Error ? injectError.message : "Unknown error";
          throw new Error(`Failed to inject content script. Please reload the page and try again. Error: ${errorMsg}`);
        }
      }

      // Extract job
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "extractJob",
      });

      if (!response || !response.success || !response.job) {
        throw new Error(response?.error || "Failed to extract job description");
      }

      // Update debug info with extracted job
      setDebugInfo((prev) => ({
        ...prev,
        job: response.job,
      }));

      if (response.job.extractionMetadata?.failedSelectors?.length) {
        console.log("Failed Selectors:", response.job.extractionMetadata.failedSelectors);
      }

      setExtractingJob(false);
      onJobExtracted?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setExtractionError(errorMessage);
      setExtractingJob(false);
    }
  };

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Job Information</h4>
        <Button onClick={handleGetJob} disabled={extractingJob} variant="secondary" className="text-xs px-2 py-1">
          {extractingJob ? "Extracting..." : "Get Job"}
        </Button>
      </div>
      {extractionError && (
        <Alert variant="error">
          <span className="font-semibold">Error:</span> {extractionError}
        </Alert>
      )}
      {!debugInfo.job && !extractingJob && (
        <div className="text-center py-8 text-gray-500">
          <p>No job extracted yet.</p>
          <p className="mt-2">Click "Get Job" to extract job description from current page.</p>
        </div>
      )}
      {extractingJob && (
        <div className="text-center py-8">
          <LoadingSpinner text="Extracting job description..." />
        </div>
      )}
      {debugInfo.job && (
        <>
          <div>
            <span className="font-semibold">Source:</span> {debugInfo.job.source}
          </div>
          <div>
            <span className="font-semibold">Title:</span> {debugInfo.job.title}
          </div>
          <div>
            <span className="font-semibold">Company:</span> {debugInfo.job.company}
          </div>
          <div>
            <span className="font-semibold">URL:</span>{" "}
            <span className="text-blue-600 break-all">{debugInfo.job.url || "N/A"}</span>
          </div>
          {debugInfo.job.extractionMetadata && (
            <div>
              <span className="font-semibold">Extraction Info:</span>
              <div className="mt-1 p-2 bg-white border border-gray-200 rounded">
                <div>
                  Selector used:{" "}
                  <code className="bg-gray-100 px-1 rounded">{debugInfo.job.extractionMetadata.usedSelector}</code>
                </div>
                {debugInfo.job.extractionMetadata.isCollection && <div className="mt-1">Type: Collection page</div>}
                {debugInfo.job.extractionMetadata.failedSelectors &&
                  debugInfo.job.extractionMetadata.failedSelectors.length > 0 && (
                    <div className="mt-2">
                      <div className="font-semibold text-red-600 mb-1">Failed Selectors:</div>
                      <div className="max-h-32 overflow-y-auto">
                        {debugInfo.job.extractionMetadata.failedSelectors.map((selector, idx) => (
                          <div key={idx} className="text-xs text-red-500 font-mono mb-1 break-all">
                            - {selector}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
          <div>
            <span className="font-semibold">Description Length:</span> {debugInfo.job.description.length} chars
          </div>
          <div className="mt-2">
            <span className="font-semibold">Full Description:</span>
            <div className="mt-1 text-xs text-gray-600 mb-1">
              (Includes: primary description container, fit level preferences, and main job description)
            </div>
            <CodeBlock className="mt-1" maxHeight="">
              {debugInfo.job.description || "No description available"}
            </CodeBlock>
          </div>
        </>
      )}
    </div>
  );
}
