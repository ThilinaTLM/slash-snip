import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trash2, Copy } from 'lucide-react';
import type { TemplateDTO, CreateTemplateDTO, UpdateTemplateDTO, GroupDTO } from '@application/dto';
import { GroupSelector } from './GroupSelector';
import { PlaceholderToolbar } from './PlaceholderToolbar';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Textarea } from '@ui/textarea';

interface TemplateEditorProps {
  template: TemplateDTO | null;
  groups: GroupDTO[];
  onSave: (data: CreateTemplateDTO | UpdateTemplateDTO) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onCreateGroup?: () => void;
}

interface FormData {
  trigger: string;
  name: string;
  content: string;
  description: string;
  groupId: string | undefined;
  tags: string;
}

function getInitialFormData(template: TemplateDTO | null): FormData {
  if (template) {
    return {
      trigger: template.trigger,
      name: template.name,
      content: template.content,
      description: template.description ?? '',
      groupId: template.categoryId,
      tags: template.tags.join(', '),
    };
  }
  return {
    trigger: '',
    name: '',
    content: '',
    description: '',
    groupId: undefined,
    tags: '',
  };
}

export function TemplateEditor({
  template,
  groups,
  onSave,
  onCancel,
  onDelete,
  onDuplicate,
  onCreateGroup,
}: TemplateEditorProps): React.ReactElement {
  const isEditMode = template !== null;
  const [formData, setFormData] = useState<FormData>(() =>
    getInitialFormData(template)
  );
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setFormData(getInitialFormData(template));
    setError(null);
    setHasChanges(false);
  }, [template]);

  const handleChange = useCallback(
    (field: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        setHasChanges(true);
        setError(null);
      },
    []
  );

  const handleGroupChange = useCallback((groupId: string | undefined) => {
    setFormData((prev) => ({ ...prev, groupId }));
    setHasChanges(true);
  }, []);

  const handleInsertPlaceholder = useCallback((placeholder: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = formData.content;

    const newContent = content.slice(0, start) + placeholder + content.slice(end);
    setFormData((prev) => ({ ...prev, content: newContent }));
    setHasChanges(true);

    requestAnimationFrame(() => {
      textarea.focus();
      const newPosition = start + placeholder.length;
      textarea.setSelectionRange(newPosition, newPosition);
    });
  }, [formData.content]);

  const validate = (): boolean => {
    const trigger = formData.trigger.trim();
    const name = formData.name.trim();

    if (!trigger) {
      setError('Trigger is required');
      return false;
    }

    if (trigger.length < 2) {
      setError('Trigger must be at least 2 characters');
      return false;
    }

    if (trigger.length > 32) {
      setError('Trigger must be 32 characters or less');
      return false;
    }

    if (/\s/.test(trigger)) {
      setError('Trigger cannot contain whitespace');
      return false;
    }

    if (!name) {
      setError('Name is required');
      return false;
    }

    if (name.length > 100) {
      setError('Name must be 100 characters or less');
      return false;
    }

    if (formData.content.length > 10000) {
      setError('Content must be 10,000 characters or less');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    const trigger = formData.trigger.trim();
    const name = formData.name.trim();
    const content = formData.content;
    const description = formData.description.trim() || undefined;
    const groupId = formData.groupId;
    const tags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (isEditMode && template) {
      const updates: UpdateTemplateDTO = {
        id: template.id,
        trigger,
        name,
        content,
        description,
        categoryId: groupId,
        tags,
      };
      onSave(updates);
    } else {
      const data: CreateTemplateDTO = {
        trigger,
        name,
        content,
        description,
        categoryId: groupId,
        tags,
      };
      onSave(data);
    }

    setHasChanges(false);
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) {
        return;
      }
    }
    onCancel();
  };

  return (
    <form className="editor-form" onSubmit={handleSubmit}>
      {/* Header */}
      <div className="editor-header">
        <h2 className="editor-title">
          {isEditMode ? 'Edit Snippet' : 'New Snippet'}
        </h2>
        {isEditMode && template && template.usageCount > 0 && (
          <span className="editor-usage">Used {template.usageCount}x</span>
        )}
      </div>

      {error && <div className="editor-error">{error}</div>}

      {/* Trigger & Name row */}
      <div className="editor-row">
        <div className="editor-field">
          <label htmlFor="trigger" className="editor-label">Trigger *</label>
          <Input
            id="trigger"
            type="text"
            value={formData.trigger}
            onChange={handleChange('trigger')}
            placeholder="/hello"
            autoFocus={!isEditMode}
          />
          <span className="editor-hint">Type + space to expand</span>
        </div>

        <div className="editor-field">
          <label htmlFor="name" className="editor-label">Name *</label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="Greeting template"
          />
        </div>
      </div>

      {/* Content */}
      <div className="editor-field">
        <label htmlFor="content" className="editor-label">Content</label>
        <PlaceholderToolbar onInsert={handleInsertPlaceholder} />
        <Textarea
          id="content"
          ref={contentRef}
          value={formData.content}
          onChange={handleChange('content')}
          placeholder="Hello <input:Name>!&#10;Today is <date>."
          rows={6}
          mono
        />
      </div>

      {/* Group & Tags row */}
      <div className="editor-row">
        <div className="editor-field">
          <label htmlFor="group" className="editor-label">Group</label>
          <GroupSelector
            groups={groups}
            value={formData.groupId}
            onChange={handleGroupChange}
            onCreateNew={onCreateGroup}
          />
        </div>

        <div className="editor-field">
          <label htmlFor="tags" className="editor-label">Tags</label>
          <Input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={handleChange('tags')}
            placeholder="greeting, email"
          />
          <span className="editor-hint">Comma-separated</span>
        </div>
      </div>

      {/* Description */}
      <div className="editor-field">
        <label htmlFor="description" className="editor-label">Description</label>
        <Input
          id="description"
          type="text"
          value={formData.description}
          onChange={handleChange('description')}
          placeholder="Optional description"
        />
      </div>

      {/* Actions */}
      <div className="editor-actions">
        <div className="editor-actions-left">
          {isEditMode && onDelete && (
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 size={14} />
              Delete
            </Button>
          )}
          {isEditMode && onDuplicate && (
            <Button type="button" variant="secondary" size="sm" onClick={onDuplicate}>
              <Copy size={14} />
              Duplicate
            </Button>
          )}
        </div>
        <div className="editor-actions-right">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!hasChanges && isEditMode}>
            {isEditMode ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </form>
  );
}
