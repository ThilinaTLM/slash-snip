import React from 'react';
import {
  ChevronRight,
  FolderOpen,
  Folder,
  Trash2,
  Plus,
  GripVertical,
  Copy,
} from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { TemplateDTO, GroupDTO } from '@application/dto';

export interface TreeNodeProps {
  type: 'group' | 'template';
  data: GroupDTO | TemplateDTO;
  isSelected?: boolean;
  isExpanded?: boolean;
  depth?: number;
  templateCount?: number;
  isDraggable?: boolean;
  isDropTarget?: boolean;
  onSelect?: () => void;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddTemplate?: () => void;
  onDuplicate?: () => void;
  children?: React.ReactNode;
}

export function TreeNode({
  type,
  data,
  isSelected = false,
  isExpanded = false,
  depth = 0,
  templateCount = 0,
  isDraggable = false,
  isDropTarget = false,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
  onAddTemplate,
  onDuplicate,
  children,
}: TreeNodeProps): React.ReactElement {
  const paddingLeft = depth * 16 + 8;

  // Draggable for templates
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: data.id,
    disabled: !isDraggable,
  });

  // Droppable for groups
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: isDropTarget ? `group-${data.id}` : 'disabled',
    disabled: !isDropTarget,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'group' && onToggle) {
      onToggle();
    } else if (onSelect) {
      onSelect();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  if (type === 'group') {
    const group = data as GroupDTO;
    return (
      <div ref={setDroppableRef}>
        <div
          className={`tree-node ${isSelected ? 'tree-node-selected' : ''} ${isOver ? 'tree-node-drop-target' : ''}`}
          style={{ paddingLeft }}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          <ChevronRight
            size={14}
            className={`tree-node-chevron ${isExpanded ? 'tree-node-chevron-expanded' : ''}`}
          />
          {isExpanded ? (
            <FolderOpen
              size={14}
              className="tree-node-icon tree-node-icon-accent"
            />
          ) : (
            <Folder size={14} className="tree-node-icon" />
          )}
          <span className="tree-node-label">
            {group.name} ({templateCount})
          </span>
          <div className="tree-node-actions">
            {onAddTemplate && (
              <button
                className="tree-node-action-btn"
                title="Add template to group"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTemplate();
                }}
              >
                <Plus size={14} />
              </button>
            )}
            {onDelete && (
              <button
                className="tree-node-action-btn tree-node-action-btn-danger"
                title="Delete group"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        {isExpanded && children && (
          <div className="tree-children">{children}</div>
        )}
      </div>
    );
  }

  // Template node
  const template = data as TemplateDTO;
  return (
    <div
      ref={setDraggableRef}
      className={`tree-node ${isSelected ? 'tree-node-selected' : ''} ${isDragging ? 'tree-node-dragging' : ''}`}
      style={{ paddingLeft }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isDraggable && (
        <div
          className="tree-node-drag-handle"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={12} />
        </div>
      )}
      <span
        className={`tree-node-name ${isSelected ? 'tree-node-name-selected' : ''}`}
      >
        {template.name}
      </span>
      <span
        className={`tree-node-trigger ${isSelected ? 'tree-node-trigger-selected' : ''}`}
      >
        {template.trigger}
      </span>
      <div className="tree-node-actions">
        {onDuplicate && (
          <button
            className="tree-node-action-btn"
            title="Duplicate snippet"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy size={14} />
          </button>
        )}
        {onDelete && (
          <button
            className="tree-node-action-btn tree-node-action-btn-danger"
            title="Delete snippet"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
