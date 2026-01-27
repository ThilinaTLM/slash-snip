import type { ISettingsPort } from '@application/ports';
import type { AppSettings } from '@shared/types/settings';
import { DEFAULT_SETTINGS } from '@shared/types/settings';
import { STORAGE_KEYS } from '@shared/constants';
import { ChromeStorageAdapter } from './ChromeStorageAdapter';

/**
 * Chrome storage implementation of ISettingsPort
 */
export class SettingsAdapter implements ISettingsPort {
  constructor(private storage: ChromeStorageAdapter) {}

  async getSettings(): Promise<AppSettings> {
    const stored = await this.storage.get<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS);
    return { ...DEFAULT_SETTINGS, ...stored };
  }
}
