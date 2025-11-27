import { useLocalStorage } from "@/shared/hooks/use-local-storage";

import type { MatchResult } from "./use-resume-outputs";

export interface ResumeHistoryItem {
  id: string;
  timestamp: number;
  resume: string;
  jobDescription: string;
  adaptedResume: string;
  gaps: string;
  matchResult: MatchResult;
}

const STORAGE_KEY = "resumeAgent:history";

export function useResumeHistory() {
  const [history, setHistory] = useLocalStorage<ResumeHistoryItem[]>(STORAGE_KEY, []);

  const addToHistory = (data: {
    resume: string;
    jobDescription: string;
    adaptedResume: string;
    gaps: string;
    matchResult: MatchResult;
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

