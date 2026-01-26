import type {
  PlaceholderType,
  ParsedPlaceholder,
  PlaceholderContext,
  ProcessedContent,
} from '@shared/types';
import {
  formatDate,
  DEFAULT_DATE_FORMAT,
  DEFAULT_TIME_FORMAT,
  DEFAULT_DATETIME_FORMAT,
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
      const [raw, type, format] = match;
      placeholders.push({
        raw,
        type: type as PlaceholderType,
        format,
        startIndex: match.index,
        endIndex: match.index + raw.length,
      });
    }

    return placeholders;
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

    // Process placeholders in reverse order to preserve indices
    const sortedPlaceholders = [...placeholders].sort((a, b) => b.startIndex - a.startIndex);

    for (const placeholder of sortedPlaceholders) {
      const replacement = this.resolvePlaceholder(placeholder, context);

      // Track cursor position (use first <cursor> only)
      if (placeholder.type === 'cursor' && cursorOffset === undefined) {
        // Calculate cursor position accounting for previous replacements
        // Since we're processing in reverse, we need to calculate forward
        cursorOffset = this.calculateCursorOffset(content, placeholders, placeholder, context);
      }

      result =
        result.slice(0, placeholder.startIndex) + replacement + result.slice(placeholder.endIndex);
    }

    return { text: result, cursorOffset };
  }

  /**
   * Resolve a single placeholder to its replacement value
   */
  private resolvePlaceholder(placeholder: ParsedPlaceholder, context: PlaceholderContext): string {
    const now = new Date();

    switch (placeholder.type) {
      case 'clipboard':
        return context.clipboard ?? '';

      case 'selection':
        return context.selection ?? '';

      case 'cursor':
        // Cursor placeholder is removed; position is tracked separately
        return '';

      case 'date':
        return formatDate(now, placeholder.format ?? DEFAULT_DATE_FORMAT);

      case 'time':
        return formatDate(now, placeholder.format ?? DEFAULT_TIME_FORMAT);

      case 'datetime':
        return formatDate(now, placeholder.format ?? DEFAULT_DATETIME_FORMAT);

      default:
        // Unknown placeholder type - return as-is
        return placeholder.raw;
    }
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
}
