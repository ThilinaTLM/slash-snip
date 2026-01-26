import React, { useState, useEffect, useCallback } from 'react';
import { AppShell, type View } from './components/layout';
import { SnippetsScreen } from './screens/SnippetsScreen';
import { TryItOutScreen } from './screens/TryItOutScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ImportExportScreen } from './screens/ImportExportScreen';
import { useTemplates } from './hooks/useTemplates';
import { useGroups } from './hooks/useGroups';
import { getInitialTheme, type Theme } from './components/ThemeToggle';
import type { CreateGroupDTO, UpdateGroupDTO } from '@application/dto';

export function App(): React.ReactElement {
  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refresh: refreshTemplates,
  } = useTemplates();

  const {
    groups,
    loading: groupsLoading,
    error: groupsError,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useGroups();

  const [currentView, setCurrentView] = useState<View>('snippets');
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Enable theme transitions after initial render (theme is applied by ThemeToggle)
  useEffect(() => {
    // Remove no-transitions class after a short delay to enable smooth transitions
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('no-transitions');
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N: New template (only on snippets screen)
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && currentView === 'snippets') {
        e.preventDefault();
        // Will be handled by SnippetsScreen
      }

      // Cmd/Ctrl + F: Focus search (only on snippets screen)
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && currentView === 'snippets') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  const loading = templatesLoading || groupsLoading;
  const error = templatesError || groupsError;

  const handleCreateGroup = useCallback(
    async (data: CreateGroupDTO) => {
      await createGroup(data);
    },
    [createGroup]
  );

  const handleUpdateGroup = useCallback(
    async (data: UpdateGroupDTO) => {
      await updateGroup(data);
    },
    [updateGroup]
  );

  const handleDeleteGroup = useCallback(
    async (id: string) => {
      await deleteGroup(id);
    },
    [deleteGroup]
  );

  const renderScreen = () => {
    switch (currentView) {
      case 'snippets':
        return (
          <SnippetsScreen
            templates={templates}
            groups={groups}
            loading={loading}
            error={error}
            onCreateTemplate={createTemplate}
            onUpdateTemplate={updateTemplate}
            onDeleteTemplate={deleteTemplate}
            onCreateGroup={handleCreateGroup}
            onUpdateGroup={handleUpdateGroup}
            onDeleteGroup={handleDeleteGroup}
            onRefresh={refreshTemplates}
          />
        );
      case 'try-it-out':
        return <TryItOutScreen templates={templates} />;
      case 'settings':
        return <SettingsScreen />;
      case 'import-export':
        return <ImportExportScreen templates={templates} groups={groups} />;
      default:
        return null;
    }
  };

  return (
    <AppShell
      currentView={currentView}
      onViewChange={setCurrentView}
      templateCount={templates.length}
      theme={theme}
      onThemeChange={setTheme}
    >
      {renderScreen()}
    </AppShell>
  );
}
