import type { Template } from '../entities/Template';

/**
 * Repository interface for Template persistence
 * Implementations are in infrastructure layer
 */
export interface ITemplateRepository {
  /**
   * Save a template (create or update)
   */
  save(template: Template): Promise<void>;

  /**
   * Find a template by ID
   */
  findById(id: string): Promise<Template | null>;

  /**
   * Find a template by trigger string
   */
  findByTrigger(trigger: string): Promise<Template | null>;

  /**
   * Get all templates
   */
  findAll(): Promise<Template[]>;

  /**
   * Delete a template by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a trigger is already in use (optionally excluding a specific template ID)
   */
  existsByTrigger(trigger: string, excludeId?: string): Promise<boolean>;
}
