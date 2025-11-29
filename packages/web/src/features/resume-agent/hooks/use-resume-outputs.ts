"use client";

import type { MatchResult } from "@/entities/match-result";
import { useLocalStorage } from "@/shared/hooks/use-local-storage";

const STORAGE_KEYS = {
  adaptedResume: "resumeAgent:adaptedResume",
  gaps: "resumeAgent:gapsAnalysis",
  matchResult: "resumeAgent:matchResult",
} as const;

// Re-export entity types for backward compatibility
export type { ChecklistItem, MatchResult } from "@/entities/match-result";

export function useResumeOutputs() {
  const [adaptedResume, setAdaptedResume] = useLocalStorage(STORAGE_KEYS.adaptedResume, "");
  const [gaps, setGaps] = useLocalStorage(STORAGE_KEYS.gaps, "");
  const [matchResult, setMatchResult] = useLocalStorage<MatchResult | null>(STORAGE_KEYS.matchResult, null);

  const updateOutputs = (data: { adaptedResume: string; gaps: string; matchResult: MatchResult }) => {
    setAdaptedResume(data.adaptedResume);
    setGaps(data.gaps);
    setMatchResult(data.matchResult);
  };

  return {
    adaptedResume,
    gaps,
    matchResult,
    updateOutputs,
  };
}
