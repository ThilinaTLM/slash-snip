import React from 'react';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardIcon } from '@ui/index';

export function GettingStartedSection(): React.ReactElement {
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <CardIcon>
          <BookOpen size={16} />
        </CardIcon>
        <h2 className="settings-section-title">Getting Started</h2>
      </div>
      <Card>
        <CardContent>
          <div className="help-content-section">
            <p className="help-intro">
              SlashSnip lets you create text templates that expand when you type a trigger shortcut.
              Here&apos;s how to get started:
            </p>
            <ol className="help-steps">
              <li>
                <strong>Create a template</strong> — Click the &ldquo;New&rdquo; button in the Snippets tab to
                create your first template.
              </li>
              <li>
                <strong>Set a trigger</strong> — Choose a unique shortcut like <code>/sig</code> or{' '}
                <code>::email</code> that you&apos;ll type to trigger the expansion.
              </li>
              <li>
                <strong>Write your content</strong> — Enter the text you want to expand. You can use
                placeholders for dynamic content.
              </li>
              <li>
                <strong>Use it anywhere</strong> — Type your trigger in any text field, and it will
                expand into your template content.
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
