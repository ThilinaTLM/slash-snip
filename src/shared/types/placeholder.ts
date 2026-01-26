/**
 * Types of placeholders supported in templates
 */
export type PlaceholderType = 'clipboard' | 'cursor' | 'selection' | 'date' | 'time' | 'datetime';

/**
 * Parsed placeholder information extracted from template content
 */
export interface ParsedPlaceholder {
  /** Original placeholder string, e.g., "<date:YYYY-MM-DD>" */
  raw: string;
  /** Type of placeholder */
  type: PlaceholderType;
  /** Optional format string, e.g., "YYYY-MM-DD" */
  format?: string;
  /** Start index in the original content */
  startIndex: number;
  /** End index in the original content */
  endIndex: number;
}

/**
 * Context information needed for placeholder resolution
 */
export interface PlaceholderContext {
  /** Selected text before the trigger was typed */
  selection?: string;
  /** Current clipboard content */
  clipboard?: string;
}

/**
 * Result of processing placeholders in template content
 */
export interface ProcessedContent {
  /** The fully processed text with all placeholders resolved */
  text: string;
  /** Cursor position offset if <cursor> placeholder was used */
  cursorOffset?: number;
}
