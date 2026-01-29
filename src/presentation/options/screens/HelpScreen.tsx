import React from 'react';
import { BookOpen } from 'lucide-react';
import {
  GettingStartedSection,
  TriggersSection,
  PlaceholdersSection,
  ExamplesSection,
  TipsSection,
} from './help';

export function HelpScreen(): React.ReactElement {
  return (
    <div className="settings-screen">
      <div className="settings-container help-container">
        <div className="settings-header">
          <div className="settings-icon-wrapper">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="settings-title">Help</h1>
            <p className="settings-subtitle">
              Learn how to use SlashSnip effectively
            </p>
          </div>
        </div>

        <div className="settings-sections">
          <GettingStartedSection />
          <TriggersSection />
          <PlaceholdersSection />
          <ExamplesSection />
          <TipsSection />
        </div>
      </div>
    </div>
  );
}
