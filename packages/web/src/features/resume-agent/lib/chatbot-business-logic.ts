import { getOpenAIApiKey } from "@/shared/config/storage";

import { buildChatbotContext } from "./build-chatbot-context";
import { ChatbotApiError, sendChatbotMessage, sendChatbotMessageStream } from "./chatbot-api";
import type { ChatbotMessage, ResumeContext } from "./types";

const MESSAGE_THRESHOLD = 50;

// Debug logging utility
const DEBUG = true;
export const log = (category: string, message: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[Chatbot:${category}]`, message, data || "");
  }
};

/**
 * Business logic: Generate follow-up questions based on context and chat history
 */
export async function generateFollowUpQuestions(
  resumeContext: ResumeContext,
  messages: ChatbotMessage[]
): Promise<string[]> {
  const hasData = !!resumeContext.adaptedResume.trim() || !!resumeContext.gaps.trim() || !!resumeContext.matchResult;

  if (!hasData) {
    return [];
  }

  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    return [];
  }

  const contextString = buildChatbotContext(resumeContext);

  // Build conversation history for context
  const conversationHistory = messages
    .filter((msg) => msg.content.trim() !== "")
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

  // Create prompt that considers both context and chat history
  let prompt = `Based on the resume, job description, gaps analysis, and match results provided`;

  if (conversationHistory.length > 0) {
    prompt += `, and considering the conversation history below, generate exactly 3 relevant follow-up questions that a user might want to ask next.`;
  } else {
    prompt += `, generate exactly 3 relevant follow-up questions that a user might want to ask.`;
  }

  prompt += `\n\nThe questions should be:
- Specific and relevant to the resume adaptation context`;

  if (conversationHistory.length > 0) {
    prompt += ` and the current conversation`;
  }

  prompt += `
- Helpful for understanding the resume, job match, or gaps
- Short and concise (one sentence each)
- Different from each other
- Not repeating questions that were already asked in the conversation`;

  if (conversationHistory.length > 0) {
    prompt += `\n\nCONVERSATION HISTORY:\n${conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n\n")}`;
  }

  prompt += `\n\nReturn ONLY a JSON array of exactly 3 strings, nothing else. Example format: ["Question 1?", "Question 2?", "Question 3?"]`;

  const messagesForApi =
    conversationHistory.length > 0
      ? [...conversationHistory, { role: "user" as const, content: prompt }]
      : [{ role: "user" as const, content: prompt }];

  try {
    const response = await sendChatbotMessage({
      messages: messagesForApi,
      context: contextString,
      apiKey,
    });

    // Try to parse the response as JSON array
    try {
      const questions = JSON.parse(response.content.trim());
      if (Array.isArray(questions) && questions.length > 0) {
        // Take up to 3 questions
        return questions.slice(0, 3);
      }
    } catch (parseError) {
      // If JSON parsing fails, try to extract questions from text
      const lines = response.content
        .split("\n")
        .map((line) =>
          line
            .trim()
            .replace(/^[-•*]\s*/, "")
            .replace(/^\d+[.)]\s*/, "")
        )
        .filter((line) => line.length > 0 && line.includes("?"));
      if (lines.length > 0) {
        return lines.slice(0, 3);
      }
    }

    // Fallback: try to extract questions from text
    const lines = response.content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && (line.includes("?") || line.match(/^\d+[.)]/)));
    if (lines.length > 0) {
      return lines.slice(0, 3);
    }

    return [];
  } catch (error) {
    log("generateFollowUpQuestions", "Error", { error });
    return [];
  }
}

/**
 * Business logic: Summarize conversation when it reaches threshold
 */
export async function summarizeConversation(
  resumeContext: ResumeContext,
  messagesToSummarize: ChatbotMessage[]
): Promise<string> {
  log("summarizeConversation", "Starting", { messageCount: messagesToSummarize.length });

  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new ChatbotApiError("OpenAI API key not configured");
  }

  const contextString = buildChatbotContext(resumeContext);

  // Build conversation history for summarization
  const conversationHistory = messagesToSummarize.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  // Add summarize prompt
  const summarizePrompt = `Summarize the messages sent and received in the chat.`;

  conversationHistory.push({
    role: "user",
    content: summarizePrompt,
  });

  try {
    const response = await sendChatbotMessage({
      messages: conversationHistory,
      context: contextString,
      apiKey,
    });

    log("summarizeConversation", "Complete", { summaryLength: response.content.length });
    return response.content;
  } catch (error) {
    log("summarizeConversation", "Failed", { error });
    throw error;
  }
}

/**
 * Business logic: Send a message and get streaming response
 */
export async function sendChatbotMessageWithStream(
  resumeContext: ResumeContext,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  onChunk: (chunk: string) => void
): Promise<void> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new ChatbotApiError("OpenAI API key not configured");
  }

  const contextString = buildChatbotContext(resumeContext);

  await sendChatbotMessageStream(
    {
      messages: conversationHistory,
      context: contextString,
      apiKey,
    },
    onChunk
  );
}

/**
 * Business logic: Check if conversation should be summarized
 */
export function shouldSummarizeConversation(messageCount: number): boolean {
  return messageCount >= MESSAGE_THRESHOLD;
}

/**
 * Business logic: Validate if we have data to chat about
 */
export function hasResumeData(resumeContext: ResumeContext): boolean {
  return !!resumeContext.adaptedResume.trim() || !!resumeContext.gaps.trim() || !!resumeContext.matchResult;
}
