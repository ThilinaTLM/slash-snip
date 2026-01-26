import type { Group } from '../entities/Group';

/**
 * Repository interface for Group aggregate
 */
export interface IGroupRepository {
  /**
   * Save a group (create or update)
   */
  save(group: Group): Promise<void>;

  /**
   * Find a group by ID
   */
  findById(id: string): Promise<Group | null>;

  /**
   * Find all groups
   */
  findAll(): Promise<Group[]>;

  /**
   * Delete a group by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a group name already exists
   */
  existsByName(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Ensure the default group exists
   */
  ensureDefaultGroup(): Promise<Group>;
}
