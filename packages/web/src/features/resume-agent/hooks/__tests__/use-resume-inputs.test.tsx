import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useResumeInputs } from "../use-resume-inputs";

describe("useResumeInputs", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it("should initialize with empty values", () => {
    const { result } = renderHook(() => useResumeInputs());

    expect(result.current.resume).toBe("");
    expect(result.current.jobDescription).toBe("");
    expect(result.current.hasValidInputs).toBe(false);
  });

  it("should update resume value", () => {
    const { result } = renderHook(() => useResumeInputs());

    act(() => {
      result.current.setResume("My Resume Content");
    });

    expect(result.current.resume).toBe("My Resume Content");
    expect(result.current.hasValidInputs).toBe(false); // Still false because jobDescription is empty
  });

  it("should update jobDescription value", () => {
    const { result } = renderHook(() => useResumeInputs());

    act(() => {
      result.current.setJobDescription("Job Description Content");
    });

    expect(result.current.jobDescription).toBe("Job Description Content");
    expect(result.current.hasValidInputs).toBe(false); // Still false because resume is empty
  });

  it("should return hasValidInputs as true when both inputs are provided", () => {
    const { result } = renderHook(() => useResumeInputs());

    act(() => {
      result.current.setResume("Resume Content");
      result.current.setJobDescription("Job Description");
    });

    expect(result.current.hasValidInputs).toBe(true);
  });

  it("should return hasValidInputs as false when resume is only whitespace", () => {
    const { result } = renderHook(() => useResumeInputs());

    act(() => {
      result.current.setResume("   \n\t  ");
      result.current.setJobDescription("Job Description");
    });

    expect(result.current.hasValidInputs).toBe(false);
  });

  it("should return hasValidInputs as false when jobDescription is only whitespace", () => {
    const { result } = renderHook(() => useResumeInputs());

    act(() => {
      result.current.setResume("Resume Content");
      result.current.setJobDescription("   \n\t  ");
    });

    expect(result.current.hasValidInputs).toBe(false);
  });

  it("should persist values in localStorage", async () => {
    const { result } = renderHook(() => useResumeInputs());

    // Wait for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    act(() => {
      result.current.setResume("Resume");
      result.current.setJobDescription("Job");
    });

    // useLocalStorage stores strings directly (not JSON stringified)
    expect(localStorage.getItem("resumeAgent:resume")).toBe("Resume");
    expect(localStorage.getItem("resumeAgent:jobDescription")).toBe("Job");
  });

  it("should load values from localStorage on mount", async () => {
    localStorage.setItem("resumeAgent:resume", "Stored Resume");
    localStorage.setItem("resumeAgent:jobDescription", "Stored Job");

    const { result } = renderHook(() => useResumeInputs());

    // Wait for hydration
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(result.current.resume).toBe("Stored Resume");
    expect(result.current.jobDescription).toBe("Stored Job");
    expect(result.current.hasValidInputs).toBe(true);
  });
});
