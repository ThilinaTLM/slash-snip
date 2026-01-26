/**
 * Application settings types
 */

export interface AppSettings {
  triggerKey: 'space' | 'tab' | 'enter';
  caseSensitive: boolean;
  treePanelWidth: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  triggerKey: 'space',
  caseSensitive: false,
  treePanelWidth: 256,
};
