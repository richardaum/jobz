import axios from "axios";

import { getChatbotSystemMessage } from "./build-chatbot-context";
import type { ChatbotApiRequest, ChatbotApiResponse } from "./types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TEMPERATURE = 0.7;

export class ChatbotApiError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "ChatbotApiError";
  }
}

/**
 * Sends a message to the chatbot API and returns the response
 */
export async function sendChatbotMessage(request: ChatbotApiRequest): Promise<ChatbotApiResponse> {
  const { messages, context, apiKey } = request;

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `${getChatbotSystemMessage()}\n\nCONTEXT:\n${context}`,
          },
          ...messages,
        ],
        temperature: DEFAULT_TEMPERATURE,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new ChatbotApiError("No content in API response");
    }

    return { content };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error?.message || error.message || "Failed to get response from chatbot";
      throw new ChatbotApiError(errorMessage, error);
    }

    throw new ChatbotApiError("Unknown error occurred", error);
  }
}
