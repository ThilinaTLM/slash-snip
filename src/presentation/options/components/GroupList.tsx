import React from 'react';
import type { GroupDTO } from '@application/dto';
import { DEFAULT_GROUP_ID } from '@domain/entities';

interface GroupListProps {
  groups: GroupDTO[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string | null) => void;
  onEditGroup: (group: GroupDTO) => void;
  onDeleteGroup: (id: string) => void;
  onCreateGroup: () => void;
}

export function GroupList({
  groups,
  selectedGroupId,
  onSelectGroup,
  onEditGroup,
  onDeleteGroup,
  onCreateGroup,
}: GroupListProps): React.ReactElement {
  const handleEditClick = (e: React.MouseEvent, group: GroupDTO) => {
    e.stopPropagation();
    onEditGroup(group);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteGroup(id);
  };

  return (
    <div className="group-list">
      <div className="group-list-header">
        <span className="group-list-title">Groups</span>
        <button
          className="group-add-btn"
          onClick={onCreateGroup}
          title="Add group"
        >
          +
        </button>
      </div>
      <div className="group-list-content">
        <div
          className={`group-item group-all ${selectedGroupId === null ? 'selected' : ''}`}
          onClick={() => onSelectGroup(null)}
        >
          <span className="group-icon">📋</span>
          <span className="group-name">All Templates</span>
        </div>
        {groups.map((group) => {
          const isDefault = group.id === DEFAULT_GROUP_ID;
          return (
            <div
              key={group.id}
              className={`group-item ${selectedGroupId === group.id ? 'selected' : ''}`}
              onClick={() => onSelectGroup(group.id)}
            >
              <span className="group-icon">📁</span>
              <span className="group-name">{group.name}</span>
              <div className="group-actions">
                <button
                  className="group-action-btn"
                  onClick={(e) => handleEditClick(e, group)}
                  title="Edit group"
                >
                  ✎
                </button>
                {!isDefault && (
                  <button
                    className="group-action-btn group-action-delete"
                    onClick={(e) => handleDeleteClick(e, group.id)}
                    title="Delete group"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {groups.length === 0 && (
          <div className="group-empty">
            <span className="hint">No groups yet</span>
          </div>
        )}
      </div>
    </div>
  );
}
