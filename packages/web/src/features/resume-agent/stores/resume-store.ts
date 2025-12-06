import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { MatchResult } from "@/entities/match-result";
import type { ResumeChange, ResumeSection } from "@/entities/resume";
import type { ResumeHistoryItem } from "@/entities/resume-history";

// Re-export entity types for backward compatibility
export type { ChecklistItem, MatchResult } from "@/entities/match-result";
export type { ResumeChange } from "@/entities/resume";
export type { ResumeHistoryItem } from "@/entities/resume-history";

export interface ResumeStore {
  // Inputs
  resume: string;
  jobDescription: string;
  personalPreferences: string;
  setResume: (resume: string) => void;
  setJobDescription: (jobDescription: string) => void;
  setPersonalPreferences: (personalPreferences: string) => void;

  // Outputs
  adaptedResume: string;
  sections: ResumeSection[]; // Structured sections of the resume
  gaps: string;
  matchResult: MatchResult | null;
  changes: ResumeChange[];
  rawResponseJson: string | null; // Full JSON response from AI
  updateOutputs: (data: {
    adaptedResume: string;
    sections?: ResumeSection[];
    gaps: string;
    matchResult: MatchResult;
    changes: ResumeChange[];
    rawResponseJson?: string;
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
        personalPreferences: "",
        adaptedResume: "",
        sections: [],
        gaps: "",
        matchResult: null,
        changes: [],
        rawResponseJson: null,

        // Inputs
        setResume: (resume: string) => set({ resume: resume || "" }),
        setJobDescription: (jobDescription: string) => set({ jobDescription: jobDescription || "" }),
        setPersonalPreferences: (personalPreferences: string) =>
          set({ personalPreferences: personalPreferences || "" }),

        // Outputs
        updateOutputs: (data: {
          adaptedResume: string;
          sections?: ResumeSection[];
          gaps: string;
          matchResult: MatchResult;
          changes: ResumeChange[];
          rawResponseJson?: string;
        }) =>
          set({
            adaptedResume: data.adaptedResume || "",
            sections: data.sections || [],
            gaps: data.gaps || "",
            matchResult: data.matchResult,
            changes: data.changes || [],
            rawResponseJson: data.rawResponseJson || null,
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
            sections: [],
            gaps: "",
            matchResult: null,
            changes: [],
            rawResponseJson: null,
          }),

        // Clear all data
        clearAll: () =>
          set({
            resume: "",
            jobDescription: "",
            personalPreferences: "",
            adaptedResume: "",
            sections: [],
            gaps: "",
            matchResult: null,
            changes: [],
            rawResponseJson: null,
          }),
      };
    },
    {
      name: "resume-agent-storage",
      partialize: (state) => ({
        // Only persist card data
        resume: state.resume || "",
        jobDescription: state.jobDescription || "",
        personalPreferences: state.personalPreferences || "",
        adaptedResume: state.adaptedResume || "",
        sections: state.sections || [],
        gaps: state.gaps || "",
        matchResult: state.matchResult,
        changes: state.changes || [],
        rawResponseJson: state.rawResponseJson || null,
      }),
      // Ensure we always have string defaults on rehydration
      merge: (persistedState: unknown, currentState) => {
        const persisted = persistedState as Partial<ResumeStore> | undefined;
        return {
          ...currentState,
          resume: persisted?.resume ?? "",
          jobDescription: persisted?.jobDescription ?? "",
          personalPreferences: persisted?.personalPreferences ?? "",
          adaptedResume: persisted?.adaptedResume ?? "",
          sections: persisted?.sections ?? [],
          gaps: persisted?.gaps ?? "",
          matchResult: persisted?.matchResult ?? null,
          changes: persisted?.changes ?? [],
          rawResponseJson: persisted?.rawResponseJson ?? null,
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
