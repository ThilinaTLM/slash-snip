import type {
  ITemplateRepository,
  TriggerQueryOptions,
  ExistsByTriggerOptions,
  ConflictCheckOptions,
  TriggerConflict,
} from '@domain/repositories';
import { Template, type TemplateProps } from '@domain/entities';
import { STORAGE_KEYS } from '@shared/constants';
import { createDefaultTemplates } from '@shared/constants/defaultTemplates';
import { ChromeStorageAdapter } from '../chrome/storage/ChromeStorageAdapter';

/**
 * Chrome storage implementation of ITemplateRepository
 */
export class TemplateRepository implements ITemplateRepository {
  constructor(private storage: ChromeStorageAdapter) {}

  async save(template: Template): Promise<void> {
    const templates = await this.getAllProps();
    const index = templates.findIndex((t) => t.id === template.id);

    if (index >= 0) {
      // Update existing
      templates[index] = template.toProps();
    } else {
      // Add new
      templates.push(template.toProps());
    }

    await this.storage.set(STORAGE_KEYS.TEMPLATES, templates);
  }

  async findById(id: string): Promise<Template | null> {
    const templates = await this.getAllProps();
    const props = templates.find((t) => t.id === id);
    return props ? Template.fromProps(props) : null;
  }

  async findByTrigger(trigger: string, options?: TriggerQueryOptions): Promise<Template | null> {
    const templates = await this.getAllProps();
    const caseSensitive = options?.caseSensitive ?? true;

    const props = templates.find((t) => {
      if (caseSensitive) {
        return t.trigger === trigger;
      }
      return t.trigger.toLowerCase() === trigger.toLowerCase();
    });

    return props ? Template.fromProps(props) : null;
  }

  async findAll(): Promise<Template[]> {
    const templates = await this.getAllProps();
    return templates.map((props) => Template.fromProps(props));
  }

  async delete(id: string): Promise<void> {
    const templates = await this.getAllProps();
    const filtered = templates.filter((t) => t.id !== id);
    await this.storage.set(STORAGE_KEYS.TEMPLATES, filtered);
  }

  async existsByTrigger(trigger: string, options?: ExistsByTriggerOptions): Promise<boolean> {
    const templates = await this.getAllProps();
    const caseSensitive = options?.caseSensitive ?? true;
    const excludeId = options?.excludeId;

    return templates.some((t) => {
      if (t.id === excludeId) return false;
      if (caseSensitive) {
        return t.trigger === trigger;
      }
      return t.trigger.toLowerCase() === trigger.toLowerCase();
    });
  }

  async findTriggerConflicts(
    trigger: string,
    options?: ConflictCheckOptions
  ): Promise<TriggerConflict[]> {
    const templates = await this.getAllProps();
    const caseSensitive = options?.caseSensitive ?? true;
    const excludeId = options?.excludeId;
    const conflicts: TriggerConflict[] = [];

    const normalizedTrigger = caseSensitive ? trigger : trigger.toLowerCase();

    for (const t of templates) {
      if (t.id === excludeId) continue;

      const normalizedExisting = caseSensitive ? t.trigger : t.trigger.toLowerCase();

      // Check if new trigger is a prefix of existing trigger
      if (normalizedExisting.startsWith(normalizedTrigger) && normalizedExisting !== normalizedTrigger) {
        conflicts.push({
          trigger: t.trigger,
          isPrefix: true,
        });
      }
      // Check if existing trigger is a prefix of new trigger
      else if (normalizedTrigger.startsWith(normalizedExisting) && normalizedExisting !== normalizedTrigger) {
        conflicts.push({
          trigger: t.trigger,
          isPrefix: false,
        });
      }
    }

    return conflicts;
  }

  /**
   * Ensure default templates exist (seeds on first install)
   */
  async ensureDefaultTemplates(): Promise<void> {
    const templates = await this.getAllProps();

    // Only seed if storage is empty (first install)
    if (templates.length > 0) {
      return;
    }

    const defaultTemplates = createDefaultTemplates();
    await this.storage.set(STORAGE_KEYS.TEMPLATES, defaultTemplates);
  }

  /**
   * Get raw template props from storage
   */
  private async getAllProps(): Promise<TemplateProps[]> {
    const templates = await this.storage.get<TemplateProps[]>(STORAGE_KEYS.TEMPLATES);
    return templates ?? [];
  }
}
