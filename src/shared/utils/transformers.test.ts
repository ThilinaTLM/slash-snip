import { describe, it, expect } from 'vitest';
import { applyTransform, isTransformModifier, TRANSFORM_MODIFIERS } from './transformers';

describe('transformers', () => {
  describe('applyTransform', () => {
    it('should convert text to uppercase with "upper"', () => {
      expect(applyTransform('hello world', 'upper')).toBe('HELLO WORLD');
    });

    it('should convert text to lowercase with "lower"', () => {
      expect(applyTransform('HELLO WORLD', 'lower')).toBe('hello world');
    });

    it('should convert text to title case with "title"', () => {
      expect(applyTransform('hello world', 'title')).toBe('Hello World');
      expect(applyTransform('HELLO WORLD', 'title')).toBe('Hello World');
      expect(applyTransform('hElLo WoRlD', 'title')).toBe('Hello World');
    });

    it('should trim whitespace with "trim"', () => {
      expect(applyTransform('  hello world  ', 'trim')).toBe('hello world');
      expect(applyTransform('\n\thello\t\n', 'trim')).toBe('hello');
    });

    it('should handle empty strings', () => {
      expect(applyTransform('', 'upper')).toBe('');
      expect(applyTransform('', 'lower')).toBe('');
      expect(applyTransform('', 'title')).toBe('');
      expect(applyTransform('', 'trim')).toBe('');
    });

    it('should handle strings with special characters', () => {
      expect(applyTransform('hello-world_123', 'upper')).toBe('HELLO-WORLD_123');
      expect(applyTransform('HELLO@WORLD.COM', 'lower')).toBe('hello@world.com');
    });
  });

  describe('isTransformModifier', () => {
    it('should return true for valid transform modifiers', () => {
      expect(isTransformModifier('upper')).toBe(true);
      expect(isTransformModifier('lower')).toBe(true);
      expect(isTransformModifier('title')).toBe(true);
      expect(isTransformModifier('trim')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isTransformModifier('UPPER')).toBe(false);
      expect(isTransformModifier('unknown')).toBe(false);
      expect(isTransformModifier('')).toBe(false);
      expect(isTransformModifier('uppercase')).toBe(false);
    });
  });

  describe('TRANSFORM_MODIFIERS', () => {
    it('should contain all valid modifiers', () => {
      expect(TRANSFORM_MODIFIERS).toContain('upper');
      expect(TRANSFORM_MODIFIERS).toContain('lower');
      expect(TRANSFORM_MODIFIERS).toContain('title');
      expect(TRANSFORM_MODIFIERS).toContain('trim');
      expect(TRANSFORM_MODIFIERS.length).toBe(4);
    });
  });
});
