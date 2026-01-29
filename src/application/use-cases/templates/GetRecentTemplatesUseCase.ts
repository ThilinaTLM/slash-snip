import type {
  ITemplateRepository,
  IRecentTemplatesRepository,
} from '@domain/repositories';
import type { TemplateDTO } from '@application/dto/template.dto';
import { toTemplateDTO } from '@application/dto/template.dto';

export class GetRecentTemplatesUseCase {
  constructor(
    private templateRepository: ITemplateRepository,
    private recentTemplatesRepository: IRecentTemplatesRepository
  ) {}

  /**
   * Get recently used templates in order (most recent first)
   * @param limit Maximum number of templates to return (default: 5)
   */
  async execute(limit = 5): Promise<TemplateDTO[]> {
    const recentEntries = await this.recentTemplatesRepository.getAll();
    const templates: TemplateDTO[] = [];

    // Fetch each template and filter out any that no longer exist
    for (const entry of recentEntries) {
      if (templates.length >= limit) break;

      const template = await this.templateRepository.findById(entry.templateId);
      if (template) {
        templates.push(toTemplateDTO(template));
      }
    }

    return templates;
  }
}
