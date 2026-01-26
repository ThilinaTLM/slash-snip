import React from 'react';
import type { TemplateDTO } from '@application/dto';

interface TemplateListProps {
  templates: TemplateDTO[];
  onDelete: (id: string) => void;
}

export function TemplateList({ templates, onDelete }: TemplateListProps): React.ReactElement {
  if (templates.length === 0) {
    return (
      <div className="empty-state">
        <p>No templates yet.</p>
        <p className="hint">Create one to get started!</p>
      </div>
    );
  }

  return (
    <ul className="template-list">
      {templates.map((template) => (
        <li key={template.id} className="template-item">
          <div className="template-info">
            <span className="template-trigger">{template.trigger}</span>
            <span className="template-name">{template.name}</span>
          </div>
          <div className="template-actions">
            <button
              className="btn btn-danger btn-small"
              onClick={() => onDelete(template.id)}
              title="Delete template"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
