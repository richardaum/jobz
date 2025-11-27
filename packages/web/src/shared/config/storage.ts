import { useSettingsStore } from "@/shared/stores/settings-store";

/**
 * Get OpenAI API key from Zustand settings store
 * Falls back to environment variable if not set in store
 * @returns API key string or null if not found
 */
export function getOpenAIApiKey(): string | null {
  // Try to get from Zustand store (client-side only)
  if (typeof window !== "undefined") {
    try {
      const apiKey = useSettingsStore.getState().getOpenAIApiKey();
      if (apiKey) {
        return apiKey;
      }
    } catch (error) {
      console.error("Failed to get API key from store:", error);
    }
  }

  // Fallback to environment variable
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_OPENAI_API_KEY) {
    return process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  }

  return null;
}
