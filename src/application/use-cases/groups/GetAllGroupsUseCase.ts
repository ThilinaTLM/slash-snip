import type { IGroupRepository } from '@domain/repositories';
import type { GroupDTO } from '@application/dto';
import { toGroupDTO } from '@application/dto';

export class GetAllGroupsUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(): Promise<GroupDTO[]> {
    // Ensure default group exists
    await this.groupRepository.ensureDefaultGroup();

    const groups = await this.groupRepository.findAll();
    return groups.map(toGroupDTO).sort((a, b) => a.order - b.order);
  }
}
