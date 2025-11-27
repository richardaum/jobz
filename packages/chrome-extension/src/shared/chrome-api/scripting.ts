/**
 * Abstraction layer for Chrome Scripting API
 * Provides type-safe, promise-based methods for script injection
 */

export type InjectScriptOptions =
  | {
      target: { tabId: number };
      files: string[];
      world?: "ISOLATED" | "MAIN";
    }
  | {
      target: { tabId: number };
      func: () => void;
      args?: never[];
      world?: "ISOLATED" | "MAIN";
    };

/**
 * Check if we're in a devtools context
 */
function isDevtoolsContext(): boolean {
  try {
    return typeof chrome !== "undefined" && !!chrome.devtools;
  } catch {
    return false;
  }
}

export class ChromeScripting {
  /**
   * Execute a script in a tab
   */
  async executeScript(options: InjectScriptOptions): Promise<chrome.scripting.InjectionResult[]> {
    // If in devtools context, delegate to background script
    if (isDevtoolsContext()) {
      const { runtime } = await import("./runtime");
      const response = await runtime.sendMessage({
        action: "executeScript",
        options,
      });
      if (response?.error) {
        throw new Error(response.error);
      }
      return response?.result || [];
    }

    // In background or other contexts, use chrome.scripting directly
    if (!chrome.scripting || !chrome.scripting.executeScript) {
      throw new Error("chrome.scripting API is not available in this context");
    }

    if ("files" in options) {
      return chrome.scripting.executeScript({
        target: options.target,
        files: options.files,
        world: options.world,
      });
    } else {
      // For func, Chrome API requires args to be an empty tuple [] when not provided
      return chrome.scripting.executeScript({
        target: options.target,
        func: options.func,
        world: options.world,
      });
    }
  }

  /**
   * Inject a content script file into a tab
   */
  async injectScript(tabId: number, files: string[] = ["src/content.js"]): Promise<void> {
    await this.executeScript({
      target: { tabId },
      files,
    });
    // Small delay to ensure script is loaded
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

// Export singleton instance for convenience
export const scripting = new ChromeScripting();
