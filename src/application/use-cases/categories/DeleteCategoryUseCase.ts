import type { ICategoryRepository } from '@domain/repositories';
import { CategoryNotFoundError } from '@domain/errors';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(id: string): Promise<Result<void, CategoryNotFoundError>> {
    // Check if the category exists
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      return err(new CategoryNotFoundError(id));
    }

    // Delete from repository
    await this.categoryRepository.delete(id);

    return ok(undefined);
  }
}
