import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@shared/constants';
import type { AppSettings } from '@shared/types/settings';
import { DEFAULT_SETTINGS } from '@shared/types/settings';

interface UseSettingsResult {
  settings: AppSettings;
  loading: boolean;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
}

/**
 * Hook for managing application settings with Chrome storage persistence
 */
export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings from Chrome storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
        const stored = result[STORAGE_KEYS.SETTINGS] as
          | Partial<AppSettings>
          | undefined;

        if (stored) {
          // Migrate legacy trigger key values (tab, enter) to 'space'
          let migratedSettings = { ...DEFAULT_SETTINGS, ...stored };
          if (
            stored.triggerKey &&
            stored.triggerKey !== 'space' &&
            stored.triggerKey !== 'none'
          ) {
            migratedSettings = { ...migratedSettings, triggerKey: 'space' };
            // Persist the migration
            await chrome.storage.local.set({
              [STORAGE_KEYS.SETTINGS]: migratedSettings,
            });
            console.log('[SlashSnip] Migrated legacy triggerKey to space');
          }
          setSettings(migratedSettings);
        }
      } catch (error) {
        console.error('[SlashSnip] Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update settings and persist to storage
  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      try {
        await chrome.storage.local.set({
          [STORAGE_KEYS.SETTINGS]: newSettings,
        });
      } catch (error) {
        console.error('[SlashSnip] Failed to save settings:', error);
        throw error;
      }
    },
    [settings]
  );

  return { settings, loading, updateSettings };
}
