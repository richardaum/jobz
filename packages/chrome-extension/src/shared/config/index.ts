export { env } from "./env";

export const OPENAI_API_KEY_STORAGE_KEY = "openai_api_key";

export async function getOpenAIApiKey(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([OPENAI_API_KEY_STORAGE_KEY], (result) => {
      // Try to get from storage first, then fallback to env
      const storedKey = result[OPENAI_API_KEY_STORAGE_KEY];
      if (storedKey) {
        resolve(storedKey);
      } else {
        // Fallback to environment variable if available
        const envKey = import.meta.env.VITE_OPENAI_API_KEY;
        resolve(envKey || null);
      }
    });
  });
}

export async function setOpenAIApiKey(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [OPENAI_API_KEY_STORAGE_KEY]: apiKey }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}
