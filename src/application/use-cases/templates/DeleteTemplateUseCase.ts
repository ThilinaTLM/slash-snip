import type { ITemplateRepository } from '@domain/repositories';
import { TemplateNotFoundError } from '@domain/errors';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export class DeleteTemplateUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(id: string): Promise<Result<void, TemplateNotFoundError>> {
    // Verify template exists
    const template = await this.templateRepository.findById(id);
    if (!template) {
      return err(new TemplateNotFoundError(id));
    }

    await this.templateRepository.delete(id);
    return ok(undefined);
  }
}
