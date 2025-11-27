/**
 * Abstraction layer for Chrome DevTools API
 * Provides type-safe, promise-based methods for DevTools operations
 */

export class ChromeDevTools {
  /**
   * Get the tab ID of the inspected window
   */
  getInspectedTabId(): number {
    return chrome.devtools.inspectedWindow.tabId;
  }

  /**
   * Evaluate JavaScript in the inspected window
   */
  async eval<T = unknown>(expression: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      chrome.devtools.inspectedWindow.eval(expression, (result: T, exceptionInfo) => {
        if (exceptionInfo) {
          reject(new Error(`Eval error: ${exceptionInfo.value || exceptionInfo.description || "Unknown error"}`));
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * Get the current page URL from the inspected window
   */
  async getInspectedUrl(): Promise<string> {
    const url = await this.eval<string>("window.location.href");
    if (typeof url !== "string") {
      throw new Error("Invalid page URL");
    }
    return url;
  }

  /**
   * Check if a URL is restricted (chrome://, chrome-extension://, about:)
   */
  isRestrictedUrl(url: string): boolean {
    return url.startsWith("chrome://") || url.startsWith("chrome-extension://") || url.startsWith("about:");
  }

  /**
   * Create a DevTools panel
   */
  createPanel(
    title: string,
    iconPath: string,
    pagePath: string,
    callback?: (panel: chrome.devtools.panels.ExtensionPanel) => void
  ): void {
    chrome.devtools.panels.create(title, iconPath, pagePath, callback);
  }
}

// Export singleton instance for convenience
export const devtools = new ChromeDevTools();
