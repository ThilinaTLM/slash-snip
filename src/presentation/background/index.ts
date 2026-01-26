// Background Service Worker Entry Point
// Message routing and background tasks

import { MessageRouter } from '@infrastructure/chrome/messaging';
import { MESSAGE_TYPES } from '@shared/constants';
import type { MessageResponse } from '@shared/types';
import type { CreateTemplateDTO, UpdateTemplateDTO, TemplateDTO, CreateCategoryDTO, UpdateCategoryDTO, CategoryDTO } from '@application/dto';
import {
  getCreateTemplateUseCase,
  getGetAllTemplatesUseCase,
  getUpdateTemplateUseCase,
  getDeleteTemplateUseCase,
  getGetTemplateByTriggerUseCase,
  getCreateCategoryUseCase,
  getUpdateCategoryUseCase,
  getDeleteCategoryUseCase,
  getGetAllCategoriesUseCase,
} from '@di/container';

// Initialize message router
const router = new MessageRouter();

// Handle GET_TEMPLATES
router.on<void, TemplateDTO[]>(
  MESSAGE_TYPES.GET_TEMPLATES,
  async (): Promise<MessageResponse<TemplateDTO[]>> => {
    console.log('[SlashSnip BG] GET_TEMPLATES received');
    try {
      const useCase = getGetAllTemplatesUseCase();
      const templates = await useCase.execute();
      console.log('[SlashSnip BG] Templates found:', templates.length, templates);
      return { success: true, data: templates };
    } catch (error) {
      console.error('[SlashSnip BG] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get templates',
      };
    }
  }
);

// Handle CREATE_TEMPLATE
router.on<CreateTemplateDTO, TemplateDTO>(
  MESSAGE_TYPES.CREATE_TEMPLATE,
  async (payload): Promise<MessageResponse<TemplateDTO>> => {
    console.log('[SlashSnip BG] CREATE_TEMPLATE received:', payload);
    try {
      const useCase = getCreateTemplateUseCase();
      const result = await useCase.execute(payload);

      if (result.isErr()) {
        console.error('[SlashSnip BG] Create failed:', result.error.message);
        return { success: false, error: result.error.message };
      }

      console.log('[SlashSnip BG] Template created:', result.value);
      return { success: true, data: result.value };
    } catch (error) {
      console.error('[SlashSnip BG] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create template',
      };
    }
  }
);

// Handle UPDATE_TEMPLATE
router.on<UpdateTemplateDTO, TemplateDTO>(
  MESSAGE_TYPES.UPDATE_TEMPLATE,
  async (payload): Promise<MessageResponse<TemplateDTO>> => {
    console.log('[SlashSnip BG] UPDATE_TEMPLATE received:', payload);
    try {
      const useCase = getUpdateTemplateUseCase();
      const result = await useCase.execute(payload);

      if (result.isErr()) {
        console.error('[SlashSnip BG] Update failed:', result.error.message);
        return { success: false, error: result.error.message };
      }

      console.log('[SlashSnip BG] Template updated:', result.value);
      return { success: true, data: result.value };
    } catch (error) {
      console.error('[SlashSnip BG] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update template',
      };
    }
  }
);

// Handle DELETE_TEMPLATE
router.on<{ id: string }, void>(
  MESSAGE_TYPES.DELETE_TEMPLATE,
  async (payload): Promise<MessageResponse<void>> => {
    try {
      const useCase = getDeleteTemplateUseCase();
      const result = await useCase.execute(payload.id);

      if (result.isErr()) {
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template',
      };
    }
  }
);

// Handle GET_BY_TRIGGER
router.on<{ trigger: string }, TemplateDTO | null>(
  MESSAGE_TYPES.GET_BY_TRIGGER,
  async (payload): Promise<MessageResponse<TemplateDTO | null>> => {
    console.log('[SlashSnip BG] GET_BY_TRIGGER received:', payload);
    try {
      const useCase = getGetTemplateByTriggerUseCase();
      const template = await useCase.execute(payload.trigger);
      console.log('[SlashSnip BG] Template found:', template);
      return { success: true, data: template };
    } catch (error) {
      console.error('[SlashSnip BG] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get template',
      };
    }
  }
);

// ============ Category Handlers ============

// Handle GET_CATEGORIES
router.on<void, CategoryDTO[]>(
  MESSAGE_TYPES.GET_CATEGORIES,
  async (): Promise<MessageResponse<CategoryDTO[]>> => {
    console.log('[SlashSnip BG] GET_CATEGORIES received');
    try {
      const useCase = getGetAllCategoriesUseCase();
      const categories = await useCase.execute();
      console.log('[SlashSnip BG] Categories found:', categories.length);
      return { success: true, data: categories };
    } catch (error) {
      console.error('[SlashSnip BG] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get categories',
      };
    }
  }
);

// Handle CREATE_CATEGORY
router.on<CreateCategoryDTO, CategoryDTO>(
  MESSAGE_TYPES.CREATE_CATEGORY,
  async (payload): Promise<MessageResponse<CategoryDTO>> => {
    console.log('[SlashSnip BG] CREATE_CATEGORY received:', payload);
    try {
      const useCase = getCreateCategoryUseCase();
      const result = await useCase.execute(payload);

      if (result.isErr()) {
        console.error('[SlashSnip BG] Create category failed:', result.error.message);
        return { success: false, error: result.error.message };
      }

      console.log('[SlashSnip BG] Category created:', result.value);
      return { success: true, data: result.value };
    } catch (error) {
      console.error('[SlashSnip BG] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create category',
      };
    }
  }
);

// Handle UPDATE_CATEGORY
router.on<UpdateCategoryDTO, CategoryDTO>(
  MESSAGE_TYPES.UPDATE_CATEGORY,
  async (payload): Promise<MessageResponse<CategoryDTO>> => {
    console.log('[SlashSnip BG] UPDATE_CATEGORY received:', payload);
    try {
      const useCase = getUpdateCategoryUseCase();
      const result = await useCase.execute(payload);

      if (result.isErr()) {
        console.error('[SlashSnip BG] Update category failed:', result.error.message);
        return { success: false, error: result.error.message };
      }

      console.log('[SlashSnip BG] Category updated:', result.value);
      return { success: true, data: result.value };
    } catch (error) {
      console.error('[SlashSnip BG] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update category',
      };
    }
  }
);

// Handle DELETE_CATEGORY
router.on<{ id: string }, void>(
  MESSAGE_TYPES.DELETE_CATEGORY,
  async (payload): Promise<MessageResponse<void>> => {
    console.log('[SlashSnip BG] DELETE_CATEGORY received:', payload);
    try {
      const useCase = getDeleteCategoryUseCase();
      const result = await useCase.execute(payload.id);

      if (result.isErr()) {
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete category',
      };
    }
  }
);

// Start listening for messages
router.listen();

console.log('SlashSnip background service worker initialized');
