import React from 'react';
import { FileText, FolderOpen, Settings, ArrowLeftRight } from 'lucide-react';

export type View = 'templates' | 'groups' | 'settings' | 'import-export';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  templateCount?: number;
  groupCount?: number;
}

interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export function Sidebar({
  currentView,
  onViewChange,
  templateCount,
  groupCount,
}: SidebarProps): React.ReactElement {
  const navItems: NavItem[] = [
    {
      id: 'templates',
      label: 'Templates',
      icon: <FileText />,
      badge: templateCount,
    },
    {
      id: 'groups',
      label: 'Groups',
      icon: <FolderOpen />,
      badge: groupCount,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings />,
    },
    {
      id: 'import-export',
      label: 'Import/Export',
      icon: <ArrowLeftRight />,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">
          <span className="sidebar-logo-slash">/</span>SlashSnip
        </span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="nav-item-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}
