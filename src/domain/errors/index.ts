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
