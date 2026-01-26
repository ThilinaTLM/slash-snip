import type { Category } from '@domain/entities';

/**
 * DTO for creating a new category
 */
export interface CreateCategoryDTO {
  name: string;
  parentId?: string;
  order?: number;
}

/**
 * DTO for updating an existing category
 */
export interface UpdateCategoryDTO {
  id: string;
  name?: string;
  parentId?: string | null;
  order?: number;
}

/**
 * DTO for category data returned from use cases
 */
export interface CategoryDTO {
  id: string;
  name: string;
  parentId?: string;
  order: number;
}

/**
 * Convert Category entity to CategoryDTO
 */
export function toCategoryDTO(category: Category): CategoryDTO {
  return {
    id: category.id,
    name: category.name,
    parentId: category.parentId,
    order: category.order,
  };
}
