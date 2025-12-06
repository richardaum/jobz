import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ChatbotMessage, SerializableMessage } from "../hooks/use-chatbot-queue";

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

// Queue operation types
type QueueOperation = {
  type: "update" | "clear";
  updater?: ChatbotMessage[] | ((prev: ChatbotMessage[]) => ChatbotMessage[]);
};

interface ChatbotQueueStore {
  // State
  messages: ChatbotMessage[];
  queue: QueueOperation[];
  isProcessing: boolean;

  // Actions
  enqueueOperation: (operation: QueueOperation) => void;
  processQueue: () => void;
  setMessages: (updater: ChatbotMessage[] | ((prev: ChatbotMessage[]) => ChatbotMessage[])) => void;
  clearMessages: () => void;
}

export const useChatbotQueueStore = create<ChatbotQueueStore>()(
  persist(
    (set, get) => {
      // Process queue operations sequentially
      const processQueue = () => {
        const state = get();
        if (state.isProcessing || state.queue.length === 0) {
          return;
        }

        set({ isProcessing: true });

        try {
          // Process all queued operations sequentially
          while (get().queue.length > 0) {
            const operation = get().queue[0];
            const newQueue = get().queue.slice(1);
            set({ queue: newQueue });

            if (operation.type === "clear") {
              set({ messages: [] });
            } else if (operation.updater) {
              const currentMessages = get().messages;
              const newMessages =
                typeof operation.updater === "function" ? operation.updater([...currentMessages]) : operation.updater;

              // Safety check: prevent clearing if we have messages
              if (newMessages.length === 0 && currentMessages.length > 0) {
                // Skip this operation
                continue;
              }

              set({ messages: newMessages });
            }
          }
        } finally {
          set({ isProcessing: false });
        }
      };

      return {
        messages: [],
        queue: [],
        isProcessing: false,

        enqueueOperation: (operation: QueueOperation) => {
          set((state) => ({
            queue: [...state.queue, operation],
          }));

          // Process immediately if not already processing
          // Use setTimeout to ensure state updates are batched
          setTimeout(() => {
            const currentState = get();
            if (!currentState.isProcessing && currentState.queue.length > 0) {
              processQueue();
            }
          }, 0);
        },

        processQueue,

        setMessages: (updater: ChatbotMessage[] | ((prev: ChatbotMessage[]) => ChatbotMessage[])) => {
          get().enqueueOperation({
            type: "update",
            updater,
          });
        },

        clearMessages: () => {
          get().enqueueOperation({ type: "clear" });
        },
      };
    },
    {
      name: "chatbot-queue-storage",
      // Persist only messages (serialized), not queue or processing state
      partialize: (state) => ({
        messages: state.messages.map(serializeMessage),
      }),
      // Deserialize messages on rehydration
      merge: (persistedState: unknown, currentState) => {
        const persisted = persistedState as { messages?: SerializableMessage[] } | undefined;
        return {
          ...currentState,
          messages: persisted?.messages?.map(deserializeMessage) ?? [],
          queue: [], // Reset queue on rehydration
          isProcessing: false, // Reset processing state on rehydration
        };
      },
    }
  )
);
