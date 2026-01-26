import type { IGroupRepository } from '@domain/repositories';
import { Group, type GroupProps, DEFAULT_GROUP_ID, DEFAULT_GROUP_NAME } from '@domain/entities';
import { STORAGE_KEYS } from '@shared/constants';
import { ChromeStorageAdapter } from '../chrome/storage/ChromeStorageAdapter';

/**
 * Chrome storage implementation of IGroupRepository
 */
export class GroupRepository implements IGroupRepository {
  constructor(private storage: ChromeStorageAdapter) {}

  async save(group: Group): Promise<void> {
    const groups = await this.getAllProps();
    const index = groups.findIndex((g) => g.id === group.id);

    if (index >= 0) {
      // Update existing
      groups[index] = group.toProps();
    } else {
      // Add new
      groups.push(group.toProps());
    }

    await this.storage.set(STORAGE_KEYS.GROUPS, groups);
  }

  async findById(id: string): Promise<Group | null> {
    const groups = await this.getAllProps();
    const props = groups.find((g) => g.id === id);
    return props ? Group.fromProps(props) : null;
  }

  async findAll(): Promise<Group[]> {
    const groups = await this.getAllProps();
    return groups.map((props) => Group.fromProps(props));
  }

  async delete(id: string): Promise<void> {
    const groups = await this.getAllProps();
    const filtered = groups.filter((g) => g.id !== id);
    await this.storage.set(STORAGE_KEYS.GROUPS, filtered);
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const groups = await this.getAllProps();
    const normalizedName = name.trim().toLowerCase();
    return groups.some(
      (g) => g.name.toLowerCase() === normalizedName && g.id !== excludeId
    );
  }

  async ensureDefaultGroup(): Promise<Group> {
    const existing = await this.findById(DEFAULT_GROUP_ID);
    if (existing) {
      return existing;
    }

    // Create default group
    const defaultGroup = Group.fromProps({
      id: DEFAULT_GROUP_ID,
      name: DEFAULT_GROUP_NAME,
      order: 0,
    });

    await this.save(defaultGroup);
    return defaultGroup;
  }

  /**
   * Get raw group props from storage
   */
  private async getAllProps(): Promise<GroupProps[]> {
    const groups = await this.storage.get<GroupProps[]>(STORAGE_KEYS.GROUPS);
    return groups ?? [];
  }
}
