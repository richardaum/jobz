"use client";

import { MacScrollbar } from "mac-scrollbar";
import { useEffect, useRef } from "react";

import type { ChatbotEmptyState, ChatMessage } from "../types";

interface ChatbotMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  emptyState?: ChatbotEmptyState;
  onScrollToBottom?: () => void;
}

export function ChatbotMessages({ messages, isLoading, emptyState, onScrollToBottom }: ChatbotMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onScrollToBottom) {
      // Small delay to ensure MacScrollbar is rendered
      setTimeout(() => {
        if (messagesEndRef.current) {
          // Try scrollIntoView first
          if (typeof messagesEndRef.current.scrollIntoView === "function") {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
          // Also try scrolling the parent container (MacScrollbar)
          const scrollContainer = messagesEndRef.current.closest(".ms-container");
          if (scrollContainer && typeof scrollContainer.scrollTo === "function") {
            scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: "smooth" });
          }
        }
        onScrollToBottom();
      }, 100);
    }
  }, [messages, onScrollToBottom]);

  // Filter out empty assistant messages when loading (hide them until stream starts writing)
  const visibleMessages = messages.filter((message) => {
    // Hide empty assistant messages while loading (before stream starts writing)
    if (isLoading && message.role === "assistant" && !message.content.trim()) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 min-h-0">
      <MacScrollbar className="h-full w-full" skin="dark">
        <div className="p-4 space-y-4">
          {visibleMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px] text-center">
              <div className="text-muted-foreground">
                <p className="text-sm font-medium mb-1">{emptyState?.title || "Start a conversation"}</p>
                {emptyState?.description && <p className="text-xs">{emptyState.description}</p>}
              </div>
            </div>
          ) : (
            visibleMessages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </MacScrollbar>
    </div>
  );
}
