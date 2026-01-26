import React from 'react';
import { Sidebar, type View } from './Sidebar';

interface AppShellProps {
  currentView: View;
  onViewChange: (view: View) => void;
  templateCount?: number;
  groupCount?: number;
  children: React.ReactNode;
}

export function AppShell({
  currentView,
  onViewChange,
  templateCount,
  groupCount,
  children,
}: AppShellProps): React.ReactElement {
  return (
    <div className="app-shell">
      <Sidebar
        currentView={currentView}
        onViewChange={onViewChange}
        templateCount={templateCount}
        groupCount={groupCount}
      />
      <main className="main-content">{children}</main>
    </div>
  );
}
