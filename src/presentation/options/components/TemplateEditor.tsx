import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check } from 'lucide-react';
import type { TemplateDTO, UpdateTemplateDTO } from '@application/dto';
import { PlaceholderToolbar } from './PlaceholderToolbar';
import { Input } from '@ui/input';
import { Textarea } from '@ui/textarea';

interface TemplateEditorProps {
  template: TemplateDTO;
  onSave: (data: UpdateTemplateDTO) => void;
}

interface FormData {
  trigger: string;
  name: string;
  content: string;
  tags: string;
}

function getInitialFormData(template: TemplateDTO): FormData {
  return {
    trigger: template.trigger,
    name: template.name,
    content: template.content,
    tags: template.tags.join(', '),
  };
}

export function TemplateEditor({
  template,
  onSave,
}: TemplateEditorProps): React.ReactElement {
  const [formData, setFormData] = useState<FormData>(() =>
    getInitialFormData(template)
  );
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const templateIdRef = useRef(template.id);

  // Reset form when template changes
  useEffect(() => {
    // Only reset if we switched to a different template
    if (template.id !== templateIdRef.current) {
      templateIdRef.current = template.id;
      setFormData(getInitialFormData(template));
      setError(null);
      setSaveStatus('idle');
    }
  }, [template]);

  // Auto-save with debounce
  const performSave = useCallback((data: FormData) => {
    const trigger = data.trigger.trim();
    const name = data.name.trim();

    // Validate before saving
    if (!trigger || trigger.length < 2 || trigger.length > 32 || /\s/.test(trigger)) {
      return;
    }
    if (!name || name.length > 100) {
      return;
    }
    if (data.content.length > 10000) {
      return;
    }

    const tags = data.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updates: UpdateTemplateDTO = {
      id: template.id,
      trigger,
      name,
      content: data.content,
      categoryId: template.categoryId,
      tags,
    };

    setSaveStatus('saving');
    onSave(updates);

    // Show "Saved" status briefly
    setTimeout(() => setSaveStatus('saved'), 100);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [template.id, template.categoryId, onSave]);

  const debouncedSave = useCallback((data: FormData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      performSave(data);
    }, 500);
  }, [performSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (field: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newData = { ...formData, [field]: e.target.value };
        setFormData(newData);
        setError(null);
        debouncedSave(newData);
      },
    [formData, debouncedSave]
  );

  const handleInsertPlaceholder = useCallback((placeholder: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = formData.content;

    const newContent = content.slice(0, start) + placeholder + content.slice(end);
    const newData = { ...formData, content: newContent };
    setFormData(newData);
    debouncedSave(newData);

    requestAnimationFrame(() => {
      textarea.focus();
      const newPosition = start + placeholder.length;
      textarea.setSelectionRange(newPosition, newPosition);
    });
  }, [formData, debouncedSave]);

  return (
    <div className="editor-form">
      {/* Header */}
      <div className="editor-header">
        <h2 className="editor-title">Edit Snippet</h2>
        <div className="editor-header-right">
          {saveStatus === 'saved' && (
            <span className="editor-saved">
              <Check size={14} />
              Saved
            </span>
          )}
          {template.usageCount > 0 && (
            <span className="editor-usage">Used {template.usageCount}x</span>
          )}
        </div>
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
      <div className="editor-field editor-field-grow">
        <label htmlFor="content" className="editor-label">Content</label>
        <PlaceholderToolbar onInsert={handleInsertPlaceholder} />
        <Textarea
          id="content"
          ref={contentRef}
          value={formData.content}
          onChange={handleChange('content')}
          placeholder="Hello <input:Name>!&#10;Today is <date>."
          rows={12}
          mono
          className="editor-content-textarea"
        />
      </div>

      {/* Tags */}
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
  );
}
