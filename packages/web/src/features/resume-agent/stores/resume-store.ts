import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { MatchResult } from "@/entities/match-result";
import type { ResumeChange } from "@/entities/resume";
import type { ResumeHistoryItem } from "@/entities/resume-history";

// Re-export entity types for backward compatibility
export type { ChecklistItem, MatchResult } from "@/entities/match-result";
export type { ResumeChange } from "@/entities/resume";
export type { ResumeHistoryItem } from "@/entities/resume-history";

interface ResumeStore {
  // Inputs
  resume: string;
  jobDescription: string;
  setResume: (resume: string) => void;
  setJobDescription: (jobDescription: string) => void;

  // Outputs
  adaptedResume: string;
  gaps: string;
  matchResult: MatchResult | null;
  changes: ResumeChange[];
  updateOutputs: (data: {
    adaptedResume: string;
    gaps: string;
    matchResult: MatchResult;
    changes: ResumeChange[];
  }) => void;

  // Computed
  hasValidInputs: () => boolean;

  // Clear functions
  clearResults: () => void;
  clearAll: () => void;
}

interface ResumeHistoryStore {
  history: ResumeHistoryItem[];
  addToHistory: (data: {
    resume: string;
    jobDescription: string;
    adaptedResume: string;
    gaps: string;
    matchResult: MatchResult;
    changes: ResumeChange[];
  }) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  loadFromHistory: (
    item: ResumeHistoryItem,
    setCardData: (data: {
      resume: string;
      jobDescription: string;
      adaptedResume: string;
      gaps: string;
      matchResult: MatchResult;
      changes: ResumeChange[];
    }) => void
  ) => void;
}

// Store for card data (inputs and outputs)
export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => {
      return {
        // Initial state - always strings, never undefined
        resume: "",
        jobDescription: "",
        adaptedResume: "",
        gaps: "",
        matchResult: null,
        changes: [],

        // Inputs
        setResume: (resume: string) => set({ resume: resume || "" }),
        setJobDescription: (jobDescription: string) => set({ jobDescription: jobDescription || "" }),

        // Outputs
        updateOutputs: (data: {
          adaptedResume: string;
          gaps: string;
          matchResult: MatchResult;
          changes: ResumeChange[];
        }) =>
          set({
            adaptedResume: data.adaptedResume || "",
            gaps: data.gaps || "",
            matchResult: data.matchResult,
            changes: data.changes || [],
          }),

        // Computed
        hasValidInputs: () => {
          const state = get();
          return !!state.resume?.trim() && !!state.jobDescription?.trim();
        },

        // Clear results only (outputs)
        clearResults: () =>
          set({
            adaptedResume: "",
            gaps: "",
            matchResult: null,
            changes: [],
          }),

        // Clear all data
        clearAll: () =>
          set({
            resume: "",
            jobDescription: "",
            adaptedResume: "",
            gaps: "",
            matchResult: null,
            changes: [],
          }),
      };
    },
    {
      name: "resume-agent-storage",
      partialize: (state) => ({
        // Only persist card data
        resume: state.resume || "",
        jobDescription: state.jobDescription || "",
        adaptedResume: state.adaptedResume || "",
        gaps: state.gaps || "",
        matchResult: state.matchResult,
        changes: state.changes || [],
      }),
      // Ensure we always have string defaults on rehydration
      merge: (persistedState: any, currentState) => {
        return {
          ...currentState,
          resume: persistedState?.resume ?? "",
          jobDescription: persistedState?.jobDescription ?? "",
          adaptedResume: persistedState?.adaptedResume ?? "",
          gaps: persistedState?.gaps ?? "",
          matchResult: persistedState?.matchResult ?? null,
          changes: persistedState?.changes ?? [],
        };
      },
    }
  )
);

// Separate store for history
export const useResumeHistoryStore = create<ResumeHistoryStore>()(
  persist(
    (set, _get) => ({
      history: [],

      addToHistory: (data) => {
        const newItem: ResumeHistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          ...data,
        };

        set((state) => ({
          history: [newItem, ...state.history].slice(0, 50), // Keep only last 50 items
        }));
      },

      removeFromHistory: (id: string) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),

      clearHistory: () => set({ history: [] }),

      loadFromHistory: (item: ResumeHistoryItem, setCardData) => {
        setCardData({
          resume: item.resume,
          jobDescription: item.jobDescription,
          adaptedResume: item.adaptedResume,
          gaps: item.gaps,
          matchResult: item.matchResult,
          changes: item.changes || [],
        });
      },
    }),
    {
      name: "resume-agent-history",
      partialize: (state) => ({
        history: state.history,
      }),
    }
  )
);
