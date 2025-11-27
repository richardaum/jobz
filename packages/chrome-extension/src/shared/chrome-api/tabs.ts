/**
 * Abstraction layer for Chrome Tabs API
 * Provides type-safe, promise-based methods for tab operations
 */

export type ActiveTab = chrome.tabs.Tab & { id: number; url: string };

export class ChromeTabs {
  /**
   * Get the currently active tab
   * Tries multiple strategies to find a valid tab
   */
  async getActiveTab(): Promise<ActiveTab> {
    // Get current tab - try current window first, then last active tab
    let tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];

    // If no active tab in current window, try to get last active tab
    if (!tab?.id || !tab?.url) {
      const tabs = await chrome.tabs.query({ active: true });
      tab = tabs[0];
    }

    // If still no tab, try to get any tab
    if (!tab?.id || !tab?.url) {
      const allTabs = await chrome.tabs.query({});
      tab = allTabs.find((t) => t.url && !this.isRestrictedUrl(t.url)) || allTabs[0];
    }

    if (!tab?.id || !tab?.url) {
      throw new Error("Could not get current tab. Please open a webpage and try again.");
    }

    // Check if URL is valid for content scripts
    if (this.isRestrictedUrl(tab.url)) {
      throw new Error("Content scripts cannot run on this page. Please navigate to a regular webpage.");
    }

    // TypeScript knows tab has id and url at this point due to the checks above
    // Return the tab with the correct type using the Chrome API's type system
    return tab as ActiveTab;
  }

  /**
   * Send a message to a tab
   */
  async sendMessage<T = unknown>(tabId: number, message: unknown): Promise<T> {
    return chrome.tabs.sendMessage(tabId, message);
  }

  /**
   * Check if a URL is restricted (chrome://, chrome-extension://, about:)
   */
  isRestrictedUrl(url: string): boolean {
    return url.startsWith("chrome://") || url.startsWith("chrome-extension://") || url.startsWith("about:");
  }
}

// Export singleton instance for convenience
export const tabs = new ChromeTabs();
