import React, { useState, useCallback } from 'react';
import { Inbox, Plus } from 'lucide-react';
import type { TemplateDTO, CreateTemplateDTO, UpdateTemplateDTO, GroupDTO, CreateGroupDTO, UpdateGroupDTO } from '@application/dto';
import { TemplateTree } from '../components/TemplateTree';
import { TemplateEditor } from '../components/TemplateEditor';
import { GroupDialog } from '../components/GroupDialog';
import { ConfirmDialog } from '@ui/index';
import { Button } from '@ui/button';
import type { AppSettings } from '@shared/types/settings';

let newTemplateCounter = 1;

interface SnippetsScreenProps {
  templates: TemplateDTO[];
  groups: GroupDTO[];
  loading: boolean;
  error: string | null;
  settings: AppSettings;
  onCreateTemplate: (data: CreateTemplateDTO) => Promise<TemplateDTO | null>;
  onUpdateTemplate: (data: UpdateTemplateDTO) => Promise<boolean>;
  onDeleteTemplate: (id: string) => Promise<boolean>;
  onCreateGroup: (data: CreateGroupDTO) => Promise<void>;
  onUpdateGroup: (data: UpdateGroupDTO) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onRefresh: () => void;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

interface DeleteTarget {
  type: 'template' | 'group';
  data: TemplateDTO | GroupDTO;
}

export function SnippetsScreen({
  templates,
  groups,
  loading,
  error,
  settings,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onRefresh,
  onUpdateSettings,
}: SnippetsScreenProps): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [groupDialogState, setGroupDialogState] = useState<{ isOpen: boolean; group: GroupDTO | null }>({
    isOpen: false,
    group: null,
  });

  const selectedTemplate = selectedId ? templates.find((t) => t.id === selectedId) ?? null : null;

  const handleSelectTemplate = (id: string) => {
    setSelectedId(id);
  };

  const handleNewTemplate = async (groupId?: string) => {
    // Generate a unique trigger
    let trigger = `/new${newTemplateCounter}`;
    while (templates.some((t) => t.trigger === trigger)) {
      newTemplateCounter++;
      trigger = `/new${newTemplateCounter}`;
    }
    newTemplateCounter++;

    const newTemplateData: CreateTemplateDTO = {
      trigger,
      name: 'New Snippet',
      content: '',
      groupId: groupId,
      tags: [],
    };

    const newTemplate = await onCreateTemplate(newTemplateData);
    if (newTemplate) {
      setSelectedId(newTemplate.id);
    }
  };

  const handleNewGroup = () => {
    setGroupDialogState({ isOpen: true, group: null });
  };

  const handleEditGroup = (group: GroupDTO) => {
    setGroupDialogState({ isOpen: true, group });
  };

  const handleDeleteGroup = (group: GroupDTO) => {
    setDeleteTarget({ type: 'group', data: group });
  };

  const handleDeleteTemplate = (template: TemplateDTO) => {
    setDeleteTarget({ type: 'template', data: template });
  };

  const handleDuplicateTemplate = async (template: TemplateDTO) => {
    // Find a unique trigger for the duplicate
    const baseTrigger = template.trigger;
    let suffix = 1;
    let newTrigger = `${baseTrigger}-copy`;
    while (templates.some((t) => t.trigger === newTrigger)) {
      suffix++;
      newTrigger = `${baseTrigger}-copy${suffix}`;
    }

    const duplicateData: CreateTemplateDTO = {
      trigger: newTrigger,
      name: `${template.name} (copy)`,
      content: template.content,
      groupId: template.groupId,
      tags: [...template.tags],
    };

    const newTemplate = await onCreateTemplate(duplicateData);
    if (newTemplate) {
      setSelectedId(newTemplate.id);
    }
  };

  const handleMoveTemplate = useCallback(
    async (templateId: string, targetGroupId: string | null) => {
      const template = templates.find((t) => t.id === templateId);
      if (!template) return;

      // Don't update if already in the target group
      if (template.groupId === targetGroupId) return;
      if (!template.groupId && targetGroupId === null) return;

      await onUpdateTemplate({
        id: templateId,
        groupId: targetGroupId ?? undefined,
      });
    },
    [templates, onUpdateTemplate]
  );

  const handleTreeWidthChange = useCallback(
    (width: number) => {
      onUpdateSettings({ treePanelWidth: width });
    },
    [onUpdateSettings]
  );

  const handleSave = async (data: UpdateTemplateDTO) => {
    await onUpdateTemplate(data);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'template') {
      const success = await onDeleteTemplate(deleteTarget.data.id);
      if (success && selectedId === deleteTarget.data.id) {
        setSelectedId(null);
      }
    } else {
      await onDeleteGroup(deleteTarget.data.id);
    }
    setDeleteTarget(null);
  };


  const handleSaveGroup = useCallback(
    async (data: CreateGroupDTO | UpdateGroupDTO) => {
      if ('id' in data) {
        await onUpdateGroup(data);
      } else {
        await onCreateGroup(data);
      }
      setGroupDialogState({ isOpen: false, group: null });
    },
    [onCreateGroup, onUpdateGroup]
  );

  const getDeleteTitle = (): string => {
    if (!deleteTarget) return '';
    return `Delete ${deleteTarget.type === 'template' ? 'Snippet' : 'Group'}?`;
  };

  const getDeleteMessage = (): string => {
    if (!deleteTarget) return '';
    if (deleteTarget.type === 'template') {
      const template = deleteTarget.data as TemplateDTO;
      return `Are you sure you want to delete "${template.name}"? This action cannot be undone.`;
    }
    const group = deleteTarget.data as GroupDTO;
    const templateCount = templates.filter((t) => t.groupId === group.id).length;
    if (templateCount > 0) {
      return `Are you sure you want to delete "${group.name}"? The ${templateCount} template${templateCount !== 1 ? 's' : ''} in this group will become ungrouped.`;
    }
    return `Are you sure you want to delete "${group.name}"?`;
  };

  if (loading) {
    return (
      <div className="snippets-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="snippets-screen">
      {error && (
        <div className="snippets-error">
          {error}
          <Button variant="secondary" size="sm" onClick={onRefresh}>
            Retry
          </Button>
        </div>
      )}

      <div className="snippets-layout">
        {/* Tree panel */}
        <TemplateTree
          templates={templates}
          groups={groups}
          selectedId={selectedId}
          searchQuery={searchQuery}
          width={settings.treePanelWidth}
          onSearchChange={setSearchQuery}
          onSelectTemplate={handleSelectTemplate}
          onNewTemplate={handleNewTemplate}
          onNewGroup={handleNewGroup}
          onEditGroup={handleEditGroup}
          onDeleteGroup={handleDeleteGroup}
          onDeleteTemplate={handleDeleteTemplate}
          onDuplicateTemplate={handleDuplicateTemplate}
          onMoveTemplate={handleMoveTemplate}
          onWidthChange={handleTreeWidthChange}
        />

        {/* Editor panel */}
        <div className="editor-panel">
          {selectedTemplate ? (
            <div className="editor-container">
              <TemplateEditor
                key={selectedTemplate.id}
                template={selectedTemplate}
                onSave={handleSave}
              />
            </div>
          ) : (
            <div className="editor-empty">
              <Inbox size={48} className="editor-empty-icon" />
              <h2 className="editor-empty-title">No Snippet Selected</h2>
              <p className="editor-empty-subtitle">
                Select a snippet from the tree or create a new one
              </p>
              <Button onClick={() => handleNewTemplate()}>
                <Plus size={16} />
                New Snippet
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={getDeleteTitle()}
        description={getDeleteMessage()}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      {/* Group dialog */}
      <GroupDialog
        isOpen={groupDialogState.isOpen}
        group={groupDialogState.group}
        onSave={handleSaveGroup}
        onClose={() => setGroupDialogState({ isOpen: false, group: null })}
      />
    </div>
  );
}
