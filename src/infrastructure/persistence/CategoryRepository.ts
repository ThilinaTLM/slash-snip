import type { ICategoryRepository } from '@domain/repositories';
import { Category, type CategoryProps } from '@domain/entities';
import { STORAGE_KEYS } from '@shared/constants';
import { ChromeStorageAdapter } from '../chrome/storage/ChromeStorageAdapter';

/**
 * Chrome storage implementation of ICategoryRepository
 */
export class CategoryRepository implements ICategoryRepository {
  constructor(private storage: ChromeStorageAdapter) {}

  async save(category: Category): Promise<void> {
    const categories = await this.getAllProps();
    const index = categories.findIndex((c) => c.id === category.id);

    if (index >= 0) {
      // Update existing
      categories[index] = category.toProps();
    } else {
      // Add new
      categories.push(category.toProps());
    }

    await this.storage.set(STORAGE_KEYS.CATEGORIES, categories);
  }

  async findById(id: string): Promise<Category | null> {
    const categories = await this.getAllProps();
    const props = categories.find((c) => c.id === id);
    return props ? Category.fromProps(props) : null;
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.getAllProps();
    return categories.map((props) => Category.fromProps(props));
  }

  async findByParentId(parentId: string | null): Promise<Category[]> {
    const categories = await this.getAllProps();
    return categories
      .filter((c) =>
        parentId === null ? c.parentId === undefined : c.parentId === parentId
      )
      .map((props) => Category.fromProps(props));
  }

  async delete(id: string): Promise<void> {
    const categories = await this.getAllProps();
    const filtered = categories.filter((c) => c.id !== id);
    await this.storage.set(STORAGE_KEYS.CATEGORIES, filtered);
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const categories = await this.getAllProps();
    const normalizedName = name.trim().toLowerCase();
    return categories.some(
      (c) => c.name.toLowerCase() === normalizedName && c.id !== excludeId
    );
  }

  /**
   * Get raw category props from storage
   */
  private async getAllProps(): Promise<CategoryProps[]> {
    const categories = await this.storage.get<CategoryProps[]>(
      STORAGE_KEYS.CATEGORIES
    );
    return categories ?? [];
  }
}
