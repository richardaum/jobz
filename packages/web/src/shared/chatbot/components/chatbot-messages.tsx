"use client";

import { MacScrollbar } from "mac-scrollbar";
import { useRef } from "react";

import { useAutoScroll } from "../hooks";
import type { ChatbotEmptyState, ChatMessage } from "../types";
import { MarkdownMessage } from "./markdown-message";

interface ChatbotMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  emptyState?: ChatbotEmptyState;
  onScrollToBottom?: () => void;
}

export function ChatbotMessages({ messages, isLoading, emptyState, onScrollToBottom }: ChatbotMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Handle auto-scrolling with respect to user scroll position
  useAutoScroll({
    messagesEndRef,
    enabled: true,
    onScrollToBottom,
    dependencies: [messages],
  });

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
                  <MarkdownMessage content={message.content} />
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
