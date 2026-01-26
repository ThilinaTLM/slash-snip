import React, { useState } from 'react';
import { Keyboard, Palette, Zap } from 'lucide-react';
import {
  Card,
  CardContent,
  CardRow,
  CardRowLabel,
  CardRowTitle,
  CardRowDescription,
  CardIcon,
} from '@ui/index';
import { Switch } from '@ui/switch';
import { Select, SelectItem } from '@ui/select';

export function SettingsScreen(): React.ReactElement {
  const [triggerKey, setTriggerKey] = useState('space');
  const [caseSensitive, setCaseSensitive] = useState(false);

  return (
    <div className="settings-screen">
      <div className="settings-container">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">
            Configure how SlashSnip works for you
          </p>
        </div>

        <div className="settings-sections">
          {/* Trigger Settings */}
          <section className="settings-section">
            <div className="settings-section-header">
              <CardIcon>
                <Zap size={16} />
              </CardIcon>
              <h2 className="settings-section-title">Trigger Behavior</h2>
            </div>
            <Card>
              <CardContent>
                <CardRow>
                  <CardRowLabel>
                    <CardRowTitle>Expansion Trigger</CardRowTitle>
                    <CardRowDescription>
                      How to trigger template expansion after typing a shortcut
                    </CardRowDescription>
                  </CardRowLabel>
                  <Select value={triggerKey} onValueChange={setTriggerKey} className="settings-select">
                    <SelectItem value="space">Space</SelectItem>
                    <SelectItem value="tab">Tab</SelectItem>
                    <SelectItem value="enter">Enter</SelectItem>
                  </Select>
                </CardRow>
                <CardRow>
                  <CardRowLabel>
                    <CardRowTitle>Case Sensitivity</CardRowTitle>
                    <CardRowDescription>
                      Whether trigger shortcuts are case-sensitive
                    </CardRowDescription>
                  </CardRowLabel>
                  <Switch
                    checked={caseSensitive}
                    onCheckedChange={setCaseSensitive}
                    aria-label="Case sensitivity"
                  />
                </CardRow>
              </CardContent>
            </Card>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="settings-section">
            <div className="settings-section-header">
              <CardIcon>
                <Keyboard size={16} />
              </CardIcon>
              <h2 className="settings-section-title">Keyboard Shortcuts</h2>
            </div>
            <Card>
              <CardContent>
                <CardRow>
                  <CardRowLabel>
                    <CardRowTitle>Open Command Palette</CardRowTitle>
                    <CardRowDescription>
                      Quick access to search and insert templates
                    </CardRowDescription>
                  </CardRowLabel>
                  <kbd className="settings-kbd">Alt + S</kbd>
                </CardRow>
                <CardRow>
                  <CardRowLabel>
                    <CardRowTitle>Quick Insert</CardRowTitle>
                    <CardRowDescription>
                      Insert most recently used template
                    </CardRowDescription>
                  </CardRowLabel>
                  <kbd className="settings-kbd">Alt + Shift + S</kbd>
                </CardRow>
              </CardContent>
            </Card>
            <p className="settings-section-note">
              Keyboard shortcuts can be customized in Chrome&apos;s extension settings at{' '}
              <code>chrome://extensions/shortcuts</code>
            </p>
          </section>

          {/* Appearance */}
          <section className="settings-section">
            <div className="settings-section-header">
              <CardIcon>
                <Palette size={16} />
              </CardIcon>
              <h2 className="settings-section-title">Appearance</h2>
            </div>
            <Card>
              <CardContent>
                <CardRow>
                  <CardRowLabel>
                    <CardRowTitle>Theme</CardRowTitle>
                    <CardRowDescription>
                      Use the toggle in the navigation bar to switch themes
                    </CardRowDescription>
                  </CardRowLabel>
                </CardRow>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
