/**
 * Wrapper around Chrome storage.local API
 * Provides typed access to extension storage
 */
export class ChromeStorageAdapter {
  /**
   * Get a value from storage
   */
  async get<T>(key: string): Promise<T | null> {
    const result = await chrome.storage.local.get(key);
    return (result[key] as T) ?? null;
  }

  /**
   * Set a value in storage
   */
  async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }

  /**
   * Remove a key from storage
   */
  async remove(key: string): Promise<void> {
    await chrome.storage.local.remove(key);
  }

  /**
   * Get all storage data
   */
  async getAll(): Promise<Record<string, unknown>> {
    return chrome.storage.local.get(null);
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    await chrome.storage.local.clear();
  }
}

// Singleton instance
export const chromeStorage = new ChromeStorageAdapter();
