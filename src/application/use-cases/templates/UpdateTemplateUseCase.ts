import type { ITemplateRepository } from '@domain/repositories';
import { TemplateNotFoundError, DuplicateTriggerError } from '@domain/errors';
import type { UpdateTemplateDTO, TemplateDTO } from '@application/dto/template.dto';
import { toTemplateDTO } from '@application/dto/template.dto';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export class UpdateTemplateUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(dto: UpdateTemplateDTO): Promise<Result<TemplateDTO, Error>> {
    // Find existing template
    const existing = await this.templateRepository.findById(dto.id);
    if (!existing) {
      return err(new TemplateNotFoundError(dto.id));
    }

    // Check for duplicate trigger if trigger is being changed
    if (dto.trigger && dto.trigger !== existing.trigger) {
      const triggerExists = await this.templateRepository.existsByTrigger(
        dto.trigger,
        dto.id
      );
      if (triggerExists) {
        return err(new DuplicateTriggerError(dto.trigger));
      }
    }

    // Update template entity
    const updateResult = existing.update({
      trigger: dto.trigger,
      name: dto.name,
      content: dto.content,
      description: dto.description,
      categoryId: dto.categoryId,
      tags: dto.tags,
      isFavorite: dto.isFavorite,
    });

    if (updateResult.isErr()) {
      return err(updateResult.error);
    }

    const updated = updateResult.value;

    // Save to repository
    await this.templateRepository.save(updated);

    return ok(toTemplateDTO(updated));
  }
}
