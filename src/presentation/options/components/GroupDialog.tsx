import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { GroupDTO, CreateGroupDTO, UpdateGroupDTO } from '@application/dto';

interface GroupDialogProps {
  isOpen: boolean;
  group: GroupDTO | null; // null = create mode
  onSave: (data: CreateGroupDTO | UpdateGroupDTO) => void;
  onClose: () => void;
}

export function GroupDialog({
  isOpen,
  group,
  onSave,
  onClose,
}: GroupDialogProps): React.ReactElement | null {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEditMode = group !== null;

  useEffect(() => {
    if (isOpen) {
      if (group) {
        setName(group.name);
      } else {
        setName('');
      }
      setError(null);
    }
  }, [isOpen, group]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Group name is required');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Group name must be 50 characters or less');
      return;
    }

    if (isEditMode && group) {
      const updates: UpdateGroupDTO = {
        id: group.id,
        name: trimmedName,
      };
      onSave(updates);
    } else {
      const data: CreateGroupDTO = {
        name: trimmedName,
      };
      onSave(data);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditMode ? 'Edit Group' : 'New Group'}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="group-name">Name *</label>
              <input
                id="group-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group name"
                autoFocus
              />
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
