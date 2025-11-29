import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MatchResult } from "@/entities/match-result";
import type { ResumeChange } from "@/entities/resume";

import { useResumeHistoryStore, useResumeStore } from "../resume-store";

describe("resume-store", () => {
  beforeEach(() => {
    useResumeStore.getState().clearAll();
    useResumeHistoryStore.getState().clearHistory();
    localStorage.clear();
  });

  describe("useResumeStore", () => {
    it("should initialize with empty values", () => {
      const state = useResumeStore.getState();
      expect(state.resume).toBe("");
      expect(state.jobDescription).toBe("");
      expect(state.personalPreferences).toBe("");
      expect(state.adaptedResume).toBe("");
      expect(state.gaps).toBe("");
      expect(state.matchResult).toBeNull();
      expect(state.changes).toEqual([]);
    });

    it("should set resume", () => {
      useResumeStore.getState().setResume("My resume content");
      expect(useResumeStore.getState().resume).toBe("My resume content");
    });

    it("should set job description", () => {
      useResumeStore.getState().setJobDescription("Job description");
      expect(useResumeStore.getState().jobDescription).toBe("Job description");
    });

    it("should set personal preferences", () => {
      useResumeStore.getState().setPersonalPreferences("Preferences");
      expect(useResumeStore.getState().personalPreferences).toBe("Preferences");
    });

    it("should handle empty strings", () => {
      useResumeStore.getState().setResume("");
      expect(useResumeStore.getState().resume).toBe("");
    });

    it("should check valid inputs", () => {
      expect(useResumeStore.getState().hasValidInputs()).toBe(false);

      useResumeStore.getState().setResume("Resume");
      expect(useResumeStore.getState().hasValidInputs()).toBe(false);

      useResumeStore.getState().setJobDescription("Job");
      expect(useResumeStore.getState().hasValidInputs()).toBe(true);
    });

    it("should not consider whitespace-only inputs as valid", () => {
      useResumeStore.getState().setResume("   ");
      useResumeStore.getState().setJobDescription("   ");
      expect(useResumeStore.getState().hasValidInputs()).toBe(false);
    });

    it("should update outputs", () => {
      const matchResult: MatchResult = {
        matchPercentage: 85,
        analysis: "Good match",
        checklist: [],
      };
      const changes: ResumeChange[] = [{ section: "Skills", description: "Added new skill" }];

      useResumeStore.getState().updateOutputs({
        adaptedResume: "Adapted resume",
        gaps: "Gaps analysis",
        matchResult,
        changes,
      });

      const state = useResumeStore.getState();
      expect(state.adaptedResume).toBe("Adapted resume");
      expect(state.gaps).toBe("Gaps analysis");
      expect(state.matchResult).toEqual(matchResult);
      expect(state.changes).toEqual(changes);
    });

    it("should clear results only", () => {
      useResumeStore.getState().setResume("Resume");
      useResumeStore.getState().setJobDescription("Job");
      useResumeStore.getState().updateOutputs({
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult: { matchPercentage: 80, analysis: "Good match", checklist: [] },
        changes: [],
      });

      useResumeStore.getState().clearResults();

      const state = useResumeStore.getState();
      expect(state.resume).toBe("Resume");
      expect(state.jobDescription).toBe("Job");
      expect(state.adaptedResume).toBe("");
      expect(state.gaps).toBe("");
      expect(state.matchResult).toBeNull();
      expect(state.changes).toEqual([]);
    });

    it("should clear all data", () => {
      useResumeStore.getState().setResume("Resume");
      useResumeStore.getState().setJobDescription("Job");
      useResumeStore.getState().updateOutputs({
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult: { matchPercentage: 80, analysis: "Good match", checklist: [] },
        changes: [],
      });

      useResumeStore.getState().clearAll();

      const state = useResumeStore.getState();
      expect(state.resume).toBe("");
      expect(state.jobDescription).toBe("");
      expect(state.adaptedResume).toBe("");
      expect(state.gaps).toBe("");
      expect(state.matchResult).toBeNull();
      expect(state.changes).toEqual([]);
    });
  });

  describe("useResumeHistoryStore", () => {
    it("should initialize with empty history", () => {
      expect(useResumeHistoryStore.getState().history).toEqual([]);
    });

    it("should add item to history", () => {
      const matchResult: MatchResult = { matchPercentage: 85, analysis: "Good match", checklist: [] };
      const changes: ResumeChange[] = [];

      useResumeHistoryStore.getState().addToHistory({
        resume: "Resume",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult,
        changes,
      });

      const history = useResumeHistoryStore.getState().history;
      expect(history).toHaveLength(1);
      expect(history[0].resume).toBe("Resume");
      expect(history[0].jobDescription).toBe("Job");
      expect(history[0].matchResult).toEqual(matchResult);
    });

    it("should limit history to 50 items", () => {
      const matchResult: MatchResult = { matchPercentage: 85, analysis: "Good match", checklist: [] };
      const changes: ResumeChange[] = [];

      for (let i = 0; i < 55; i++) {
        useResumeHistoryStore.getState().addToHistory({
          resume: `Resume ${i}`,
          jobDescription: "Job",
          adaptedResume: "Adapted",
          gaps: "Gaps",
          matchResult,
          changes,
        });
      }

      const history = useResumeHistoryStore.getState().history;
      expect(history).toHaveLength(50);
      expect(history[0].resume).toBe("Resume 54");
    });

    it("should remove item from history", () => {
      const matchResult: MatchResult = { matchPercentage: 85, analysis: "Good match", checklist: [] };
      const changes: ResumeChange[] = [];

      useResumeHistoryStore.getState().addToHistory({
        resume: "Resume 1",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult,
        changes,
      });

      useResumeHistoryStore.getState().addToHistory({
        resume: "Resume 2",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult,
        changes,
      });

      const history = useResumeHistoryStore.getState().history;
      const idToRemove = history[0].id;

      useResumeHistoryStore.getState().removeFromHistory(idToRemove);

      const updatedHistory = useResumeHistoryStore.getState().history;
      expect(updatedHistory).toHaveLength(1);
      expect(updatedHistory[0].resume).toBe("Resume 1");
    });

    it("should clear history", () => {
      const matchResult: MatchResult = { matchPercentage: 85, analysis: "Good match", checklist: [] };
      const changes: ResumeChange[] = [];

      useResumeHistoryStore.getState().addToHistory({
        resume: "Resume",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult,
        changes,
      });

      useResumeHistoryStore.getState().clearHistory();
      expect(useResumeHistoryStore.getState().history).toEqual([]);
    });

    it("should load from history", () => {
      const matchResult: MatchResult = { matchPercentage: 85, analysis: "Good match", checklist: [] };
      const changes: ResumeChange[] = [];

      useResumeHistoryStore.getState().addToHistory({
        resume: "Resume",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult,
        changes,
      });

      const history = useResumeHistoryStore.getState().history;
      const item = history[0];

      const setCardData = vi.fn();
      useResumeHistoryStore.getState().loadFromHistory(item, setCardData);

      expect(setCardData).toHaveBeenCalledWith({
        resume: "Resume",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult,
        changes: [],
      });
    });
  });
});
