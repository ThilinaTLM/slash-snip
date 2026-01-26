import React, { useState, useEffect, useCallback } from 'react';
import { AppShell, type View } from './components/layout';
import { TemplatesScreen } from './screens/TemplatesScreen';
import { GroupsScreen } from './screens/GroupsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ImportExportScreen } from './screens/ImportExportScreen';
import { useTemplates } from './hooks/useTemplates';
import { useGroups } from './hooks/useGroups';
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

  const [currentView, setCurrentView] = useState<View>('templates');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N: New template (only on templates screen)
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && currentView === 'templates') {
        e.preventDefault();
        // Will be handled by TemplatesScreen
      }

      // Cmd/Ctrl + F: Focus search (only on templates screen)
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && currentView === 'templates') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input input') as HTMLInputElement;
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
      case 'templates':
        return (
          <TemplatesScreen
            templates={templates}
            groups={groups}
            loading={loading}
            error={error}
            onCreateTemplate={createTemplate}
            onUpdateTemplate={updateTemplate}
            onDeleteTemplate={deleteTemplate}
            onCreateGroup={handleCreateGroup}
            onRefresh={refreshTemplates}
          />
        );
      case 'groups':
        return (
          <GroupsScreen
            groups={groups}
            templates={templates}
            loading={groupsLoading}
            onCreateGroup={handleCreateGroup}
            onUpdateGroup={handleUpdateGroup}
            onDeleteGroup={handleDeleteGroup}
          />
        );
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
      groupCount={groups.length}
    >
      {renderScreen()}
    </AppShell>
  );
}
