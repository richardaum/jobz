console.log("Background service worker loaded");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

// Handle logs from content scripts
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === "log") {
    const { level, args } = request;
    const logMethod = console[level as keyof Console] || console.log;
    logMethod(`[Content Script]`, ...args);
    return false;
  }
  return false;
});
