import React, { useState } from 'react';
import type { CategoryDTO } from '@application/dto';

interface CategoryTreeProps {
  categories: CategoryDTO[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onEditCategory: (category: CategoryDTO) => void;
  onDeleteCategory: (id: string) => void;
  onCreateCategory: () => void;
}

interface CategoryNodeProps {
  category: CategoryDTO;
  categories: CategoryDTO[];
  selectedId: string | null;
  level: number;
  onSelect: (id: string | null) => void;
  onEdit: (category: CategoryDTO) => void;
  onDelete: (id: string) => void;
}

function CategoryNode({
  category,
  categories,
  selectedId,
  level,
  onSelect,
  onEdit,
  onDelete,
}: CategoryNodeProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(true);
  const children = categories.filter((c) => c.parentId === category.id);
  const hasChildren = children.length > 0;
  const isSelected = selectedId === category.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(category.id);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(category);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(category.id);
  };

  return (
    <div className="category-node">
      <div
        className={`category-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <button
            className="category-toggle"
            onClick={handleToggle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="category-toggle-placeholder" />
        )}
        <span className="category-icon">📁</span>
        <span className="category-name">{category.name}</span>
        <div className="category-actions">
          <button
            className="category-action-btn"
            onClick={handleEdit}
            title="Edit category"
          >
            ✎
          </button>
          <button
            className="category-action-btn category-action-delete"
            onClick={handleDelete}
            title="Delete category"
          >
            ×
          </button>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="category-children">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              categories={categories}
              selectedId={selectedId}
              level={level + 1}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onEditCategory,
  onDeleteCategory,
  onCreateCategory,
}: CategoryTreeProps): React.ReactElement {
  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="category-tree">
      <div className="category-tree-header">
        <span className="category-tree-title">Categories</span>
        <button
          className="category-add-btn"
          onClick={onCreateCategory}
          title="Add category"
        >
          +
        </button>
      </div>
      <div className="category-tree-content">
        <div
          className={`category-item category-all ${selectedCategoryId === null ? 'selected' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          <span className="category-toggle-placeholder" />
          <span className="category-icon">📋</span>
          <span className="category-name">All Templates</span>
        </div>
        {rootCategories.map((category) => (
          <CategoryNode
            key={category.id}
            category={category}
            categories={categories}
            selectedId={selectedCategoryId}
            level={0}
            onSelect={onSelectCategory}
            onEdit={onEditCategory}
            onDelete={onDeleteCategory}
          />
        ))}
        {rootCategories.length === 0 && (
          <div className="category-empty">
            <span className="hint">No categories yet</span>
          </div>
        )}
      </div>
    </div>
  );
}
