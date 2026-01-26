import React, { useState } from 'react';

interface TemplateFormProps {
  onSubmit: (data: { trigger: string; name: string; content: string }) => void;
  onCancel: () => void;
}

export function TemplateForm({ onSubmit, onCancel }: TemplateFormProps): React.ReactElement {
  const [trigger, setTrigger] = useState('');
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!trigger.trim()) {
      setError('Trigger is required');
      return;
    }
    if (trigger.trim().length < 2) {
      setError('Trigger must be at least 2 characters');
      return;
    }
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!content) {
      setError('Content is required');
      return;
    }

    onSubmit({
      trigger: trigger.trim(),
      name: name.trim(),
      content,
    });
  };

  return (
    <form className="template-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="trigger">Trigger</label>
        <input
          id="trigger"
          type="text"
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          placeholder="/hello"
          autoFocus
        />
        <span className="hint">Type this + space to expand</span>
      </div>

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Greeting"
        />
      </div>

      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Hello, World!"
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Create
        </button>
      </div>
    </form>
  );
}
