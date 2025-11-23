import { create } from "zustand";

import type { MatchResult } from "../lib/match-job";
import type { DebugInfo } from "./types";

interface MatchingState {
  matchResult: MatchResult | null;
  debugInfo: DebugInfo;
  error: string | null;
  setMatchResult: (result: MatchResult | null) => void;
  setDebugInfo: (info: DebugInfo | ((prev: DebugInfo) => DebugInfo)) => void;
  setError: (error: string | null) => void;
}

export const useMatchingStore = create<MatchingState>((set) => ({
  matchResult: null,
  debugInfo: { steps: [] },
  error: null,
  setMatchResult: (result) => set({ matchResult: result }),
  setDebugInfo: (info) =>
    set((state) => ({
      debugInfo: typeof info === "function" ? info(state.debugInfo) : info,
    })),
  setError: (error) => set({ error }),
}));
