import type {
  ITemplateRepository,
  IRecentTemplatesRepository,
} from '@domain/repositories';
import type { TemplateDTO } from '@application/dto/template.dto';
import { toTemplateDTO } from '@application/dto/template.dto';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export class IncrementUsageUseCase {
  constructor(
    private templateRepository: ITemplateRepository,
    private recentTemplatesRepository: IRecentTemplatesRepository
  ) {}

  async execute(id: string): Promise<Result<TemplateDTO, Error>> {
    // Find the template
    const template = await this.templateRepository.findById(id);
    if (!template) {
      return err(new Error('Template not found'));
    }

    // Increment usage count
    const updated = template.incrementUsage();

    // Save to repository
    await this.templateRepository.save(updated);

    // Add to recent templates
    await this.recentTemplatesRepository.add(id);

    return ok(toTemplateDTO(updated));
  }
}
