import { create } from "zustand";

import type { JobDescription } from "@/entities/job";

import type { MatchResult } from "../lib/match-job";
import type { DebugInfo } from "./types";

interface MatchingState {
  matchResult: MatchResult | null;
  job: JobDescription | null;
  debugInfo: DebugInfo;
  error: string | null;
  setMatchResult: (result: MatchResult | null) => void;
  setJob: (job: JobDescription | null) => void;
  setDebugInfo: (info: DebugInfo | ((prev: DebugInfo) => DebugInfo)) => void;
  setError: (error: string | null) => void;
}

export const useMatchingStore = create<MatchingState>((set) => ({
  matchResult: null,
  job: null,
  debugInfo: { logs: [] },
  error: null,
  setMatchResult: (result) => set({ matchResult: result }),
  setJob: (job) => set({ job }),
  setDebugInfo: (info) =>
    set((state) => ({
      debugInfo: typeof info === "function" ? info(state.debugInfo) : info,
    })),
  setError: (error) => set({ error }),
}));
