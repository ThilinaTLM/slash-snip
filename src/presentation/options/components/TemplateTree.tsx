import React, { useState, useMemo } from 'react';
import { Plus, FolderPlus, Search, Inbox } from 'lucide-react';
import type { TemplateDTO, GroupDTO } from '@application/dto';
import { TreeNode } from './TreeNode';
import { Button } from '@ui/button';
import { Input } from '@ui/input';

interface TemplateTreeProps {
  templates: TemplateDTO[];
  groups: GroupDTO[];
  selectedId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTemplate: (id: string) => void;
  onNewTemplate: () => void;
  onNewGroup: () => void;
  onEditGroup: (group: GroupDTO) => void;
  onDeleteGroup: (group: GroupDTO) => void;
  onDeleteTemplate: (template: TemplateDTO) => void;
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
  onSearchChange,
  onSelectTemplate,
  onNewTemplate,
  onNewGroup,
  onEditGroup,
  onDeleteGroup,
  onDeleteTemplate,
}: TemplateTreeProps): React.ReactElement {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // Initially expand all groups
    return new Set(groups.map((g) => g.id));
  });

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
    <div className="tree-panel">
      {/* Header with actions */}
      <div className="tree-actions">
        <Button size="sm" onClick={onNewTemplate} title="New Template">
          <Plus size={14} />
          <span>Template</span>
        </Button>
        <Button variant="secondary" size="sm" onClick={onNewGroup} title="New Group">
          <FolderPlus size={14} />
          <span>Group</span>
        </Button>
      </div>

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
          <div className="tree">
            {/* Groups with templates */}
            {groupedData.map(({ group, templates: groupTemplates }) => (
              <TreeNode
                key={group.id}
                type="group"
                data={group}
                isExpanded={expandedGroups.has(group.id)}
                templateCount={groupTemplates.length}
                onToggle={() => toggleGroup(group.id)}
                onEdit={() => onEditGroup(group)}
                onDelete={() => onDeleteGroup(group)}
              >
                {groupTemplates.map((template) => (
                  <TreeNode
                    key={template.id}
                    type="template"
                    data={template}
                    depth={1}
                    isSelected={selectedId === template.id}
                    onSelect={() => onSelectTemplate(template.id)}
                    onDelete={() => onDeleteTemplate(template)}
                  />
                ))}
              </TreeNode>
            ))}

            {/* Ungrouped templates */}
            {ungroupedTemplates.length > 0 && (
              <>
                {groups.length > 0 && (
                  <div className="tree-section-label">Ungrouped</div>
                )}
                {ungroupedTemplates.map((template) => (
                  <TreeNode
                    key={template.id}
                    type="template"
                    data={template}
                    isSelected={selectedId === template.id}
                    onSelect={() => onSelectTemplate(template.id)}
                    onDelete={() => onDeleteTemplate(template)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="tree-footer">
        <span>{templates.length} snippet{templates.length !== 1 ? 's' : ''}</span>
        <span>{groups.length} group{groups.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
