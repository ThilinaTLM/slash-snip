import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Play, Clipboard, MousePointerClick } from 'lucide-react';
import type { TemplateDTO } from '@application/dto';
import { PlaceholderProcessor } from '@domain/services/PlaceholderProcessor';
import { Input } from '@ui/input';
import { Textarea } from '@ui/textarea';

interface TryItOutProps {
  templates: TemplateDTO[];
}

export function TryItOut({ templates }: TryItOutProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(true);
  const [input, setInput] = useState('');
  const [simulatedClipboard, setSimulatedClipboard] = useState('clipboard text');
  const [simulatedSelection, setSimulatedSelection] = useState('selected text');

  const processor = useMemo(() => new PlaceholderProcessor(), []);

  const { output, matchedTemplate } = useMemo(() => {
    if (!input.trim()) {
      return { output: '', matchedTemplate: null };
    }

    // Find matching template trigger in input
    // Check for triggers followed by space or at end of input
    for (const template of templates) {
      const trigger = template.trigger;

      // Check if input contains the trigger followed by space, newline, or is at end
      const patterns = [
        trigger + ' ',  // Trigger followed by space
        trigger + '\n', // Trigger followed by newline
      ];

      for (const pattern of patterns) {
        if (input.includes(pattern)) {
          const context = { clipboard: simulatedClipboard, selection: simulatedSelection };
          const result = processor.process(template.content, context);
          const expandedInput = input.replace(pattern, result.text + (pattern.endsWith(' ') ? ' ' : '\n'));
          return { output: expandedInput, matchedTemplate: template };
        }
      }

      // Also check if input ends with the trigger exactly (for preview before space)
      if (input.endsWith(trigger)) {
        const context = { clipboard: simulatedClipboard, selection: simulatedSelection };
        const result = processor.process(template.content, context);
        const expandedInput = input.slice(0, -trigger.length) + result.text;
        return { output: expandedInput, matchedTemplate: template };
      }
    }

    return { output: input, matchedTemplate: null };
  }, [input, templates, processor, simulatedClipboard, simulatedSelection]);

  return (
    <div className="try-it-out">
      {/* Header */}
      <button
        className="try-it-out-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="try-it-out-header-left">
          <Play size={16} className="text-accent" />
          <span className="try-it-out-title">Try It Out</span>
          {matchedTemplate && (
            <span className="try-it-out-match">Matched: {matchedTemplate.trigger}</span>
          )}
        </div>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="try-it-out-content">
          {/* Simulated context inputs */}
          <div className="try-it-out-context">
            <div className="try-it-out-context-field">
              <label className="try-it-out-context-label">
                <Clipboard size={12} />
                Simulated Clipboard
              </label>
              <Input
                type="text"
                value={simulatedClipboard}
                onChange={(e) => setSimulatedClipboard(e.target.value)}
                placeholder="Clipboard content..."
              />
            </div>
            <div className="try-it-out-context-field">
              <label className="try-it-out-context-label">
                <MousePointerClick size={12} />
                Simulated Selection
              </label>
              <Input
                type="text"
                value={simulatedSelection}
                onChange={(e) => setSimulatedSelection(e.target.value)}
                placeholder="Selected text..."
              />
            </div>
          </div>

          {/* Input and Output */}
          <div className="try-it-out-row">
            <div>
              <label className="try-it-out-field-label">Type triggers here</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={templates.length > 0 ? `Try typing "${templates[0].trigger} "...` : 'Create a template first...'}
                style={{ height: '96px' }}
                mono
              />
            </div>
            <div>
              <label className="try-it-out-field-label">Preview (expansion result)</label>
              <div className="try-it-out-preview">
                {output || <span className="try-it-out-preview-placeholder">Output will appear here...</span>}
              </div>
            </div>
          </div>

          {/* Hint */}
          <p className="try-it-out-hint">
            Type a trigger (like <code>{templates[0]?.trigger || '/hello'}</code>) followed by a space to see it expand.
            Placeholders like <code>{'<clipboard>'}</code> will use the simulated values above.
          </p>
        </div>
      )}
    </div>
  );
}
