import { useMatchingStore } from "@/features/match-job";
import { Card } from "@/shared/ui";

interface JobInfoProps {
  isExtracting?: boolean;
  attemptCount?: number;
  hasError?: boolean;
  errorMessage?: string | null;
  isRetrying?: boolean;
}

export function JobInfo({ isExtracting, attemptCount, hasError, errorMessage, isRetrying }: JobInfoProps) {
  const job = useMatchingStore((state) => state.job);

  if (isExtracting) {
    return (
      <Card className="p-4">
        <div className="text-center py-4">
          {isRetrying ? (
            <>
              <div className="text-sm font-medium text-gray-700 mb-2">
                {hasError ? "Failed to extract job information" : "Extracting job information..."}
              </div>
              {hasError && errorMessage && (
                <div className="text-xs text-red-600 mb-2 bg-red-50 p-2 rounded border border-red-200 whitespace-pre-line">
                  {errorMessage.split("\n").map((line, idx) => (
                    <div key={idx} className={idx > 0 ? "mt-1" : ""}>
                      {line.startsWith("Used selector:") || line.startsWith("Failed selectors") ? (
                        <div className="font-mono text-xs bg-white px-1 rounded mt-1">{line}</div>
                      ) : (
                        line
                      )}
                    </div>
                  ))}
                </div>
              )}
              {attemptCount !== undefined && attemptCount > 0 && (
                <div className="text-xs text-gray-500">Attempt {attemptCount} - Retrying in 3 seconds...</div>
              )}
            </>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-2">Extracting job information...</div>
              {attemptCount !== undefined && attemptCount > 0 && (
                <div className="text-xs text-gray-500">Attempt {attemptCount}</div>
              )}
            </>
          )}
        </div>
      </Card>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.company}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Source:</span>
            <span className="font-medium capitalize">{job.source}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Description:</span>
            <span className="font-medium">{job.description.length.toLocaleString()} chars</span>
          </div>
        </div>

        {job.url && (
          <div className="text-xs">
            <span className="text-gray-500">URL:</span>{" "}
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {job.url}
            </a>
          </div>
        )}

        {job.extractionMetadata && (
          <div className="text-xs pt-2 border-t border-gray-200">
            <div className="text-gray-500 mb-1">Extraction Details:</div>
            <div className="bg-gray-50 p-2 rounded">
              <div>
                <span className="text-gray-600">Selector:</span>{" "}
                <code className="bg-white px-1 rounded text-xs">{job.extractionMetadata.usedSelector}</code>
              </div>
              {job.extractionMetadata.isCollection && <div className="mt-1 text-gray-600">Type: Collection page</div>}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
