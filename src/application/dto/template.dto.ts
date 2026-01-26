import type { Template } from '@domain/entities';

/**
 * DTO for creating a new template
 */
export interface CreateTemplateDTO {
  trigger: string;
  name: string;
  content: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
}

/**
 * DTO for updating an existing template
 */
export interface UpdateTemplateDTO {
  id: string;
  trigger?: string;
  name?: string;
  content?: string;
  description?: string;
  categoryId?: string | null;
  tags?: string[];
  isFavorite?: boolean;
}

/**
 * DTO for template data in UI
 */
export interface TemplateDTO {
  id: string;
  trigger: string;
  name: string;
  content: string;
  description?: string;
  categoryId?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  usageCount: number;
  isFavorite: boolean;
}

/**
 * Convert Template entity to DTO
 */
export function toTemplateDTO(template: Template): TemplateDTO {
  return {
    id: template.id,
    trigger: template.trigger,
    name: template.name,
    content: template.content,
    description: template.description,
    categoryId: template.categoryId,
    tags: template.tags,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    usageCount: template.usageCount,
    isFavorite: template.isFavorite,
  };
}
