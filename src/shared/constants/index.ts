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
 * Maximum number of recent templates to track
 */
export const MAX_RECENT_TEMPLATES = 10;

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
  GROUPS: 'groups',
  SETTINGS: 'settings',
  RECENT_TEMPLATES: 'recentTemplates',
} as const;

/**
 * Message types for Chrome messaging
 */
export const MESSAGE_TYPES = {
  // Template messages
  GET_TEMPLATES: 'GET_TEMPLATES',
  CREATE_TEMPLATE: 'CREATE_TEMPLATE',
  UPDATE_TEMPLATE: 'UPDATE_TEMPLATE',
  DELETE_TEMPLATE: 'DELETE_TEMPLATE',
  GET_BY_TRIGGER: 'GET_BY_TRIGGER',
  GET_BY_ID: 'GET_BY_ID',
  EXPAND_TEMPLATE: 'EXPAND_TEMPLATE',
  // Category messages (deprecated)
  GET_CATEGORIES: 'GET_CATEGORIES',
  CREATE_CATEGORY: 'CREATE_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  // Group messages
  GET_GROUPS: 'GET_GROUPS',
  CREATE_GROUP: 'CREATE_GROUP',
  UPDATE_GROUP: 'UPDATE_GROUP',
  DELETE_GROUP: 'DELETE_GROUP',
  // Quick access messages
  INCREMENT_USAGE: 'INCREMENT_USAGE',
  GET_RECENT_TEMPLATES: 'GET_RECENT_TEMPLATES',
  // Import/Export messages
  IMPORT_BACKUP: 'IMPORT_BACKUP',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

/**
 * Regex pattern to match placeholders in template content
 * Matches: <clipboard>, <cursor>, <selection>, <date>, <time>, <datetime>, <input>, <select>, <tab>
 * Also supports transform modifiers like <clipboard:upper>
 */
export const PLACEHOLDER_PATTERN =
  /<(clipboard|cursor|selection|date|time|datetime|input|select|tab)(?::([^>]+))?>/g;

/**
 * Individual placeholder patterns for validation
 */
export const PLACEHOLDER_PATTERNS = {
  CLIPBOARD: /<clipboard(?::([^>]+))?>/g,
  CURSOR: /<cursor>/g,
  SELECTION: /<selection(?::([^>]+))?>/g,
  DATE: /<date(?::([^>]+))?>/g,
  TIME: /<time(?::([^>]+))?>/g,
  DATETIME: /<datetime(?::([^>]+))?>/g,
  INPUT: /<input:([^>]+)>/g,
  SELECT: /<select:([^>]+)>/g,
  TAB: /<tab:([^>]+)>/g,
} as const;
