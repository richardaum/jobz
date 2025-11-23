import type { MatchResult } from "@/features/match-job";
import { Badge, Button, ProgressBar } from "@/shared/ui";

interface MatchResultProps {
  result: MatchResult;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function MatchResultWidget({ result, onRefresh, isRefreshing = false }: MatchResultProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{result.job.title}</h3>
            <p className="text-sm text-gray-600">{result.job.company}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {result.isCached && (
              <Badge variant="info" className="whitespace-nowrap">
                Cached
              </Badge>
            )}
            {onRefresh && (
              <Button
                onClick={onRefresh}
                disabled={isRefreshing}
                variant="secondary"
                className="text-xs px-2 py-1"
                type="button"
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <ProgressBar value={result.matchPercentage} showLabel label="Match Score" variant="default" />
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis:</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{result.analysis}</p>
      </div>

      {result.checklist && result.checklist.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Match Checklist:</h4>
          <div className="space-y-2">
            {result.checklist.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">
                  {item.checked ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">{item.category}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
