/**
 * Adapter for handling contenteditable elements
 * Provides utilities for text extraction and replacement using Selection/Range APIs
 */

/**
 * Create a DocumentFragment with text and <br> elements for newlines.
 * HTML does not render \n characters as visual line breaks in contenteditable,
 * so we must convert them to <br> elements.
 */
export function createTextWithLineBreaks(text: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const lines = text.split('\n');

  lines.forEach((line, index) => {
    if (index > 0) {
      fragment.appendChild(document.createElement('br'));
    }
    if (line) {
      fragment.appendChild(document.createTextNode(line));
    }
  });

  return fragment;
}

export interface ContenteditableContext {
  element: HTMLElement;
  text: string;           // Text content up to cursor
  cursorPosition: number;
  range: Range;           // Current selection range for replacement
}

/**
 * Get the text content and cursor context from a contenteditable element
 */
export function getContenteditableContext(element: HTMLElement): ContenteditableContext | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);

  // Verify the selection is within our element
  if (!element.contains(range.commonAncestorContainer)) {
    return null;
  }

  // Create a range from the start of the element to the cursor position
  const preCaretRange = document.createRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.startContainer, range.startOffset);

  // Get text content up to cursor
  const text = preCaretRange.toString();

  return {
    element,
    text,
    cursorPosition: text.length,
    range: range.cloneRange(),
  };
}

/**
 * Replace text in a contenteditable element
 * @param ctx - The contenteditable context
 * @param startIndex - Start index of text to replace (relative to text up to cursor)
 * @param endIndex - End index of text to replace
 * @param newText - Text to insert
 */
export function replaceContenteditableText(
  ctx: ContenteditableContext,
  startIndex: number,
  endIndex: number,
  newText: string
): void {
  const { element } = ctx;
  const selection = window.getSelection();
  if (!selection) return;

  // Find the range to delete (from startIndex to endIndex)
  const deleteRange = findRangeForTextPosition(element, startIndex, endIndex);
  if (!deleteRange) return;

  // Delete the trigger text
  deleteRange.deleteContents();

  // Insert the new text with proper line break handling
  const fragment = createTextWithLineBreaks(newText);
  const lastChild = fragment.lastChild;
  deleteRange.insertNode(fragment);

  // Move cursor to end of inserted content
  const newRange = document.createRange();
  if (lastChild) {
    newRange.setStartAfter(lastChild);
  } else {
    newRange.setStart(deleteRange.startContainer, deleteRange.startOffset);
  }
  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);

  // Dispatch input event for framework compatibility
  element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
}

/**
 * Find a Range that covers text positions within a contenteditable element
 */
function findRangeForTextPosition(
  element: HTMLElement,
  startPos: number,
  endPos: number
): Range | null {
  const range = document.createRange();
  let charCount = 0;
  let foundStart = false;

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const nodeLength = node.textContent?.length ?? 0;

    // Find start position
    if (!foundStart && charCount + nodeLength >= startPos) {
      range.setStart(node, startPos - charCount);
      foundStart = true;
    }

    // Find end position
    if (foundStart && charCount + nodeLength >= endPos) {
      range.setEnd(node, endPos - charCount);
      return range;
    }

    charCount += nodeLength;
  }

  // Handle edge case: positions beyond text content
  if (foundStart) {
    // End wasn't found, set to end of element
    range.setEndAfter(element.lastChild || element);
    return range;
  }

  return null;
}

/**
 * Store undo data on a contenteditable element
 */
export interface ContenteditableUndoData {
  innerHTML: string;
  // We'll restore selection approximately based on text length
  textLength: number;
}

export function storeContenteditableUndo(element: HTMLElement): ContenteditableUndoData {
  return {
    innerHTML: element.innerHTML,
    textLength: element.textContent?.length ?? 0,
  };
}

export function restoreContenteditableUndo(
  element: HTMLElement,
  undoData: ContenteditableUndoData
): void {
  element.innerHTML = undoData.innerHTML;

  // Try to restore cursor to end of content
  const selection = window.getSelection();
  if (selection && element.lastChild) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false); // collapse to end
    selection.removeAllRanges();
    selection.addRange(range);
  }

  element.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

/**
 * Position cursor at a specific text offset within a contenteditable element
 * @param element - The contenteditable element
 * @param offset - The text offset position (character count from start)
 */
export function positionCursorAtOffset(element: HTMLElement, offset: number): void {
  const selection = window.getSelection();
  if (!selection) return;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  let charCount = 0;
  let node: Text | null;

  while ((node = walker.nextNode() as Text | null)) {
    const nodeLength = node.textContent?.length ?? 0;

    if (charCount + nodeLength >= offset) {
      // Found the node containing our offset
      const range = document.createRange();
      range.setStart(node, offset - charCount);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    charCount += nodeLength;
  }

  // Offset is beyond text content - position at end
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}
