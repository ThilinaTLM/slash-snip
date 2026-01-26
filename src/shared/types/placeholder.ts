/**
 * Types of placeholders supported in templates
 */
export type PlaceholderType =
  | 'clipboard'
  | 'cursor'
  | 'selection'
  | 'date'
  | 'time'
  | 'datetime'
  | 'input'
  | 'select'
  | 'tab';

/**
 * Text transform modifiers for placeholders
 */
export type TransformModifier = 'upper' | 'lower' | 'title' | 'trim';

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
  /** Label for input/select placeholders */
  label?: string;
  /** Default value for input/tab placeholders */
  defaultValue?: string;
  /** Options for select placeholders */
  options?: string[];
  /** Tab stop index for tab placeholders */
  tabIndex?: number;
  /** Text transform modifier */
  transform?: TransformModifier;
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
 * Definition of an input field required for template expansion
 */
export interface InputFieldDefinition {
  /** Unique identifier for the field */
  id: string;
  /** Type of input (text or select dropdown) */
  type: 'text' | 'select';
  /** Label to display to the user */
  label: string;
  /** Default value for the field */
  defaultValue?: string;
  /** Options for select type */
  options?: string[];
  /** Index of the placeholder in the template */
  placeholderIndex: number;
}

/**
 * Definition of a tab stop position in expanded content
 */
export interface TabStopDefinition {
  /** Tab stop index (1-based, determines navigation order) */
  index: number;
  /** Start offset in the final expanded text */
  startOffset: number;
  /** End offset in the final expanded text */
  endOffset: number;
  /** Default value to select */
  defaultValue?: string;
}

/**
 * Result of processing placeholders in template content
 */
export interface ProcessedContent {
  /** The fully processed text with all placeholders resolved */
  text: string;
  /** Cursor position offset if <cursor> placeholder was used */
  cursorOffset?: number;
  /** Tab stops for navigation (if any) */
  tabStops?: TabStopDefinition[];
  /** Input fields that require user input before expansion */
  requiresInput?: InputFieldDefinition[];
}

/**
 * Result from user input dialog
 */
export interface InputDialogResult {
  /** Whether the user cancelled the dialog */
  cancelled: boolean;
  /** Map of field IDs to user-provided values */
  values: Record<string, string>;
}
