import type { MatchResult } from "@/entities/match-result";
import type { ResumeChange, ResumeSection } from "@/entities/resume";
import type { ChatMessage } from "@/shared/chatbot";

// Re-export shared type for feature-specific usage
export type ChatbotMessage = ChatMessage;

export interface ResumeContext {
  resume: string;
  jobDescription: string;
  adaptedResume: string;
  gaps: string;
  matchResult: MatchResult | null;
  changes: ResumeChange[];
  sections: ResumeSection[];
}

export interface ChatbotApiRequest {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  context: string;
  apiKey: string;
}

export interface ChatbotApiResponse {
  content: string;
}
