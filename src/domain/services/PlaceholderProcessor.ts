import type {
  PlaceholderType,
  ParsedPlaceholder,
  PlaceholderContext,
  ProcessedContent,
  InputFieldDefinition,
  TabStopDefinition,
} from '@shared/types';
import {
  formatDate,
  DEFAULT_DATE_FORMAT,
  DEFAULT_TIME_FORMAT,
  DEFAULT_DATETIME_FORMAT,
  applyTransform,
  isTransformModifier,
  generateUUID,
} from '@shared/utils';
import { PLACEHOLDER_PATTERN } from '@shared/constants';

/**
 * Domain service for processing placeholders in template content
 */
export class PlaceholderProcessor {
  /**
   * Parse all placeholders from template content
   */
  parse(content: string): ParsedPlaceholder[] {
    const placeholders: ParsedPlaceholder[] = [];
    const pattern = new RegExp(PLACEHOLDER_PATTERN.source, 'g');

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const [raw, type, formatPart] = match;
      const placeholder: ParsedPlaceholder = {
        raw,
        type: type as PlaceholderType,
        startIndex: match.index,
        endIndex: match.index + raw.length,
      };

      // Parse the format part based on placeholder type
      this.parseFormatPart(placeholder, formatPart);

      placeholders.push(placeholder);
    }

    return placeholders;
  }

  /**
   * Parse the format part of a placeholder based on its type
   */
  private parseFormatPart(placeholder: ParsedPlaceholder, formatPart?: string): void {
    if (!formatPart) {
      return;
    }

    switch (placeholder.type) {
      case 'clipboard':
      case 'selection':
        // Check if formatPart is a transform modifier
        if (isTransformModifier(formatPart)) {
          placeholder.transform = formatPart;
        } else {
          placeholder.format = formatPart;
        }
        break;

      case 'input': {
        // Format: Label or Label:defaultValue
        const parts = formatPart.split(':');
        placeholder.label = parts[0];
        if (parts.length > 1) {
          placeholder.defaultValue = parts.slice(1).join(':'); // Allow colons in default value
        }
        break;
      }

      case 'select': {
        // Format: Label:opt1,opt2,opt3
        const colonIndex = formatPart.indexOf(':');
        if (colonIndex !== -1) {
          placeholder.label = formatPart.slice(0, colonIndex);
          placeholder.options = formatPart.slice(colonIndex + 1).split(',').map((s) => s.trim());
        } else {
          placeholder.label = formatPart;
          placeholder.options = [];
        }
        break;
      }

      case 'tab': {
        // Format: N or N:defaultValue
        const parts = formatPart.split(':');
        placeholder.tabIndex = parseInt(parts[0], 10);
        if (parts.length > 1) {
          placeholder.defaultValue = parts.slice(1).join(':');
        }
        break;
      }

      default:
        // For date, time, datetime - store as format
        placeholder.format = formatPart;
    }
  }

  /**
   * Analyze template for interactive placeholders that require user input
   * @returns Array of input field definitions, or undefined if no interactive placeholders
   */
  analyzeInteractive(content: string): InputFieldDefinition[] | undefined {
    const placeholders = this.parse(content);
    const interactiveFields: InputFieldDefinition[] = [];

    for (let i = 0; i < placeholders.length; i++) {
      const ph = placeholders[i];

      if (ph.type === 'input') {
        interactiveFields.push({
          id: generateUUID(),
          type: 'text',
          label: ph.label ?? 'Input',
          defaultValue: ph.defaultValue,
          placeholderIndex: i,
        });
      } else if (ph.type === 'select') {
        interactiveFields.push({
          id: generateUUID(),
          type: 'select',
          label: ph.label ?? 'Select',
          options: ph.options ?? [],
          defaultValue: ph.options?.[0],
          placeholderIndex: i,
        });
      }
    }

    return interactiveFields.length > 0 ? interactiveFields : undefined;
  }

  /**
   * Process template content with user-provided input values
   * @param content - Template content with placeholders
   * @param context - Context containing selection and clipboard data
   * @param inputValues - Map of input field IDs to user-provided values
   * @param inputFields - The input field definitions from analyzeInteractive
   */
  processWithInputs(
    content: string,
    context: PlaceholderContext,
    inputValues: Record<string, string>,
    inputFields: InputFieldDefinition[]
  ): ProcessedContent {
    const placeholders = this.parse(content);

    if (placeholders.length === 0) {
      return { text: content };
    }

    // Create a map of placeholder index to input value
    const inputValueByIndex = new Map<number, string>();
    for (const field of inputFields) {
      const value = inputValues[field.id] ?? field.defaultValue ?? '';
      inputValueByIndex.set(field.placeholderIndex, value);
    }

    let result = content;
    let cursorOffset: number | undefined;
    const tabStops: TabStopDefinition[] = [];

    // Process placeholders in reverse order to preserve indices
    const sortedPlaceholders = [...placeholders].sort((a, b) => b.startIndex - a.startIndex);

    for (const placeholder of sortedPlaceholders) {
      let replacement: string;

      // Check if this is an input/select placeholder with a user-provided value
      const originalIndex = placeholders.indexOf(placeholder);
      if (inputValueByIndex.has(originalIndex)) {
        replacement = inputValueByIndex.get(originalIndex)!;
      } else {
        replacement = this.resolvePlaceholder(placeholder, context);
      }

      // Track tab stops before replacement
      if (placeholder.type === 'tab' && placeholder.tabIndex !== undefined) {
        // Will calculate actual offset after all replacements
        tabStops.push({
          index: placeholder.tabIndex,
          startOffset: placeholder.startIndex,
          endOffset: placeholder.startIndex + replacement.length,
          defaultValue: placeholder.defaultValue,
        });
      }

      // Track cursor position (use first <cursor> only)
      if (placeholder.type === 'cursor' && cursorOffset === undefined) {
        cursorOffset = this.calculateCursorOffset(content, placeholders, placeholder, context);
      }

      result =
        result.slice(0, placeholder.startIndex) + replacement + result.slice(placeholder.endIndex);
    }

    // Recalculate tab stop offsets based on final positions
    // Process in forward order to adjust for previous replacements
    const forwardPlaceholders = [...placeholders].sort((a, b) => a.startIndex - b.startIndex);
    const finalTabStops: TabStopDefinition[] = [];

    for (const placeholder of forwardPlaceholders) {
      if (placeholder.type === 'tab' && placeholder.tabIndex !== undefined) {
        const replacement = placeholder.defaultValue ?? '';

        // Calculate offset accounting for all previous placeholder replacements
        let offset = placeholder.startIndex;
        for (const ph of forwardPlaceholders) {
          if (ph.startIndex < placeholder.startIndex) {
            const originalIndex = placeholders.indexOf(ph);
            let rep: string;
            if (inputValueByIndex.has(originalIndex)) {
              rep = inputValueByIndex.get(originalIndex)!;
            } else {
              rep = this.resolvePlaceholder(ph, context);
            }
            offset += rep.length - ph.raw.length;
          }
        }

        finalTabStops.push({
          index: placeholder.tabIndex,
          startOffset: offset,
          endOffset: offset + replacement.length,
          defaultValue: placeholder.defaultValue,
        });
      }
    }

    // Sort tab stops by index
    finalTabStops.sort((a, b) => a.index - b.index);

    return {
      text: result,
      cursorOffset,
      tabStops: finalTabStops.length > 0 ? finalTabStops : undefined,
    };
  }

  /**
   * Process template content and resolve all placeholders
   * @param content - Template content with placeholders
   * @param context - Context containing selection and clipboard data
   * @returns Processed content with resolved placeholders and optional cursor position
   */
  process(content: string, context: PlaceholderContext): ProcessedContent {
    const placeholders = this.parse(content);

    if (placeholders.length === 0) {
      return { text: content };
    }

    let result = content;
    let cursorOffset: number | undefined;
    const tabStops: TabStopDefinition[] = [];

    // Process placeholders in reverse order to preserve indices
    const sortedPlaceholders = [...placeholders].sort((a, b) => b.startIndex - a.startIndex);

    for (const placeholder of sortedPlaceholders) {
      const replacement = this.resolvePlaceholder(placeholder, context);

      // Track cursor position (use first <cursor> only)
      if (placeholder.type === 'cursor' && cursorOffset === undefined) {
        cursorOffset = this.calculateCursorOffset(content, placeholders, placeholder, context);
      }

      result =
        result.slice(0, placeholder.startIndex) + replacement + result.slice(placeholder.endIndex);
    }

    // Calculate tab stop offsets (process in forward order)
    const forwardPlaceholders = [...placeholders].sort((a, b) => a.startIndex - b.startIndex);

    for (const placeholder of forwardPlaceholders) {
      if (placeholder.type === 'tab' && placeholder.tabIndex !== undefined) {
        const replacement = placeholder.defaultValue ?? '';

        // Calculate offset accounting for all previous placeholder replacements
        let offset = placeholder.startIndex;
        for (const ph of forwardPlaceholders) {
          if (ph.startIndex < placeholder.startIndex) {
            const rep = this.resolvePlaceholder(ph, context);
            offset += rep.length - ph.raw.length;
          }
        }

        tabStops.push({
          index: placeholder.tabIndex,
          startOffset: offset,
          endOffset: offset + replacement.length,
          defaultValue: placeholder.defaultValue,
        });
      }
    }

    // Sort tab stops by index
    tabStops.sort((a, b) => a.index - b.index);

    return {
      text: result,
      cursorOffset,
      tabStops: tabStops.length > 0 ? tabStops : undefined,
    };
  }

  /**
   * Resolve a single placeholder to its replacement value
   */
  private resolvePlaceholder(placeholder: ParsedPlaceholder, context: PlaceholderContext): string {
    const now = new Date();
    let value: string;

    switch (placeholder.type) {
      case 'clipboard':
        value = context.clipboard ?? '';
        break;

      case 'selection':
        value = context.selection ?? '';
        break;

      case 'cursor':
        // Cursor placeholder is removed; position is tracked separately
        return '';

      case 'date':
        return formatDate(now, placeholder.format ?? DEFAULT_DATE_FORMAT);

      case 'time':
        return formatDate(now, placeholder.format ?? DEFAULT_TIME_FORMAT);

      case 'datetime':
        return formatDate(now, placeholder.format ?? DEFAULT_DATETIME_FORMAT);

      case 'input':
        // Input placeholders should be handled via processWithInputs
        // Return default value or empty string as fallback
        return placeholder.defaultValue ?? '';

      case 'select':
        // Select placeholders should be handled via processWithInputs
        // Return first option or empty string as fallback
        return placeholder.options?.[0] ?? '';

      case 'tab':
        // Tab placeholders return their default value or empty string
        return placeholder.defaultValue ?? '';

      default:
        // Unknown placeholder type - return as-is
        return placeholder.raw;
    }

    // Apply transform if specified
    if (placeholder.transform) {
      value = applyTransform(value, placeholder.transform);
    }

    return value;
  }

  /**
   * Calculate the cursor offset position after all placeholders are resolved
   */
  private calculateCursorOffset(
    _content: string,
    placeholders: ParsedPlaceholder[],
    cursorPlaceholder: ParsedPlaceholder,
    context: PlaceholderContext
  ): number {
    let offset = cursorPlaceholder.startIndex;

    // Account for placeholders that come before the cursor
    for (const ph of placeholders) {
      if (ph.startIndex < cursorPlaceholder.startIndex) {
        const replacement = this.resolvePlaceholder(ph, context);
        // Adjust offset by the difference between replacement and original
        offset += replacement.length - ph.raw.length;
      }
    }

    return offset;
  }

  /**
   * Check if content contains any placeholders
   */
  hasPlaceholders(content: string): boolean {
    const pattern = new RegExp(PLACEHOLDER_PATTERN.source);
    return pattern.test(content);
  }

  /**
   * Check if content contains interactive placeholders (input/select)
   */
  hasInteractivePlaceholders(content: string): boolean {
    const placeholders = this.parse(content);
    return placeholders.some((ph) => ph.type === 'input' || ph.type === 'select');
  }

  /**
   * Check if content contains tab stops
   */
  hasTabStops(content: string): boolean {
    const placeholders = this.parse(content);
    return placeholders.some((ph) => ph.type === 'tab');
  }
}
