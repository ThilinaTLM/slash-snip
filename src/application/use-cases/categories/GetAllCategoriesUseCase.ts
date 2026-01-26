import type { ICategoryRepository } from '@domain/repositories';
import type { CategoryDTO } from '@application/dto';
import { toCategoryDTO } from '@application/dto';

export class GetAllCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(): Promise<CategoryDTO[]> {
    const categories = await this.categoryRepository.findAll();
    return categories.map(toCategoryDTO).sort((a, b) => a.order - b.order);
  }
}
