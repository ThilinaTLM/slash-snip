import { Template } from '@domain/entities';
import type { ITemplateRepository } from '@domain/repositories';
import { DuplicateTriggerError } from '@domain/errors';
import type { CreateTemplateDTO, TemplateDTO } from '@application/dto/template.dto';
import { toTemplateDTO } from '@application/dto/template.dto';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export class CreateTemplateUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(
    dto: CreateTemplateDTO
  ): Promise<Result<TemplateDTO, Error>> {
    // Check for duplicate trigger
    const exists = await this.templateRepository.existsByTrigger(dto.trigger);
    if (exists) {
      return err(new DuplicateTriggerError(dto.trigger));
    }

    // Create template entity
    const templateResult = Template.create({
      trigger: dto.trigger,
      name: dto.name,
      content: dto.content,
      description: dto.description,
      categoryId: dto.categoryId,
      tags: dto.tags,
    });

    if (templateResult.isErr()) {
      return err(templateResult.error);
    }

    const template = templateResult.value;

    // Save to repository
    await this.templateRepository.save(template);

    return ok(toTemplateDTO(template));
  }
}
