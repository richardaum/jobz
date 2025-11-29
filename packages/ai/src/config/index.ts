/**
 * AI package configuration constants
 */

export const OPENAI_API_BASE_URL = "https://api.openai.com/v1";
export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

/**
 * Get OpenAI API key from environment variables
 * Tries multiple environment variable names to support different frameworks:
 * - NEXT_PUBLIC_OPENAI_API_KEY (Next.js)
 * - VITE_OPENAI_API_KEY (Vite)
 * - OPENAI_API_KEY (Node.js/server)
 *
 * @returns API key string or null if not found
 */
export function getOpenAIApiKey(): string | null {
  // Try Next.js env variable first
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_OPENAI_API_KEY) {
    return process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  }

  // Try Node.js/server env variable
  if (typeof process !== "undefined" && process.env?.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }

  return null;
}
