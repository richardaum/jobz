import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getOpenAIApiKey } from "@/shared/config/storage";

import { buildChatbotContext, ChatbotApiError, sendChatbotMessage, sendChatbotMessageStream } from "../../lib";
import { useResumeStore } from "../../stores/resume-store";
import { useResumeChatbot } from "../use-resume-chatbot";

// Mock dependencies
vi.mock("@/shared/config/storage");
vi.mock("../../lib", () => ({
  buildChatbotContext: vi.fn(),
  ChatbotApiError: class ChatbotApiError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ChatbotApiError";
    }
  },
  sendChatbotMessage: vi.fn(),
  sendChatbotMessageStream: vi.fn(),
}));
vi.mock("../../stores/resume-store");
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const STORAGE_KEY = "resumeAgent:chatHistory";

describe("useResumeChatbot", () => {
  const mockGetOpenAIApiKey = vi.mocked(getOpenAIApiKey);
  const mockSendChatbotMessageStream = vi.mocked(sendChatbotMessageStream);
  const mockSendChatbotMessage = vi.mocked(sendChatbotMessage);
  const mockBuildChatbotContext = vi.mocked(buildChatbotContext);
  const mockUseResumeStore = vi.mocked(useResumeStore);

  const createMockStoreState = (overrides = {}) => ({
    resume: "",
    jobDescription: "",
    personalPreferences: "",
    adaptedResume: "Adapted Resume",
    gaps: "Gaps Analysis",
    matchResult: null,
    changes: [],
    sections: [],
    rawResponseJson: null,
    setResume: vi.fn(),
    setJobDescription: vi.fn(),
    setPersonalPreferences: vi.fn(),
    updateOutputs: vi.fn(),
    hasValidInputs: vi.fn(() => true),
    clearResults: vi.fn(),
    clearAll: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Default mocks
    mockGetOpenAIApiKey.mockReturnValue("sk-test-key");
    mockBuildChatbotContext.mockReturnValue("Context String");
    mockSendChatbotMessageStream.mockResolvedValue(undefined);
    mockSendChatbotMessage.mockResolvedValue({ content: "Summary of conversation" });

    // Mock useResumeStore
    mockUseResumeStore.mockImplementation((selector) => {
      const state = createMockStoreState();
      return selector(state);
    });
  });

  describe("localStorage persistence", () => {
    it("should initialize with empty messages", async () => {
      const { result } = renderHook(() => useResumeChatbot());

      // Wait for hydration
      await waitFor(() => {
        expect(result.current.messages).toEqual([]);
      });
    });

    it("should persist messages to localStorage", async () => {
      const { result } = renderHook(() => useResumeChatbot());

      // Wait for hydration
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Mock streaming response
      mockSendChatbotMessageStream.mockImplementation(async (_, onChunk) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        onChunk("Hello");
        onChunk(" World");
      });

      await act(async () => {
        await result.current.sendMessage("Test message");
      });

      await waitFor(
        () => {
          const stored = localStorage.getItem(STORAGE_KEY);
          expect(stored).toBeDefined();
          const parsed = JSON.parse(stored!);
          expect(parsed).toHaveLength(2); // user message + assistant message
          expect(parsed[0].role).toBe("user");
          expect(parsed[0].content).toBe("Test message");
          expect(parsed[1].role).toBe("assistant");
          expect(parsed[1].content).toBe("Hello World");
        },
        { timeout: 2000 }
      );
    });

    it("should load messages from localStorage on mount", async () => {
      const storedMessages = [
        {
          id: "user-1",
          role: "user",
          content: "Stored message",
          timestamp: new Date("2024-01-01").toISOString(),
        },
        {
          id: "assistant-1",
          role: "assistant",
          content: "Stored response",
          timestamp: new Date("2024-01-01").toISOString(),
        },
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedMessages));

      const { result } = renderHook(() => useResumeChatbot());

      // Wait for hydration
      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      expect(result.current.messages[0].content).toBe("Stored message");
      expect(result.current.messages[1].content).toBe("Stored response");
      expect(result.current.messages[0].timestamp).toBeInstanceOf(Date);
      expect(result.current.messages[1].timestamp).toBeInstanceOf(Date);
    });

    it("should serialize and deserialize Date objects correctly", async () => {
      const { result } = renderHook(() => useResumeChatbot());

      // Wait for hydration
      await new Promise((resolve) => setTimeout(resolve, 50));

      mockSendChatbotMessageStream.mockImplementation(async (_, onChunk) => {
        onChunk("Response");
      });

      await act(async () => {
        await result.current.sendMessage("Test");
      });

      await waitFor(
        () => {
          const stored = localStorage.getItem(STORAGE_KEY);
          expect(stored).toBeDefined();
          const parsed = JSON.parse(stored!);
          expect(parsed.length).toBeGreaterThan(0);
          expect(parsed[0].timestamp).toBeDefined();
          expect(typeof parsed[0].timestamp).toBe("string");
          expect(new Date(parsed[0].timestamp)).toBeInstanceOf(Date);
        },
        { timeout: 2000 }
      );

      // Reload and verify dates are deserialized
      const { result: result2 } = renderHook(() => useResumeChatbot());

      await waitFor(
        () => {
          expect(result2.current.messages.length).toBeGreaterThan(0);
          expect(result2.current.messages[0].timestamp).toBeInstanceOf(Date);
        },
        { timeout: 2000 }
      );
    });
  });

  describe("message sending", () => {
    it("should send a message and receive a response", async () => {
      const { result } = renderHook(() => useResumeChatbot());

      // Wait for hydration
      await new Promise((resolve) => setTimeout(resolve, 50));

      mockSendChatbotMessageStream.mockImplementation(async (_, onChunk) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        onChunk("Hello");
        onChunk(" World");
      });

      await act(async () => {
        await result.current.sendMessage("Test message");
      });

      await waitFor(
        () => {
          expect(result.current.messages).toHaveLength(2);
          expect(result.current.messages[0].content).toBe("Test message");
          expect(result.current.messages[1].content).toBe("Hello World");
        },
        { timeout: 2000 }
      );
    });

    it("should show error when API key is not configured", async () => {
      mockGetOpenAIApiKey.mockReturnValue(null);
      const { toast } = await import("sonner");

      const { result } = renderHook(() => useResumeChatbot());

      await new Promise((resolve) => setTimeout(resolve, 10));

      await act(async () => {
        await result.current.sendMessage("Test");
      });

      expect(vi.mocked(toast.error)).toHaveBeenCalledWith("OpenAI API key not configured. Please set it in Settings.");
      expect(result.current.messages).toHaveLength(0);
    });

    it("should show error when no data is available", async () => {
      mockUseResumeStore.mockImplementation((selector) => {
        const state = createMockStoreState({
          adaptedResume: "",
          gaps: "",
          matchResult: null,
        });
        return selector(state);
      });

      const { toast } = await import("sonner");
      const { result } = renderHook(() => useResumeChatbot());

      await new Promise((resolve) => setTimeout(resolve, 10));

      await act(async () => {
        await result.current.sendMessage("Test");
      });

      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        "No resume data available. Please process your resume first."
      );
    });

    it("should handle API errors gracefully", async () => {
      const { toast } = await import("sonner");
      const { result } = renderHook(() => useResumeChatbot());

      await new Promise((resolve) => setTimeout(resolve, 50));

      mockSendChatbotMessageStream.mockRejectedValue(new ChatbotApiError("API Error"));

      await act(async () => {
        await result.current.sendMessage("Test");
      });

      await waitFor(
        () => {
          expect(result.current.messages).toHaveLength(2);
          expect(result.current.messages[1].content).toBe("Sorry, I encountered an error. Please try again.");
        },
        { timeout: 2000 }
      );

      expect(vi.mocked(toast.error)).toHaveBeenCalledWith("API Error");
    });
  });

  describe("summarization", () => {
    it("should summarize conversation when reaching 50 messages", async () => {
      // Create 49 messages (to be at threshold)
      const existingMessages = Array.from({ length: 49 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
        content: `Message ${i}`,
        timestamp: new Date(2024, 0, Math.min(i + 1, 31)).toISOString(), // Use valid dates
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingMessages));

      // Re-render to load the messages
      const { result: result2 } = renderHook(() => useResumeChatbot());

      await waitFor(() => {
        expect(result2.current.messages.length).toBeGreaterThan(0);
      });

      mockSendChatbotMessageStream.mockImplementation(async (_, onChunk) => {
        onChunk("Response");
      });

      mockSendChatbotMessage.mockResolvedValue({
        content: "This is a summary of the previous 49 messages discussing resume adaptation.",
      });

      await act(async () => {
        await result2.current.sendMessage("50th message");
      });

      await waitFor(() => {
        // Should have summary + user message + assistant message
        const messages = result2.current.messages;
        expect(messages.length).toBeGreaterThanOrEqual(2);
        // Check if summary message exists
        const summaryMessage = messages.find((msg) => msg.content.includes("[Previous conversation summary]"));
        expect(summaryMessage).toBeDefined();
      });

      expect(mockSendChatbotMessage).toHaveBeenCalled();
    });

    it("should continue with full history if summarization fails", async () => {
      const { toast } = await import("sonner");

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Create 50 messages
      const existingMessages = Array.from({ length: 50 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
        content: `Message ${i}`,
        timestamp: new Date(2024, 0, Math.min(i + 1, 31)).toISOString(), // Use valid dates
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingMessages));

      const { result: result2 } = renderHook(() => useResumeChatbot());

      await waitFor(() => {
        expect(result2.current.messages.length).toBeGreaterThan(0);
      });

      mockSendChatbotMessage.mockRejectedValue(new ChatbotApiError("Summarization failed"));
      mockSendChatbotMessageStream.mockImplementation(async (_, onChunk) => {
        onChunk("Response");
      });

      await act(async () => {
        await result2.current.sendMessage("51st message");
      });

      await waitFor(() => {
        // Should still have all messages (no summary)
        expect(result2.current.messages.length).toBeGreaterThan(50);
      });

      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        "Failed to summarize conversation. Continuing with full history."
      );
    });

    it("should filter out empty assistant messages before summarizing", async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Create messages with some empty assistant messages
      const existingMessages = Array.from({ length: 49 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
        content: i === 10 ? "" : `Message ${i}`, // One empty message
        timestamp: new Date(2024, 0, Math.min(i + 1, 31)).toISOString(), // Use valid dates
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingMessages));

      const { result: result2 } = renderHook(() => useResumeChatbot());

      await waitFor(() => {
        expect(result2.current.messages.length).toBeGreaterThan(0);
      });

      mockSendChatbotMessage.mockResolvedValue({
        content: "Summary",
      });

      mockSendChatbotMessageStream.mockImplementation(async (_, onChunk) => {
        onChunk("Response");
      });

      await act(async () => {
        await result2.current.sendMessage("50th message");
      });

      await waitFor(() => {
        expect(mockSendChatbotMessage).toHaveBeenCalled();
      });

      // Verify that the summarize call filtered out empty messages
      const summarizeCall = mockSendChatbotMessage.mock.calls[0];
      const messagesToSummarize = summarizeCall[0].messages;
      const emptyMessages = messagesToSummarize.filter((msg) => !msg.content.trim());
      expect(emptyMessages.length).toBe(0);
    });
  });

  describe("data change detection", () => {
    it("should clear messages when resume data changes", async () => {
      const { result, rerender } = renderHook(() => useResumeChatbot());

      await new Promise((resolve) => setTimeout(resolve, 50));

      mockSendChatbotMessageStream.mockImplementation(async (_, onChunk) => {
        onChunk("Response");
      });

      // Send a message
      await act(async () => {
        await result.current.sendMessage("Test");
      });

      await waitFor(
        () => {
          expect(result.current.messages.length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );

      // Change resume data and rerender
      mockUseResumeStore.mockImplementation((selector) => {
        const state = createMockStoreState({
          resume: "New Resume",
        });
        return selector(state);
      });

      rerender();

      await waitFor(
        () => {
          expect(result.current.messages).toEqual([]);
        },
        { timeout: 2000 }
      );
    });

    it("should clear messages when adaptedResume changes", async () => {
      const { result, rerender } = renderHook(() => useResumeChatbot());

      await new Promise((resolve) => setTimeout(resolve, 50));

      mockSendChatbotMessageStream.mockImplementation(async (_, onChunk) => {
        onChunk("Response");
      });

      await act(async () => {
        await result.current.sendMessage("Test");
      });

      await waitFor(
        () => {
          expect(result.current.messages.length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );

      // Change adaptedResume and rerender
      mockUseResumeStore.mockImplementation((selector) => {
        const state = createMockStoreState({
          adaptedResume: "New Adapted Resume",
        });
        return selector(state);
      });

      rerender();

      await waitFor(
        () => {
          expect(result.current.messages).toEqual([]);
        },
        { timeout: 2000 }
      );
    });

    it("should not clear messages when data hasn't changed", async () => {
      const { result } = renderHook(() => useResumeChatbot());

      await new Promise((resolve) => setTimeout(resolve, 50));

      mockSendChatbotMessageStream.mockImplementation(async (_, onChunk) => {
        onChunk("Response");
      });

      await act(async () => {
        await result.current.sendMessage("Test");
      });

      await waitFor(
        () => {
          expect(result.current.messages.length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );

      const messageCount = result.current.messages.length;

      // Re-render with same data - should not clear
      const { result: result2 } = renderHook(() => useResumeChatbot());

      await waitFor(
        () => {
          // Messages should persist if data hasn't changed
          expect(result2.current.messages.length).toBe(messageCount);
        },
        { timeout: 2000 }
      );
    });
  });

  describe("UI state", () => {
    it("should toggle chatbot open/closed state", () => {
      const { result } = renderHook(() => useResumeChatbot());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it("should clear messages", async () => {
      const { result } = renderHook(() => useResumeChatbot());

      await new Promise((resolve) => setTimeout(resolve, 50));

      mockSendChatbotMessageStream.mockImplementation(async (_, onChunk) => {
        onChunk("Response");
      });

      await act(async () => {
        await result.current.sendMessage("Test");
      });

      await waitFor(
        () => {
          expect(result.current.messages.length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toEqual([]);

      // Verify localStorage is cleared
      await waitFor(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        expect(stored).toBe("[]");
      });
    });

    it("should indicate loading state during message sending", async () => {
      const { result } = renderHook(() => useResumeChatbot());

      await new Promise((resolve) => setTimeout(resolve, 10));

      let resolveStream: () => void;
      const streamPromise = new Promise<void>((resolve) => {
        resolveStream = resolve;
      });

      mockSendChatbotMessageStream.mockImplementation(async (_, onChunk) => {
        await streamPromise;
        onChunk("Response");
      });

      act(() => {
        result.current.sendMessage("Test");
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve the stream
      act(() => {
        resolveStream!();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should compute hasData correctly", () => {
      // Test with adaptedResume
      mockUseResumeStore.mockImplementation((selector) => {
        const state = createMockStoreState({
          adaptedResume: "Has data",
          gaps: "",
          matchResult: null,
        });
        return selector(state);
      });

      const { result } = renderHook(() => useResumeChatbot());
      expect(result.current.hasData).toBe(true);

      // Test with gaps
      mockUseResumeStore.mockImplementation((selector) => {
        const state = createMockStoreState({
          adaptedResume: "",
          gaps: "Has gaps",
          matchResult: null,
        });
        return selector(state);
      });

      const { result: result2 } = renderHook(() => useResumeChatbot());
      expect(result2.current.hasData).toBe(true);

      // Test with matchResult
      mockUseResumeStore.mockImplementation((selector) => {
        const state = createMockStoreState({
          adaptedResume: "",
          gaps: "",
          matchResult: { matchPercentage: 85, analysis: "Good", checklist: [] },
        });
        return selector(state);
      });

      const { result: result3 } = renderHook(() => useResumeChatbot());
      expect(result3.current.hasData).toBe(true);

      // Test with no data
      mockUseResumeStore.mockImplementation((selector) => {
        const state = createMockStoreState({
          adaptedResume: "",
          gaps: "",
          matchResult: null,
        });
        return selector(state);
      });

      const { result: result4 } = renderHook(() => useResumeChatbot());
      expect(result4.current.hasData).toBe(false);
    });
  });
});
