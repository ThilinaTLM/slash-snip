import type { ITemplateRepository } from '@domain/repositories';
import type { TemplateDTO } from '@application/dto/template.dto';
import { toTemplateDTO } from '@application/dto/template.dto';

export class GetTemplateByIdUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(id: string): Promise<TemplateDTO | null> {
    const template = await this.templateRepository.findById(id);
    return template ? toTemplateDTO(template) : null;
  }
}
