import type { TriggerMatch } from './TriggerDetector';
import {
  type ContenteditableContext,
  type ContenteditableUndoData,
  replaceContenteditableText,
  storeContenteditableUndo,
  restoreContenteditableUndo,
  positionCursorAtOffset,
} from './ContenteditableAdapter';

export interface ExpansionResult {
  success: boolean;
  originalText: string;
  expandedText: string;
}

export interface ExpansionOptions {
  /** Cursor offset within the expanded content (for <cursor> placeholder) */
  cursorOffset?: number;
}

/**
 * Handles text expansion in input elements
 */
export class TextExpander {
  /**
   * Expand a trigger in an input or textarea element
   * @param element - The input or textarea element
   * @param match - The trigger match information
   * @param content - The processed content to insert
   * @param options - Optional expansion options (cursor offset, etc.)
   */
  expand(
    element: HTMLInputElement | HTMLTextAreaElement,
    match: TriggerMatch,
    content: string,
    options: ExpansionOptions = {}
  ): ExpansionResult {
    const originalValue = element.value;
    const beforeTrigger = originalValue.slice(0, match.startIndex);
    const afterTrigger = originalValue.slice(match.endIndex);

    const expandedText = beforeTrigger + content + afterTrigger;
    const originalText = originalValue;

    // Store for potential undo
    const undoData = {
      element,
      originalValue,
      selectionStart: element.selectionStart,
      selectionEnd: element.selectionEnd,
    };

    // Set the new value
    element.value = expandedText;

    // Set cursor position: use cursorOffset if provided (from <cursor> placeholder),
    // otherwise position at end of expanded content
    const newCursorPosition =
      options.cursorOffset !== undefined
        ? beforeTrigger.length + options.cursorOffset
        : beforeTrigger.length + content.length;
    element.setSelectionRange(newCursorPosition, newCursorPosition);

    // Dispatch input event so frameworks detect the change
    element.dispatchEvent(new Event('input', { bubbles: true }));

    // Store undo data on the element
    (
      element as HTMLElement & { __slashsnipUndo?: typeof undoData }
    ).__slashsnipUndo = undoData;

    return {
      success: true,
      originalText,
      expandedText,
    };
  }

  /**
   * Expand a trigger in a contenteditable element
   * @param element - The contenteditable element
   * @param match - The trigger match information
   * @param content - The processed content to insert
   * @param ctx - The contenteditable context
   * @param options - Optional expansion options (cursor offset, etc.)
   */
  expandContenteditable(
    element: HTMLElement,
    match: TriggerMatch,
    content: string,
    ctx: ContenteditableContext,
    options: ExpansionOptions = {}
  ): ExpansionResult {
    const originalText = ctx.text;

    // Store for potential undo
    const undoData = storeContenteditableUndo(element);
    (
      element as HTMLElement & { __slashsnipUndo?: ContenteditableUndoData }
    ).__slashsnipUndo = undoData;
    (
      element as HTMLElement & { __slashsnipIsContenteditable?: boolean }
    ).__slashsnipIsContenteditable = true;

    // Replace the trigger with expanded content
    replaceContenteditableText(ctx, match.startIndex, match.endIndex, content);

    // If cursorOffset is specified (from <cursor> placeholder), reposition cursor
    if (options.cursorOffset !== undefined) {
      const absoluteCursorPos = match.startIndex + options.cursorOffset;
      positionCursorAtOffset(element, absoluteCursorPos);
    }

    const expandedText = originalText.slice(0, match.startIndex) + content;

    return {
      success: true,
      originalText,
      expandedText,
    };
  }

  /**
   * Undo the last expansion on an element
   */
  undo(element: HTMLInputElement | HTMLTextAreaElement | HTMLElement): boolean {
    // Check if this is a contenteditable element
    const isContenteditable = (
      element as HTMLElement & { __slashsnipIsContenteditable?: boolean }
    ).__slashsnipIsContenteditable;

    if (isContenteditable) {
      return this.undoContenteditable(element);
    }

    const undoData = (
      element as HTMLElement & {
        __slashsnipUndo?: {
          originalValue: string;
          selectionStart: number | null;
          selectionEnd: number | null;
        };
      }
    ).__slashsnipUndo;

    if (!undoData) {
      return false;
    }

    (element as HTMLInputElement | HTMLTextAreaElement).value =
      undoData.originalValue;
    if (undoData.selectionStart !== null && undoData.selectionEnd !== null) {
      (element as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(
        undoData.selectionStart,
        undoData.selectionEnd
      );
    }

    // Dispatch input event
    element.dispatchEvent(new Event('input', { bubbles: true }));

    // Clear undo data
    delete (element as HTMLElement & { __slashsnipUndo?: unknown })
      .__slashsnipUndo;

    return true;
  }

  /**
   * Undo the last expansion on a contenteditable element
   */
  private undoContenteditable(element: HTMLElement): boolean {
    const undoData = (
      element as HTMLElement & { __slashsnipUndo?: ContenteditableUndoData }
    ).__slashsnipUndo;

    if (!undoData) {
      return false;
    }

    restoreContenteditableUndo(element, undoData);

    // Clear undo data
    delete (element as HTMLElement & { __slashsnipUndo?: unknown })
      .__slashsnipUndo;
    delete (element as HTMLElement & { __slashsnipIsContenteditable?: boolean })
      .__slashsnipIsContenteditable;

    return true;
  }
}
