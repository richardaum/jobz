import { useMatchingStore } from "@/features/match-job";

export function useClearActionHistory() {
  const { setDebugInfo, setJob, setMatchResult, setError } = useMatchingStore();

  const clearActionHistory = () => {
    setDebugInfo({ logs: [] });
    setJob(null);
    setMatchResult(null);
    setError(null);
  };

  return { clearActionHistory };
}


