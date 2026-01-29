import type { TabStopDefinition } from '@shared/types';

interface TabStopState {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLElement;
  tabStops: TabStopDefinition[];
  currentIndex: number;
  baseOffset: number;
  isContenteditable: boolean;
}

/**
 * Manages tab stop navigation for template expansion
 * Supports both input/textarea and contenteditable elements
 */
export class TabStopManager {
  private state: TabStopState | null = null;
  private keydownHandler: EventListener | null = null;
  private blurHandler: (() => void) | null = null;

  /**
   * Activate tab stop navigation for an element
   * @param element - The input element to manage
   * @param tabStops - Array of tab stop definitions (sorted by index)
   * @param baseOffset - Base offset from start of expansion
   */
  activate(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLElement,
    tabStops: TabStopDefinition[],
    baseOffset: number
  ): void {
    // Deactivate any existing state
    this.deactivate();

    if (tabStops.length === 0) {
      return;
    }

    const isContenteditable = !(
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    );

    this.state = {
      element,
      tabStops,
      currentIndex: 0,
      baseOffset,
      isContenteditable,
    };

    // Set up event listeners
    this.keydownHandler = this.handleKeydown.bind(this) as EventListener;
    this.blurHandler = this.handleBlur.bind(this);

    element.addEventListener('keydown', this.keydownHandler, true);
    element.addEventListener('blur', this.blurHandler);

    // Select the first tab stop
    this.selectCurrentTabStop();
  }

  /**
   * Deactivate tab stop navigation
   */
  deactivate(): void {
    if (this.state) {
      if (this.keydownHandler) {
        this.state.element.removeEventListener(
          'keydown',
          this.keydownHandler,
          true
        );
      }
      if (this.blurHandler) {
        this.state.element.removeEventListener('blur', this.blurHandler);
      }
    }

    this.state = null;
    this.keydownHandler = null;
    this.blurHandler = null;
  }

  /**
   * Check if tab stop navigation is active
   */
  isActive(): boolean {
    return this.state !== null;
  }

  /**
   * Handle keydown events for tab navigation
   */
  private handleKeydown(e: KeyboardEvent): void {
    if (!this.state) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();

      if (e.shiftKey) {
        this.moveToPrevious();
      } else {
        this.moveToNext();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.deactivate();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      // Enter confirms and exits (unless in textarea)
      if (
        this.state.element instanceof HTMLTextAreaElement ||
        this.state.isContenteditable
      ) {
        // Allow normal Enter in textareas and contenteditables
        return;
      }
      e.preventDefault();
      this.deactivate();
    }
  }

  /**
   * Handle blur events (deactivate on focus loss)
   */
  private handleBlur(): void {
    // Use a small delay to allow Tab key to work (it triggers blur before keydown sometimes)
    setTimeout(() => {
      if (this.state && document.activeElement !== this.state.element) {
        this.deactivate();
      }
    }, 100);
  }

  /**
   * Move to the next tab stop
   */
  private moveToNext(): void {
    if (!this.state) return;

    this.state.currentIndex++;

    if (this.state.currentIndex >= this.state.tabStops.length) {
      // Reached the end - deactivate and position cursor at end of last tab stop
      const lastStop = this.state.tabStops[this.state.tabStops.length - 1];
      const absoluteEnd = this.state.baseOffset + lastStop.endOffset;
      this.setCursorPosition(absoluteEnd);
      this.deactivate();
      return;
    }

    this.selectCurrentTabStop();
  }

  /**
   * Move to the previous tab stop
   */
  private moveToPrevious(): void {
    if (!this.state) return;

    if (this.state.currentIndex > 0) {
      this.state.currentIndex--;
      this.selectCurrentTabStop();
    }
  }

  /**
   * Select the text at the current tab stop
   */
  private selectCurrentTabStop(): void {
    if (!this.state) return;

    const tabStop = this.state.tabStops[this.state.currentIndex];
    const absoluteStart = this.state.baseOffset + tabStop.startOffset;
    const absoluteEnd = this.state.baseOffset + tabStop.endOffset;

    if (this.state.isContenteditable) {
      this.selectRangeContenteditable(
        this.state.element as HTMLElement,
        absoluteStart,
        absoluteEnd
      );
    } else {
      this.selectRangeInput(
        this.state.element as HTMLInputElement | HTMLTextAreaElement,
        absoluteStart,
        absoluteEnd
      );
    }
  }

  /**
   * Select a range in an input/textarea element
   */
  private selectRangeInput(
    element: HTMLInputElement | HTMLTextAreaElement,
    start: number,
    end: number
  ): void {
    element.focus();
    element.setSelectionRange(start, end);
  }

  /**
   * Select a range in a contenteditable element
   */
  private selectRangeContenteditable(
    element: HTMLElement,
    start: number,
    end: number
  ): void {
    element.focus();

    const range = document.createRange();
    const selection = window.getSelection();

    if (!selection) return;

    // Find the text nodes and offsets
    const startPos = this.findTextPosition(element, start);
    const endPos = this.findTextPosition(element, end);

    if (startPos && endPos) {
      range.setStart(startPos.node, startPos.offset);
      range.setEnd(endPos.node, endPos.offset);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
   * Find a text node and offset for a given character position
   */
  private findTextPosition(
    element: HTMLElement,
    targetOffset: number
  ): { node: Node; offset: number } | null {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentOffset = 0;
    let node: Text | null;

    while ((node = walker.nextNode() as Text | null)) {
      const nodeLength = node.textContent?.length ?? 0;

      if (currentOffset + nodeLength >= targetOffset) {
        return {
          node,
          offset: targetOffset - currentOffset,
        };
      }

      currentOffset += nodeLength;
    }

    // If we didn't find it, return the last position
    const lastNode = walker.currentNode || element;
    return {
      node: lastNode,
      offset: lastNode.textContent?.length ?? 0,
    };
  }

  /**
   * Set cursor position (collapse selection to a point)
   */
  private setCursorPosition(position: number): void {
    if (!this.state) return;

    if (this.state.isContenteditable) {
      const element = this.state.element as HTMLElement;
      element.focus();

      const selection = window.getSelection();
      if (!selection) return;

      const pos = this.findTextPosition(element, position);
      if (pos) {
        const range = document.createRange();
        range.setStart(pos.node, pos.offset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      const element = this.state.element as
        | HTMLInputElement
        | HTMLTextAreaElement;
      element.focus();
      element.setSelectionRange(position, position);
    }
  }
}

// Export singleton instance
export const tabStopManager = new TabStopManager();
