import { useMatchingStore } from "@/features/match-job";
import { Alert } from "@/shared/ui";

import type { DebugInfo } from "../DebugPanel";

interface OverviewTabProps {
  debugInfo: DebugInfo;
  duration: number | null;
}

export function OverviewTab({ debugInfo, duration }: OverviewTabProps) {
  const job = useMatchingStore((state) => state.job);

  return (
    <div className="space-y-2 text-xs">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="font-semibold">Status:</span>{" "}
          {debugInfo.error ? (
            <span className="text-red-600">❌ Error</span>
          ) : debugInfo.endTime ? (
            <span className="text-green-600">✅ Success</span>
          ) : (
            <span className="text-yellow-600">⏳ Processing</span>
          )}
        </div>
        {duration !== null && (
          <div>
            <span className="font-semibold">Duration:</span> {duration.toFixed(0)}ms
          </div>
        )}
      </div>
      {job && (
        <div>
          <span className="font-semibold">Job Source:</span> {job.source}
        </div>
      )}
      {debugInfo.resume && (
        <div>
          <span className="font-semibold">Resume Source:</span> {debugInfo.resume.source}
        </div>
      )}
      {debugInfo.apiRequest && (
        <div>
          <span className="font-semibold">Model:</span> {debugInfo.apiRequest.model}
        </div>
      )}
      {debugInfo.apiResponse && (
        <div>
          <span className="font-semibold">Match:</span> {debugInfo.apiResponse.matchPercentage}%
        </div>
      )}
      {debugInfo.error && (
        <Alert variant="error">
          <span className="font-semibold">Error:</span>
          <div className="mt-1">{debugInfo.error.message}</div>
        </Alert>
      )}
    </div>
  );
}
