"use client";

import { IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";

import type { ChatbotConfig, ChatMessage } from "./types";

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  config?: Partial<ChatbotConfig>;
  className?: string;
}

const defaultConfig: ChatbotConfig = {
  header: {
    title: "Chat",
    description: "Start a conversation",
  },
  emptyState: {
    title: "Start a conversation",
    description: "Ask a question to get started",
  },
  placeholder: "Type your message...",
  position: "bottom-right",
  width: "w-96",
  height: "h-[600px]",
};

const positionClasses = {
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
};

export function Chatbot({
  isOpen,
  onToggle,
  messages,
  onSendMessage,
  isLoading = false,
  config = {},
  className,
}: ChatbotProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const finalConfig = { ...defaultConfig, ...config };
  const position = finalConfig.position || "bottom-right";

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const message = input.trim();
      setInput("");
      await onSendMessage(message);
      // Focus back on input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bg-background border border-border rounded-lg shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-4 fade-in-0",
        positionClasses[position],
        finalConfig.width,
        finalConfig.height,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          {finalConfig.header.icon ? (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              {finalConfig.header.icon}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-sm">{finalConfig.header.title}</h3>
            {finalConfig.header.description && (
              <p className="text-xs text-muted-foreground">{finalConfig.header.description}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle} type="button" className="h-8 w-8 p-0">
          <IconX className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px] text-center">
              <div className="text-muted-foreground">
                <p className="text-sm font-medium mb-1">{finalConfig.emptyState?.title || "Start a conversation"}</p>
                {finalConfig.emptyState?.description && <p className="text-xs">{finalConfig.emptyState.description}</p>}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
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
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={finalConfig.placeholder}
            className="flex-1 min-h-[60px] max-h-[120px] px-3 py-2 text-sm border border-input rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
            type="button"
            className="self-end shrink-0"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
