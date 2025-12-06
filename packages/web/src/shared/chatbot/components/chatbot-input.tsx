"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/shared/ui";

interface ChatbotInputProps {
  placeholder?: string;
  isLoading: boolean;
  onSend: (message: string) => Promise<void>;
  onClear?: () => void;
  autoFocus?: boolean;
}

export function ChatbotInput({
  placeholder = "Type your message...",
  isLoading,
  onSend,
  onClear,
  autoFocus = false,
}: ChatbotInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const message = input.trim();
      setInput("");
      await onSend(message);
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

  return (
    <div className="border-t border-border shrink-0">
      <div className="p-4 pb-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-h-[60px] max-h-[120px] px-3 py-2 text-sm border border-input rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
          rows={2}
        />
      </div>
      {/* Toolbar */}
      <div className="px-4 pb-4 flex justify-end gap-2">
        {onClear && (
          <Button onClick={onClear} disabled={isLoading} size="sm" type="button" variant="outline">
            Clear
          </Button>
        )}
        <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="sm" type="button">
          Send
        </Button>
      </div>
    </div>
  );
}
