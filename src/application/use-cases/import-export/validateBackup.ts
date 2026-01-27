import type { TemplateDTO, GroupDTO } from '@application/dto';

export const SUPPORTED_BACKUP_VERSION = '1.0';

export interface BackupData {
  version: string;
  exportedAt: string;
  templates: TemplateDTO[];
  groups: GroupDTO[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  data?: BackupData;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateTemplate(template: unknown, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `templates[${index}]`;

  if (!isObject(template)) {
    errors.push({ field: prefix, message: 'Template must be an object' });
    return errors;
  }

  if (typeof template.id !== 'string' || template.id.trim() === '') {
    errors.push({ field: `${prefix}.id`, message: 'Template id must be a non-empty string' });
  }

  if (typeof template.trigger !== 'string' || template.trigger.trim() === '') {
    errors.push({ field: `${prefix}.trigger`, message: 'Template trigger must be a non-empty string' });
  }

  if (typeof template.name !== 'string' || template.name.trim() === '') {
    errors.push({ field: `${prefix}.name`, message: 'Template name must be a non-empty string' });
  }

  if (typeof template.content !== 'string') {
    errors.push({ field: `${prefix}.content`, message: 'Template content must be a string' });
  }

  if (template.groupId !== undefined && typeof template.groupId !== 'string') {
    errors.push({ field: `${prefix}.groupId`, message: 'Template groupId must be a string if provided' });
  }

  if (!Array.isArray(template.tags)) {
    errors.push({ field: `${prefix}.tags`, message: 'Template tags must be an array' });
  } else if (template.tags.some((tag: unknown) => typeof tag !== 'string')) {
    errors.push({ field: `${prefix}.tags`, message: 'Template tags must all be strings' });
  }

  if (typeof template.createdAt !== 'number') {
    errors.push({ field: `${prefix}.createdAt`, message: 'Template createdAt must be a number' });
  }

  if (typeof template.updatedAt !== 'number') {
    errors.push({ field: `${prefix}.updatedAt`, message: 'Template updatedAt must be a number' });
  }

  if (typeof template.usageCount !== 'number') {
    errors.push({ field: `${prefix}.usageCount`, message: 'Template usageCount must be a number' });
  }

  return errors;
}

function validateGroup(group: unknown, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `groups[${index}]`;

  if (!isObject(group)) {
    errors.push({ field: prefix, message: 'Group must be an object' });
    return errors;
  }

  if (typeof group.id !== 'string' || group.id.trim() === '') {
    errors.push({ field: `${prefix}.id`, message: 'Group id must be a non-empty string' });
  }

  if (typeof group.name !== 'string' || group.name.trim() === '') {
    errors.push({ field: `${prefix}.name`, message: 'Group name must be a non-empty string' });
  }

  if (typeof group.order !== 'number') {
    errors.push({ field: `${prefix}.order`, message: 'Group order must be a number' });
  }

  return errors;
}

export function validateBackup(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check that data is an object
  if (!isObject(data)) {
    return {
      valid: false,
      errors: [{ field: 'root', message: 'Backup data must be an object' }],
      warnings: [],
    };
  }

  // Check version field
  if (typeof data.version !== 'string') {
    errors.push({ field: 'version', message: 'Version field must be a string' });
  } else if (data.version !== SUPPORTED_BACKUP_VERSION) {
    warnings.push({
      field: 'version',
      message: `Backup version "${data.version}" differs from current version "${SUPPORTED_BACKUP_VERSION}"`,
    });
  }

  // Check exportedAt field
  if (typeof data.exportedAt !== 'string') {
    errors.push({ field: 'exportedAt', message: 'exportedAt field must be a string' });
  }

  // Check templates array
  if (!Array.isArray(data.templates)) {
    errors.push({ field: 'templates', message: 'Templates must be an array' });
  } else {
    for (let i = 0; i < data.templates.length; i++) {
      errors.push(...validateTemplate(data.templates[i], i));
    }
  }

  // Check groups array
  if (!Array.isArray(data.groups)) {
    errors.push({ field: 'groups', message: 'Groups must be an array' });
  } else {
    for (let i = 0; i < data.groups.length; i++) {
      errors.push(...validateGroup(data.groups[i], i));
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  return {
    valid: true,
    errors: [],
    warnings,
    data: data as unknown as BackupData,
  };
}
