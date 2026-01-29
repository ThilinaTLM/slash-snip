import { ChromeStorageAdapter } from '@infrastructure/chrome/storage/ChromeStorageAdapter';
import { SettingsAdapter } from '@infrastructure/chrome/storage/SettingsAdapter';
import { ClipboardAdapter } from '@infrastructure/chrome/clipboard';
import { TemplateRepository } from '@infrastructure/persistence/TemplateRepository';
import { CategoryRepository } from '@infrastructure/persistence/CategoryRepository';
import { RecentTemplatesRepository } from '@infrastructure/persistence/RecentTemplatesRepository';
import {
  CreateTemplateUseCase,
  GetAllTemplatesUseCase,
  UpdateTemplateUseCase,
  DeleteTemplateUseCase,
  GetTemplateByTriggerUseCase,
  GetTemplateByIdUseCase,
  IncrementUsageUseCase,
  GetRecentTemplatesUseCase,
} from '@application/use-cases/templates';
import {
  CreateCategoryUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
  GetAllCategoriesUseCase,
} from '@application/use-cases/categories';
import {
  CreateGroupUseCase,
  UpdateGroupUseCase,
  DeleteGroupUseCase,
  GetAllGroupsUseCase,
} from '@application/use-cases/groups';
import { ImportBackupUseCase } from '@application/use-cases/import-export';
import { PlaceholderProcessor } from '@domain/services';
import { GroupRepository } from '@infrastructure/persistence/GroupRepository';
import type {
  ITemplateRepository,
  ICategoryRepository,
  IGroupRepository,
  IRecentTemplatesRepository,
} from '@domain/repositories';
import type { IClipboardPort, ISettingsPort } from '@application/ports';

/**
 * Simple DI container using factory functions
 * Creates singleton instances for the application
 */

// Infrastructure singletons
let storageAdapter: ChromeStorageAdapter | null = null;
let clipboardAdapter: IClipboardPort | null = null;
let settingsAdapter: ISettingsPort | null = null;
let templateRepository: ITemplateRepository | null = null;
let categoryRepository: ICategoryRepository | null = null;
let groupRepository: IGroupRepository | null = null;
let recentTemplatesRepository: IRecentTemplatesRepository | null = null;

// Domain service singletons
let placeholderProcessor: PlaceholderProcessor | null = null;

// Template use case singletons
let createTemplateUseCase: CreateTemplateUseCase | null = null;
let getAllTemplatesUseCase: GetAllTemplatesUseCase | null = null;
let updateTemplateUseCase: UpdateTemplateUseCase | null = null;
let deleteTemplateUseCase: DeleteTemplateUseCase | null = null;
let getTemplateByTriggerUseCase: GetTemplateByTriggerUseCase | null = null;
let getTemplateByIdUseCase: GetTemplateByIdUseCase | null = null;
let incrementUsageUseCase: IncrementUsageUseCase | null = null;
let getRecentTemplatesUseCase: GetRecentTemplatesUseCase | null = null;

// Category use case singletons
let createCategoryUseCase: CreateCategoryUseCase | null = null;
let updateCategoryUseCase: UpdateCategoryUseCase | null = null;
let deleteCategoryUseCase: DeleteCategoryUseCase | null = null;
let getAllCategoriesUseCase: GetAllCategoriesUseCase | null = null;

// Group use case singletons
let createGroupUseCase: CreateGroupUseCase | null = null;
let updateGroupUseCase: UpdateGroupUseCase | null = null;
let deleteGroupUseCase: DeleteGroupUseCase | null = null;
let getAllGroupsUseCase: GetAllGroupsUseCase | null = null;

// Import/Export use case singletons
let importBackupUseCase: ImportBackupUseCase | null = null;

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
 * Get or create SettingsAdapter instance
 */
export function getSettingsAdapter(): ISettingsPort {
  if (!settingsAdapter) {
    settingsAdapter = new SettingsAdapter(getStorageAdapter());
  }
  return settingsAdapter;
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
 * Get or create GroupRepository instance
 */
export function getGroupRepository(): IGroupRepository {
  if (!groupRepository) {
    groupRepository = new GroupRepository(getStorageAdapter());
  }
  return groupRepository;
}

/**
 * Get or create RecentTemplatesRepository instance
 */
export function getRecentTemplatesRepository(): IRecentTemplatesRepository {
  if (!recentTemplatesRepository) {
    recentTemplatesRepository = new RecentTemplatesRepository(
      getStorageAdapter()
    );
  }
  return recentTemplatesRepository;
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
    createTemplateUseCase = new CreateTemplateUseCase(
      getTemplateRepository(),
      getSettingsAdapter()
    );
  }
  return createTemplateUseCase;
}

/**
 * Get or create GetAllTemplatesUseCase instance
 */
export function getGetAllTemplatesUseCase(): GetAllTemplatesUseCase {
  if (!getAllTemplatesUseCase) {
    getAllTemplatesUseCase = new GetAllTemplatesUseCase(
      getTemplateRepository()
    );
  }
  return getAllTemplatesUseCase;
}

/**
 * Get or create UpdateTemplateUseCase instance
 */
export function getUpdateTemplateUseCase(): UpdateTemplateUseCase {
  if (!updateTemplateUseCase) {
    updateTemplateUseCase = new UpdateTemplateUseCase(
      getTemplateRepository(),
      getSettingsAdapter()
    );
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
    getTemplateByTriggerUseCase = new GetTemplateByTriggerUseCase(
      getTemplateRepository()
    );
  }
  return getTemplateByTriggerUseCase;
}

/**
 * Get or create GetTemplateByIdUseCase instance
 */
export function getGetTemplateByIdUseCase(): GetTemplateByIdUseCase {
  if (!getTemplateByIdUseCase) {
    getTemplateByIdUseCase = new GetTemplateByIdUseCase(
      getTemplateRepository()
    );
  }
  return getTemplateByIdUseCase;
}

/**
 * Get or create IncrementUsageUseCase instance
 */
export function getIncrementUsageUseCase(): IncrementUsageUseCase {
  if (!incrementUsageUseCase) {
    incrementUsageUseCase = new IncrementUsageUseCase(
      getTemplateRepository(),
      getRecentTemplatesRepository()
    );
  }
  return incrementUsageUseCase;
}

/**
 * Get or create GetRecentTemplatesUseCase instance
 */
export function getGetRecentTemplatesUseCase(): GetRecentTemplatesUseCase {
  if (!getRecentTemplatesUseCase) {
    getRecentTemplatesUseCase = new GetRecentTemplatesUseCase(
      getTemplateRepository(),
      getRecentTemplatesRepository()
    );
  }
  return getRecentTemplatesUseCase;
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
    getAllCategoriesUseCase = new GetAllCategoriesUseCase(
      getCategoryRepository()
    );
  }
  return getAllCategoriesUseCase;
}

/**
 * Get or create CreateGroupUseCase instance
 */
export function getCreateGroupUseCase(): CreateGroupUseCase {
  if (!createGroupUseCase) {
    createGroupUseCase = new CreateGroupUseCase(getGroupRepository());
  }
  return createGroupUseCase;
}

/**
 * Get or create UpdateGroupUseCase instance
 */
export function getUpdateGroupUseCase(): UpdateGroupUseCase {
  if (!updateGroupUseCase) {
    updateGroupUseCase = new UpdateGroupUseCase(getGroupRepository());
  }
  return updateGroupUseCase;
}

/**
 * Get or create DeleteGroupUseCase instance
 */
export function getDeleteGroupUseCase(): DeleteGroupUseCase {
  if (!deleteGroupUseCase) {
    deleteGroupUseCase = new DeleteGroupUseCase(getGroupRepository());
  }
  return deleteGroupUseCase;
}

/**
 * Get or create GetAllGroupsUseCase instance
 */
export function getGetAllGroupsUseCase(): GetAllGroupsUseCase {
  if (!getAllGroupsUseCase) {
    getAllGroupsUseCase = new GetAllGroupsUseCase(getGroupRepository());
  }
  return getAllGroupsUseCase;
}

/**
 * Get or create ImportBackupUseCase instance
 */
export function getImportBackupUseCase(): ImportBackupUseCase {
  if (!importBackupUseCase) {
    importBackupUseCase = new ImportBackupUseCase(
      getTemplateRepository(),
      getGroupRepository(),
      getSettingsAdapter()
    );
  }
  return importBackupUseCase;
}

/**
 * Container object with all factory functions
 */
export const container = {
  getStorageAdapter,
  getClipboardAdapter,
  getSettingsAdapter,
  getTemplateRepository,
  getCategoryRepository,
  getGroupRepository,
  getRecentTemplatesRepository,
  getPlaceholderProcessor,
  getCreateTemplateUseCase,
  getGetAllTemplatesUseCase,
  getUpdateTemplateUseCase,
  getDeleteTemplateUseCase,
  getGetTemplateByTriggerUseCase,
  getGetTemplateByIdUseCase,
  getIncrementUsageUseCase,
  getGetRecentTemplatesUseCase,
  getCreateCategoryUseCase,
  getUpdateCategoryUseCase,
  getDeleteCategoryUseCase,
  getGetAllCategoriesUseCase,
  getCreateGroupUseCase,
  getUpdateGroupUseCase,
  getDeleteGroupUseCase,
  getGetAllGroupsUseCase,
  getImportBackupUseCase,
};
