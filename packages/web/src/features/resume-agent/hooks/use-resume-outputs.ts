"use client";

import { useLocalStorage } from "@/shared/hooks/use-local-storage";

const STORAGE_KEYS = {
  adaptedResume: "resumeAgent:adaptedResume",
  gaps: "resumeAgent:gapsAnalysis",
  matchResult: "resumeAgent:matchResult",
} as const;

export interface ChecklistItem {
  category: string;
  checked: boolean;
  description: string;
}

export interface MatchResult {
  matchPercentage: number;
  analysis: string;
  checklist: ChecklistItem[];
}

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
