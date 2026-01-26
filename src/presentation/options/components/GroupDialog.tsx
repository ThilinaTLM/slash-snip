import React, { useState, useEffect } from 'react';
import type { GroupDTO, CreateGroupDTO, UpdateGroupDTO } from '@application/dto';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@ui/index';
import { Button } from '@ui/button';
import { Input } from '@ui/input';

interface GroupDialogProps {
  isOpen: boolean;
  group: GroupDTO | null;
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader onClose={onClose}>
          <DialogTitle>{isEditMode ? 'Edit Group' : 'New Group'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            {error && (
              <div className="group-dialog-error">
                {error}
              </div>
            )}

            <div className="editor-field">
              <label htmlFor="group-name" className="editor-label">
                Name *
              </label>
              <Input
                id="group-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group name"
                autoFocus
              />
            </div>
          </DialogBody>
          <DialogFooter variant="highlighted">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
