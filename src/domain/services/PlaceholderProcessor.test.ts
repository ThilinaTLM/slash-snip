import { describe, it, expect, beforeEach } from 'vitest';
import { PlaceholderProcessor } from './PlaceholderProcessor';
import type { PlaceholderContext } from '@shared/types';

describe('PlaceholderProcessor', () => {
  let processor: PlaceholderProcessor;

  beforeEach(() => {
    processor = new PlaceholderProcessor();
  });

  describe('parse', () => {
    describe('input placeholders', () => {
      it('should parse <input:Label>', () => {
        const placeholders = processor.parse('Hello <input:Name>!');
        expect(placeholders).toHaveLength(1);
        expect(placeholders[0].type).toBe('input');
        expect(placeholders[0].label).toBe('Name');
        expect(placeholders[0].defaultValue).toBeUndefined();
      });

      it('should parse <input:Label:default>', () => {
        const placeholders = processor.parse('Hello <input:Name:World>!');
        expect(placeholders).toHaveLength(1);
        expect(placeholders[0].type).toBe('input');
        expect(placeholders[0].label).toBe('Name');
        expect(placeholders[0].defaultValue).toBe('World');
      });

      it('should parse default values with colons', () => {
        const placeholders = processor.parse('<input:Time:10:30>');
        expect(placeholders[0].defaultValue).toBe('10:30');
      });
    });

    describe('select placeholders', () => {
      it('should parse <select:Label:options>', () => {
        const placeholders = processor.parse('Color: <select:Pick:red,green,blue>');
        expect(placeholders).toHaveLength(1);
        expect(placeholders[0].type).toBe('select');
        expect(placeholders[0].label).toBe('Pick');
        expect(placeholders[0].options).toEqual(['red', 'green', 'blue']);
      });

      it('should handle options with whitespace', () => {
        const placeholders = processor.parse('<select:Size:small, medium, large>');
        expect(placeholders[0].options).toEqual(['small', 'medium', 'large']);
      });
    });

    describe('tab placeholders', () => {
      it('should parse <tab:N>', () => {
        const placeholders = processor.parse('Name: <tab:1>\nEmail: <tab:2>');
        expect(placeholders).toHaveLength(2);
        expect(placeholders[0].type).toBe('tab');
        expect(placeholders[0].tabIndex).toBe(1);
        expect(placeholders[1].tabIndex).toBe(2);
      });

      it('should parse <tab:N:default>', () => {
        const placeholders = processor.parse('<tab:1:TODO>');
        expect(placeholders[0].tabIndex).toBe(1);
        expect(placeholders[0].defaultValue).toBe('TODO');
      });
    });

    describe('transform modifiers', () => {
      it('should parse <clipboard:upper>', () => {
        const placeholders = processor.parse('<clipboard:upper>');
        expect(placeholders[0].type).toBe('clipboard');
        expect(placeholders[0].transform).toBe('upper');
      });

      it('should parse <selection:lower>', () => {
        const placeholders = processor.parse('<selection:lower>');
        expect(placeholders[0].type).toBe('selection');
        expect(placeholders[0].transform).toBe('lower');
      });

      it('should parse <clipboard:title>', () => {
        const placeholders = processor.parse('<clipboard:title>');
        expect(placeholders[0].transform).toBe('title');
      });

      it('should parse <selection:trim>', () => {
        const placeholders = processor.parse('<selection:trim>');
        expect(placeholders[0].transform).toBe('trim');
      });
    });
  });

  describe('analyzeInteractive', () => {
    it('should return undefined for templates without interactive placeholders', () => {
      expect(processor.analyzeInteractive('Hello <clipboard>!')).toBeUndefined();
      expect(processor.analyzeInteractive('Today: <date>')).toBeUndefined();
    });

    it('should return input fields for <input> placeholders', () => {
      const fields = processor.analyzeInteractive('Hello <input:Name>!');
      expect(fields).toHaveLength(1);
      expect(fields![0].type).toBe('text');
      expect(fields![0].label).toBe('Name');
    });

    it('should return select fields for <select> placeholders', () => {
      const fields = processor.analyzeInteractive('<select:Color:red,green,blue>');
      expect(fields).toHaveLength(1);
      expect(fields![0].type).toBe('select');
      expect(fields![0].options).toEqual(['red', 'green', 'blue']);
    });

    it('should return multiple fields in order', () => {
      const fields = processor.analyzeInteractive('<input:Name>, <select:Color:red,blue>, <input:Email>');
      expect(fields).toHaveLength(3);
      expect(fields![0].label).toBe('Name');
      expect(fields![1].label).toBe('Color');
      expect(fields![2].label).toBe('Email');
    });
  });

  describe('process with transforms', () => {
    it('should apply uppercase transform to clipboard', () => {
      const context: PlaceholderContext = { clipboard: 'hello world' };
      const result = processor.process('Output: <clipboard:upper>', context);
      expect(result.text).toBe('Output: HELLO WORLD');
    });

    it('should apply lowercase transform to selection', () => {
      const context: PlaceholderContext = { selection: 'HELLO WORLD' };
      const result = processor.process('Output: <selection:lower>', context);
      expect(result.text).toBe('Output: hello world');
    });

    it('should apply title case transform', () => {
      const context: PlaceholderContext = { clipboard: 'john doe' };
      const result = processor.process('Name: <clipboard:title>', context);
      expect(result.text).toBe('Name: John Doe');
    });

    it('should apply trim transform', () => {
      const context: PlaceholderContext = { selection: '  spaced  ' };
      const result = processor.process('Text: <selection:trim>', context);
      expect(result.text).toBe('Text: spaced');
    });

    it('should handle empty clipboard with transform', () => {
      const context: PlaceholderContext = { clipboard: '' };
      const result = processor.process('Output: <clipboard:upper>', context);
      expect(result.text).toBe('Output: ');
    });
  });

  describe('process with tab stops', () => {
    it('should process tab stops and return definitions', () => {
      const context: PlaceholderContext = {};
      const result = processor.process('Name: <tab:1>\nEmail: <tab:2>', context);
      expect(result.tabStops).toHaveLength(2);
      expect(result.tabStops![0].index).toBe(1);
      expect(result.tabStops![1].index).toBe(2);
    });

    it('should calculate correct offsets for tab stops', () => {
      const context: PlaceholderContext = {};
      const result = processor.process('Name: <tab:1>', context);
      expect(result.text).toBe('Name: ');
      expect(result.tabStops![0].startOffset).toBe(6);
      expect(result.tabStops![0].endOffset).toBe(6);
    });

    it('should include default values in tab stops', () => {
      const context: PlaceholderContext = {};
      const result = processor.process('<tab:1:TODO>', context);
      expect(result.text).toBe('TODO');
      expect(result.tabStops![0].defaultValue).toBe('TODO');
      expect(result.tabStops![0].endOffset).toBe(4);
    });

    it('should sort tab stops by index', () => {
      const context: PlaceholderContext = {};
      const result = processor.process('<tab:3> <tab:1> <tab:2>', context);
      expect(result.tabStops![0].index).toBe(1);
      expect(result.tabStops![1].index).toBe(2);
      expect(result.tabStops![2].index).toBe(3);
    });
  });

  describe('processWithInputs', () => {
    it('should replace input placeholders with provided values', () => {
      const context: PlaceholderContext = {};
      const fields = processor.analyzeInteractive('Hello <input:Name>!')!;
      const inputValues = { [fields[0].id]: 'World' };

      const result = processor.processWithInputs('Hello <input:Name>!', context, inputValues, fields);
      expect(result.text).toBe('Hello World!');
    });

    it('should handle multiple inputs', () => {
      const context: PlaceholderContext = {};
      const content = '<input:First> <input:Last>';
      const fields = processor.analyzeInteractive(content)!;
      const inputValues = {
        [fields[0].id]: 'John',
        [fields[1].id]: 'Doe',
      };

      const result = processor.processWithInputs(content, context, inputValues, fields);
      expect(result.text).toBe('John Doe');
    });

    it('should use default value when input not provided', () => {
      const context: PlaceholderContext = {};
      const content = '<input:Name:Anonymous>';
      const fields = processor.analyzeInteractive(content)!;

      const result = processor.processWithInputs(content, context, {}, fields);
      expect(result.text).toBe('Anonymous');
    });

    it('should handle select placeholders', () => {
      const context: PlaceholderContext = {};
      const content = 'Color: <select:Pick:red,green,blue>';
      const fields = processor.analyzeInteractive(content)!;
      const inputValues = { [fields[0].id]: 'green' };

      const result = processor.processWithInputs(content, context, inputValues, fields);
      expect(result.text).toBe('Color: green');
    });

    it('should work with mixed placeholders', () => {
      const context: PlaceholderContext = { clipboard: 'clipboard-text' };
      const content = 'Name: <input:Name>, Clip: <clipboard>';
      const fields = processor.analyzeInteractive(content)!;
      const inputValues = { [fields[0].id]: 'John' };

      const result = processor.processWithInputs(content, context, inputValues, fields);
      expect(result.text).toBe('Name: John, Clip: clipboard-text');
    });

    it('should calculate tab stops correctly with inputs', () => {
      const context: PlaceholderContext = {};
      const content = '<input:Name>: <tab:1:TODO>';
      const fields = processor.analyzeInteractive(content)!;
      const inputValues = { [fields[0].id]: 'John' };

      const result = processor.processWithInputs(content, context, inputValues, fields);
      expect(result.text).toBe('John: TODO');
      expect(result.tabStops).toHaveLength(1);
      expect(result.tabStops![0].startOffset).toBe(6); // "John: " = 6 chars
    });
  });

  describe('hasInteractivePlaceholders', () => {
    it('should return true for input placeholders', () => {
      expect(processor.hasInteractivePlaceholders('<input:Name>')).toBe(true);
    });

    it('should return true for select placeholders', () => {
      expect(processor.hasInteractivePlaceholders('<select:Color:red,blue>')).toBe(true);
    });

    it('should return false for non-interactive placeholders', () => {
      expect(processor.hasInteractivePlaceholders('<clipboard>')).toBe(false);
      expect(processor.hasInteractivePlaceholders('<date>')).toBe(false);
      expect(processor.hasInteractivePlaceholders('<tab:1>')).toBe(false);
    });
  });

  describe('hasTabStops', () => {
    it('should return true for templates with tab stops', () => {
      expect(processor.hasTabStops('<tab:1>')).toBe(true);
      expect(processor.hasTabStops('Name: <tab:1>')).toBe(true);
    });

    it('should return false for templates without tab stops', () => {
      expect(processor.hasTabStops('<input:Name>')).toBe(false);
      expect(processor.hasTabStops('<clipboard>')).toBe(false);
    });
  });
});
