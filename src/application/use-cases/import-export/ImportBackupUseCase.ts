import type { ITemplateRepository, IGroupRepository } from '@domain/repositories';
import type { ISettingsPort } from '@application/ports';
import { Template, Group } from '@domain/entities';
import type { TemplateDTO } from '@application/dto';
import { validateBackup, type BackupData } from './validateBackup';

export type ConflictResolution = 'replace' | 'skip' | 'keep_both';

export interface ImportOptions {
  conflictResolution: ConflictResolution;
}

export interface ConflictInfo {
  importedTrigger: string;
  importedName: string;
  existingId: string;
  existingName: string;
}

export interface ImportResult {
  templatesImported: number;
  templatesSkipped: number;
  templatesReplaced: number;
  groupsImported: number;
  errors: string[];
}

export interface PreviewResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  templateCount: number;
  groupCount: number;
  conflicts: ConflictInfo[];
  data?: BackupData;
}

export class ImportBackupUseCase {
  constructor(
    private templateRepository: ITemplateRepository,
    private groupRepository: IGroupRepository,
    private settingsPort?: ISettingsPort
  ) {}

  /**
   * Preview the import to detect conflicts and validate the backup
   */
  async preview(rawData: unknown): Promise<PreviewResult> {
    // Validate the backup structure
    const validation = validateBackup(rawData);
    if (!validation.valid || !validation.data) {
      return {
        valid: false,
        errors: validation.errors.map(e => `${e.field}: ${e.message}`),
        warnings: validation.warnings.map(w => `${w.field}: ${w.message}`),
        templateCount: 0,
        groupCount: 0,
        conflicts: [],
      };
    }

    const backupData = validation.data;
    const conflicts: ConflictInfo[] = [];

    // Load settings for case sensitivity
    const settings = await this.settingsPort?.getSettings();
    const caseSensitive = settings?.caseSensitive ?? true;

    // Check for trigger conflicts
    for (const templateDTO of backupData.templates) {
      const existing = await this.templateRepository.findByTrigger(templateDTO.trigger, {
        caseSensitive,
      });

      if (existing) {
        conflicts.push({
          importedTrigger: templateDTO.trigger,
          importedName: templateDTO.name,
          existingId: existing.id,
          existingName: existing.name,
        });
      }
    }

    return {
      valid: true,
      errors: [],
      warnings: validation.warnings.map(w => `${w.field}: ${w.message}`),
      templateCount: backupData.templates.length,
      groupCount: backupData.groups.length,
      conflicts,
      data: backupData,
    };
  }

  /**
   * Execute the import with the specified conflict resolution
   */
  async execute(backupData: BackupData, options: ImportOptions): Promise<ImportResult> {
    const result: ImportResult = {
      templatesImported: 0,
      templatesSkipped: 0,
      templatesReplaced: 0,
      groupsImported: 0,
      errors: [],
    };

    // Load settings for case sensitivity
    const settings = await this.settingsPort?.getSettings();
    const caseSensitive = settings?.caseSensitive ?? true;

    // Import groups first
    for (const groupDTO of backupData.groups) {
      try {
        // Check if group with same ID exists
        const existingById = await this.groupRepository.findById(groupDTO.id);

        if (existingById) {
          // Group already exists, skip to avoid duplicates
          continue;
        }

        // Create group from DTO
        const group = Group.fromProps({
          id: groupDTO.id,
          name: groupDTO.name,
          order: groupDTO.order,
        });

        await this.groupRepository.save(group);
        result.groupsImported++;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to import group "${groupDTO.name}": ${message}`);
      }
    }

    // Import templates
    for (const templateDTO of backupData.templates) {
      try {
        // Check for existing template with same trigger
        const existingByTrigger = await this.templateRepository.findByTrigger(templateDTO.trigger, {
          caseSensitive,
        });

        if (existingByTrigger) {
          switch (options.conflictResolution) {
            case 'skip':
              result.templatesSkipped++;
              continue;

            case 'replace':
              // Delete existing and import new
              await this.templateRepository.delete(existingByTrigger.id);
              await this.importTemplate(templateDTO);
              result.templatesReplaced++;
              break;

            case 'keep_both': {
              // Modify trigger and import
              const newTrigger = await this.generateUniqueTrigger(templateDTO.trigger, caseSensitive);
              await this.importTemplate({ ...templateDTO, trigger: newTrigger });
              result.templatesImported++;
              break;
            }
          }
        } else {
          // No conflict, import directly
          await this.importTemplate(templateDTO);
          result.templatesImported++;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to import template "${templateDTO.name}": ${message}`);
      }
    }

    return result;
  }

  /**
   * Import a single template from DTO
   */
  private async importTemplate(dto: TemplateDTO): Promise<void> {
    const template = Template.fromProps({
      id: dto.id,
      trigger: dto.trigger,
      name: dto.name,
      content: dto.content,
      description: dto.description,
      categoryId: dto.categoryId,
      tags: dto.tags,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      usageCount: dto.usageCount,
    });

    await this.templateRepository.save(template);
  }

  /**
   * Generate a unique trigger by appending a number suffix
   */
  private async generateUniqueTrigger(baseTrigger: string, caseSensitive: boolean): Promise<string> {
    let counter = 2;
    let newTrigger = `${baseTrigger}_${counter}`;

    while (await this.templateRepository.existsByTrigger(newTrigger, { caseSensitive })) {
      counter++;
      newTrigger = `${baseTrigger}_${counter}`;
    }

    return newTrigger;
  }
}
