"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getOpenAIApiKey } from "@/shared/config/storage";
import { useLocalStorage } from "@/shared/hooks/use-local-storage";

import {
  buildChatbotContext,
  ChatbotApiError,
  type ChatbotMessage,
  type ResumeContext,
  sendChatbotMessage,
  sendChatbotMessageStream,
} from "../lib";
import { useResumeStore } from "../stores/resume-store";

const STORAGE_KEY = "resumeAgent:chatHistory";
const MESSAGE_THRESHOLD = 50;

// Serializable message format for localStorage (Date as ISO string)
interface SerializableMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO string
}

// Convert ChatMessage to SerializableMessage
function serializeMessage(msg: ChatbotMessage): SerializableMessage {
  return {
    ...msg,
    timestamp: msg.timestamp.toISOString(),
  };
}

// Convert SerializableMessage to ChatMessage
function deserializeMessage(msg: SerializableMessage): ChatbotMessage {
  return {
    ...msg,
    timestamp: new Date(msg.timestamp),
  };
}

export function useResumeChatbot() {
  // UI State
  const [isOpen, setIsOpen] = useState(false);

  // Use localStorage for messages with Date serialization
  const [serializedMessages, setSerializedMessages] = useLocalStorage<SerializableMessage[]>(STORAGE_KEY, []);

  // Convert serialized messages to ChatMessage format
  const messages: ChatbotMessage[] = serializedMessages.map(deserializeMessage);

  // Helper to update messages (converts to serialized format)
  const setMessages = useCallback(
    (updater: ChatbotMessage[] | ((prev: ChatbotMessage[]) => ChatbotMessage[])) => {
      setSerializedMessages((prev) => {
        const prevMessages = prev.map(deserializeMessage);
        const newMessages = typeof updater === "function" ? updater(prevMessages) : updater;
        return newMessages.map(serializeMessage);
      });
    },
    [setSerializedMessages]
  );

  const [isLoading, setIsLoading] = useState(false);

  // Business Data from Store
  const resume = useResumeStore((state) => state.resume);
  const jobDescription = useResumeStore((state) => state.jobDescription);
  const adaptedResume = useResumeStore((state) => state.adaptedResume);
  const gaps = useResumeStore((state) => state.gaps);
  const matchResult = useResumeStore((state) => state.matchResult);
  const changes = useResumeStore((state) => state.changes);
  const sections = useResumeStore((state) => state.sections);

  // Track previous data to detect changes
  const prevDataRef = useRef<{
    resume: string;
    jobDescription: string;
    adaptedResume: string;
    gaps: string;
    matchResult: typeof matchResult;
    changes: typeof changes;
    sections: typeof sections;
  } | null>(null);

  // Track if we're in an active conversation to prevent clearing messages during streaming
  const isActiveConversationRef = useRef(false);

  // Computed: Check if we have data to chat about
  const hasData = !!adaptedResume.trim() || !!gaps.trim() || !!matchResult;

  // Clear messages when data changes (inputs or outputs)
  // But only if we're not in an active conversation
  useEffect(() => {
    const prevData = prevDataRef.current;
    const currentData = {
      resume,
      jobDescription,
      adaptedResume,
      gaps,
      matchResult,
      changes,
      sections,
    };

    // Skip on initial mount
    if (prevData === null) {
      prevDataRef.current = currentData;
      return;
    }

    // Don't clear messages if we're in an active conversation
    if (isActiveConversationRef.current) {
      // Still update the ref for next comparison
      prevDataRef.current = currentData;
      return;
    }

    // Check if any relevant data changed
    const dataChanged =
      prevData.resume !== currentData.resume ||
      prevData.jobDescription !== currentData.jobDescription ||
      prevData.adaptedResume !== currentData.adaptedResume ||
      prevData.gaps !== currentData.gaps ||
      prevData.matchResult !== currentData.matchResult ||
      prevData.changes.length !== currentData.changes.length ||
      prevData.sections.length !== currentData.sections.length;

    // If data changed, clear messages to avoid stale context
    if (dataChanged) {
      setMessages([]);
    }

    // Update ref for next comparison
    prevDataRef.current = currentData;
  }, [resume, jobDescription, adaptedResume, gaps, matchResult, changes, sections, setMessages]);

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
      const summarizePrompt = `Please provide a concise summary of the conversation so far. Focus on:
- Key topics discussed
- Important questions asked and answers provided
- Any decisions or conclusions reached
- Relevant context about the resume adaptation process

Keep the summary brief but comprehensive enough to maintain context for future messages.`;

      conversationHistory.push({
        role: "user",
        content: summarizePrompt,
      });

      const response = await sendChatbotMessage({
        messages: conversationHistory,
        context: contextString,
        apiKey,
      });

      return response.content;
    },
    [getResumeContext]
  );

  const sendMessage = useCallback(
    async (userMessage: string) => {
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

      // Add user message to UI state
      const userMsg: ChatbotMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };

      // Check if we need to summarize before adding new messages
      const currentMessageCount = messages.length;
      let messagesToUse = messages;

      if (currentMessageCount >= MESSAGE_THRESHOLD) {
        setIsLoading(true);
        try {
          // Summarize all messages except empty assistant messages
          const messagesToSummarize = messages.filter((msg) => msg.content.trim() !== "");
          const summary = await summarizeConversation(messagesToSummarize);

          // Replace old messages with summary
          const summaryMsg: ChatbotMessage = {
            id: `summary-${Date.now()}`,
            role: "assistant",
            content: `[Previous conversation summary]\n\n${summary}`,
            timestamp: new Date(),
          };

          messagesToUse = [summaryMsg];
          setMessages([summaryMsg]);
        } catch (error) {
          console.error("Failed to summarize conversation:", error);
          toast.error("Failed to summarize conversation. Continuing with full history.");
          // Continue with existing messages if summarization fails
        } finally {
          setIsLoading(false);
        }
      }

      // Create assistant message placeholder for streaming
      const assistantMsgId = `assistant-${Date.now()}`;
      const assistantMsg: ChatbotMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      // Add both user message and empty assistant message in a single state update
      // This prevents race conditions where the assistant message might be added before the user message
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);
      isActiveConversationRef.current = true;

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

        // Call streaming API
        await sendChatbotMessageStream(
          {
            messages: conversationHistory,
            context: contextString,
            apiKey,
          },
          (chunk: string) => {
            // Update the assistant message content incrementally
            setMessages((prev) =>
              prev.map((msg) => (msg.id === assistantMsgId ? { ...msg, content: msg.content + chunk } : msg))
            );
          }
        );
      } catch (error) {
        console.error("Chatbot error:", error);

        let errorMessage = "Sorry, I encountered an error. Please try again.";
        if (error instanceof ChatbotApiError) {
          errorMessage = error.message;
          toast.error(errorMessage);
        } else {
          toast.error("Failed to get response from chatbot");
        }

        // Replace the empty assistant message with error message
        setMessages((prev) => prev.map((msg) => (msg.id === assistantMsgId ? { ...msg, content: errorMessage } : msg)));
      } finally {
        setIsLoading(false);
        isActiveConversationRef.current = false;
      }
    },
    [hasData, messages, getResumeContext, summarizeConversation, setMessages]
  );

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

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
