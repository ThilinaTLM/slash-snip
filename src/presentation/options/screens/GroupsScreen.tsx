import React, { useState } from 'react';
import { Plus, FolderOpen, Pencil, Trash2, X } from 'lucide-react';
import type { GroupDTO, CreateGroupDTO, UpdateGroupDTO, TemplateDTO } from '@application/dto';
import { GroupDialog } from '../components/GroupDialog';
import { DEFAULT_GROUP_ID } from '@domain/entities';

interface GroupsScreenProps {
  groups: GroupDTO[];
  templates: TemplateDTO[];
  loading: boolean;
  onCreateGroup: (data: CreateGroupDTO) => Promise<void>;
  onUpdateGroup: (data: UpdateGroupDTO) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
}

interface DeleteConfirmProps {
  groupName: string;
  templateCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({
  groupName,
  templateCount,
  onConfirm,
  onCancel,
}: DeleteConfirmProps): React.ReactElement {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-dialog modal-dialog-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Group?</h3>
          <button className="modal-close" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p>
            Are you sure you want to delete &ldquo;{groupName}&rdquo;?
            {templateCount > 0 && (
              <>
                {' '}
                The {templateCount} template{templateCount !== 1 ? 's' : ''} in this group will not
                be deleted, but will become ungrouped.
              </>
            )}
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

export function GroupsScreen({
  groups,
  templates,
  loading,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
}: GroupsScreenProps): React.ReactElement {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GroupDTO | null>(null);

  const getTemplateCount = (groupId: string): number => {
    return templates.filter((t) => t.categoryId === groupId).length;
  };

  const handleCreateClick = () => {
    setEditingGroup(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (group: GroupDTO) => {
    setEditingGroup(group);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (group: GroupDTO) => {
    setDeleteTarget(group);
  };

  const handleSave = async (data: CreateGroupDTO | UpdateGroupDTO) => {
    if ('id' in data) {
      await onUpdateGroup(data);
    } else {
      await onCreateGroup(data);
    }
    setIsDialogOpen(false);
    setEditingGroup(null);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await onDeleteGroup(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="content-header">
        <div className="content-header-left">
          <h1 className="content-header-title">Groups</h1>
        </div>
        <div className="content-header-right">
          <button className="btn btn-primary" onClick={handleCreateClick}>
            <Plus size={16} />
            New Group
          </button>
        </div>
      </div>

      <div className="content-body">
        <div className="screen-container">
          <p className="screen-section-description">
            Organize your templates into groups for easier management. Templates can belong to one
            group at a time.
          </p>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : groups.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FolderOpen />
              </div>
              <h2 className="empty-state-title">No Groups Yet</h2>
              <p className="empty-state-text">Create groups to organize your templates</p>
              <button className="btn btn-primary" onClick={handleCreateClick}>
                <Plus size={16} />
                New Group
              </button>
            </div>
          ) : (
            <div className="groups-list">
              {groups.map((group) => {
                const templateCount = getTemplateCount(group.id);
                const isDefault = group.id === DEFAULT_GROUP_ID;
                return (
                  <div key={group.id} className="group-card">
                    <div className="group-card-icon">
                      <FolderOpen size={18} />
                    </div>
                    <div className="group-card-content">
                      <div className="group-card-name">{group.name}</div>
                      <div className="group-card-count">
                        {templateCount} template{templateCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="group-card-actions">
                      <button
                        className="btn btn-icon btn-ghost"
                        onClick={() => handleEditClick(group)}
                        title="Edit group"
                      >
                        <Pencil size={16} />
                      </button>
                      {!isDefault && (
                        <button
                          className="btn btn-icon btn-ghost"
                          onClick={() => handleDeleteClick(group)}
                          title="Delete group"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <GroupDialog
        isOpen={isDialogOpen}
        group={editingGroup}
        onSave={handleSave}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingGroup(null);
        }}
      />

      {deleteTarget && (
        <DeleteConfirmDialog
          groupName={deleteTarget.name}
          templateCount={getTemplateCount(deleteTarget.id)}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
