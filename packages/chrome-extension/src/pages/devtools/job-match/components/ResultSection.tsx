import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { type MatchResult, useMatchingStore } from "@/features/match-job";
import { Alert } from "@/shared/ui";
import { MatchResultWidget } from "@/widgets/match-result";

import { useCacheCheck } from "../hooks/useCacheCheck";
import { useJobMatching } from "../hooks/useJobMatching";
import { useResume } from "../hooks/useResume";

export function ResultSection() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNoCacheMessage, setShowNoCacheMessage] = useState(false);
  const { matchResult, setMatchResult, setError } = useMatchingStore(
    useShallow((state) => ({
      matchResult: state.matchResult,
      setMatchResult: state.setMatchResult,
      setError: state.setError,
    }))
  );
  const { resume } = useResume();

  const { refreshMatch } = useJobMatching({
    resume,
    setLoading: setIsRefreshing,
    setMatchResult,
    setError,
  });

  // Memoize callbacks to prevent infinite loops
  const handleCacheFound = useCallback(
    (result: MatchResult) => {
      setMatchResult(result);
      setShowNoCacheMessage(false);
    },
    [setMatchResult]
  );

  const handleNoCache = useCallback(() => {
    setShowNoCacheMessage(true);
  }, []);

  const handleCacheError = useCallback((_error: string) => {
    // Silently fail - user can still use the match button
    setShowNoCacheMessage(false);
  }, []);

  // Check cache when component mounts
  const { isChecking } = useCacheCheck({
    onCacheFound: handleCacheFound,
    onNoCache: handleNoCache,
    onError: handleCacheError,
  });

  // Hide no cache message when user manually matches
  useEffect(() => {
    if (matchResult) {
      setShowNoCacheMessage(false);
    }
  }, [matchResult]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMatch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      {isChecking && !matchResult && <div className="text-sm text-gray-500 text-center py-2">Checking cache...</div>}
      {showNoCacheMessage && !matchResult && !isChecking && (
        <Alert variant="info">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>No cached analysis for this job. Click "Match Current Job" to analyze.</span>
          </div>
        </Alert>
      )}
      {matchResult && <MatchResultWidget result={matchResult} onRefresh={handleRefresh} isRefreshing={isRefreshing} />}
    </>
  );
}
