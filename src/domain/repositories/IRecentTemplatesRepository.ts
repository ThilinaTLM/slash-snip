/**
 * Recent template entry with timestamp
 */
export interface RecentTemplateEntry {
  templateId: string;
  usedAt: number;
}

/**
 * Repository interface for tracking recently used templates
 */
export interface IRecentTemplatesRepository {
  /**
   * Add a template ID to recent list (or update its timestamp if already present)
   * Maintains insertion order with most recent first
   */
  add(templateId: string): Promise<void>;

  /**
   * Get all recent template IDs in order (most recent first)
   */
  getAll(): Promise<RecentTemplateEntry[]>;

  /**
   * Remove a template ID from recent list
   * Called when a template is deleted
   */
  remove(templateId: string): Promise<void>;

  /**
   * Clear all recent templates
   */
  clear(): Promise<void>;
}
