import { DEFAULT_TRIGGER_DELIMITERS } from '@shared/constants';
import { getContenteditableContext, type ContenteditableContext } from './ContenteditableAdapter';

export interface TriggerMatch {
  trigger: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Detects trigger patterns in text input
 */
export class TriggerDetector {
  private delimiters: string[];

  constructor(delimiters: string[] = DEFAULT_TRIGGER_DELIMITERS) {
    this.delimiters = delimiters;
  }

  /**
   * Check if text ends with a trigger followed by a delimiter
   * Returns the trigger if found, null otherwise
   */
  detectTrigger(text: string): TriggerMatch | null {
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
   * Extract potential trigger from current input value and cursor position
   */
  detectTriggerAtCursor(value: string, cursorPosition: number): TriggerMatch | null {
    // Get text up to cursor
    const textToCursor = value.slice(0, cursorPosition);
    return this.detectTrigger(textToCursor);
  }

  /**
   * Detect trigger in a contenteditable element using Selection API
   */
  detectTriggerInContenteditable(element: HTMLElement): { match: TriggerMatch; ctx: ContenteditableContext } | null {
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
