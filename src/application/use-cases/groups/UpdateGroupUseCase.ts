import type { IGroupRepository } from '@domain/repositories';
import { GroupNotFoundError, DuplicateGroupNameError, InvalidGroupError } from '@domain/errors';
import type { UpdateGroupDTO, GroupDTO } from '@application/dto';
import { toGroupDTO } from '@application/dto';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export class UpdateGroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(
    dto: UpdateGroupDTO
  ): Promise<Result<GroupDTO, GroupNotFoundError | InvalidGroupError | DuplicateGroupNameError>> {
    // Find the existing group
    const existingGroup = await this.groupRepository.findById(dto.id);
    if (!existingGroup) {
      return err(new GroupNotFoundError(dto.id));
    }

    // Check for duplicate name if name is being changed
    if (dto.name !== undefined && dto.name !== existingGroup.name) {
      const nameExists = await this.groupRepository.existsByName(dto.name, dto.id);
      if (nameExists) {
        return err(new DuplicateGroupNameError(dto.name));
      }
    }

    // Update the group
    const updateResult = existingGroup.update({
      name: dto.name,
      order: dto.order,
    });

    if (updateResult.isErr()) {
      return err(updateResult.error);
    }

    const updatedGroup = updateResult.value;

    // Save to repository
    await this.groupRepository.save(updatedGroup);

    // Return DTO
    return ok(toGroupDTO(updatedGroup));
  }
}
