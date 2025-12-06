import { useCallback, useEffect, useRef } from "react";

import { useChatbotQueueStore } from "../stores/chatbot-queue-store";

// Serializable message format for localStorage (Date as ISO string)
export interface SerializableMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO string
}

// Chat message format with Date object
export interface ChatbotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface UseChatbotQueueOptions {
  // Legacy options - kept for backward compatibility but no longer used
  serializedMessages?: SerializableMessage[];
  setSerializedMessages?: (
    value: SerializableMessage[] | ((val: SerializableMessage[]) => SerializableMessage[])
  ) => void;
  onUpdate?: (prevCount: number, newCount: number) => void;
  onClear?: (prevCount: number) => void;
  debug?: boolean;
}

/**
 * Hook for managing chatbot message queue operations
 * Now uses a global Zustand store for state management
 */
export function useChatbotQueue(options: UseChatbotQueueOptions = {}) {
  const { onUpdate, onClear, debug = false } = options;

  // Get messages and actions from the global store
  const messages = useChatbotQueueStore((state) => state.messages);
  const setMessages = useChatbotQueueStore((state) => state.setMessages);
  const clearMessages = useChatbotQueueStore((state) => state.clearMessages);

  // Ref to track current messages for callbacks
  const messagesRef = useRef<ChatbotMessage[]>(messages);
  const prevCountRef = useRef<number>(messages.length);

  // Update ref whenever messages change
  useEffect(() => {
    const prevCount = prevCountRef.current;
    const newCount = messages.length;

    // Only call callbacks if count actually changed
    if (prevCount !== newCount) {
      if (newCount === 0 && prevCount > 0) {
        // Messages were cleared
        if (debug) {
          console.log(`[ChatbotQueue:clear]`, "Messages cleared", { prevCount });
        }
        onClear?.(prevCount);
      } else if (newCount !== prevCount) {
        // Messages were updated
        if (debug) {
          console.log(`[ChatbotQueue:update]`, "Messages updated", { prevCount, newCount });
        }
        onUpdate?.(prevCount, newCount);
      }
    }

    messagesRef.current = messages;
    prevCountRef.current = newCount;
  }, [messages, onUpdate, onClear, debug]);

  // Debug logging utility
  const log = useCallback(
    (category: string, message: string, data?: unknown) => {
      if (debug) {
        console.log(`[ChatbotQueue:${category}]`, message, data || "");
      }
    },
    [debug]
  );

  // Wrapped setMessages with logging
  const setMessagesWithLog = useCallback(
    (updater: ChatbotMessage[] | ((prev: ChatbotMessage[]) => ChatbotMessage[])) => {
      log("setMessages", "Queuing operation");
      setMessages(updater);
    },
    [setMessages, log]
  );

  // Wrapped clearMessages with logging
  const clearMessagesWithLog = useCallback(() => {
    log("clearMessages", "Queuing clear operation");
    clearMessages();
  }, [clearMessages, log]);

  return {
    messages,
    messagesRef,
    setMessages: setMessagesWithLog,
    clearMessages: clearMessagesWithLog,
  };
}
