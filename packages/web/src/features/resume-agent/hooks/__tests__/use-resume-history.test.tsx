import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { MatchResult } from "@/entities/match-result";
import type { ResumeChange } from "@/entities/resume";

import { useResumeHistory } from "../use-resume-history";

describe("useResumeHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const createMockMatchResult = (): MatchResult => ({
    matchPercentage: 85,
    analysis: "Good match",
    checklist: [
      { category: "Skills", description: "Requirement 1", checked: true },
      { category: "Experience", description: "Requirement 2", checked: false },
    ],
  });

  const createMockResumeChange = (): ResumeChange => ({
    section: "Experience",
    description: "Added new experience",
  });

  it("should initialize with empty history", () => {
    const { result } = renderHook(() => useResumeHistory());

    expect(result.current.history).toEqual([]);
  });

  it("should add item to history", async () => {
    const { result } = renderHook(() => useResumeHistory());

    // Wait for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    act(() => {
      result.current.addToHistory({
        resume: "Resume Content",
        jobDescription: "Job Description",
        adaptedResume: "Adapted Resume",
        gaps: "Gaps Analysis",
        matchResult: createMockMatchResult(),
        changes: [createMockResumeChange()],
      });
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });

    expect(result.current.history[0].resume).toBe("Resume Content");
    expect(result.current.history[0].jobDescription).toBe("Job Description");
    expect(result.current.history[0].id).toBeDefined();
    expect(result.current.history[0].timestamp).toBeDefined();
  });

  it("should generate unique IDs for history items", async () => {
    const { result } = renderHook(() => useResumeHistory());

    // Wait for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    act(() => {
      result.current.addToHistory({
        resume: "Resume 1",
        jobDescription: "Job 1",
        adaptedResume: "Adapted 1",
        gaps: "Gaps 1",
        matchResult: createMockMatchResult(),
        changes: [],
      });
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });

    act(() => {
      result.current.addToHistory({
        resume: "Resume 2",
        jobDescription: "Job 2",
        adaptedResume: "Adapted 2",
        gaps: "Gaps 2",
        matchResult: createMockMatchResult(),
        changes: [],
      });
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(2);
    });

    expect(result.current.history[0].id).not.toBe(result.current.history[1].id);
  });

  it("should add new items to the beginning of history", async () => {
    const { result } = renderHook(() => useResumeHistory());

    // Wait for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    act(() => {
      result.current.addToHistory({
        resume: "First",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult: createMockMatchResult(),
        changes: [],
      });
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });

    act(() => {
      result.current.addToHistory({
        resume: "Second",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult: createMockMatchResult(),
        changes: [],
      });
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(2);
    });

    expect(result.current.history[0].resume).toBe("Second");
    expect(result.current.history[1].resume).toBe("First");
  });

  it("should limit history to 50 items", async () => {
    const { result } = renderHook(() => useResumeHistory());

    // Wait for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Add items one by one to ensure state updates correctly
    for (let i = 0; i < 55; i++) {
      act(() => {
        result.current.addToHistory({
          resume: `Resume ${i}`,
          jobDescription: "Job",
          adaptedResume: "Adapted",
          gaps: "Gaps",
          matchResult: createMockMatchResult(),
          changes: [],
        });
      });
      // Small delay to allow state updates
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    await waitFor(
      () => {
        expect(result.current.history.length).toBeGreaterThanOrEqual(50);
      },
      { timeout: 2000 }
    );

    expect(result.current.history).toHaveLength(50);
    expect(result.current.history[0].resume).toBe("Resume 54");
    expect(result.current.history[49].resume).toBe("Resume 5");
  });

  it("should remove item from history", async () => {
    const { result } = renderHook(() => useResumeHistory());

    // Wait for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    act(() => {
      result.current.addToHistory({
        resume: "First",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult: createMockMatchResult(),
        changes: [],
      });
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });

    const firstId = result.current.history[0].id;

    act(() => {
      result.current.addToHistory({
        resume: "Second",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult: createMockMatchResult(),
        changes: [],
      });
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(2);
    });

    act(() => {
      result.current.removeFromHistory(firstId);
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });

    expect(result.current.history[0].resume).toBe("Second");
  });

  it("should clear all history", () => {
    const { result } = renderHook(() => useResumeHistory());

    act(() => {
      result.current.addToHistory({
        resume: "First",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult: createMockMatchResult(),
        changes: [],
      });
      result.current.addToHistory({
        resume: "Second",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult: createMockMatchResult(),
        changes: [],
      });
    });

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history).toEqual([]);
  });

  it("should get history item by ID", async () => {
    const { result } = renderHook(() => useResumeHistory());

    // Wait for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    act(() => {
      result.current.addToHistory({
        resume: "Target",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult: createMockMatchResult(),
        changes: [],
      });
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });

    const targetId = result.current.history[0].id;

    act(() => {
      result.current.addToHistory({
        resume: "Other",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult: createMockMatchResult(),
        changes: [],
      });
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(2);
    });

    const item = result.current.getHistoryItem(targetId);
    expect(item).toBeDefined();
    expect(item?.resume).toBe("Target");
  });

  it("should return undefined for non-existent ID", () => {
    const { result } = renderHook(() => useResumeHistory());

    const item = result.current.getHistoryItem("non-existent-id");
    expect(item).toBeUndefined();
  });

  it("should persist history in localStorage", () => {
    const { result } = renderHook(() => useResumeHistory());

    act(() => {
      result.current.addToHistory({
        resume: "Resume",
        jobDescription: "Job",
        adaptedResume: "Adapted",
        gaps: "Gaps",
        matchResult: createMockMatchResult(),
        changes: [],
      });
    });

    const stored = localStorage.getItem("resumeAgent:history");
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].resume).toBe("Resume");
  });
});
