// Background Service Worker Entry Point
// Message routing and background tasks

import { MessageRouter } from '@infrastructure/chrome/messaging';
import { contextMenuService } from '@infrastructure/chrome/context-menu';
import { commandsService } from '@infrastructure/chrome/commands';
import { MESSAGE_TYPES, STORAGE_KEYS } from '@shared/constants';
import type { MessageResponse } from '@shared/types';
import type { AppSettings } from '@shared/types/settings';
import { DEFAULT_SETTINGS } from '@shared/types/settings';
import type { CreateTemplateDTO, UpdateTemplateDTO, TemplateDTO, CreateCategoryDTO, UpdateCategoryDTO, CategoryDTO, CreateGroupDTO, UpdateGroupDTO, GroupDTO } from '@application/dto';
import type { SearchResult } from '@application/use-cases/templates/SearchTemplatesUseCase';
import {
  getCreateTemplateUseCase,
  getGetAllTemplatesUseCase,
  getUpdateTemplateUseCase,
  getDeleteTemplateUseCase,
  getGetTemplateByTriggerUseCase,
  getGetTemplateByIdUseCase,
  getIncrementUsageUseCase,
  getGetRecentTemplatesUseCase,
  getSearchTemplatesUseCase,
  getCreateCategoryUseCase,
  getUpdateCategoryUseCase,
  getDeleteCategoryUseCase,
  getGetAllCategoriesUseCase,
  getCreateGroupUseCase,
  getUpdateGroupUseCase,
  getDeleteGroupUseCase,
  getGetAllGroupsUseCase,
} from '@di/container';

// Initialize message router
const router = new MessageRouter();

/**
 * Load settings from Chrome storage
 */
async function loadSettings(): Promise<AppSettings> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    const stored = result[STORAGE_KEYS.SETTINGS] as Partial<AppSettings> | undefined;
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch (error) {
    console.error('[SlashSnip BG] Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

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
      const settings = await loadSettings();
      const useCase = getGetTemplateByTriggerUseCase();
      const template = await useCase.execute(payload.trigger, {
        caseSensitive: settings.caseSensitive,
      });
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

// Handle GET_BY_ID
router.on<{ id: string }, TemplateDTO | null>(
  MESSAGE_TYPES.GET_BY_ID,
  async (payload): Promise<MessageResponse<TemplateDTO | null>> => {
    console.log('[SlashSnip BG] GET_BY_ID received:', payload);
    try {
      const useCase = getGetTemplateByIdUseCase();
      const template = await useCase.execute(payload.id);
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

// Handle INCREMENT_USAGE
router.on<{ id: string }, TemplateDTO>(
  MESSAGE_TYPES.INCREMENT_USAGE,
  async (payload): Promise<MessageResponse<TemplateDTO>> => {
    console.log('[SlashSnip BG] INCREMENT_USAGE received:', payload);
    try {
      const useCase = getIncrementUsageUseCase();
      const result = await useCase.execute(payload.id);

      if (result.isErr()) {
        console.error('[SlashSnip BG] Increment usage failed:', result.error.message);
        return { success: false, error: result.error.message };
      }

      console.log('[SlashSnip BG] Usage incremented:', result.value);

      // Update context menus with new recents
      await refreshContextMenus();

      return { success: true, data: result.value };
    } catch (error) {
      console.error('[SlashSnip BG] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to increment usage',
      };
    }
  }
);

// Handle GET_RECENT_TEMPLATES
router.on<{ limit?: number }, TemplateDTO[]>(
  MESSAGE_TYPES.GET_RECENT_TEMPLATES,
  async (payload): Promise<MessageResponse<TemplateDTO[]>> => {
    console.log('[SlashSnip BG] GET_RECENT_TEMPLATES received:', payload);
    try {
      const useCase = getGetRecentTemplatesUseCase();
      const templates = await useCase.execute(payload?.limit);
      console.log('[SlashSnip BG] Recent templates found:', templates.length);
      return { success: true, data: templates };
    } catch (error) {
      console.error('[SlashSnip BG] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recent templates',
      };
    }
  }
);

// Handle SEARCH_TEMPLATES
router.on<{ query: string; limit?: number }, SearchResult[]>(
  MESSAGE_TYPES.SEARCH_TEMPLATES,
  async (payload): Promise<MessageResponse<SearchResult[]>> => {
    console.log('[SlashSnip BG] SEARCH_TEMPLATES received:', payload);
    try {
      const useCase = getSearchTemplatesUseCase();
      const results = await useCase.execute(payload.query, payload?.limit);
      console.log('[SlashSnip BG] Search results:', results.length);
      return { success: true, data: results };
    } catch (error) {
      console.error('[SlashSnip BG] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search templates',
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

// ============ Group Handlers ============

// Handle GET_GROUPS
router.on<void, GroupDTO[]>(
  MESSAGE_TYPES.GET_GROUPS,
  async (): Promise<MessageResponse<GroupDTO[]>> => {
    console.log('[SlashSnip BG] GET_GROUPS received');
    try {
      const useCase = getGetAllGroupsUseCase();
      const groups = await useCase.execute();
      console.log('[SlashSnip BG] Groups found:', groups.length);
      return { success: true, data: groups };
    } catch (error) {
      console.error('[SlashSnip BG] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get groups',
      };
    }
  }
);

// Handle CREATE_GROUP
router.on<CreateGroupDTO, GroupDTO>(
  MESSAGE_TYPES.CREATE_GROUP,
  async (payload): Promise<MessageResponse<GroupDTO>> => {
    console.log('[SlashSnip BG] CREATE_GROUP received:', payload);
    try {
      const useCase = getCreateGroupUseCase();
      const result = await useCase.execute(payload);

      if (result.isErr()) {
        console.error('[SlashSnip BG] Create group failed:', result.error.message);
        return { success: false, error: result.error.message };
      }

      console.log('[SlashSnip BG] Group created:', result.value);
      return { success: true, data: result.value };
    } catch (error) {
      console.error('[SlashSnip BG] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create group',
      };
    }
  }
);

// Handle UPDATE_GROUP
router.on<UpdateGroupDTO, GroupDTO>(
  MESSAGE_TYPES.UPDATE_GROUP,
  async (payload): Promise<MessageResponse<GroupDTO>> => {
    console.log('[SlashSnip BG] UPDATE_GROUP received:', payload);
    try {
      const useCase = getUpdateGroupUseCase();
      const result = await useCase.execute(payload);

      if (result.isErr()) {
        console.error('[SlashSnip BG] Update group failed:', result.error.message);
        return { success: false, error: result.error.message };
      }

      console.log('[SlashSnip BG] Group updated:', result.value);
      return { success: true, data: result.value };
    } catch (error) {
      console.error('[SlashSnip BG] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update group',
      };
    }
  }
);

// Handle DELETE_GROUP
router.on<{ id: string }, void>(
  MESSAGE_TYPES.DELETE_GROUP,
  async (payload): Promise<MessageResponse<void>> => {
    console.log('[SlashSnip BG] DELETE_GROUP received:', payload);
    try {
      const useCase = getDeleteGroupUseCase();
      const result = await useCase.execute(payload.id);

      if (result.isErr()) {
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete group',
      };
    }
  }
);

// Start listening for messages
router.listen();

// ============ Context Menu Setup ============

/**
 * Refresh context menus with recent templates
 */
async function refreshContextMenus(): Promise<void> {
  try {
    const recentUseCase = getGetRecentTemplatesUseCase();
    const recentTemplates = await recentUseCase.execute(5);
    await contextMenuService.updateMenus(recentTemplates);
  } catch (error) {
    console.error('[SlashSnip BG] Failed to refresh context menus:', error);
  }
}

// Store references for context menu click handling
let cachedRecents: TemplateDTO[] = [];

/**
 * Update cached templates for context menu click handling
 */
async function updateCachedMenuData(): Promise<void> {
  try {
    const recentUseCase = getGetRecentTemplatesUseCase();
    cachedRecents = await recentUseCase.execute(5);
    await contextMenuService.updateMenus(cachedRecents);
  } catch (error) {
    console.error('[SlashSnip BG] Failed to update cached menu data:', error);
  }
}

// Initialize context menus on install/startup
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[SlashSnip BG] Extension installed/updated');
  await contextMenuService.initialize();
  await updateCachedMenuData();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('[SlashSnip BG] Extension startup');
  await contextMenuService.initialize();
  await updateCachedMenuData();
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('[SlashSnip BG] Context menu clicked:', info.menuItemId);

  const action = contextMenuService.parseMenuItemId(
    info.menuItemId,
    cachedRecents
  );

  if (!action || !tab?.id) {
    return;
  }

  if (action.type === 'open-palette') {
    // Send message to content script to open command palette
    chrome.tabs.sendMessage(tab.id, {
      type: MESSAGE_TYPES.OPEN_COMMAND_PALETTE,
    });
  } else if (action.type === 'template') {
    // Get the full template and send to content script
    const templateUseCase = getGetTemplateByIdUseCase();
    const template = await templateUseCase.execute(action.templateId);

    if (template) {
      chrome.tabs.sendMessage(tab.id, {
        type: MESSAGE_TYPES.INSERT_TEMPLATE,
        payload: { template },
      });
    }
  }
});

// ============ Action Click Handler ============

// Open options page when extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// ============ Keyboard Commands ============

// Handle command palette keyboard shortcut
commandsService.on('open-command-palette', async () => {
  console.log('[SlashSnip BG] Open command palette command received');

  // Get the active tab and send message to content script
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: MESSAGE_TYPES.OPEN_COMMAND_PALETTE,
    });
  }
});

// Start listening for commands
commandsService.listen();

console.log('SlashSnip background service worker initialized');
