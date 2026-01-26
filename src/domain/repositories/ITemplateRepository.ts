import type { Template } from '../entities/Template';

/**
 * Options for trigger-based queries
 */
export interface TriggerQueryOptions {
  /** Whether to match triggers case-sensitively (default: true) */
  caseSensitive?: boolean;
}

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
   * @param trigger The trigger string to search for
   * @param options Optional query options (e.g., case sensitivity)
   */
  findByTrigger(trigger: string, options?: TriggerQueryOptions): Promise<Template | null>;

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
