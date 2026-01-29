import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardIcon } from '@ui/index';

export function TipsSection(): React.ReactElement {
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <CardIcon>
          <Sparkles size={16} />
        </CardIcon>
        <h2 className="settings-section-title">Tips & Best Practices</h2>
      </div>
      <Card>
        <CardContent>
          <div className="help-content-section">
            <div className="help-tips-grid">
              <div className="help-tip-card">
                <h4 className="help-tip-title">Organize with Groups</h4>
                <p className="help-tip-text">
                  Create groups to organize related templates. Use groups for different projects,
                  clients, or template types (emails, code, etc.).
                </p>
              </div>

              <div className="help-tip-card">
                <h4 className="help-tip-title">Use Tab Stops for Forms</h4>
                <p className="help-tip-text">
                  For templates with multiple fields, use <code>{'<tab:1>'}</code>,{' '}
                  <code>{'<tab:2>'}</code>, etc. Press Tab to jump between fields after expansion.
                </p>
              </div>

              <div className="help-tip-card">
                <h4 className="help-tip-title">Consistent Trigger Prefixes</h4>
                <p className="help-tip-text">
                  Use consistent prefixes for related templates. For example:{' '}
                  <code>/email-meeting</code>, <code>/email-followup</code>,{' '}
                  <code>/email-thanks</code>.
                </p>
              </div>

              <div className="help-tip-card">
                <h4 className="help-tip-title">Clipboard + Transforms</h4>
                <p className="help-tip-text">
                  Combine clipboard with transforms for powerful workflows. Copy text, then use{' '}
                  <code>{'<clipboard:upper>'}</code> or <code>{'<clipboard:title>'}</code>.
                </p>
              </div>

              <div className="help-tip-card">
                <h4 className="help-tip-title">Default Values Save Time</h4>
                <p className="help-tip-text">
                  Add default values to inputs and tab stops for common choices:{' '}
                  <code>{'<input:Priority:Medium>'}</code> or <code>{'<tab:1:TODO>'}</code>.
                </p>
              </div>

              <div className="help-tip-card">
                <h4 className="help-tip-title">Backup Regularly</h4>
                <p className="help-tip-text">
                  Export your templates regularly from the Settings page. This creates a JSON backup
                  you can import later or share with teammates.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
