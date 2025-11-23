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
  await chrome.scripting.executeScript({
    target: { tabId },
    files,
  });
  await new Promise((resolve) => setTimeout(resolve, 200));
}
