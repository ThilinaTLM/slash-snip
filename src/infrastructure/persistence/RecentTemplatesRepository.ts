import type { IRecentTemplatesRepository, RecentTemplateEntry } from '@domain/repositories';
import { STORAGE_KEYS, MAX_RECENT_TEMPLATES } from '@shared/constants';
import { ChromeStorageAdapter } from '../chrome/storage/ChromeStorageAdapter';

/**
 * Chrome storage implementation of IRecentTemplatesRepository
 * Stores the last N template IDs with timestamps
 */
export class RecentTemplatesRepository implements IRecentTemplatesRepository {
  constructor(private storage: ChromeStorageAdapter) {}

  async add(templateId: string): Promise<void> {
    const entries = await this.getAllEntries();

    // Remove existing entry if present
    const filtered = entries.filter((e) => e.templateId !== templateId);

    // Add new entry at the beginning (most recent first)
    const newEntry: RecentTemplateEntry = {
      templateId,
      usedAt: Date.now(),
    };

    filtered.unshift(newEntry);

    // Keep only the most recent N entries
    const trimmed = filtered.slice(0, MAX_RECENT_TEMPLATES);

    await this.storage.set(STORAGE_KEYS.RECENT_TEMPLATES, trimmed);
  }

  async getAll(): Promise<RecentTemplateEntry[]> {
    return this.getAllEntries();
  }

  async remove(templateId: string): Promise<void> {
    const entries = await this.getAllEntries();
    const filtered = entries.filter((e) => e.templateId !== templateId);
    await this.storage.set(STORAGE_KEYS.RECENT_TEMPLATES, filtered);
  }

  async clear(): Promise<void> {
    await this.storage.set(STORAGE_KEYS.RECENT_TEMPLATES, []);
  }

  /**
   * Get raw entries from storage
   */
  private async getAllEntries(): Promise<RecentTemplateEntry[]> {
    const entries = await this.storage.get<RecentTemplateEntry[]>(
      STORAGE_KEYS.RECENT_TEMPLATES
    );
    return entries ?? [];
  }
}
