import React, { useState, useRef, useCallback } from 'react';
import { Plus, Search, FolderOpen, ChevronDown, Inbox, Trash2, X } from 'lucide-react';
import type { TemplateDTO, CreateTemplateDTO, UpdateTemplateDTO, GroupDTO } from '@application/dto';
import { TemplateEditor } from '../components/TemplateEditor';
import { PreviewPane } from '../components/PreviewPane';
import { GroupDialog } from '../components/GroupDialog';
import type { CreateGroupDTO, UpdateGroupDTO } from '@application/dto';

interface TemplatesScreenProps {
  templates: TemplateDTO[];
  groups: GroupDTO[];
  loading: boolean;
  error: string | null;
  onCreateTemplate: (data: CreateTemplateDTO) => Promise<TemplateDTO | null>;
  onUpdateTemplate: (data: UpdateTemplateDTO) => Promise<boolean>;
  onDeleteTemplate: (id: string) => Promise<boolean>;
  onCreateGroup: (data: CreateGroupDTO) => Promise<void>;
  onRefresh: () => void;
}

interface DeleteConfirmProps {
  templateName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({
  templateName,
  onConfirm,
  onCancel,
}: DeleteConfirmProps): React.ReactElement {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-dialog modal-dialog-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Template?</h3>
          <button className="modal-close" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p>
            Are you sure you want to delete &ldquo;{templateName}&rdquo;? This action cannot be
            undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function TemplatesScreen({
  templates,
  groups,
  loading,
  error,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onCreateGroup,
  onRefresh,
}: TemplatesScreenProps): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isGroupFilterOpen, setIsGroupFilterOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TemplateDTO | null>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

  const groupFilterRef = useRef<HTMLDivElement>(null);

  // Filter templates by group and search
  const filteredTemplates = templates
    .filter((t) => (selectedGroupId ? t.categoryId === selectedGroupId : true))
    .filter((t) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(query) ||
        t.trigger.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });

  const selectedTemplate = selectedId ? templates.find((t) => t.id === selectedId) ?? null : null;

  const selectedGroupName =
    selectedGroupId ? groups.find((g) => g.id === selectedGroupId)?.name : null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsCreating(false);
  };

  const handleNewTemplate = () => {
    setSelectedId(null);
    setIsCreating(true);
  };

  const handleSave = async (data: CreateTemplateDTO | UpdateTemplateDTO) => {
    if ('id' in data) {
      await onUpdateTemplate(data);
    } else {
      if (selectedGroupId && !data.categoryId) {
        data = { ...data, categoryId: selectedGroupId };
      }
      const newTemplate = await onCreateTemplate(data);
      if (newTemplate) {
        setSelectedId(newTemplate.id);
        setIsCreating(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const success = await onDeleteTemplate(id);
    if (success && selectedId === id) {
      setSelectedId(null);
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

  const handleGroupFilterSelect = (groupId: string | null) => {
    setSelectedGroupId(groupId);
    setIsGroupFilterOpen(false);
  };

  const handleCreateGroup = useCallback(async (data: CreateGroupDTO | UpdateGroupDTO) => {
    if (!('id' in data)) {
      await onCreateGroup(data);
    }
    setIsGroupDialogOpen(false);
  }, [onCreateGroup]);

  const getContentPreview = (content: string): string => {
    const clean = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    return clean.length > 50 ? clean.slice(0, 50) + '...' : clean;
  };

  const getGroupName = (categoryId?: string): string | undefined => {
    if (!categoryId) return undefined;
    return groups.find((g) => g.id === categoryId)?.name;
  };

  // Close group filter on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (groupFilterRef.current && !groupFilterRef.current.contains(event.target as Node)) {
        setIsGroupFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="content-header">
        <div className="content-header-left">
          <h1 className="content-header-title">Templates</h1>
        </div>
        <div className="content-header-right">
          <button className="btn btn-primary" onClick={handleNewTemplate}>
            <Plus size={16} />
            New Template
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={onRefresh} className="btn btn-sm">
            Retry
          </button>
        </div>
      )}

      <div className="content-body">
        <div className="master-detail">
          <div className="master-panel">
            <div className="master-panel-header">
              <div className="master-panel-toolbar">
                <div className="search-input">
                  <span className="search-input-icon">
                    <Search size={16} />
                  </span>
                  <input
                    type="search"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="group-filter" ref={groupFilterRef}>
                  <button
                    className={`group-filter-btn ${selectedGroupId ? 'active' : ''}`}
                    onClick={() => setIsGroupFilterOpen(!isGroupFilterOpen)}
                  >
                    <FolderOpen size={16} />
                    <span>{selectedGroupName ?? 'All'}</span>
                    <ChevronDown size={14} />
                  </button>
                  {isGroupFilterOpen && (
                    <div className="group-filter-menu">
                      <button
                        className={`group-filter-item ${!selectedGroupId ? 'selected' : ''}`}
                        onClick={() => handleGroupFilterSelect(null)}
                      >
                        All Templates
                      </button>
                      {groups.map((group) => (
                        <button
                          key={group.id}
                          className={`group-filter-item ${selectedGroupId === group.id ? 'selected' : ''}`}
                          onClick={() => handleGroupFilterSelect(group.id)}
                        >
                          {group.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="master-panel-list">
              {loading ? (
                <div className="loading">Loading...</div>
              ) : filteredTemplates.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Inbox />
                  </div>
                  <p className="empty-state-title">No templates found</p>
                  <p className="empty-state-text">
                    {searchQuery ? 'Try a different search' : 'Create one to get started!'}
                  </p>
                </div>
              ) : (
                <ul className="template-list">
                  {filteredTemplates.map((template) => {
                    const groupName = getGroupName(template.categoryId);
                    return (
                      <li
                        key={template.id}
                        className={`template-card ${selectedId === template.id ? 'selected' : ''}`}
                        onClick={() => handleSelect(template.id)}
                      >
                        <div className="template-card-content">
                          <div className="template-card-header">
                            <span className="template-trigger">{template.trigger}</span>
                          </div>
                          <div className="template-name">{template.name}</div>
                          <div className="template-preview">
                            {getContentPreview(template.content)}
                          </div>
                          {groupName && (
                            <div className="template-group-badge">
                              <span className="badge">{groupName}</span>
                            </div>
                          )}
                        </div>
                        <div className="template-card-actions">
                          <button
                            className="btn btn-icon btn-ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(template);
                            }}
                            title="Delete template"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="detail-panel">
            {isCreating || selectedTemplate ? (
              <div className="detail-panel-content">
                <div className="editor-panel">
                  <TemplateEditor
                    template={isCreating ? null : selectedTemplate}
                    groups={groups}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onDelete={selectedTemplate ? () => setDeleteTarget(selectedTemplate) : undefined}
                    onDuplicate={selectedTemplate ? () => handleDuplicate(selectedTemplate) : undefined}
                    onCreateGroup={() => setIsGroupDialogOpen(true)}
                  />
                </div>
                <div className="preview-panel">
                  <PreviewPane
                    content={isCreating ? '' : (selectedTemplate?.content ?? '')}
                  />
                </div>
              </div>
            ) : (
              <div className="detail-panel-empty">
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Inbox />
                  </div>
                  <h2 className="empty-state-title">No Template Selected</h2>
                  <p className="empty-state-text">Select a template to edit or create a new one</p>
                  <button className="btn btn-primary" onClick={handleNewTemplate}>
                    <Plus size={16} />
                    New Template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <DeleteConfirmDialog
          templateName={deleteTarget.name}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <GroupDialog
        isOpen={isGroupDialogOpen}
        group={null}
        onSave={handleCreateGroup}
        onClose={() => setIsGroupDialogOpen(false)}
      />
    </>
  );
}
