"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { getOpenAIApiKey } from "@/shared/config/storage";

import {
  buildChatbotContext,
  ChatbotApiError,
  type ChatbotMessage,
  type ResumeContext,
  sendChatbotMessage,
} from "../lib";
import { useResumeStore } from "../stores/resume-store";

export function useResumeChatbot() {
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Business Data from Store
  const resume = useResumeStore((state) => state.resume);
  const jobDescription = useResumeStore((state) => state.jobDescription);
  const adaptedResume = useResumeStore((state) => state.adaptedResume);
  const gaps = useResumeStore((state) => state.gaps);
  const matchResult = useResumeStore((state) => state.matchResult);
  const changes = useResumeStore((state) => state.changes);
  const sections = useResumeStore((state) => state.sections);

  // Computed: Check if we have data to chat about
  const hasData = !!adaptedResume.trim() || !!gaps.trim() || !!matchResult;

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

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        // Build context using business logic
        const resumeContext = getResumeContext();
        const contextString = buildChatbotContext(resumeContext);

        // Build conversation history for API
        const conversationHistory = messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

        // Add current user message to history
        conversationHistory.push({
          role: "user",
          content: userMessage,
        });

        // Call business logic API
        const response = await sendChatbotMessage({
          messages: conversationHistory,
          context: contextString,
          apiKey,
        });

        // Add assistant response to UI state
        const assistantMsg: ChatbotMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        console.error("Chatbot error:", error);

        let errorMessage = "Sorry, I encountered an error. Please try again.";
        if (error instanceof ChatbotApiError) {
          errorMessage = error.message;
          toast.error(errorMessage);
        } else {
          toast.error("Failed to get response from chatbot");
        }

        // Add error message to UI state
        const errorMsg: ChatbotMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: errorMessage,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [hasData, messages, getResumeContext]
  );

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

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
