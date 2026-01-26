import { generateUUID } from '@shared/utils';
import { InvalidCategoryError } from '../errors';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export const MAX_CATEGORY_NAME_LENGTH = 50;

export interface CategoryProps {
  id: string;
  name: string;
  parentId?: string;
  order: number;
}

export interface CreateCategoryInput {
  name: string;
  parentId?: string;
  order?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  parentId?: string | null;
  order?: number;
}

export class Category {
  private readonly props: CategoryProps;

  private constructor(props: CategoryProps) {
    this.props = props;
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get parentId(): string | undefined {
    return this.props.parentId;
  }

  get order(): number {
    return this.props.order;
  }

  /**
   * Factory method to create a new category
   */
  static create(input: CreateCategoryInput): Result<Category, InvalidCategoryError> {
    // Validate name
    const nameValidation = Category.validateName(input.name);
    if (nameValidation.isErr()) {
      return err(nameValidation.error);
    }

    const category = new Category({
      id: generateUUID(),
      name: nameValidation.value,
      parentId: input.parentId,
      order: input.order ?? 0,
    });

    return ok(category);
  }

  /**
   * Reconstitute a category from stored props (no validation)
   */
  static fromProps(props: CategoryProps): Category {
    return new Category(props);
  }

  /**
   * Validate a category name
   */
  static validateName(name: string): Result<string, InvalidCategoryError> {
    const trimmed = name.trim();

    if (!trimmed || trimmed.length === 0) {
      return err(new InvalidCategoryError('Category name is required'));
    }

    if (trimmed.length > MAX_CATEGORY_NAME_LENGTH) {
      return err(new InvalidCategoryError(`Category name must be ${MAX_CATEGORY_NAME_LENGTH} characters or less`));
    }

    return ok(trimmed);
  }

  /**
   * Update category properties
   */
  update(input: UpdateCategoryInput): Result<Category, InvalidCategoryError> {
    let newName = this.props.name;

    if (input.name !== undefined) {
      const nameValidation = Category.validateName(input.name);
      if (nameValidation.isErr()) {
        return err(nameValidation.error);
      }
      newName = nameValidation.value;
    }

    const updatedCategory = new Category({
      ...this.props,
      name: newName,
      parentId: input.parentId === null ? undefined : (input.parentId ?? this.props.parentId),
      order: input.order ?? this.props.order,
    });

    return ok(updatedCategory);
  }

  /**
   * Convert to plain object for storage
   */
  toProps(): CategoryProps {
    return { ...this.props };
  }
}
