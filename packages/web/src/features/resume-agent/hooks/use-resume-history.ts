"use client";

import type { MatchResult } from "@/entities/match-result";
import type { ResumeChange } from "@/entities/resume";
import type { ResumeHistoryItem } from "@/entities/resume-history";
import { useLocalStorage } from "@/shared/hooks/use-local-storage";

// Re-export entity type for backward compatibility
export type { ResumeHistoryItem } from "@/entities/resume-history";

const STORAGE_KEY = "resumeAgent:history";

export function useResumeHistory() {
  const [history, setHistory] = useLocalStorage<ResumeHistoryItem[]>(STORAGE_KEY, []);

  const addToHistory = (data: {
    resume: string;
    jobDescription: string;
    adaptedResume: string;
    gaps: string;
    matchResult: MatchResult;
    changes: ResumeChange[];
  }) => {
    const newItem: ResumeHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...data,
    };

    setHistory((prev) => [newItem, ...prev].slice(0, 50)); // Keep only last 50 items
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const getHistoryItem = (id: string): ResumeHistoryItem | undefined => {
    return history.find((item) => item.id === id);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getHistoryItem,
  };
}
