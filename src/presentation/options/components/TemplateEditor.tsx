import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { TemplateDTO, CreateTemplateDTO, UpdateTemplateDTO, CategoryDTO } from '@application/dto';
import { CategorySelector } from './CategorySelector';
import { PlaceholderToolbar } from './PlaceholderToolbar';

interface TemplateEditorProps {
  template: TemplateDTO | null;
  categories: CategoryDTO[];
  onSave: (data: CreateTemplateDTO | UpdateTemplateDTO) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onCreateCategory?: () => void;
}

interface FormData {
  trigger: string;
  name: string;
  content: string;
  description: string;
  categoryId: string | undefined;
  tags: string;
}

function getInitialFormData(template: TemplateDTO | null): FormData {
  if (template) {
    return {
      trigger: template.trigger,
      name: template.name,
      content: template.content,
      description: template.description ?? '',
      categoryId: template.categoryId,
      tags: template.tags.join(', '),
    };
  }
  return {
    trigger: '',
    name: '',
    content: '',
    description: '',
    categoryId: undefined,
    tags: '',
  };
}

export function TemplateEditor({
  template,
  categories,
  onSave,
  onCancel,
  onDelete,
  onDuplicate,
  onCreateCategory,
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

  const handleCategoryChange = useCallback((categoryId: string | undefined) => {
    setFormData((prev) => ({ ...prev, categoryId }));
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

    // Restore focus and cursor position after React re-renders
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
    const categoryId = formData.categoryId;
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
        categoryId,
        tags,
      };
      onSave(updates);
    } else {
      const data: CreateTemplateDTO = {
        trigger,
        name,
        content,
        description,
        categoryId,
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
    <form className="template-editor" onSubmit={handleSubmit}>
      <div className="editor-header">
        <h2>{isEditMode ? 'Edit Template' : 'New Template'}</h2>
        {isEditMode && template && (
          <span className="editor-meta">
            Last updated: {new Date(template.updatedAt).toLocaleString()}
            {template.usageCount > 0 && (
              <> · Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}</>
            )}
          </span>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="trigger">Trigger *</label>
          <input
            id="trigger"
            type="text"
            value={formData.trigger}
            onChange={handleChange('trigger')}
            placeholder="/hello"
            autoFocus={!isEditMode}
          />
          <span className="hint">Type this + space to expand</span>
        </div>

        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="Greeting template"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="content">Content</label>
        <PlaceholderToolbar onInsert={handleInsertPlaceholder} />
        <textarea
          id="content"
          ref={contentRef}
          value={formData.content}
          onChange={handleChange('content')}
          placeholder="Hello <input:Name>!&#10;Today is <date>."
          rows={10}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <CategorySelector
            categories={categories}
            value={formData.categoryId}
            onChange={handleCategoryChange}
            onCreateNew={onCreateCategory}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={handleChange('tags')}
            placeholder="greeting, email, work"
          />
          <span className="hint">Comma-separated</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          value={formData.description}
          onChange={handleChange('description')}
          placeholder="Optional description for this template"
        />
      </div>

      <div className="form-actions">
        <div className="form-actions-left">
          {isEditMode && onDelete && (
            <button
              type="button"
              className="btn btn-danger-outline"
              onClick={onDelete}
            >
              Delete
            </button>
          )}
          {isEditMode && onDuplicate && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onDuplicate}
            >
              Duplicate
            </button>
          )}
        </div>
        <div className="form-actions-right">
          <button type="button" className="btn" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!hasChanges && isEditMode}
          >
            {isEditMode ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </form>
  );
}
