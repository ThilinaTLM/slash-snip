import React, { useState, useMemo } from 'react';
import { Play, Clipboard, MousePointerClick } from 'lucide-react';
import type { TemplateDTO } from '@application/dto';
import { PlaceholderProcessor } from '@domain/services/PlaceholderProcessor';
import { Input } from '@ui/input';
import { Textarea } from '@ui/textarea';

interface TryItOutScreenProps {
  templates: TemplateDTO[];
}

export function TryItOutScreen({ templates }: TryItOutScreenProps): React.ReactElement {
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
    <div className="try-it-out-screen">
      <div className="try-it-out-container">
        <div className="try-it-out-header-section">
          <div className="try-it-out-icon-wrapper">
            <Play size={20} />
          </div>
          <div>
            <h1 className="try-it-out-page-title">Try It Out</h1>
            <p className="try-it-out-page-subtitle">
              Test your snippets by typing triggers below. See how placeholders expand in real-time.
            </p>
          </div>
        </div>

        {/* Status indicator */}
        {matchedTemplate && (
          <div className="try-it-out-status">
            Matched: <span className="try-it-out-status-trigger">{matchedTemplate.trigger}</span>
            <span className="try-it-out-status-name">({matchedTemplate.name})</span>
          </div>
        )}

        {/* Simulated context inputs */}
        <div className="try-it-out-section">
          <h2 className="try-it-out-section-title">Simulated Context</h2>
          <p className="try-it-out-section-description">
            Set values for placeholders like <code>{'<clipboard>'}</code> and <code>{'<selection>'}</code>
          </p>
          <div className="try-it-out-context-grid">
            <div className="try-it-out-context-field">
              <label className="try-it-out-context-label">
                <Clipboard size={14} />
                Clipboard
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
                <MousePointerClick size={14} />
                Selection
              </label>
              <Input
                type="text"
                value={simulatedSelection}
                onChange={(e) => setSimulatedSelection(e.target.value)}
                placeholder="Selected text..."
              />
            </div>
          </div>
        </div>

        {/* Input and Output */}
        <div className="try-it-out-section">
          <h2 className="try-it-out-section-title">Test Area</h2>
          <div className="try-it-out-test-grid">
            <div className="try-it-out-test-field">
              <label className="try-it-out-test-label">Input</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={templates.length > 0 ? `Try typing "${templates[0].trigger} "...` : 'Create a template first...'}
                style={{ height: '160px' }}
                mono
              />
            </div>
            <div className="try-it-out-test-field">
              <label className="try-it-out-test-label">Output (expansion result)</label>
              <div className="try-it-out-output">
                {output || <span className="try-it-out-output-placeholder">Output will appear here...</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Help text */}
        <div className="try-it-out-help">
          <p>
            Type a trigger (like <code>{templates[0]?.trigger || '/hello'}</code>) followed by a space to see it expand.
          </p>
          {templates.length === 0 && (
            <p className="try-it-out-help-warning">
              No snippets found. Create some snippets first to test them here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
