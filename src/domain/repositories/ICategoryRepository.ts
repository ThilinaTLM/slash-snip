import type { Category } from '../entities/Category';

/**
 * Repository interface for Category aggregate
 */
export interface ICategoryRepository {
  /**
   * Save a category (create or update)
   */
  save(category: Category): Promise<void>;

  /**
   * Find a category by ID
   */
  findById(id: string): Promise<Category | null>;

  /**
   * Find all categories
   */
  findAll(): Promise<Category[]>;

  /**
   * Find categories by parent ID (null for root categories)
   */
  findByParentId(parentId: string | null): Promise<Category[]>;

  /**
   * Delete a category by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a category name already exists
   */
  existsByName(name: string, excludeId?: string): Promise<boolean>;
}
