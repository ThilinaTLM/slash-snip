import { DEFAULT_GROUP_ID } from '@domain/entities';
import type { IGroupRepository } from '@domain/repositories';
import { GroupNotFoundError, InvalidGroupError } from '@domain/errors';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export class DeleteGroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(id: string): Promise<Result<void, GroupNotFoundError | InvalidGroupError>> {
    // Cannot delete the default group
    if (id === DEFAULT_GROUP_ID) {
      return err(new InvalidGroupError('Cannot delete the default group'));
    }

    // Check if the group exists
    const existingGroup = await this.groupRepository.findById(id);
    if (!existingGroup) {
      return err(new GroupNotFoundError(id));
    }

    // Delete from repository
    await this.groupRepository.delete(id);

    return ok(undefined);
  }
}
