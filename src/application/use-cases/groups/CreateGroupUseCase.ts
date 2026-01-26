import { Group } from '@domain/entities';
import type { IGroupRepository } from '@domain/repositories';
import { DuplicateGroupNameError, InvalidGroupError } from '@domain/errors';
import type { CreateGroupDTO, GroupDTO } from '@application/dto';
import { toGroupDTO } from '@application/dto';
import type { Result } from '@shared/utils/result';
import { ok, err } from '@shared/utils/result';

export class CreateGroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(
    dto: CreateGroupDTO
  ): Promise<Result<GroupDTO, InvalidGroupError | DuplicateGroupNameError>> {
    // Check if name already exists
    const nameExists = await this.groupRepository.existsByName(dto.name);
    if (nameExists) {
      return err(new DuplicateGroupNameError(dto.name));
    }

    // Create the group entity
    const groupResult = Group.create({
      name: dto.name,
      order: dto.order,
    });

    if (groupResult.isErr()) {
      return err(groupResult.error);
    }

    const group = groupResult.value;

    // Save to repository
    await this.groupRepository.save(group);

    // Return DTO
    return ok(toGroupDTO(group));
  }
}
