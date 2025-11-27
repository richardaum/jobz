/**
 * Abstraction layer for Chrome Runtime API
 * Provides type-safe, promise-based methods for runtime operations
 */

export type MessageListener = (
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => boolean | void | Promise<any>;

export class ChromeRuntime {
  /**
   * Send a message to the extension's background script or other contexts
   */
  async sendMessage<T = any>(message: any): Promise<T> {
    return chrome.runtime.sendMessage(message);
  }

  /**
   * Get the URL for a resource in the extension
   */
  getURL(path: string): string {
    return chrome.runtime.getURL(path);
  }

  /**
   * Get the extension's manifest
   */
  getManifest(): chrome.runtime.Manifest {
    return chrome.runtime.getManifest();
  }

  /**
   * Listen for messages from other parts of the extension
   */
  onMessage(listener: MessageListener): () => void {
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }

  /**
   * Listen for extension installation/update events
   */
  onInstalled(listener: (details: chrome.runtime.InstalledDetails) => void): () => void {
    chrome.runtime.onInstalled.addListener(listener);
    return () => chrome.runtime.onInstalled.removeListener(listener);
  }

  /**
   * Create a persistent connection to the background script
   */
  connect(nameOrOptions?: string | chrome.runtime.ConnectInfo): chrome.runtime.Port {
    if (typeof nameOrOptions === "string") {
      return chrome.runtime.connect({ name: nameOrOptions });
    }
    return chrome.runtime.connect(nameOrOptions);
  }

  /**
   * Listen for connections from other parts of the extension
   */
  onConnect(listener: (port: chrome.runtime.Port) => void): () => void {
    chrome.runtime.onConnect.addListener(listener);
    return () => chrome.runtime.onConnect.removeListener(listener);
  }
}

// Export singleton instance for convenience
export const runtime = new ChromeRuntime();
