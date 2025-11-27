import { scripting } from "../chrome-api";
import { sendTabMessage } from "./messaging";

export async function checkContentScriptReady(tabId: number): Promise<boolean> {
  try {
    const response = await sendTabMessage(tabId, { action: "ping" });
    return response?.success === true;
  } catch (error) {
    return false;
  }
}

export async function injectContentScript(tabId: number, files: string[] = ["src/content.js"]): Promise<void> {
  await scripting.injectScript(tabId, files);
}

/**
 * Ensures content script is ready, injecting it if necessary.
 * Returns an error message if injection fails, null on success.
 */
export async function ensureContentScriptReady(tabId: number): Promise<string | null> {
  let contentScriptReady = false;
  try {
    contentScriptReady = await checkContentScriptReady(tabId);
  } catch (error) {
    contentScriptReady = false;
  }

  if (!contentScriptReady) {
    try {
      await injectContentScript(tabId);
    } catch (injectError) {
      const errorMsg = injectError instanceof Error ? injectError.message : "Unknown error";
      return `Failed to inject content script: ${errorMsg}`;
    }
  }

  return null;
}
