import { generateUUID } from '@shared/utils';
import { MIN_TRIGGER_LENGTH, MAX_TRIGGER_LENGTH, MAX_CONTENT_LENGTH, MAX_NAME_LENGTH } from '@shared/constants';
import { InvalidTriggerError, InvalidTemplateError } from '../errors';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export interface TemplateProps {
  id: string;
  trigger: string;
  name: string;
  content: string;
  description?: string;
  categoryId?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  usageCount: number;
  isFavorite: boolean;
}

export interface CreateTemplateInput {
  trigger: string;
  name: string;
  content: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
}

export interface UpdateTemplateInput {
  trigger?: string;
  name?: string;
  content?: string;
  description?: string;
  categoryId?: string | null;
  tags?: string[];
  isFavorite?: boolean;
}

export class Template {
  private readonly props: TemplateProps;

  private constructor(props: TemplateProps) {
    this.props = props;
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get trigger(): string {
    return this.props.trigger;
  }

  get name(): string {
    return this.props.name;
  }

  get content(): string {
    return this.props.content;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get categoryId(): string | undefined {
    return this.props.categoryId;
  }

  get tags(): string[] {
    return [...this.props.tags];
  }

  get createdAt(): number {
    return this.props.createdAt;
  }

  get updatedAt(): number {
    return this.props.updatedAt;
  }

  get usageCount(): number {
    return this.props.usageCount;
  }

  get isFavorite(): boolean {
    return this.props.isFavorite;
  }

  /**
   * Factory method to create a new template
   */
  static create(input: CreateTemplateInput): Result<Template, InvalidTriggerError | InvalidTemplateError> {
    // Validate trigger
    const triggerValidation = Template.validateTrigger(input.trigger);
    if (triggerValidation.isErr()) {
      return err(triggerValidation.error);
    }

    // Validate name
    if (!input.name || input.name.trim().length === 0) {
      return err(new InvalidTemplateError('Template name is required'));
    }
    if (input.name.length > MAX_NAME_LENGTH) {
      return err(new InvalidTemplateError(`Template name must be ${MAX_NAME_LENGTH} characters or less`));
    }

    // Validate content
    if (input.content.length > MAX_CONTENT_LENGTH) {
      return err(new InvalidTemplateError(`Template content must be ${MAX_CONTENT_LENGTH} characters or less`));
    }

    const now = Date.now();
    const template = new Template({
      id: generateUUID(),
      trigger: input.trigger.trim(),
      name: input.name.trim(),
      content: input.content,
      description: input.description?.trim(),
      categoryId: input.categoryId,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      isFavorite: false,
    });

    return ok(template);
  }

  /**
   * Reconstitute a template from stored props (no validation)
   */
  static fromProps(props: TemplateProps): Template {
    return new Template(props);
  }

  /**
   * Validate a trigger string
   */
  static validateTrigger(trigger: string): Result<string, InvalidTriggerError> {
    const trimmed = trigger.trim();

    if (trimmed.length < MIN_TRIGGER_LENGTH) {
      return err(new InvalidTriggerError(`Trigger must be at least ${MIN_TRIGGER_LENGTH} characters`));
    }

    if (trimmed.length > MAX_TRIGGER_LENGTH) {
      return err(new InvalidTriggerError(`Trigger must be ${MAX_TRIGGER_LENGTH} characters or less`));
    }

    // Triggers cannot contain whitespace
    if (/\s/.test(trimmed)) {
      return err(new InvalidTriggerError('Trigger cannot contain whitespace'));
    }

    return ok(trimmed);
  }

  /**
   * Update template properties
   */
  update(input: UpdateTemplateInput): Result<Template, InvalidTriggerError | InvalidTemplateError> {
    let newTrigger = this.props.trigger;
    let newName = this.props.name;
    let newContent = this.props.content;

    if (input.trigger !== undefined) {
      const triggerValidation = Template.validateTrigger(input.trigger);
      if (triggerValidation.isErr()) {
        return err(triggerValidation.error);
      }
      newTrigger = triggerValidation.value;
    }

    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        return err(new InvalidTemplateError('Template name is required'));
      }
      if (input.name.length > MAX_NAME_LENGTH) {
        return err(new InvalidTemplateError(`Template name must be ${MAX_NAME_LENGTH} characters or less`));
      }
      newName = input.name.trim();
    }

    if (input.content !== undefined) {
      if (input.content.length > MAX_CONTENT_LENGTH) {
        return err(new InvalidTemplateError(`Template content must be ${MAX_CONTENT_LENGTH} characters or less`));
      }
      newContent = input.content;
    }

    const updatedTemplate = new Template({
      ...this.props,
      trigger: newTrigger,
      name: newName,
      content: newContent,
      description: input.description !== undefined ? input.description?.trim() : this.props.description,
      categoryId: input.categoryId === null ? undefined : (input.categoryId ?? this.props.categoryId),
      tags: input.tags ?? this.props.tags,
      isFavorite: input.isFavorite ?? this.props.isFavorite,
      updatedAt: Date.now(),
    });

    return ok(updatedTemplate);
  }

  /**
   * Increment usage count
   */
  incrementUsage(): Template {
    return new Template({
      ...this.props,
      usageCount: this.props.usageCount + 1,
      updatedAt: Date.now(),
    });
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(): Template {
    return new Template({
      ...this.props,
      isFavorite: !this.props.isFavorite,
      updatedAt: Date.now(),
    });
  }

  /**
   * Convert to plain object for storage
   */
  toProps(): TemplateProps {
    return { ...this.props };
  }
}
