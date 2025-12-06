/**
 * Generic chatbot types for reusable chatbot components
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatbotHeaderConfig {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface ChatbotEmptyState {
  title?: string;
  description?: string;
}

export interface ChatbotConfig {
  header: ChatbotHeaderConfig;
  emptyState?: ChatbotEmptyState;
  placeholder?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  width?: string;
  height?: string;
}
