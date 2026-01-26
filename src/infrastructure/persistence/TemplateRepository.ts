import type { ITemplateRepository, TriggerQueryOptions } from '@domain/repositories';
import { Template, type TemplateProps } from '@domain/entities';
import { STORAGE_KEYS } from '@shared/constants';
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

  async existsByTrigger(trigger: string, excludeId?: string): Promise<boolean> {
    const templates = await this.getAllProps();
    return templates.some(
      (t) => t.trigger === trigger && t.id !== excludeId
    );
  }

  /**
   * Get raw template props from storage
   */
  private async getAllProps(): Promise<TemplateProps[]> {
    const templates = await this.storage.get<TemplateProps[]>(STORAGE_KEYS.TEMPLATES);
    return templates ?? [];
  }
}
