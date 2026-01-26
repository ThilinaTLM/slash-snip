import React, { useState } from 'react';
import type { TemplateDTO, CategoryDTO } from '@application/dto';

interface TemplateListProps {
  templates: TemplateDTO[];
  categories: CategoryDTO[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
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
      <div
        className="modal-dialog modal-dialog-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Delete Template?</h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          <p>
            Are you sure you want to delete &ldquo;{templateName}&rdquo;? This action cannot
            be undone.
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

export function TemplateList({
  templates,
  categories,
  selectedId,
  onSelect,
  onDelete,
}: TemplateListProps): React.ReactElement {
  const [deleteTarget, setDeleteTarget] = useState<TemplateDTO | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, template: TemplateDTO) => {
    e.stopPropagation();
    setDeleteTarget(template);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const getContentPreview = (content: string): string => {
    const clean = content
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return clean.length > 50 ? clean.slice(0, 50) + '...' : clean;
  };

  const getCategoryName = (categoryId?: string): string | undefined => {
    if (!categoryId) return undefined;
    const category = categories.find((c) => c.id === categoryId);
    return category?.name;
  };

  if (templates.length === 0) {
    return (
      <div className="template-list-container">
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <p>No templates found</p>
          <p className="hint">Create one to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="template-list-container">
        <ul className="template-list">
          {templates.map((template) => {
            const categoryName = getCategoryName(template.categoryId);
            return (
              <li
                key={template.id}
                className={`template-card ${
                  selectedId === template.id ? 'selected' : ''
                }`}
                onClick={() => onSelect(template.id)}
              >
                <div className="template-card-content">
                  <div className="template-card-header">
                    <span className="template-trigger">{template.trigger}</span>
                    {template.isFavorite && (
                      <span className="template-favorite" title="Favorite">★</span>
                    )}
                  </div>
                  <div className="template-name">{template.name}</div>
                  <div className="template-preview">
                    {getContentPreview(template.content)}
                  </div>
                  {categoryName && (
                    <div className="template-category-badge">
                      <span className="badge badge-category">{categoryName}</span>
                    </div>
                  )}
                </div>
                <div className="template-card-actions">
                  <button
                    className="btn btn-icon btn-ghost btn-danger-hover"
                    onClick={(e) => handleDeleteClick(e, template)}
                    title="Delete template"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" />
                    </svg>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {deleteTarget && (
        <DeleteConfirmDialog
          templateName={deleteTarget.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
