export interface ConversationState {
  isActive: boolean;
  lastMessageTime: number | null;
  currentAssistantMsgId: string | null;
}

export interface ConversationStateManager {
  state: ConversationState;
  setActive: (assistantMsgId: string) => void;
  setInactive: () => void;
  shouldProtect: () => boolean;
  reset: () => void;
}

/**
 * Creates a conversation state manager
 */
export function createConversationStateManager(): ConversationStateManager {
  let state: ConversationState = {
    isActive: false,
    lastMessageTime: null,
    currentAssistantMsgId: null,
  };

  return {
    get state() {
      return state;
    },
    setActive(assistantMsgId: string) {
      state = {
        isActive: true,
        lastMessageTime: Date.now(),
        currentAssistantMsgId: assistantMsgId,
      };
    },
    setInactive() {
      state = {
        ...state,
        isActive: false,
        currentAssistantMsgId: null,
      };
    },
    shouldProtect() {
      return state.isActive || (state.lastMessageTime !== null && Date.now() - state.lastMessageTime < 10000);
    },
    reset() {
      state = {
        isActive: false,
        lastMessageTime: null,
        currentAssistantMsgId: null,
      };
    },
  };
}

/**
 * Check if input data changed
 */
export function hasInputDataChanged(
  prev: { resume: string; jobDescription: string } | null,
  current: { resume: string; jobDescription: string }
): boolean {
  if (prev === null) {
    return false;
  }
  return prev.resume !== current.resume || prev.jobDescription !== current.jobDescription;
}

/**
 * Check if this is initial hydration (store loading from localStorage)
 */
export function isInitialHydration(
  isHydrated: boolean,
  prevData: { resume: string; jobDescription: string } | null,
  currentData: { resume: string; jobDescription: string },
  messageCount: number
): boolean {
  return (
    !isHydrated &&
    prevData !== null &&
    prevData.resume === "" &&
    prevData.jobDescription === "" &&
    (currentData.resume !== "" || currentData.jobDescription !== "") &&
    messageCount > 0
  );
}
