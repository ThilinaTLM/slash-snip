import React from 'react';
import { Code2 } from 'lucide-react';
import { Card, CardContent, CardIcon } from '@ui/index';

interface PlaceholderInfo {
  name: string;
  syntax: string;
  description: string;
  example?: string;
}

const placeholders: PlaceholderInfo[] = [
  {
    name: 'Clipboard',
    syntax: '<clipboard>',
    description: 'Inserts the current clipboard content',
    example: 'Paste: <clipboard>',
  },
  {
    name: 'Selection',
    syntax: '<selection>',
    description: 'Inserts the currently selected text',
    example: 'Selected: <selection>',
  },
  {
    name: 'Cursor',
    syntax: '<cursor>',
    description: 'Positions the cursor here after expansion',
  },
  {
    name: 'Date',
    syntax: '<date:FORMAT>',
    description: 'Inserts formatted date (YYYY, MM, DD, etc.)',
    example: '<date:YYYY-MM-DD> → 2026-01-29',
  },
  {
    name: 'Time',
    syntax: '<time:FORMAT>',
    description: 'Inserts formatted time (HH, mm, ss, etc.)',
    example: '<time:HH:mm> → 14:30',
  },
  {
    name: 'DateTime',
    syntax: '<datetime:FORMAT>',
    description: 'Inserts formatted date and time',
    example: '<datetime:YYYY-MM-DD HH:mm>',
  },
  {
    name: 'Input',
    syntax: '<input:Label>',
    description: 'Prompts for user input with a label',
    example: '<input:Your Name>',
  },
  {
    name: 'Input (default)',
    syntax: '<input:Label:default>',
    description: 'Input prompt with a default value',
    example: '<input:Priority:Medium>',
  },
  {
    name: 'Select',
    syntax: '<select:Label:opt1,opt2>',
    description: 'Dropdown selection from options',
    example: '<select:Status:Open,In Progress,Done>',
  },
  {
    name: 'Tab Stop',
    syntax: '<tab:N>',
    description: 'Tab stop for sequential field navigation',
    example: '<tab:1> → <tab:2> → <tab:3>',
  },
  {
    name: 'Tab (default)',
    syntax: '<tab:N:default>',
    description: 'Tab stop with a default value',
    example: '<tab:1:TODO>',
  },
];

const transforms = [
  { name: ':upper', description: 'Convert to UPPERCASE' },
  { name: ':lower', description: 'Convert to lowercase' },
  { name: ':title', description: 'Convert To Title Case' },
  { name: ':trim', description: 'Remove leading/trailing whitespace' },
];

export function PlaceholdersSection(): React.ReactElement {
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <CardIcon>
          <Code2 size={16} />
        </CardIcon>
        <h2 className="settings-section-title">Placeholders Reference</h2>
      </div>
      <Card>
        <CardContent>
          <div className="help-content-section">
            <p className="help-intro">
              Placeholders add dynamic content to your templates. They&apos;re
              replaced with actual values when the template expands.
            </p>

            <div className="help-table-container">
              <table className="help-table">
                <thead>
                  <tr>
                    <th>Placeholder</th>
                    <th>Syntax</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {placeholders.map((p) => (
                    <tr key={p.name}>
                      <td className="help-table-name">{p.name}</td>
                      <td>
                        <code>{p.syntax}</code>
                      </td>
                      <td>
                        {p.description}
                        {p.example && (
                          <span className="help-table-example">
                            <br />
                            <code>{p.example}</code>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="help-subsection-title">Text Transforms</h4>
            <p className="help-text">
              Apply transforms to clipboard or selection content by adding a
              suffix:
            </p>
            <div className="help-transforms">
              {transforms.map((t) => (
                <div key={t.name} className="help-transform-item">
                  <code>{t.name}</code>
                  <span>{t.description}</span>
                </div>
              ))}
            </div>
            <p className="help-text help-text-muted">
              Example: <code>{'<clipboard:upper>'}</code> inserts clipboard
              content in uppercase.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
