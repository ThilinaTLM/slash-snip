import type { ITemplateRepository } from '@domain/repositories';
import type { TemplateDTO } from '@application/dto/template.dto';
import { toTemplateDTO } from '@application/dto/template.dto';

export class GetTemplateByTriggerUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(trigger: string): Promise<TemplateDTO | null> {
    const template = await this.templateRepository.findByTrigger(trigger);

    if (!template) {
      return null;
    }

    // Increment usage count
    const updated = template.incrementUsage();
    await this.templateRepository.save(updated);

    return toTemplateDTO(updated);
  }
}
