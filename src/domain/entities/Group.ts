import { generateUUID } from '@shared/utils';
import { InvalidGroupError } from '../errors';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export const MAX_GROUP_NAME_LENGTH = 50;
export const DEFAULT_GROUP_ID = 'default';
export const DEFAULT_GROUP_NAME = 'Default';

export interface GroupProps {
  id: string;
  name: string;
  order: number;
}

export interface CreateGroupInput {
  name: string;
  order?: number;
}

export interface UpdateGroupInput {
  name?: string;
  order?: number;
}

export class Group {
  private readonly props: GroupProps;

  private constructor(props: GroupProps) {
    this.props = props;
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get order(): number {
    return this.props.order;
  }

  /**
   * Factory method to create a new group
   */
  static create(input: CreateGroupInput): Result<Group, InvalidGroupError> {
    // Validate name
    const nameValidation = Group.validateName(input.name);
    if (nameValidation.isErr()) {
      return err(nameValidation.error);
    }

    const group = new Group({
      id: generateUUID(),
      name: nameValidation.value,
      order: input.order ?? 0,
    });

    return ok(group);
  }

  /**
   * Create the default group
   */
  static createDefault(): Group {
    return new Group({
      id: DEFAULT_GROUP_ID,
      name: DEFAULT_GROUP_NAME,
      order: 0,
    });
  }

  /**
   * Reconstitute a group from stored props (no validation)
   */
  static fromProps(props: GroupProps): Group {
    return new Group(props);
  }

  /**
   * Validate a group name
   */
  static validateName(name: string): Result<string, InvalidGroupError> {
    const trimmed = name.trim();

    if (!trimmed || trimmed.length === 0) {
      return err(new InvalidGroupError('Group name is required'));
    }

    if (trimmed.length > MAX_GROUP_NAME_LENGTH) {
      return err(new InvalidGroupError(`Group name must be ${MAX_GROUP_NAME_LENGTH} characters or less`));
    }

    return ok(trimmed);
  }

  /**
   * Update group properties
   */
  update(input: UpdateGroupInput): Result<Group, InvalidGroupError> {
    let newName = this.props.name;

    if (input.name !== undefined) {
      const nameValidation = Group.validateName(input.name);
      if (nameValidation.isErr()) {
        return err(nameValidation.error);
      }
      newName = nameValidation.value;
    }

    const updatedGroup = new Group({
      ...this.props,
      name: newName,
      order: input.order ?? this.props.order,
    });

    return ok(updatedGroup);
  }

  /**
   * Convert to plain object for storage
   */
  toProps(): GroupProps {
    return { ...this.props };
  }
}
