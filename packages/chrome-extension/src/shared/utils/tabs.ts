export type ActiveTab = chrome.tabs.Tab & { id: number; url: string };

export async function getActiveTab(): Promise<ActiveTab> {
  // Get current tab - try current window first, then last active tab
  let tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];

  // If no active tab in current window (e.g., popup is detached), try to get last active tab
  if (!tab?.id || !tab?.url) {
    const tabs = await chrome.tabs.query({ active: true });
    tab = tabs[0];
  }

  // If still no tab, try to get any tab
  if (!tab?.id || !tab?.url) {
    const allTabs = await chrome.tabs.query({});
    tab =
      allTabs.find((t) => t.url && !t.url.startsWith("chrome://") && !t.url.startsWith("chrome-extension://")) ||
      allTabs[0];
  }

  if (!tab?.id || !tab?.url) {
    throw new Error("Could not get current tab. Please open a webpage and try again.");
  }

  // Check if URL is valid for content scripts
  if (tab.url?.startsWith("chrome://") || tab.url?.startsWith("chrome-extension://") || tab.url?.startsWith("about:")) {
    throw new Error("Content scripts cannot run on this page. Please navigate to a regular webpage.");
  }

  return tab as ActiveTab;
}
