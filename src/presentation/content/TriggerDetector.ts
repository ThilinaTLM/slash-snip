import { DEFAULT_TRIGGER_DELIMITERS } from '@shared/constants';
import {
  getContenteditableContext,
  type ContenteditableContext,
} from './ContenteditableAdapter';

export interface TriggerMatch {
  trigger: string;
  startIndex: number;
  endIndex: number;
}

export type TriggerMode = 'delimiter' | 'none';

/**
 * Detects trigger patterns in text input
 */
export class TriggerDetector {
  private delimiters: string[];
  private mode: TriggerMode;
  private knownTriggers: Set<string> = new Set();
  private caseSensitive: boolean = true;

  constructor(
    delimiters: string[] = DEFAULT_TRIGGER_DELIMITERS,
    mode: TriggerMode = 'delimiter'
  ) {
    this.delimiters = delimiters;
    this.mode = mode;
  }

  /**
   * Set the trigger mode at runtime
   */
  setMode(mode: TriggerMode): void {
    this.mode = mode;
  }

  /**
   * Get the current trigger mode
   */
  getMode(): TriggerMode {
    return this.mode;
  }

  /**
   * Set case sensitivity for trigger matching
   */
  setCaseSensitive(caseSensitive: boolean): void {
    this.caseSensitive = caseSensitive;
  }

  /**
   * Update the list of known triggers (for "none" mode matching)
   */
  setKnownTriggers(triggers: string[]): void {
    this.knownTriggers = new Set(triggers);
  }

  /**
   * Check if text ends with a trigger followed by a delimiter (delimiter mode)
   * or ends with a known trigger (none mode)
   * Returns the trigger if found, null otherwise
   */
  detectTrigger(text: string): TriggerMatch | null {
    if (this.mode === 'none') {
      return this.detectNoneTrigger(text);
    }
    return this.detectDelimiterTrigger(text);
  }

  /**
   * Detect trigger in delimiter mode (space triggers expansion)
   */
  private detectDelimiterTrigger(text: string): TriggerMatch | null {
    if (!text || text.length < 2) {
      return null;
    }

    // Check if text ends with a delimiter
    const lastChar = text[text.length - 1];
    if (!this.delimiters.includes(lastChar)) {
      return null;
    }

    // Get text before the delimiter
    const textBeforeDelimiter = text.slice(0, -1);

    // Find the start of the trigger (last whitespace or start of string)
    let triggerStart = textBeforeDelimiter.length;
    for (let i = textBeforeDelimiter.length - 1; i >= 0; i--) {
      const char = textBeforeDelimiter[i];
      if (this.isWhitespace(char)) {
        break;
      }
      triggerStart = i;
    }

    const trigger = textBeforeDelimiter.slice(triggerStart);

    // Trigger must be at least 2 characters
    if (trigger.length < 2) {
      return null;
    }

    return {
      trigger,
      startIndex: triggerStart,
      endIndex: text.length, // includes the delimiter
    };
  }

  /**
   * Detect trigger in "none" mode (immediate expansion without delimiter)
   * Checks if text ends with a known trigger
   */
  private detectNoneTrigger(text: string): TriggerMatch | null {
    if (!text || text.length < 2) {
      return null;
    }

    // Find the start of the current word (last whitespace or start of string)
    let wordStart = text.length;
    for (let i = text.length - 1; i >= 0; i--) {
      const char = text[i];
      if (this.isWhitespace(char)) {
        break;
      }
      wordStart = i;
    }

    const currentWord = text.slice(wordStart);

    // Current word must be at least 2 characters
    if (currentWord.length < 2) {
      return null;
    }

    // Check if current word matches a known trigger
    const normalizedWord = this.caseSensitive
      ? currentWord
      : currentWord.toLowerCase();

    for (const trigger of this.knownTriggers) {
      const normalizedTrigger = this.caseSensitive
        ? trigger
        : trigger.toLowerCase();
      if (normalizedWord === normalizedTrigger) {
        return {
          trigger: currentWord,
          startIndex: wordStart,
          endIndex: text.length, // no delimiter in "none" mode
        };
      }
    }

    return null;
  }

  /**
   * Extract potential trigger from current input value and cursor position
   */
  detectTriggerAtCursor(
    value: string,
    cursorPosition: number
  ): TriggerMatch | null {
    // Get text up to cursor
    const textToCursor = value.slice(0, cursorPosition);
    return this.detectTrigger(textToCursor);
  }

  /**
   * Detect trigger in a contenteditable element using Selection API
   */
  detectTriggerInContenteditable(
    element: HTMLElement
  ): { match: TriggerMatch; ctx: ContenteditableContext } | null {
    const ctx = getContenteditableContext(element);
    if (!ctx) return null;

    const match = this.detectTrigger(ctx.text);
    if (!match) return null;

    return { match, ctx };
  }

  private isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }
}
