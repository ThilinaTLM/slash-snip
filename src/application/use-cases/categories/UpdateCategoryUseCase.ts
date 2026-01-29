import type { ICategoryRepository } from '@domain/repositories';
import {
  CategoryNotFoundError,
  DuplicateCategoryNameError,
  InvalidCategoryError,
} from '@domain/errors';
import type { UpdateCategoryDTO, CategoryDTO } from '@application/dto';
import { toCategoryDTO } from '@application/dto';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(
    dto: UpdateCategoryDTO
  ): Promise<
    Result<
      CategoryDTO,
      CategoryNotFoundError | InvalidCategoryError | DuplicateCategoryNameError
    >
  > {
    // Find the existing category
    const existingCategory = await this.categoryRepository.findById(dto.id);
    if (!existingCategory) {
      return err(new CategoryNotFoundError(dto.id));
    }

    // Check for duplicate name if name is being changed
    if (dto.name !== undefined && dto.name !== existingCategory.name) {
      const nameExists = await this.categoryRepository.existsByName(
        dto.name,
        dto.id
      );
      if (nameExists) {
        return err(new DuplicateCategoryNameError(dto.name));
      }
    }

    // Update the category
    const updateResult = existingCategory.update({
      name: dto.name,
      parentId: dto.parentId,
      order: dto.order,
    });

    if (updateResult.isErr()) {
      return err(updateResult.error);
    }

    const updatedCategory = updateResult.value;

    // Save to repository
    await this.categoryRepository.save(updatedCategory);

    // Return DTO
    return ok(toCategoryDTO(updatedCategory));
  }
}
