import type { ITemplateRepository } from '@domain/repositories';
import { TemplateNotFoundError, DuplicateTriggerError, TriggerConflictError } from '@domain/errors';
import type { ISettingsPort } from '@application/ports';
import type { UpdateTemplateDTO, TemplateDTO } from '@application/dto/template.dto';
import { toTemplateDTO } from '@application/dto/template.dto';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export class UpdateTemplateUseCase {
  constructor(
    private templateRepository: ITemplateRepository,
    private settingsPort?: ISettingsPort
  ) {}

  async execute(dto: UpdateTemplateDTO): Promise<Result<TemplateDTO, Error>> {
    // Load settings to check trigger mode and case sensitivity
    const settings = await this.settingsPort?.getSettings();
    const caseSensitive = settings?.caseSensitive ?? true;

    // Find existing template
    const existing = await this.templateRepository.findById(dto.id);
    if (!existing) {
      return err(new TemplateNotFoundError(dto.id));
    }

    // Check for duplicate trigger if trigger is being changed
    if (dto.trigger && dto.trigger !== existing.trigger) {
      const triggerExists = await this.templateRepository.existsByTrigger(dto.trigger, {
        excludeId: dto.id,
        caseSensitive,
      });
      if (triggerExists) {
        return err(new DuplicateTriggerError(dto.trigger));
      }

      // In "none" mode, check for prefix conflicts
      if (settings?.triggerKey === 'none') {
        const conflicts = await this.templateRepository.findTriggerConflicts(dto.trigger, {
          excludeId: dto.id,
          caseSensitive,
        });
        if (conflicts.length > 0) {
          const conflict = conflicts[0];
          return err(new TriggerConflictError(dto.trigger, conflict.trigger, conflict.isPrefix));
        }
      }
    }

    // Update template entity
    const updateResult = existing.update({
      trigger: dto.trigger,
      name: dto.name,
      content: dto.content,
      groupId: dto.groupId,
      tags: dto.tags,
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
