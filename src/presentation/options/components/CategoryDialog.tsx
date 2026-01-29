import React, { useState, useEffect } from 'react';
import type {
  CategoryDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from '@application/dto';

interface CategoryDialogProps {
  isOpen: boolean;
  category: CategoryDTO | null; // null = create mode
  categories: CategoryDTO[];
  onSave: (data: CreateCategoryDTO | UpdateCategoryDTO) => void;
  onClose: () => void;
}

export function CategoryDialog({
  isOpen,
  category,
  categories,
  onSave,
  onClose,
}: CategoryDialogProps): React.ReactElement | null {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = category !== null;

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name);
        setParentId(category.parentId);
      } else {
        setName('');
        setParentId(undefined);
      }
      setError(null);
    }
  }, [isOpen, category]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Category name is required');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Category name must be 50 characters or less');
      return;
    }

    // Prevent circular reference
    if (isEditMode && category && parentId === category.id) {
      setError('Category cannot be its own parent');
      return;
    }

    if (isEditMode && category) {
      const updates: UpdateCategoryDTO = {
        id: category.id,
        name: trimmedName,
        parentId: parentId === '' ? null : parentId,
      };
      onSave(updates);
    } else {
      const data: CreateCategoryDTO = {
        name: trimmedName,
        parentId: parentId || undefined,
      };
      onSave(data);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Filter out the current category and its descendants for parent selection
  const getAvailableParents = (): CategoryDTO[] => {
    if (!isEditMode || !category) {
      return categories;
    }

    const getDescendantIds = (catId: string): string[] => {
      const children = categories.filter((c) => c.parentId === catId);
      const ids = children.map((c) => c.id);
      for (const child of children) {
        ids.push(...getDescendantIds(child.id));
      }
      return ids;
    };

    const excludeIds = new Set([category.id, ...getDescendantIds(category.id)]);
    return categories.filter((c) => !excludeIds.has(c.id));
  };

  const availableParents = getAvailableParents();

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditMode ? 'Edit Category' : 'New Category'}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="category-name">Name *</label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="category-parent">Parent Category</label>
              <select
                id="category-parent"
                value={parentId ?? ''}
                onChange={(e) => setParentId(e.target.value || undefined)}
              >
                <option value="">None (top level)</option>
                {availableParents.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
