import { CodeBlock } from "@/shared/ui";

import type { DebugInfo } from "../DebugPanel";

interface ApiTabProps {
  debugInfo: DebugInfo;
}

export function ApiTab({ debugInfo }: ApiTabProps) {
  return (
    <div className="space-y-3 text-xs">
      {debugInfo.apiRequest && (
        <div>
          <span className="font-semibold">Request:</span>
          <div className="mt-1 p-2 bg-white border border-gray-200 rounded">
            <div>Model: {debugInfo.apiRequest.model}</div>
            <div>Job Description: {debugInfo.apiRequest.jobDescriptionLength} chars</div>
            <div>Resume: {debugInfo.apiRequest.resumeLength} chars</div>
            <div>Total Prompt: {debugInfo.apiRequest.promptLength} chars</div>
          </div>
        </div>
      )}
      {debugInfo.apiResponse && (
        <div>
          <span className="font-semibold">Response:</span>
          <div className="mt-1 p-2 bg-white border border-gray-200 rounded">
            <div>Match: {debugInfo.apiResponse.matchPercentage}%</div>
            <div className="mt-2">
              <span className="font-semibold">Analysis:</span>
              <div className="mt-1 p-2 bg-gray-50 rounded max-h-32 overflow-y-auto">
                {debugInfo.apiResponse.analysis}
              </div>
            </div>
          </div>
        </div>
      )}
      {debugInfo.apiResponse?.rawResponse !== undefined && (
        <div>
          <span className="font-semibold">Raw Response:</span>
          <CodeBlock className="mt-1" maxHeight="max-h-32">
            {String(
              typeof debugInfo.apiResponse.rawResponse === "string"
                ? debugInfo.apiResponse.rawResponse
                : JSON.stringify(debugInfo.apiResponse.rawResponse, null, 2)
            )}
          </CodeBlock>
        </div>
      )}
      {!debugInfo.apiRequest && !debugInfo.apiResponse && (
        <div className="text-center py-8 text-gray-500">No API request/response data yet.</div>
      )}
    </div>
  );
}
