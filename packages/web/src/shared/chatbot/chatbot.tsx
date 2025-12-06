"use client";

import { useState } from "react";

import { cn } from "@/shared/lib";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui";

import { ChatbotHeader } from "./components/chatbot-header";
import { ChatbotInput } from "./components/chatbot-input";
import { ChatbotMessages } from "./components/chatbot-messages";
import type { ChatbotConfig, ChatMessage } from "./types";

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onClearMessages?: () => void;
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

interface ChatContentProps {
  config: ChatbotConfig;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onClearMessages?: () => void;
  isModal: boolean;
  onToggleModal: () => void;
  onClose: () => void;
  isOpen: boolean;
}

function ChatContent({
  config,
  messages,
  isLoading,
  onSendMessage,
  onClearMessages,
  isModal,
  onToggleModal,
  onClose,
  isOpen,
}: ChatContentProps) {
  return (
    <>
      <ChatbotHeader config={config.header} isModal={isModal} onToggleModal={onToggleModal} onClose={onClose} />
      <ChatbotMessages
        messages={messages}
        isLoading={isLoading}
        emptyState={config.emptyState}
        onScrollToBottom={() => {}}
      />
      <ChatbotInput
        placeholder={config.placeholder}
        isLoading={isLoading}
        onSend={onSendMessage}
        onClear={onClearMessages}
        autoFocus={isOpen}
      />
    </>
  );
}

export function Chatbot({
  isOpen,
  onToggle,
  messages,
  onSendMessage,
  onClearMessages,
  isLoading = false,
  config = {},
  className,
}: ChatbotProps) {
  const [isModal, setIsModal] = useState(false);

  const finalConfig = { ...defaultConfig, ...config };
  const position = finalConfig.position || "bottom-right";

  if (!isOpen) {
    return null;
  }

  if (isModal) {
    return (
      <Dialog open={isOpen} onOpenChange={onToggle}>
        <DialogContent
          hideCloseButton
          className={cn("max-w-2xl h-[90vh] max-h-[90vh] flex flex-col p-0 overflow-hidden", className)}
        >
          <DialogTitle className="sr-only">{finalConfig.header.title}</DialogTitle>
          <div className="flex flex-col h-full min-h-0 overflow-hidden">
            <ChatContent
              config={finalConfig}
              messages={messages}
              isLoading={isLoading}
              onSendMessage={onSendMessage}
              onClearMessages={onClearMessages}
              isModal={isModal}
              onToggleModal={() => setIsModal(!isModal)}
              onClose={onToggle}
              isOpen={isOpen}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
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
      <ChatContent
        config={finalConfig}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={onSendMessage}
        onClearMessages={onClearMessages}
        isModal={isModal}
        onToggleModal={() => setIsModal(!isModal)}
        onClose={onToggle}
        isOpen={isOpen}
      />
    </div>
  );
}
