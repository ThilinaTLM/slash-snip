import React from 'react';
import { Keyboard, Palette, Zap } from 'lucide-react';

export function SettingsScreen(): React.ReactElement {
  return (
    <>
      <div className="content-header">
        <div className="content-header-left">
          <h1 className="content-header-title">Settings</h1>
        </div>
      </div>

      <div className="content-body">
        <div className="screen-container">
          {/* Trigger Settings */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon">
                <Zap size={18} />
              </div>
              <h2 className="settings-section-title">Trigger Behavior</h2>
            </div>
            <div className="settings-card">
              <div className="settings-row">
                <div className="settings-row-content">
                  <div className="settings-row-label">Expansion Trigger</div>
                  <div className="settings-row-description">
                    How to trigger template expansion after typing a shortcut
                  </div>
                </div>
                <div className="settings-row-action">
                  <select className="input" style={{ width: 140 }}>
                    <option value="space">Space</option>
                    <option value="tab">Tab</option>
                    <option value="enter">Enter</option>
                  </select>
                </div>
              </div>
              <div className="settings-row">
                <div className="settings-row-content">
                  <div className="settings-row-label">Case Sensitivity</div>
                  <div className="settings-row-description">
                    Whether trigger shortcuts are case-sensitive
                  </div>
                </div>
                <div className="settings-row-action">
                  <button className="toggle" role="switch" aria-checked="false">
                    <span className="toggle-knob" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon">
                <Keyboard size={18} />
              </div>
              <h2 className="settings-section-title">Keyboard Shortcuts</h2>
            </div>
            <div className="settings-card">
              <div className="settings-row">
                <div className="settings-row-content">
                  <div className="settings-row-label">Open Command Palette</div>
                  <div className="settings-row-description">
                    Quick access to search and insert templates
                  </div>
                </div>
                <div className="settings-row-action">
                  <kbd
                    style={{
                      padding: '4px 8px',
                      background: 'var(--color-bg-tertiary)',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    Alt + S
                  </kbd>
                </div>
              </div>
              <div className="settings-row">
                <div className="settings-row-content">
                  <div className="settings-row-label">Quick Insert</div>
                  <div className="settings-row-description">
                    Insert most recently used template
                  </div>
                </div>
                <div className="settings-row-action">
                  <kbd
                    style={{
                      padding: '4px 8px',
                      background: 'var(--color-bg-tertiary)',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    Alt + Shift + S
                  </kbd>
                </div>
              </div>
            </div>
            <p
              style={{
                marginTop: 'var(--space-3)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              Keyboard shortcuts can be customized in Chrome&apos;s extension settings at{' '}
              <code style={{ fontFamily: 'var(--font-mono)' }}>chrome://extensions/shortcuts</code>
            </p>
          </div>

          {/* Appearance */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon">
                <Palette size={18} />
              </div>
              <h2 className="settings-section-title">Appearance</h2>
            </div>
            <div className="settings-card">
              <div className="settings-row">
                <div className="settings-row-content">
                  <div className="settings-row-label">Theme</div>
                  <div className="settings-row-description">
                    Choose the color scheme for the extension
                  </div>
                </div>
                <div className="settings-row-action">
                  <select className="input" style={{ width: 140 }}>
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
