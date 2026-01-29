import React from 'react';
import { Zap } from 'lucide-react';
import { Card, CardContent, CardIcon } from '@ui/index';

export function TriggersSection(): React.ReactElement {
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <CardIcon>
          <Zap size={16} />
        </CardIcon>
        <h2 className="settings-section-title">Triggers</h2>
      </div>
      <Card>
        <CardContent>
          <div className="help-content-section">
            <p className="help-intro">
              Triggers are the shortcuts you type to expand templates. Understanding how they work
              helps you create efficient workflows.
            </p>

            <h4 className="help-subsection-title">Expansion Modes</h4>
            <div className="help-mode-list">
              <div className="help-mode-item">
                <div className="help-mode-header">
                  <span className="help-mode-name">Space Mode</span>
                  <span className="help-mode-badge">Default</span>
                </div>
                <p className="help-mode-description">
                  Type your trigger followed by <kbd>Space</kbd> to expand. This prevents accidental
                  expansions while typing normally.
                </p>
                <p className="help-mode-example">
                  Example: Type <code>/sig</code> then press <kbd>Space</kbd>
                </p>
              </div>
              <div className="help-mode-item">
                <div className="help-mode-header">
                  <span className="help-mode-name">Immediate Mode</span>
                </div>
                <p className="help-mode-description">
                  Templates expand as soon as the trigger is typed. Faster, but avoid creating
                  triggers that are prefixes of each other.
                </p>
                <p className="help-mode-example">
                  Example: Type <code>/sig</code> — expands immediately
                </p>
              </div>
            </div>

            <h4 className="help-subsection-title">Tips for Choosing Triggers</h4>
            <ul className="help-tips-list">
              <li>
                Start with a symbol like <code>/</code>, <code>:</code>, or <code>;</code> to avoid
                conflicts with normal words
              </li>
              <li>Keep triggers short but memorable</li>
              <li>
                Use consistent prefixes for related templates (e.g., <code>/email-</code> for all
                email templates)
              </li>
              <li>Avoid triggers that are prefixes of other triggers in Immediate mode</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
