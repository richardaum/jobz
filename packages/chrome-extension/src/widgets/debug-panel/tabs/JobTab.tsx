import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { JobExtractorFactory } from "@/features/extract-job";
import { useMatchingStore } from "@/features/match-job";
import { Alert, Button, CodeBlock, LoadingSpinner } from "@/shared/ui";

import type { DebugInfo } from "../DebugPanel";

interface JobTabProps {
  debugInfo: DebugInfo;
  onJobExtracted?: () => void;
}

export function JobTab({ debugInfo: _debugInfo, onJobExtracted }: JobTabProps) {
  const [extractingJob, setExtractingJob] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const { job, setJob } = useMatchingStore(
    useShallow((state) => ({
      job: state.job,
      setJob: state.setJob,
    }))
  );

  const handleGetJob = async () => {
    setExtractingJob(true);
    setExtractionError(null);

    try {
      const { tabs } = await import("@/shared/chrome-api");
      const { checkContentScriptReady, injectContentScript } = await import("@/shared/utils/scripting");
      const { sendTabMessage } = await import("@/shared/utils/messaging");

      // Get current tab
      const tab = await tabs.getActiveTab();

      // Check if content script is available
      let contentScriptReady = false;
      try {
        contentScriptReady = await checkContentScriptReady(tab.id);
      } catch {
        contentScriptReady = false;
      }

      // Inject content script if needed
      if (!contentScriptReady) {
        try {
          await injectContentScript(tab.id);
        } catch (injectError) {
          const errorMsg = injectError instanceof Error ? injectError.message : "Unknown error";
          throw new Error(`Failed to inject content script. Please reload the page and try again. Error: ${errorMsg}`);
        }
      }

      // Extract job
      const response = await sendTabMessage(tab.id, {
        action: JobExtractorFactory.ACTION,
      });

      if (!response || !response.success || !response.job) {
        throw new Error(response?.error || "Failed to extract job description");
      }

      // Update job in store
      setJob(response.job);

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
      {!job && !extractingJob && (
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
      {job && (
        <>
          <div>
            <span className="font-semibold">Source:</span> {job.source}
          </div>
          <div>
            <span className="font-semibold">Title:</span> {job.title}
          </div>
          <div>
            <span className="font-semibold">Company:</span> {job.company}
          </div>
          <div>
            <span className="font-semibold">URL:</span>{" "}
            <span className="text-blue-600 break-all">{job.url || "N/A"}</span>
          </div>
          {job.extractionMetadata && (
            <div>
              <span className="font-semibold">Extraction Info:</span>
              <div className="mt-1 p-2 bg-white border border-gray-200 rounded">
                <div>
                  Selector used: <code className="bg-gray-100 px-1 rounded">{job.extractionMetadata.usedSelector}</code>
                </div>
                {job.extractionMetadata.isCollection && <div className="mt-1">Type: Collection page</div>}
                {job.extractionMetadata.failedSelectors && job.extractionMetadata.failedSelectors.length > 0 && (
                  <div className="mt-2">
                    <div className="font-semibold text-red-600 mb-1">Failed Selectors:</div>
                    <div className="max-h-32 overflow-y-auto">
                      {job.extractionMetadata.failedSelectors.map((selector, idx) => (
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
            <span className="font-semibold">Description Length:</span> {job.description.length} chars
          </div>
          <div className="mt-2">
            <span className="font-semibold">Full Description:</span>
            <div className="mt-1 text-xs text-gray-600 mb-1">
              (Includes: primary description container, fit level preferences, and main job description)
            </div>
            <CodeBlock className="mt-1" maxHeight="">
              {job.description || "No description available"}
            </CodeBlock>
          </div>
        </>
      )}
    </div>
  );
}
