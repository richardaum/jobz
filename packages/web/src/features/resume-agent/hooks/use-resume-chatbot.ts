"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { type ChatbotMessage as ChatbotMessageType, useChatbotQueue } from "@/shared/chatbot/hooks";
import { getOpenAIApiKey } from "@/shared/config/storage";
import { useStream } from "@/shared/stream";

import {
  buildChatbotContext,
  ChatbotApiError,
  type ResumeContext,
  sendChatbotMessage,
  sendChatbotMessageStream,
} from "../lib";
import { useResumeStore } from "../stores/resume-store";

const MESSAGE_THRESHOLD = 50;

// Debug logging utility - simplified
const DEBUG = true;
const log = (category: string, message: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[Chatbot:${category}]`, message, data || "");
  }
};

// Use ChatbotMessage type from the queue hook
type ChatbotMessage = ChatbotMessageType;

export function useResumeChatbot() {
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use chatbot queue hook for managing messages (now uses global Zustand store)
  const {
    messages,
    setMessages,
    clearMessages: queueClearMessages,
  } = useChatbotQueue({
    debug: DEBUG,
  });

  // Business Data from Store
  const resume = useResumeStore((state) => state.resume);
  const jobDescription = useResumeStore((state) => state.jobDescription);
  const adaptedResume = useResumeStore((state) => state.adaptedResume);
  const gaps = useResumeStore((state) => state.gaps);
  const matchResult = useResumeStore((state) => state.matchResult);
  const changes = useResumeStore((state) => state.changes);
  const sections = useResumeStore((state) => state.sections);

  // Track conversation state
  const conversationStateRef = useRef({
    isActive: false,
    lastMessageTime: null as number | null,
    currentAssistantMsgId: null as string | null,
  });

  // Track previous input data to detect changes
  const prevInputDataRef = useRef<{
    resume: string;
    jobDescription: string;
  } | null>(null);

  // Track if we've completed initial hydration
  const isHydratedRef = useRef(false);

  // Ref to track current assistant message ID during streaming
  const currentAssistantMsgIdRef = useRef<string | null>(null);

  // Generic stream hook for managing streaming operations
  const streamHook = useStream({
    onChunk: (chunk, state) => {
      // Mark that we've received the first chunk
      if (!hasReceivedFirstChunkRef.current) {
        hasReceivedFirstChunkRef.current = true;
      }
      // Update the assistant message content incrementally via queue
      if (currentAssistantMsgIdRef.current) {
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === currentAssistantMsgIdRef.current ? { ...msg, content: state.accumulatedContent } : msg
          );
          return updated;
        });
      }
    },
    logEvery: 20,
  });

  // Track if we've received the first chunk of the current stream
  const hasReceivedFirstChunkRef = useRef(false);

  // Computed: Check if we have data to chat about
  const hasData = !!adaptedResume.trim() || !!gaps.trim() || !!matchResult;

  // Clear messages when INPUT data changes (resume or jobDescription)
  useEffect(() => {
    const prevData = prevInputDataRef.current;
    const currentData = {
      resume,
      jobDescription,
    };

    // Skip on initial mount
    if (prevData === null) {
      prevInputDataRef.current = currentData;
      // Mark as hydrated after a short delay to allow store to load
      setTimeout(() => {
        isHydratedRef.current = true;
      }, 100);
      return;
    }

    // Check if input data changed
    const inputDataChanged =
      prevData.resume !== currentData.resume || prevData.jobDescription !== currentData.jobDescription;

    if (!inputDataChanged) {
      // No input change, just update ref
      prevInputDataRef.current = currentData;
      return;
    }

    // Don't clear during initial hydration (when store is loading from localStorage)
    const isInitialHydration =
      !isHydratedRef.current &&
      prevData.resume === "" &&
      prevData.jobDescription === "" &&
      (currentData.resume !== "" || currentData.jobDescription !== "") &&
      messages.length > 0;

    if (isInitialHydration) {
      log("useEffect:clearMessages", "Skipping clear during initial hydration", {
        prevData,
        currentData,
        messageCount: messages.length,
      });
      prevInputDataRef.current = currentData;
      // Mark as hydrated after handling this
      setTimeout(() => {
        isHydratedRef.current = true;
      }, 100);
      return;
    }

    log("useEffect:clearMessages", "Input changed", {
      isActive: conversationStateRef.current.isActive,
      lastMessageTime: conversationStateRef.current.lastMessageTime,
      messageCount: messages.length,
    });

    // Protection checks - don't clear if conversation is active or recent
    const state = conversationStateRef.current;
    const shouldProtect =
      state.isActive || (state.lastMessageTime !== null && Date.now() - state.lastMessageTime < 10000);

    if (shouldProtect) {
      log("useEffect:clearMessages", "Protected", {
        reason: state.isActive ? "active" : "recent",
      });
      prevInputDataRef.current = currentData;
      return;
    }

    // Clear messages only if input changed and no protection
    log("useEffect:clearMessages", "Clearing", { messageCount: messages.length });
    queueClearMessages();
    prevInputDataRef.current = currentData;
  }, [resume, jobDescription, queueClearMessages]);

  // Build resume context for business logic
  const getResumeContext = useCallback((): ResumeContext => {
    return {
      resume,
      jobDescription,
      adaptedResume,
      gaps,
      matchResult,
      changes,
      sections,
    };
  }, [resume, jobDescription, adaptedResume, gaps, matchResult, changes, sections]);

  // Summarize conversation when it reaches threshold
  const summarizeConversation = useCallback(
    async (messagesToSummarize: ChatbotMessage[]): Promise<string> => {
      log("summarizeConversation", "Starting", { messageCount: messagesToSummarize.length });

      const apiKey = getOpenAIApiKey();
      if (!apiKey) {
        throw new ChatbotApiError("OpenAI API key not configured");
      }

      const resumeContext = getResumeContext();
      const contextString = buildChatbotContext(resumeContext);

      // Build conversation history for summarization
      const conversationHistory = messagesToSummarize.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      // Add summarize prompt
      const summarizePrompt = `Summarize the messages sent and received in the chat.`;

      conversationHistory.push({
        role: "user",
        content: summarizePrompt,
      });

      try {
        const response = await sendChatbotMessage({
          messages: conversationHistory,
          context: contextString,
          apiKey,
        });

        log("summarizeConversation", "Complete", { summaryLength: response.content.length });
        return response.content;
      } catch (error) {
        log("summarizeConversation", "Failed", { error });
        throw error;
      }
    },
    [getResumeContext]
  );

  const sendMessage = useCallback(
    async (userMessage: string) => {
      log("sendMessage", "Start", { userMessage, currentCount: messages.length });

      // Validation
      if (!hasData) {
        toast.error("No resume data available. Please process your resume first.");
        return;
      }

      const apiKey = getOpenAIApiKey();
      if (!apiKey) {
        toast.error("OpenAI API key not configured. Please set it in Settings.");
        return;
      }

      // Create message IDs
      const timestamp = Date.now();
      const userMsgId = `user-${timestamp}`;
      const assistantMsgId = `assistant-${timestamp}`;

      // Create user message
      const userMsg: ChatbotMessage = {
        id: userMsgId,
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };

      // Check if we need to summarize before adding new messages
      const currentMessageCount = messages.length;
      let messagesToUse = messages;

      if (currentMessageCount >= MESSAGE_THRESHOLD) {
        log("sendMessage", "Summarizing", { currentCount: currentMessageCount });
        setIsLoading(true);
        try {
          // Summarize all messages except empty assistant messages
          const messagesToSummarize = messages.filter((msg) => msg.content.trim() !== "");
          const summary = await summarizeConversation(messagesToSummarize);

          // Replace old messages with summary
          const summaryMsg: ChatbotMessage = {
            id: `summary-${timestamp}`,
            role: "assistant",
            content: `[Previous conversation summary]\n\n${summary}`,
            timestamp: new Date(),
          };

          messagesToUse = [summaryMsg];
          setMessages([summaryMsg]);
        } catch (error) {
          log("sendMessage", "Summarization failed", { error });
          console.error("Failed to summarize conversation:", error);
          toast.error("Failed to summarize conversation. Continuing with full history.");
          // Continue with existing messages if summarization fails
        } finally {
          setIsLoading(false);
        }
      }

      // Create assistant message placeholder for streaming
      const assistantMsg: ChatbotMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      // Update conversation state BEFORE adding messages
      conversationStateRef.current = {
        isActive: true,
        lastMessageTime: timestamp,
        currentAssistantMsgId: assistantMsgId,
      };

      // Add both user message and empty assistant message in a single state update
      log("sendMessage", "Adding messages", { userMsgId, assistantMsgId });
      setMessages((prev) => {
        const newMessages = [...prev, userMsg, assistantMsg];
        log("sendMessage", "Messages added", { prevCount: prev.length, newCount: newMessages.length });
        return newMessages;
      });

      setIsLoading(true);
      hasReceivedFirstChunkRef.current = false;

      try {
        // Build context using business logic
        const resumeContext = getResumeContext();
        const contextString = buildChatbotContext(resumeContext);

        // Build conversation history for API (use summarized messages if available)
        const conversationHistory = messagesToUse.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

        // Add current user message to history
        conversationHistory.push({
          role: "user",
          content: userMessage,
        });

        log("sendMessage", "Starting stream", { historyLength: conversationHistory.length });

        // Set the current assistant message ID for the stream callback
        currentAssistantMsgIdRef.current = assistantMsgId;

        // Use generic stream hook for managing streaming
        await streamHook.stream(async (onChunk: (chunk: string) => void) => {
          await sendChatbotMessageStream(
            {
              messages: conversationHistory,
              context: contextString,
              apiKey,
            },
            onChunk
          );
        });

        log("sendMessage", "Stream complete", {
          chunkCount: streamHook.chunkCount,
          contentLength: streamHook.accumulatedContent.length,
        });

        // Clear the ref after streaming is complete
        currentAssistantMsgIdRef.current = null;
      } catch (error) {
        log("sendMessage", "Error", { error, assistantMsgId });

        console.error("Chatbot error:", error);

        let errorMessage = "Sorry, I encountered an error. Please try again.";
        if (error instanceof ChatbotApiError) {
          errorMessage = error.message;
          toast.error(errorMessage);
        } else {
          toast.error("Failed to get response from chatbot");
        }

        // Replace the empty assistant message with error message
        setMessages((prev) => {
          const updated = prev.map((msg) => (msg.id === assistantMsgId ? { ...msg, content: errorMessage } : msg));
          log("sendMessage", "Error message set", { assistantMsgId });
          return updated;
        });
      } finally {
        setIsLoading(false);

        // Reset the active flag immediately
        // The useEffect will check the state on the next render cycle
        log("sendMessage", "Resetting state");
        conversationStateRef.current = {
          ...conversationStateRef.current,
          isActive: false,
          currentAssistantMsgId: null,
        };
      }
    },
    [hasData, messages, getResumeContext, summarizeConversation, setMessages, streamHook]
  );

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const clearMessages = useCallback(() => {
    log("clearMessages", "Manual clear", { messageCount: messages.length });
    queueClearMessages();
    conversationStateRef.current = {
      isActive: false,
      lastMessageTime: null,
      currentAssistantMsgId: null,
    };
  }, [messages.length, queueClearMessages]);

  return {
    isOpen,
    toggle,
    messages,
    sendMessage,
    isLoading,
    hasData,
    clearMessages,
  };
}
