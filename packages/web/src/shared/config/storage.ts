import { useSettingsStore } from "@/shared/stores/settings-store";

/**
 * Get OpenAI API key from Zustand settings store
 * @returns API key string or null if not found
 */
export function getOpenAIApiKey(): string | null {
  // Get from Zustand store (client-side only)
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

  return null;
}
