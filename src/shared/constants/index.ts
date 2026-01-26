// Default configuration constants

/**
 * Default trigger delimiters that complete a trigger
 * Space, Tab, Enter
 */
export const DEFAULT_TRIGGER_DELIMITERS = [' ', '\t', '\n'];

/**
 * Minimum trigger length
 */
export const MIN_TRIGGER_LENGTH = 2;

/**
 * Maximum trigger length
 */
export const MAX_TRIGGER_LENGTH = 32;

/**
 * Maximum template content length
 */
export const MAX_CONTENT_LENGTH = 10000;

/**
 * Maximum template name length
 */
export const MAX_NAME_LENGTH = 100;

/**
 * Storage keys for Chrome storage
 */
export const STORAGE_KEYS = {
  TEMPLATES: 'templates',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
} as const;

/**
 * Message types for Chrome messaging
 */
export const MESSAGE_TYPES = {
  GET_TEMPLATES: 'GET_TEMPLATES',
  CREATE_TEMPLATE: 'CREATE_TEMPLATE',
  UPDATE_TEMPLATE: 'UPDATE_TEMPLATE',
  DELETE_TEMPLATE: 'DELETE_TEMPLATE',
  GET_BY_TRIGGER: 'GET_BY_TRIGGER',
  EXPAND_TEMPLATE: 'EXPAND_TEMPLATE',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];
