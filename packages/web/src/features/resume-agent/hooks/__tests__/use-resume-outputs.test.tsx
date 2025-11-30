import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { MatchResult } from "@/entities/match-result";

import { useResumeOutputs } from "../use-resume-outputs";

describe("useResumeOutputs", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with empty values", () => {
    const { result } = renderHook(() => useResumeOutputs());

    expect(result.current.adaptedResume).toBe("");
    expect(result.current.gaps).toBe("");
    expect(result.current.matchResult).toBeNull();
  });

  it("should update adaptedResume via updateOutputs", async () => {
    const { result } = renderHook(() => useResumeOutputs());

    // Wait for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    const mockMatchResult: MatchResult = {
      matchPercentage: 85,
      analysis: "Good match",
      checklist: [],
    };

    act(() => {
      result.current.updateOutputs({
        adaptedResume: "Adapted Resume Content",
        gaps: "",
        matchResult: mockMatchResult,
      });
    });

    expect(result.current.adaptedResume).toBe("Adapted Resume Content");
  });

  it("should update gaps via updateOutputs", async () => {
    const { result } = renderHook(() => useResumeOutputs());

    // Wait for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    const mockMatchResult: MatchResult = {
      matchPercentage: 85,
      analysis: "Good match",
      checklist: [],
    };

    act(() => {
      result.current.updateOutputs({
        adaptedResume: "",
        gaps: "Gaps Analysis Content",
        matchResult: mockMatchResult,
      });
    });

    expect(result.current.gaps).toBe("Gaps Analysis Content");
  });

  it("should update matchResult via updateOutputs", async () => {
    const { result } = renderHook(() => useResumeOutputs());

    const mockMatchResult: MatchResult = {
      matchPercentage: 85,
      analysis: "Good match",
      checklist: [],
    };

    // Wait for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    act(() => {
      result.current.updateOutputs({
        adaptedResume: "",
        gaps: "",
        matchResult: mockMatchResult,
      });
    });

    expect(result.current.matchResult).toEqual(mockMatchResult);
  });

  it("should update all outputs at once", async () => {
    const { result } = renderHook(() => useResumeOutputs());

    const mockMatchResult: MatchResult = {
      matchPercentage: 90,
      analysis: "Excellent match",
      checklist: [
        { category: "Requirement 1", checked: true, description: "Description 1" },
        { category: "Requirement 2", checked: false, description: "Description 2" },
      ],
    };

    // Wait for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    act(() => {
      result.current.updateOutputs({
        adaptedResume: "New Adapted Resume",
        gaps: "New Gaps Analysis",
        matchResult: mockMatchResult,
      });
    });

    expect(result.current.adaptedResume).toBe("New Adapted Resume");
    expect(result.current.gaps).toBe("New Gaps Analysis");
    expect(result.current.matchResult).toEqual(mockMatchResult);
  });

  it("should persist values in localStorage", async () => {
    const { result } = renderHook(() => useResumeOutputs());

    const mockMatchResult: MatchResult = {
      matchPercentage: 75,
      analysis: "Good match",
      checklist: [],
    };

    // Wait for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    act(() => {
      result.current.updateOutputs({
        adaptedResume: "Resume",
        gaps: "Gaps",
        matchResult: mockMatchResult,
      });
    });

    // Strings are stored directly, objects are JSON stringified
    expect(localStorage.getItem("resumeAgent:adaptedResume")).toBe("Resume");
    expect(localStorage.getItem("resumeAgent:gapsAnalysis")).toBe("Gaps");
    expect(localStorage.getItem("resumeAgent:matchResult")).toBe(JSON.stringify(mockMatchResult));
  });

  it("should load values from localStorage on mount", async () => {
    const mockMatchResult: MatchResult = {
      matchPercentage: 80,
      analysis: "Good match",
      checklist: [],
    };

    localStorage.setItem("resumeAgent:adaptedResume", "Stored Resume");
    localStorage.setItem("resumeAgent:gapsAnalysis", "Stored Gaps");
    localStorage.setItem("resumeAgent:matchResult", JSON.stringify(mockMatchResult));

    const { result } = renderHook(() => useResumeOutputs());

    // Wait for hydration
    await waitFor(() => {
      expect(result.current.adaptedResume).toBe("Stored Resume");
    });

    expect(result.current.gaps).toBe("Stored Gaps");
    expect(result.current.matchResult).toEqual(mockMatchResult);
  });
});
