import { storage } from "../chrome-api";

export { env } from "./env";

export const OPENAI_API_KEY_STORAGE_KEY = "openai_api_key";

export async function getOpenAIApiKey(): Promise<string | null> {
  // Try to get from storage first, then fallback to env
  const storedKey = await storage.getItem<string>(OPENAI_API_KEY_STORAGE_KEY);
  if (storedKey) {
    return storedKey;
  }
  // Fallback to environment variable if available
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  return envKey || null;
}

export async function setOpenAIApiKey(apiKey: string): Promise<void> {
  await storage.setItem(OPENAI_API_KEY_STORAGE_KEY, apiKey);
}
