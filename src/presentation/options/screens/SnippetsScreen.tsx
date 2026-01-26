import React, { useState, useCallback } from 'react';
import { Inbox, Plus } from 'lucide-react';
import type { TemplateDTO, CreateTemplateDTO, UpdateTemplateDTO, GroupDTO, CreateGroupDTO, UpdateGroupDTO } from '@application/dto';
import { TemplateTree } from '../components/TemplateTree';
import { TemplateEditor } from '../components/TemplateEditor';
import { GroupDialog } from '../components/GroupDialog';
import { TryItOut } from '../components/TryItOut';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogDescription,
  DialogFooter,
} from '@ui/index';
import { Button } from '@ui/button';

interface SnippetsScreenProps {
  templates: TemplateDTO[];
  groups: GroupDTO[];
  loading: boolean;
  error: string | null;
  onCreateTemplate: (data: CreateTemplateDTO) => Promise<TemplateDTO | null>;
  onUpdateTemplate: (data: UpdateTemplateDTO) => Promise<boolean>;
  onDeleteTemplate: (id: string) => Promise<boolean>;
  onCreateGroup: (data: CreateGroupDTO) => Promise<void>;
  onUpdateGroup: (data: UpdateGroupDTO) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onRefresh: () => void;
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
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onRefresh,
}: SnippetsScreenProps): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [groupDialogState, setGroupDialogState] = useState<{ isOpen: boolean; group: GroupDTO | null }>({
    isOpen: false,
    group: null,
  });

  const selectedTemplate = selectedId ? templates.find((t) => t.id === selectedId) ?? null : null;

  const handleSelectTemplate = (id: string) => {
    setSelectedId(id);
    setIsCreating(false);
  };

  const handleNewTemplate = () => {
    setSelectedId(null);
    setIsCreating(true);
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

  const handleSave = async (data: CreateTemplateDTO | UpdateTemplateDTO) => {
    if ('id' in data) {
      await onUpdateTemplate(data);
    } else {
      const newTemplate = await onCreateTemplate(data);
      if (newTemplate) {
        setSelectedId(newTemplate.id);
        setIsCreating(false);
      }
    }
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

  const handleDuplicate = async (template: TemplateDTO) => {
    let newTrigger = `${template.trigger}-copy`;
    let counter = 1;
    while (templates.some((t) => t.trigger === newTrigger)) {
      counter++;
      newTrigger = `${template.trigger}-copy${counter}`;
    }

    const duplicateData: CreateTemplateDTO = {
      trigger: newTrigger,
      name: `${template.name} (Copy)`,
      content: template.content,
      description: template.description,
      categoryId: template.categoryId,
      tags: [...template.tags],
    };

    const newTemplate = await onCreateTemplate(duplicateData);
    if (newTemplate) {
      setSelectedId(newTemplate.id);
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    if (!selectedId && templates.length > 0) {
      setSelectedId(templates[0].id);
    }
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

  const getDeleteMessage = (): string => {
    if (!deleteTarget) return '';
    if (deleteTarget.type === 'template') {
      const template = deleteTarget.data as TemplateDTO;
      return `Are you sure you want to delete "${template.name}"? This action cannot be undone.`;
    }
    const group = deleteTarget.data as GroupDTO;
    const templateCount = templates.filter((t) => t.categoryId === group.id).length;
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
          onSearchChange={setSearchQuery}
          onSelectTemplate={handleSelectTemplate}
          onNewTemplate={handleNewTemplate}
          onNewGroup={handleNewGroup}
          onEditGroup={handleEditGroup}
          onDeleteGroup={handleDeleteGroup}
          onDeleteTemplate={handleDeleteTemplate}
        />

        {/* Editor panel */}
        <div className="editor-panel">
          {isCreating || selectedTemplate ? (
            <div className="editor-container">
              <TemplateEditor
                template={isCreating ? null : selectedTemplate}
                groups={groups}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={selectedTemplate ? () => handleDeleteTemplate(selectedTemplate) : undefined}
                onDuplicate={selectedTemplate ? () => handleDuplicate(selectedTemplate) : undefined}
                onCreateGroup={handleNewGroup}
              />
            </div>
          ) : (
            <div className="editor-empty">
              <Inbox size={48} className="editor-empty-icon" />
              <h2 className="editor-empty-title">No Snippet Selected</h2>
              <p className="editor-empty-subtitle">
                Select a snippet from the tree or create a new one
              </p>
              <Button onClick={handleNewTemplate}>
                <Plus size={16} />
                New Snippet
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Try It Out panel */}
      <TryItOut templates={templates} />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader onClose={() => setDeleteTarget(null)}>
            <DialogTitle>
              Delete {deleteTarget?.type === 'template' ? 'Snippet' : 'Group'}?
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription>
              {getDeleteMessage()}
            </DialogDescription>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
