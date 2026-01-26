// Domain Errors

/**
 * Base class for domain errors
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Template not found in repository
 */
export class TemplateNotFoundError extends DomainError {
  constructor(identifier: string) {
    super(`Template not found: ${identifier}`);
  }
}

/**
 * Trigger already exists for another template
 */
export class DuplicateTriggerError extends DomainError {
  constructor(trigger: string) {
    super(`Trigger already exists: ${trigger}`);
  }
}

/**
 * Invalid trigger format
 */
export class InvalidTriggerError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Invalid template data
 */
export class InvalidTemplateError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Category not found in repository
 * @deprecated Use GroupNotFoundError instead
 */
export class CategoryNotFoundError extends DomainError {
  constructor(identifier: string) {
    super(`Category not found: ${identifier}`);
  }
}

/**
 * Invalid category data
 * @deprecated Use InvalidGroupError instead
 */
export class InvalidCategoryError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Duplicate category name
 * @deprecated Use DuplicateGroupNameError instead
 */
export class DuplicateCategoryNameError extends DomainError {
  constructor(name: string) {
    super(`Category name already exists: ${name}`);
  }
}

/**
 * Group not found in repository
 */
export class GroupNotFoundError extends DomainError {
  constructor(identifier: string) {
    super(`Group not found: ${identifier}`);
  }
}

/**
 * Invalid group data
 */
export class InvalidGroupError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Duplicate group name
 */
export class DuplicateGroupNameError extends DomainError {
  constructor(name: string) {
    super(`Group name already exists: ${name}`);
  }
}
