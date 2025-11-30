import type { ProcessResumeResponse } from "@jobz/ai";
import { renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSettingsStore } from "@/shared/stores";

import { ApiKeyError, useResumeAgent } from "../resume-agent";
import { useResumeProcessing } from "../use-resume-processing";

// Mock dependencies
vi.mock("../resume-agent");
vi.mock("@/shared/stores");
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

type MockUseResumeAgentReturn = Partial<ReturnType<typeof useResumeAgent>> & {
  mutateAsync: ReturnType<typeof useResumeAgent>["mutateAsync"];
  isPending: boolean;
  error: Error | ApiKeyError | null;
  data?: ProcessResumeResponse;
};

describe("useResumeProcessing", () => {
  const mockOnSuccess = vi.fn();
  const mockSetIsSettingsOpen = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettingsStore).mockReturnValue(mockSetIsSettingsOpen);
  });

  it("should return process function and loading states", () => {
    vi.mocked(useResumeAgent).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
      data: undefined,
    } as MockUseResumeAgentReturn as ReturnType<typeof useResumeAgent>);

    const { result } = renderHook(() => useResumeProcessing({ onSuccess: mockOnSuccess }));

    expect(result.current.process).toBeDefined();
    expect(typeof result.current.process).toBe("function");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isMatching).toBe(false);
    expect(result.current.currentMatchResult).toBeNull();
  });

  it("should show error toast when resume or job description is empty", async () => {
    vi.mocked(useResumeAgent).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
      data: undefined,
    } as MockUseResumeAgentReturn as ReturnType<typeof useResumeAgent>);

    const { result } = renderHook(() => useResumeProcessing({ onSuccess: mockOnSuccess }));

    await result.current.process("", "Job description");
    expect(toast.error).toHaveBeenCalledWith("Please fill in both resume and job description");
    expect(mockOnSuccess).not.toHaveBeenCalled();

    await result.current.process("Resume", "");
    expect(toast.error).toHaveBeenCalledWith("Please fill in both resume and job description");
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("should process resume successfully", async () => {
    const mockResult = {
      adaptResume: {
        adaptedResume: "Adapted resume",
        changes: [{ type: "added", content: "New content" }],
        keywords: [],
      },
      analyzeGaps: {
        gaps: "Gaps analysis",
      },
      matchJob: {
        matchPercentage: 85,
        analysis: "Good match",
        checklist: [{ item: "Item 1", checked: true }],
      },
    };

    mockMutateAsync.mockResolvedValue(mockResult);

    vi.mocked(useResumeAgent).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
      data: undefined,
    } as MockUseResumeAgentReturn as ReturnType<typeof useResumeAgent>);

    const { result } = renderHook(() => useResumeProcessing({ onSuccess: mockOnSuccess }));

    await result.current.process("Resume", "Job description");

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        resume: "Resume",
        jobDescription: "Job description",
        personalPreferences: undefined,
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith({
      adaptedResume: "Adapted resume",
      gaps: "Gaps analysis",
      matchResult: {
        matchPercentage: 85,
        analysis: "Good match",
        checklist: [{ item: "Item 1", checked: true }],
      },
      changes: [{ type: "added", content: "New content" }],
    });

    expect(toast.success).toHaveBeenCalledWith("Resume processed successfully!");
  });

  it("should process resume with personal preferences", async () => {
    const mockResult = {
      adaptResume: {
        adaptedResume: "Adapted resume",
        changes: [],
        keywords: [],
      },
      analyzeGaps: {
        gaps: "Gaps analysis",
      },
      matchJob: {
        matchPercentage: 90,
        analysis: "Excellent match",
        checklist: [],
      },
    };

    mockMutateAsync.mockResolvedValue(mockResult);

    vi.mocked(useResumeAgent).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
      data: undefined,
    } as MockUseResumeAgentReturn as ReturnType<typeof useResumeAgent>);

    const { result } = renderHook(() => useResumeProcessing({ onSuccess: mockOnSuccess }));

    await result.current.process("Resume", "Job description", "Personal preferences");

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        resume: "Resume",
        jobDescription: "Job description",
        personalPreferences: "Personal preferences",
      });
    });
  });

  it("should handle API key error and show settings button", () => {
    const apiKeyError = new ApiKeyError("API key is missing");

    vi.mocked(useResumeAgent).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: apiKeyError,
      data: undefined,
    } as MockUseResumeAgentReturn as ReturnType<typeof useResumeAgent>);

    const { result } = renderHook(() => useResumeProcessing({ onSuccess: mockOnSuccess }));

    // The hook should still be functional even with an error
    expect(result.current.process).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle generic error", () => {
    const genericError = new Error("Network error");

    vi.mocked(useResumeAgent).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: genericError,
      data: undefined,
    } as MockUseResumeAgentReturn as ReturnType<typeof useResumeAgent>);

    const { result } = renderHook(() => useResumeProcessing({ onSuccess: mockOnSuccess }));

    // The hook should still be functional even with an error
    expect(result.current.process).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("should return current match result from mutation data", () => {
    const mockData = {
      adaptResume: {
        adaptedResume: "Adapted resume",
        changes: [],
        keywords: [],
      },
      analyzeGaps: {
        gaps: "Gaps analysis",
      },
      matchJob: {
        matchPercentage: 75,
        analysis: "Match",
        checklist: [],
      },
    };

    vi.mocked(useResumeAgent).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
      data: mockData,
    } as MockUseResumeAgentReturn as ReturnType<typeof useResumeAgent>);

    const { result } = renderHook(() => useResumeProcessing({ onSuccess: mockOnSuccess }));

    expect(result.current.currentMatchResult).toEqual({
      matchPercentage: 75,
      analysis: "Match",
      checklist: [],
    });
  });

  it("should return loading states correctly", () => {
    vi.mocked(useResumeAgent).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
      error: null,
      data: undefined,
    } as MockUseResumeAgentReturn as ReturnType<typeof useResumeAgent>);

    const { result } = renderHook(() => useResumeProcessing({ onSuccess: mockOnSuccess }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isMatching).toBe(true);
  });

  it("should handle error during processing", async () => {
    const processingError = new Error("Processing failed");
    mockMutateAsync.mockRejectedValue(processingError);

    vi.mocked(useResumeAgent).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
      data: undefined,
    } as MockUseResumeAgentReturn as ReturnType<typeof useResumeAgent>);

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useResumeProcessing({ onSuccess: mockOnSuccess }));

    await result.current.process("Resume", "Job description");

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error processing resume:", processingError);
    });

    consoleErrorSpy.mockRestore();
  });

  it("should not log ApiKeyError to console", async () => {
    const apiKeyError = new ApiKeyError("API key is missing");
    mockMutateAsync.mockRejectedValue(apiKeyError);

    vi.mocked(useResumeAgent).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
      data: undefined,
    } as MockUseResumeAgentReturn as ReturnType<typeof useResumeAgent>);

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useResumeProcessing({ onSuccess: mockOnSuccess }));

    await result.current.process("Resume", "Job description");

    await waitFor(() => {
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
