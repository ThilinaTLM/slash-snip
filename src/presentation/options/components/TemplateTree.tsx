import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Search, Inbox, FolderPlus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import type { TemplateDTO, GroupDTO } from '@application/dto';
import { TreeNode } from './TreeNode';
import { DndTreeContext } from './DndTreeContext';
import { Input } from '@ui/input';

const MIN_PANEL_WIDTH = 200;
const MAX_PANEL_WIDTH = 400;

interface TemplateTreeProps {
  templates: TemplateDTO[];
  groups: GroupDTO[];
  selectedId: string | null;
  searchQuery: string;
  width?: number;
  onSearchChange: (query: string) => void;
  onSelectTemplate: (id: string) => void;
  onNewTemplate: (groupId?: string) => void;
  onNewGroup: () => void;
  onEditGroup: (group: GroupDTO) => void;
  onDeleteGroup: (group: GroupDTO) => void;
  onDeleteTemplate: (template: TemplateDTO) => void;
  onDuplicateTemplate: (template: TemplateDTO) => void;
  onMoveTemplate?: (templateId: string, targetGroupId: string | null) => void;
  onWidthChange?: (width: number) => void;
}

interface TreeGroup {
  group: GroupDTO;
  templates: TemplateDTO[];
}

export function TemplateTree({
  templates,
  groups,
  selectedId,
  searchQuery,
  width = 256,
  onSearchChange,
  onSelectTemplate,
  onNewTemplate,
  onNewGroup,
  onEditGroup,
  onDeleteGroup,
  onDeleteTemplate,
  onDuplicateTemplate,
  onMoveTemplate,
  onWidthChange,
}: TemplateTreeProps): React.ReactElement {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // Initially expand all groups
    return new Set(groups.map((g) => g.id));
  });

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

  // Handle resize mouse events
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = { startX: e.clientX, startWidth: width };
  }, [width]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const delta = e.clientX - resizeRef.current.startX;
      const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, resizeRef.current.startWidth + delta));
      onWidthChange?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onWidthChange]);

  // Filter templates by search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const query = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.trigger.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [templates, searchQuery]);

  // Organize templates into groups
  const { groupedData, ungroupedTemplates } = useMemo(() => {
    const grouped: TreeGroup[] = groups.map((group) => ({
      group,
      templates: filteredTemplates.filter((t) => t.categoryId === group.id),
    }));

    const ungrouped = filteredTemplates.filter(
      (t) => !t.categoryId || !groups.some((g) => g.id === t.categoryId)
    );

    return { groupedData: grouped, ungroupedTemplates: ungrouped };
  }, [filteredTemplates, groups]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const isEmpty = filteredTemplates.length === 0 && groups.length === 0;
  const isSearchEmpty = filteredTemplates.length === 0 && searchQuery.trim();

  return (
    <div className={`tree-panel ${isResizing ? 'tree-panel-resizing' : ''}`} style={{ width }}>
      {/* Search */}
      <div className="tree-search">
        <Search size={14} className="tree-search-icon" />
        <Input
          type="search"
          placeholder="Search snippets..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="tree-search-input"
        />
      </div>

      {/* Tree content */}
      <div className="tree-content">
        {isEmpty ? (
          <div className="tree-empty">
            <Inbox size={32} className="tree-empty-icon" />
            <p className="tree-empty-title">No snippets yet</p>
            <p className="tree-empty-subtitle">Create your first snippet to get started</p>
          </div>
        ) : isSearchEmpty ? (
          <div className="tree-empty">
            <Search size={24} className="tree-empty-icon" />
            <p className="tree-empty-subtitle">No results for &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : (
          <DndTreeContext templates={templates} onMoveTemplate={onMoveTemplate}>
            <div className="tree">
              {/* Groups with templates */}
              {groupedData.map(({ group, templates: groupTemplates }) => (
                <TreeNode
                  key={group.id}
                  type="group"
                  data={group}
                  isExpanded={expandedGroups.has(group.id)}
                  isDropTarget={true}
                  templateCount={groupTemplates.length}
                  onToggle={() => toggleGroup(group.id)}
                  onEdit={() => onEditGroup(group)}
                  onDelete={() => onDeleteGroup(group)}
                  onAddTemplate={() => onNewTemplate(group.id)}
                >
                  {groupTemplates.map((template) => (
                    <TreeNode
                      key={template.id}
                      type="template"
                      data={template}
                      depth={1}
                      isSelected={selectedId === template.id}
                      isDraggable={true}
                      onSelect={() => onSelectTemplate(template.id)}
                      onDuplicate={() => onDuplicateTemplate(template)}
                      onDelete={() => onDeleteTemplate(template)}
                    />
                  ))}
                </TreeNode>
              ))}

              {/* Ungrouped templates */}
              {ungroupedTemplates.length > 0 && (
                <UngroupedSection
                  templates={ungroupedTemplates}
                  selectedId={selectedId}
                  hasGroups={groups.length > 0}
                  onSelectTemplate={onSelectTemplate}
                  onDuplicateTemplate={onDuplicateTemplate}
                  onDeleteTemplate={onDeleteTemplate}
                />
              )}
            </div>
          </DndTreeContext>
        )}
      </div>

      {/* Footer with stats and new group button */}
      <div className="tree-footer">
        <div className="tree-footer-stats">
          <span>{templates.length} snippet{templates.length !== 1 ? 's' : ''}</span>
          <span>{groups.length} group{groups.length !== 1 ? 's' : ''}</span>
        </div>
        <button className="tree-footer-add-group" onClick={onNewGroup}>
          <FolderPlus size={14} />
          <span>New Group</span>
        </button>
      </div>

      {/* Resize handle */}
      <div
        className="tree-panel-resize-handle"
        onMouseDown={handleResizeStart}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
      />
    </div>
  );
}

interface UngroupedSectionProps {
  templates: TemplateDTO[];
  selectedId: string | null;
  hasGroups: boolean;
  onSelectTemplate: (id: string) => void;
  onDuplicateTemplate: (template: TemplateDTO) => void;
  onDeleteTemplate: (template: TemplateDTO) => void;
}

function UngroupedSection({
  templates,
  selectedId,
  hasGroups,
  onSelectTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
}: UngroupedSectionProps): React.ReactElement {
  const { setNodeRef, isOver } = useDroppable({
    id: 'ungrouped',
  });

  return (
    <div ref={setNodeRef} className={isOver ? 'tree-section-drop-target' : ''}>
      {hasGroups && <div className="tree-section-label">Ungrouped</div>}
      {templates.map((template) => (
        <TreeNode
          key={template.id}
          type="template"
          data={template}
          isSelected={selectedId === template.id}
          isDraggable={true}
          onSelect={() => onSelectTemplate(template.id)}
          onDuplicate={() => onDuplicateTemplate(template)}
          onDelete={() => onDeleteTemplate(template)}
        />
      ))}
    </div>
  );
}
