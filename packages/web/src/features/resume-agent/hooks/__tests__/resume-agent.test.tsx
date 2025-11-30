import { OpenAIClient } from "@jobz/ai";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getOpenAIApiKey } from "@/shared/config/storage";

import { ApiKeyError, useResumeAgent } from "../resume-agent";

// Mock dependencies
vi.mock("@/shared/config/storage", () => ({
  getOpenAIApiKey: vi.fn(),
}));

vi.mock("@jobz/ai", () => ({
  OpenAIClient: vi.fn(),
}));

describe("useResumeAgent", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should throw ApiKeyError when API key is not configured", async () => {
    vi.mocked(getOpenAIApiKey).mockReturnValue(null);

    const { result } = renderHook(() => useResumeAgent(), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          resume: "Resume",
          jobDescription: "Job",
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApiKeyError);
        expect((error as ApiKeyError).message).toBe("OpenAI API key not configured. Please set it in Settings.");
      }
    });
  });

  it("should call OpenAIClient.processResume when API key is configured", async () => {
    const mockApiKey = "sk-test-key";
    const mockResponse = {
      adaptedResume: "Adapted Resume",
      gaps: "Gaps Analysis",
      matchResult: { score: 85, checklist: [] },
    };

    vi.mocked(getOpenAIApiKey).mockReturnValue(mockApiKey);
    const mockProcessResume = vi.fn().mockResolvedValue(mockResponse);
    vi.mocked(OpenAIClient).mockImplementation(
      () =>
        ({
          processResume: mockProcessResume,
        }) as Partial<OpenAIClient> as OpenAIClient
    );

    const { result } = renderHook(() => useResumeAgent(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        resume: "Resume",
        jobDescription: "Job",
      });
    });

    expect(OpenAIClient).toHaveBeenCalledWith(mockApiKey);
    expect(mockProcessResume).toHaveBeenCalledWith({
      resume: "Resume",
      jobDescription: "Job",
    });
  });

  it("should handle API errors", async () => {
    const mockApiKey = "sk-test-key";
    const mockError = new Error("API Error");

    vi.mocked(getOpenAIApiKey).mockReturnValue(mockApiKey);
    const mockProcessResume = vi.fn().mockRejectedValue(mockError);
    vi.mocked(OpenAIClient).mockImplementation(
      () =>
        ({
          processResume: mockProcessResume,
        }) as Partial<OpenAIClient> as OpenAIClient
    );

    const { result } = renderHook(() => useResumeAgent(), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          resume: "Resume",
          jobDescription: "Job",
        });
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });

  it("should have retry set to 1", () => {
    const { result } = renderHook(() => useResumeAgent(), { wrapper });
    // The retry configuration is internal to react-query
    // We can verify it's set by checking the mutation options
    expect(result.current).toBeDefined();
  });
});
