import React from 'react';
import { Scissors, Settings, Play } from 'lucide-react';
import { ThemeToggle, type Theme } from '../ThemeToggle';

export type View = 'snippets' | 'try-it-out' | 'settings';

interface TopNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
  templateCount?: number;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export function TopNav({
  currentView,
  onViewChange,
  templateCount,
  theme,
  onThemeChange,
}: TopNavProps): React.ReactElement {
  const navItems: NavItem[] = [
    {
      id: 'snippets',
      label: 'Snippets',
      icon: <Scissors size={16} />,
      badge: templateCount,
    },
    {
      id: 'try-it-out',
      label: 'Try It Out',
      icon: <Play size={16} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={16} />,
    },
  ];

  return (
    <header className="top-nav">
      {/* Logo */}
      <div className="top-nav-logo">
        <span className="top-nav-logo-text">
          <span className="top-nav-logo-slash">/</span>
          <span>SlashSnip</span>
        </span>
      </div>

      {/* Navigation Tabs */}
      <nav className="top-nav-items">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`top-nav-item ${currentView === item.id ? 'top-nav-item-active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="top-nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span
                className={`top-nav-badge ${
                  currentView === item.id ? 'top-nav-badge-active' : 'top-nav-badge-inactive'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Theme Toggle */}
      <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
    </header>
  );
}
