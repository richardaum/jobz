"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ChatMessage } from "@/shared/chatbot";

import { generateFollowUpQuestions, hasResumeData, log, type ResumeContext } from "../lib";

interface UseFollowUpQuestionsParams {
  resumeContext: ResumeContext;
  messages: ChatMessage[];
  isLoading: boolean;
}

/**
 * Hook to manage follow-up questions generation
 * Isolates all follow-up questions logic from the main chatbot hook
 */
export function useFollowUpQuestions({ resumeContext, messages, isLoading }: UseFollowUpQuestionsParams) {
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const lastQuestionsGenerationRef = useRef<number>(0);

  const hasData = hasResumeData(resumeContext);

  // Generate follow-up questions using AI
  const generateQuestions = useCallback(async () => {
    if (!hasData) {
      setFollowUpQuestions([]);
      return;
    }

    // Avoid duplicate calls within 2 seconds
    const now = Date.now();
    if (now - lastQuestionsGenerationRef.current < 2000) {
      return;
    }
    lastQuestionsGenerationRef.current = now;

    setIsGeneratingQuestions(true);
    try {
      const questions = await generateFollowUpQuestions(resumeContext, messages);
      setFollowUpQuestions(questions);
    } catch (error) {
      log("generateFollowUpQuestions", "Error", { error });
      setFollowUpQuestions([]);
    } finally {
      setIsGeneratingQuestions(false);
    }
  }, [hasData, resumeContext, messages]);

  // Clear questions
  const clearQuestions = useCallback(() => {
    setFollowUpQuestions([]);
    lastQuestionsGenerationRef.current = 0;
  }, []);

  // Generate follow-up questions when:
  // 1. There are no messages and we have data (initial state)
  // 2. When messages change significantly (to update questions based on new context)
  useEffect(() => {
    // Only generate if not currently loading or generating
    if (isLoading || isGeneratingQuestions) {
      return;
    }

    // Generate initial questions when there are no messages
    if (messages.length === 0 && hasData) {
      generateQuestions();
      return;
    }

    // Update questions when we have messages and the last message is from assistant
    // This ensures questions are updated after each assistant response
    if (messages.length > 0 && hasData) {
      const lastMessage = messages[messages.length - 1];
      // Only regenerate if the last message is from assistant and has content
      // And if enough time has passed since last generation (to avoid duplicate calls)
      const timeSinceLastGen = Date.now() - lastQuestionsGenerationRef.current;
      if (lastMessage.role === "assistant" && lastMessage.content.trim() && timeSinceLastGen > 2000) {
        // Small delay to ensure state is settled
        const timeoutId = setTimeout(() => {
          generateQuestions();
        }, 1000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [messages, hasData, isLoading, isGeneratingQuestions, generateQuestions]);

  return {
    followUpQuestions,
    isGeneratingQuestions,
    generateQuestions,
    clearQuestions,
  };
}
