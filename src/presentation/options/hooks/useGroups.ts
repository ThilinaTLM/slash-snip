import { useState, useEffect, useCallback } from 'react';
import { sendMessage } from '@infrastructure/chrome/messaging';
import { MESSAGE_TYPES } from '@shared/constants';
import type { GroupDTO, CreateGroupDTO, UpdateGroupDTO } from '@application/dto';

interface UseGroupsReturn {
  groups: GroupDTO[];
  loading: boolean;
  error: string | null;
  createGroup: (data: CreateGroupDTO) => Promise<GroupDTO | null>;
  updateGroup: (data: UpdateGroupDTO) => Promise<boolean>;
  deleteGroup: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useGroups(): UseGroupsReturn {
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await sendMessage<void, GroupDTO[]>(
      MESSAGE_TYPES.GET_GROUPS
    );

    if (response.success && response.data) {
      // Sort by order
      const sorted = [...response.data].sort((a, b) => a.order - b.order);
      setGroups(sorted);
    } else {
      setError(response.error ?? 'Failed to fetch groups');
    }

    setLoading(false);
  }, []);

  const createGroup = useCallback(async (data: CreateGroupDTO): Promise<GroupDTO | null> => {
    setError(null);
    const response = await sendMessage<CreateGroupDTO, GroupDTO>(
      MESSAGE_TYPES.CREATE_GROUP,
      data
    );

    if (response.success && response.data) {
      setGroups((prev) => [...prev, response.data!].sort((a, b) => a.order - b.order));
      return response.data;
    } else {
      setError(response.error ?? 'Failed to create group');
      return null;
    }
  }, []);

  const updateGroup = useCallback(async (data: UpdateGroupDTO): Promise<boolean> => {
    setError(null);
    const response = await sendMessage<UpdateGroupDTO, GroupDTO>(
      MESSAGE_TYPES.UPDATE_GROUP,
      data
    );

    if (response.success && response.data) {
      setGroups((prev) => {
        const index = prev.findIndex((g) => g.id === data.id);
        if (index === -1) return prev;
        const updated = [...prev];
        updated[index] = response.data!;
        return updated.sort((a, b) => a.order - b.order);
      });
      return true;
    } else {
      setError(response.error ?? 'Failed to update group');
      return false;
    }
  }, []);

  const deleteGroup = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    const response = await sendMessage<{ id: string }, void>(
      MESSAGE_TYPES.DELETE_GROUP,
      { id }
    );

    if (response.success) {
      setGroups((prev) => prev.filter((g) => g.id !== id));
      return true;
    } else {
      setError(response.error ?? 'Failed to delete group');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    refresh: fetchGroups,
  };
}
