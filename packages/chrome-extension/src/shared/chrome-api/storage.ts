/**
 * Abstraction layer for Chrome Storage API
 * Provides type-safe, promise-based methods for storage operations
 */

type StorageArea = chrome.storage.StorageArea;

export class ChromeStorage {
  private storage: StorageArea;

  constructor(storage: StorageArea = chrome.storage.local) {
    this.storage = storage;
  }

  /**
   * Get one or more items from storage
   */
  async get<T = any>(keys?: string | string[] | { [key: string]: any } | null): Promise<{ [key: string]: T }> {
    return new Promise<{ [key: string]: T }>((resolve, reject) => {
      this.storage.get(keys ?? null, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Get a single item from storage
   */
  async getItem<T = any>(key: string): Promise<T | undefined> {
    const result = await this.get<T>(key);
    return result[key];
  }

  /**
   * Set one or more items in storage
   */
  async set(items: { [key: string]: any }): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Set a single item in storage
   */
  async setItem<T = any>(key: string, value: T): Promise<void> {
    return this.set({ [key]: value });
  }

  /**
   * Remove one or more items from storage
   */
  async remove(keys: string | string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.remove(keys, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}

// Export singleton instances for convenience
export const storage = new ChromeStorage(chrome.storage.local);
export const syncStorage = new ChromeStorage(chrome.storage.sync);
