import type { Template } from '../entities/Template';

/**
 * Options for trigger-based queries
 */
export interface TriggerQueryOptions {
  /** Whether to match triggers case-sensitively (default: true) */
  caseSensitive?: boolean;
}

/**
 * Options for checking trigger existence
 */
export interface ExistsByTriggerOptions {
  /** Template ID to exclude from the check (for updates) */
  excludeId?: string;
  /** Whether to match triggers case-sensitively (default: true) */
  caseSensitive?: boolean;
}

/**
 * Options for checking trigger conflicts
 */
export interface ConflictCheckOptions {
  /** Template ID to exclude from the check (for updates) */
  excludeId?: string;
  /** Whether to match triggers case-sensitively (default: true) */
  caseSensitive?: boolean;
}

/**
 * Represents a trigger conflict (prefix overlap)
 */
export interface TriggerConflict {
  /** The conflicting trigger */
  trigger: string;
  /** Whether the new trigger is a prefix of the existing one (true) or vice versa (false) */
  isPrefix: boolean;
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
  findByTrigger(
    trigger: string,
    options?: TriggerQueryOptions
  ): Promise<Template | null>;

  /**
   * Get all templates
   */
  findAll(): Promise<Template[]>;

  /**
   * Delete a template by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a trigger is already in use
   * @param trigger The trigger string to check
   * @param options Optional check options (excludeId, caseSensitive)
   */
  existsByTrigger(
    trigger: string,
    options?: ExistsByTriggerOptions
  ): Promise<boolean>;

  /**
   * Find triggers that conflict with the given trigger (prefix overlaps)
   * Used in "none" mode where immediate expansion requires no prefix ambiguity
   * @param trigger The trigger to check for conflicts
   * @param options Optional check options (excludeId, caseSensitive)
   */
  findTriggerConflicts(
    trigger: string,
    options?: ConflictCheckOptions
  ): Promise<TriggerConflict[]>;

  /**
   * Ensure default templates exist (seeds on first install)
   */
  ensureDefaultTemplates(): Promise<void>;
}
