import type { ITemplateRepository } from '@domain/repositories';
import type { TemplateDTO } from '@application/dto/template.dto';
import { toTemplateDTO } from '@application/dto/template.dto';

export class GetAllTemplatesUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(): Promise<TemplateDTO[]> {
    const templates = await this.templateRepository.findAll();
    return templates.map(toTemplateDTO);
  }
}
