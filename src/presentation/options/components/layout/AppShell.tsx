import React from 'react';
import { TopNav, type View } from './TopNav';
import type { Theme } from '../ThemeToggle';

interface AppShellProps {
  currentView: View;
  onViewChange: (view: View) => void;
  templateCount?: number;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  children: React.ReactNode;
}

export function AppShell({
  currentView,
  onViewChange,
  templateCount,
  theme,
  onThemeChange,
  children,
}: AppShellProps): React.ReactElement {
  return (
    <div className="app-shell">
      <TopNav
        currentView={currentView}
        onViewChange={onViewChange}
        templateCount={templateCount}
        theme={theme}
        onThemeChange={onThemeChange}
      />
      <main className="app-main">{children}</main>
    </div>
  );
}
