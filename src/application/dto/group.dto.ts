import type { Group } from '@domain/entities';

/**
 * DTO for creating a new group
 */
export interface CreateGroupDTO {
  name: string;
  order?: number;
}

/**
 * DTO for updating an existing group
 */
export interface UpdateGroupDTO {
  id: string;
  name?: string;
  order?: number;
}

/**
 * DTO for group data returned from use cases
 */
export interface GroupDTO {
  id: string;
  name: string;
  order: number;
}

/**
 * Convert Group entity to GroupDTO
 */
export function toGroupDTO(group: Group): GroupDTO {
  return {
    id: group.id,
    name: group.name,
    order: group.order,
  };
}
