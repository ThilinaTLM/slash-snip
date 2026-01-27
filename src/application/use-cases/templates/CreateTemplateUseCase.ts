import { Template } from '@domain/entities';
import type { ITemplateRepository } from '@domain/repositories';
import { DuplicateTriggerError, TriggerConflictError } from '@domain/errors';
import type { ISettingsPort } from '@application/ports';
import type { CreateTemplateDTO, TemplateDTO } from '@application/dto/template.dto';
import { toTemplateDTO } from '@application/dto/template.dto';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export class CreateTemplateUseCase {
  constructor(
    private templateRepository: ITemplateRepository,
    private settingsPort?: ISettingsPort
  ) {}

  async execute(
    dto: CreateTemplateDTO
  ): Promise<Result<TemplateDTO, Error>> {
    // Load settings to check trigger mode and case sensitivity
    const settings = await this.settingsPort?.getSettings();
    const caseSensitive = settings?.caseSensitive ?? true;

    // Check for duplicate trigger
    const exists = await this.templateRepository.existsByTrigger(dto.trigger, {
      caseSensitive,
    });
    if (exists) {
      return err(new DuplicateTriggerError(dto.trigger));
    }

    // In "none" mode, check for prefix conflicts
    if (settings?.triggerKey === 'none') {
      const conflicts = await this.templateRepository.findTriggerConflicts(dto.trigger, {
        caseSensitive,
      });
      if (conflicts.length > 0) {
        const conflict = conflicts[0];
        return err(new TriggerConflictError(dto.trigger, conflict.trigger, conflict.isPrefix));
      }
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
