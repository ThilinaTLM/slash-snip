import { ChromeStorageAdapter } from '@infrastructure/chrome/storage/ChromeStorageAdapter';
import { ClipboardAdapter } from '@infrastructure/chrome/clipboard';
import { TemplateRepository } from '@infrastructure/persistence/TemplateRepository';
import { CategoryRepository } from '@infrastructure/persistence/CategoryRepository';
import {
  CreateTemplateUseCase,
  GetAllTemplatesUseCase,
  UpdateTemplateUseCase,
  DeleteTemplateUseCase,
  GetTemplateByTriggerUseCase,
} from '@application/use-cases/templates';
import {
  CreateCategoryUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
  GetAllCategoriesUseCase,
} from '@application/use-cases/categories';
import { PlaceholderProcessor } from '@domain/services';
import type { ITemplateRepository, ICategoryRepository } from '@domain/repositories';
import type { IClipboardPort } from '@application/ports';

/**
 * Simple DI container using factory functions
 * Creates singleton instances for the application
 */

// Infrastructure singletons
let storageAdapter: ChromeStorageAdapter | null = null;
let clipboardAdapter: IClipboardPort | null = null;
let templateRepository: ITemplateRepository | null = null;
let categoryRepository: ICategoryRepository | null = null;

// Domain service singletons
let placeholderProcessor: PlaceholderProcessor | null = null;

// Template use case singletons
let createTemplateUseCase: CreateTemplateUseCase | null = null;
let getAllTemplatesUseCase: GetAllTemplatesUseCase | null = null;
let updateTemplateUseCase: UpdateTemplateUseCase | null = null;
let deleteTemplateUseCase: DeleteTemplateUseCase | null = null;
let getTemplateByTriggerUseCase: GetTemplateByTriggerUseCase | null = null;

// Category use case singletons
let createCategoryUseCase: CreateCategoryUseCase | null = null;
let updateCategoryUseCase: UpdateCategoryUseCase | null = null;
let deleteCategoryUseCase: DeleteCategoryUseCase | null = null;
let getAllCategoriesUseCase: GetAllCategoriesUseCase | null = null;

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
 * Get or create CategoryRepository instance
 */
export function getCategoryRepository(): ICategoryRepository {
  if (!categoryRepository) {
    categoryRepository = new CategoryRepository(getStorageAdapter());
  }
  return categoryRepository;
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
 * Get or create UpdateTemplateUseCase instance
 */
export function getUpdateTemplateUseCase(): UpdateTemplateUseCase {
  if (!updateTemplateUseCase) {
    updateTemplateUseCase = new UpdateTemplateUseCase(getTemplateRepository());
  }
  return updateTemplateUseCase;
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
 * Get or create CreateCategoryUseCase instance
 */
export function getCreateCategoryUseCase(): CreateCategoryUseCase {
  if (!createCategoryUseCase) {
    createCategoryUseCase = new CreateCategoryUseCase(getCategoryRepository());
  }
  return createCategoryUseCase;
}

/**
 * Get or create UpdateCategoryUseCase instance
 */
export function getUpdateCategoryUseCase(): UpdateCategoryUseCase {
  if (!updateCategoryUseCase) {
    updateCategoryUseCase = new UpdateCategoryUseCase(getCategoryRepository());
  }
  return updateCategoryUseCase;
}

/**
 * Get or create DeleteCategoryUseCase instance
 */
export function getDeleteCategoryUseCase(): DeleteCategoryUseCase {
  if (!deleteCategoryUseCase) {
    deleteCategoryUseCase = new DeleteCategoryUseCase(getCategoryRepository());
  }
  return deleteCategoryUseCase;
}

/**
 * Get or create GetAllCategoriesUseCase instance
 */
export function getGetAllCategoriesUseCase(): GetAllCategoriesUseCase {
  if (!getAllCategoriesUseCase) {
    getAllCategoriesUseCase = new GetAllCategoriesUseCase(getCategoryRepository());
  }
  return getAllCategoriesUseCase;
}

/**
 * Container object with all factory functions
 */
export const container = {
  getStorageAdapter,
  getClipboardAdapter,
  getTemplateRepository,
  getCategoryRepository,
  getPlaceholderProcessor,
  getCreateTemplateUseCase,
  getGetAllTemplatesUseCase,
  getUpdateTemplateUseCase,
  getDeleteTemplateUseCase,
  getGetTemplateByTriggerUseCase,
  getCreateCategoryUseCase,
  getUpdateCategoryUseCase,
  getDeleteCategoryUseCase,
  getGetAllCategoriesUseCase,
};

/**
 * Reset all singletons (useful for testing)
 */
export function resetContainer(): void {
  storageAdapter = null;
  clipboardAdapter = null;
  templateRepository = null;
  categoryRepository = null;
  placeholderProcessor = null;
  createTemplateUseCase = null;
  getAllTemplatesUseCase = null;
  updateTemplateUseCase = null;
  deleteTemplateUseCase = null;
  getTemplateByTriggerUseCase = null;
  createCategoryUseCase = null;
  updateCategoryUseCase = null;
  deleteCategoryUseCase = null;
  getAllCategoriesUseCase = null;
}
