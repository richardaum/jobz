import { runtime, scripting } from "@/shared/chrome-api";

console.log("Background service worker loaded");

runtime.onInstalled(() => {
  console.log("Extension installed");
});

// Handle messages from devtools and content scripts
runtime.onMessage((request, _sender, sendResponse) => {
  // Handle log messages from content scripts, forward to devtools
  if (request.action === "log") {
    const { level, args } = request;

    // Log to background console
    const logMethods: Record<string, typeof console.log> = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
    };
    const logMethod = logMethods[level] || console.log;
    logMethod(`[Extension]`, ...args);

    // Forward to devtools (content script logs only)
    // Devtools logs are added directly to store, so we only forward content script logs
    try {
      runtime
        .sendMessage({
          action: "logToStore",
          level,
          args,
          timestamp: request.timestamp || Date.now(),
        })
        .catch(() => {
          // Devtools not available, ignore
        });
    } catch {
      // Ignore errors
    }

    return false;
  }

  // Handle executeScript requests from devtools
  if (request.action === "executeScript") {
    // @ts-expect-error - chrome.scripting is available in the background script
    if (chrome.scripting && chrome.scripting.executeScript) {
      scripting
        .executeScript?.(request.options)
        .then((result) => {
          sendResponse({ result });
        })
        .catch((error) => {
          sendResponse({ error: error.message });
        });
      return true; // Keep channel open for async response
    } else {
      sendResponse({ error: "chrome.scripting API not available" });
      return false;
    }
  }

  return false;
});
