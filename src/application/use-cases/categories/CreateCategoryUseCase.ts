import { Category } from '@domain/entities';
import type { ICategoryRepository } from '@domain/repositories';
import {
  DuplicateCategoryNameError,
  InvalidCategoryError,
} from '@domain/errors';
import type { CreateCategoryDTO, CategoryDTO } from '@application/dto';
import { toCategoryDTO } from '@application/dto';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(
    dto: CreateCategoryDTO
  ): Promise<
    Result<CategoryDTO, InvalidCategoryError | DuplicateCategoryNameError>
  > {
    // Check if name already exists
    const nameExists = await this.categoryRepository.existsByName(dto.name);
    if (nameExists) {
      return err(new DuplicateCategoryNameError(dto.name));
    }

    // Create the category entity
    const categoryResult = Category.create({
      name: dto.name,
      parentId: dto.parentId,
      order: dto.order,
    });

    if (categoryResult.isErr()) {
      return err(categoryResult.error);
    }

    const category = categoryResult.value;

    // Save to repository
    await this.categoryRepository.save(category);

    // Return DTO
    return ok(toCategoryDTO(category));
  }
}
