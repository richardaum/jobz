"use client";

import { Chatbot, type ChatMessage } from "@/shared/chatbot";

import type { ChatbotMessage } from "../lib";

interface ResumeChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatbotMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onClearMessages?: () => void;
  isLoading: boolean;
}

/**
 * Resume-specific chatbot wrapper that uses the generic Chatbot component
 * Converts feature-specific types to shared types
 */
export function ResumeChatbot({
  isOpen,
  onToggle,
  messages,
  onSendMessage,
  onClearMessages,
  isLoading,
}: ResumeChatbotProps) {
  // Convert feature-specific messages to shared ChatMessage type
  const sharedMessages: ChatMessage[] = messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
  }));

  return (
    <Chatbot
      isOpen={isOpen}
      onToggle={onToggle}
      messages={sharedMessages}
      onSendMessage={onSendMessage}
      onClearMessages={onClearMessages}
      isLoading={isLoading}
      config={{
        header: {
          title: "Ask about Resume",
          description: "Get insights about your adapted resume",
          icon: <span className="text-lg">🤖</span>,
        },
        emptyState: {
          title: "Start a conversation",
          description: "Ask questions about your resume, job match, or gaps analysis",
        },
        placeholder: "Ask a question...",
        position: "bottom-right",
        followUpQuestions: [
          "What are the key strengths of my resume?",
          "How well does my resume match the job description?",
          "What gaps should I address in my resume?",
        ],
      }}
    />
  );
}
