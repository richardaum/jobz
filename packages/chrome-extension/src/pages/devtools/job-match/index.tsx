import { Badge } from "@/shared/ui";

import { ErrorDisplay } from "./components/ErrorDisplay";
import { JobInfo } from "./components/JobInfo";
import { MatchButton } from "./components/MatchButton";
import { ResultSection } from "./components/ResultSection";
import { useAutoJobExtraction } from "./hooks/useAutoJobExtraction";
import { useExtensionVersion } from "./hooks/useExtensionVersion";

export function JobMatch() {
  const version = useExtensionVersion();
  const { isExtracting, attemptCount, hasError, errorMessage, isRetrying } = useAutoJobExtraction(); // Automatically extract job when tab is opened

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <h2 className="text-2xl font-bold">Job Match</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Version:</span>
          <Badge variant="primary" className="font-mono">
            {version}
          </Badge>
        </div>
      </div>

      <JobInfo
        isExtracting={isExtracting}
        attemptCount={attemptCount}
        hasError={hasError}
        errorMessage={errorMessage}
        isRetrying={isRetrying}
      />

      <MatchButton />

      <ErrorDisplay />

      <ResultSection />
    </div>
  );
}
