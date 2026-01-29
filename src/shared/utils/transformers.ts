import type { TransformModifier } from '@shared/types';

/**
 * Apply a text transformation modifier
 */
export function applyTransform(
  text: string,
  transform: TransformModifier
): string {
  switch (transform) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return toTitleCase(text);
    case 'trim':
      return text.trim();
  }
}

/**
 * Convert text to Title Case
 */
function toTitleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

/**
 * Check if a string is a valid transform modifier
 */
export function isTransformModifier(value: string): value is TransformModifier {
  return ['upper', 'lower', 'title', 'trim'].includes(value);
}

/**
 * All available transform modifiers
 */
export const TRANSFORM_MODIFIERS: readonly TransformModifier[] = [
  'upper',
  'lower',
  'title',
  'trim',
];
