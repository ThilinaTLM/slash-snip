import type { AppSettings } from '@shared/types/settings';

/**
 * Port interface for settings operations
 * Allows reading application settings
 */
export interface ISettingsPort {
  /**
   * Get the current application settings
   * @returns The current settings, or default settings if not found
   */
  getSettings(): Promise<AppSettings>;
}
