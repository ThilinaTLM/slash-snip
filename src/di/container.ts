import { ChromeStorageAdapter } from '@infrastructure/chrome/storage/ChromeStorageAdapter';
import { ClipboardAdapter } from '@infrastructure/chrome/clipboard';
import { TemplateRepository } from '@infrastructure/persistence/TemplateRepository';
import {
  CreateTemplateUseCase,
  GetAllTemplatesUseCase,
  DeleteTemplateUseCase,
  GetTemplateByTriggerUseCase,
} from '@application/use-cases/templates';
import { PlaceholderProcessor } from '@domain/services';
import type { ITemplateRepository } from '@domain/repositories';
import type { IClipboardPort } from '@application/ports';

/**
 * Simple DI container using factory functions
 * Creates singleton instances for the application
 */

// Infrastructure singletons
let storageAdapter: ChromeStorageAdapter | null = null;
let clipboardAdapter: IClipboardPort | null = null;
let templateRepository: ITemplateRepository | null = null;

// Domain service singletons
let placeholderProcessor: PlaceholderProcessor | null = null;

// Use case singletons
let createTemplateUseCase: CreateTemplateUseCase | null = null;
let getAllTemplatesUseCase: GetAllTemplatesUseCase | null = null;
let deleteTemplateUseCase: DeleteTemplateUseCase | null = null;
let getTemplateByTriggerUseCase: GetTemplateByTriggerUseCase | null = null;

/**
 * Get or create ChromeStorageAdapter instance
 */
export function getStorageAdapter(): ChromeStorageAdapter {
  if (!storageAdapter) {
    storageAdapter = new ChromeStorageAdapter();
  }
  return storageAdapter;
}

/**
 * Get or create ClipboardAdapter instance
 */
export function getClipboardAdapter(): IClipboardPort {
  if (!clipboardAdapter) {
    clipboardAdapter = new ClipboardAdapter();
  }
  return clipboardAdapter;
}

/**
 * Get or create TemplateRepository instance
 */
export function getTemplateRepository(): ITemplateRepository {
  if (!templateRepository) {
    templateRepository = new TemplateRepository(getStorageAdapter());
  }
  return templateRepository;
}

/**
 * Get or create PlaceholderProcessor instance
 */
export function getPlaceholderProcessor(): PlaceholderProcessor {
  if (!placeholderProcessor) {
    placeholderProcessor = new PlaceholderProcessor();
  }
  return placeholderProcessor;
}

/**
 * Get or create CreateTemplateUseCase instance
 */
export function getCreateTemplateUseCase(): CreateTemplateUseCase {
  if (!createTemplateUseCase) {
    createTemplateUseCase = new CreateTemplateUseCase(getTemplateRepository());
  }
  return createTemplateUseCase;
}

/**
 * Get or create GetAllTemplatesUseCase instance
 */
export function getGetAllTemplatesUseCase(): GetAllTemplatesUseCase {
  if (!getAllTemplatesUseCase) {
    getAllTemplatesUseCase = new GetAllTemplatesUseCase(getTemplateRepository());
  }
  return getAllTemplatesUseCase;
}

/**
 * Get or create DeleteTemplateUseCase instance
 */
export function getDeleteTemplateUseCase(): DeleteTemplateUseCase {
  if (!deleteTemplateUseCase) {
    deleteTemplateUseCase = new DeleteTemplateUseCase(getTemplateRepository());
  }
  return deleteTemplateUseCase;
}

/**
 * Get or create GetTemplateByTriggerUseCase instance
 */
export function getGetTemplateByTriggerUseCase(): GetTemplateByTriggerUseCase {
  if (!getTemplateByTriggerUseCase) {
    getTemplateByTriggerUseCase = new GetTemplateByTriggerUseCase(getTemplateRepository());
  }
  return getTemplateByTriggerUseCase;
}

/**
 * Container object with all factory functions
 */
export const container = {
  getStorageAdapter,
  getClipboardAdapter,
  getTemplateRepository,
  getPlaceholderProcessor,
  getCreateTemplateUseCase,
  getGetAllTemplatesUseCase,
  getDeleteTemplateUseCase,
  getGetTemplateByTriggerUseCase,
};

/**
 * Reset all singletons (useful for testing)
 */
export function resetContainer(): void {
  storageAdapter = null;
  clipboardAdapter = null;
  templateRepository = null;
  placeholderProcessor = null;
  createTemplateUseCase = null;
  getAllTemplatesUseCase = null;
  deleteTemplateUseCase = null;
  getTemplateByTriggerUseCase = null;
}
