import axios from "axios";

import { getChatbotSystemMessage } from "./build-chatbot-context";
import type { ChatbotApiRequest, ChatbotApiResponse } from "./types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TEMPERATURE = 0.7;

export type StreamChunkCallback = (chunk: string) => void;

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

/**
 * Sends a message to the chatbot API with streaming support
 * Calls onChunk for each chunk of content as it arrives
 */
export async function sendChatbotMessageStream(
  request: ChatbotApiRequest,
  onChunk: StreamChunkCallback
): Promise<void> {
  const { messages, context, apiKey } = request;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `${getChatbotSystemMessage()}\n\nCONTEXT:\n${context}`,
          },
          ...messages,
        ],
        temperature: DEFAULT_TEMPERATURE,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText || "Failed to get response from chatbot";
      throw new ChatbotApiError(errorMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new ChatbotApiError("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim() === "") continue;
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            return;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Ignore JSON parse errors for incomplete chunks
            console.warn("Failed to parse streaming chunk:", e);
          }
        }
      }
    }
  } catch (error: unknown) {
    if (error instanceof ChatbotApiError) {
      throw error;
    }

    throw new ChatbotApiError("Unknown error occurred", error);
  }
}
