import React from 'react';
import { ChevronRight, FolderOpen, Folder, FileText, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@ui/index';
import type { TemplateDTO, GroupDTO } from '@application/dto';

export interface TreeNodeProps {
  type: 'group' | 'template';
  data: GroupDTO | TemplateDTO;
  isSelected?: boolean;
  isExpanded?: boolean;
  depth?: number;
  templateCount?: number;
  onSelect?: () => void;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
}

export function TreeNode({
  type,
  data,
  isSelected = false,
  isExpanded = false,
  depth = 0,
  templateCount = 0,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
  children,
}: TreeNodeProps): React.ReactElement {
  const paddingLeft = depth * 16 + 8;

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
    if (type === 'template' && onEdit) {
      onEdit();
    }
  };

  if (type === 'group') {
    const group = data as GroupDTO;
    return (
      <div>
        <div
          className={`tree-node ${isSelected ? 'tree-node-selected' : ''}`}
          style={{ paddingLeft }}
          onClick={handleClick}
        >
          <ChevronRight
            size={14}
            className={`tree-node-chevron ${isExpanded ? 'tree-node-chevron-expanded' : ''}`}
          />
          {isExpanded ? (
            <FolderOpen size={14} className="tree-node-icon tree-node-icon-accent" />
          ) : (
            <Folder size={14} className="tree-node-icon" />
          )}
          <span className="tree-node-label">{group.name}</span>
          <span className="tree-node-count">{templateCount}</span>
          <TreeNodeMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
        {isExpanded && children && <div className="tree-children">{children}</div>}
      </div>
    );
  }

  // Template node
  const template = data as TemplateDTO;
  return (
    <div
      className={`tree-node ${isSelected ? 'tree-node-selected' : ''}`}
      style={{ paddingLeft }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <FileText
        size={14}
        className={`tree-node-icon ${isSelected ? 'tree-node-icon-accent' : ''}`}
      />
      <span className={`tree-node-trigger ${isSelected ? 'tree-node-trigger-selected' : ''}`}>
        {template.trigger}
      </span>
      <span className={`tree-node-name ${isSelected ? 'tree-node-name-selected' : ''}`}>
        {template.name}
      </span>
      <TreeNodeMenu onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

interface TreeNodeMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

function TreeNodeMenu({ onEdit, onDelete }: TreeNodeMenuProps): React.ReactElement {
  if (!onEdit && !onDelete) {
    return <></>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="tree-node-menu"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal size={14} className="text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {onEdit && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil size={12} />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            destructive
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={12} />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
