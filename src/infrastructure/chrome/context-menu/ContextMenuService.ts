import type { TemplateDTO } from '@application/dto';

const MENU_ID_ROOT = 'slashsnip-insert';
const MENU_ID_RECENT = 'slashsnip-recent';
const MENU_ID_SEPARATOR = 'slashsnip-sep';
const MENU_ID_ALL = 'slashsnip-all';

/**
 * Service for managing Chrome context menus
 */
export class ContextMenuService {
  private isInitialized = false;

  /**
   * Initialize the context menu structure
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Remove all existing menus first
    await this.removeAll();

    // Create root menu item
    chrome.contextMenus.create({
      id: MENU_ID_ROOT,
      title: 'Insert Template',
      contexts: ['editable'],
    });

    this.isInitialized = true;
    console.log('[SlashSnip] Context menu initialized');
  }

  /**
   * Update context menu with recent templates
   */
  async updateMenus(recents: TemplateDTO[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Remove existing child menus
    await this.removeChildMenus();

    if (recents.length === 0) {
      // Show empty state
      chrome.contextMenus.create({
        id: 'slashsnip-empty',
        parentId: MENU_ID_ROOT,
        title: 'No templates yet',
        enabled: false,
        contexts: ['editable'],
      });
      return;
    }

    // Add recents section
    chrome.contextMenus.create({
      id: MENU_ID_RECENT,
      parentId: MENU_ID_ROOT,
      title: 'Recent',
      enabled: false,
      contexts: ['editable'],
    });

    recents.slice(0, 5).forEach((template, index) => {
      chrome.contextMenus.create({
        id: `slashsnip-recent-${index}`,
        parentId: MENU_ID_ROOT,
        title: `${template.trigger} - ${this.truncate(template.name, 30)}`,
        contexts: ['editable'],
      });
    });

    // Add "All templates" option
    chrome.contextMenus.create({
      id: MENU_ID_SEPARATOR,
      parentId: MENU_ID_ROOT,
      type: 'separator',
      contexts: ['editable'],
    });

    chrome.contextMenus.create({
      id: MENU_ID_ALL,
      parentId: MENU_ID_ROOT,
      title: 'Search all templates...',
      contexts: ['editable'],
    });

    console.log('[SlashSnip] Context menus updated:', recents.length, 'recents');
  }

  /**
   * Handle context menu click
   * Returns template ID or 'open-palette' or null
   */
  parseMenuItemId(
    menuItemId: string | number,
    recents: TemplateDTO[]
  ): { type: 'template'; templateId: string } | { type: 'open-palette' } | null {
    const id = String(menuItemId);

    if (id === MENU_ID_ALL) {
      return { type: 'open-palette' };
    }

    if (id.startsWith('slashsnip-recent-')) {
      const index = parseInt(id.replace('slashsnip-recent-', ''), 10);
      if (index >= 0 && index < recents.length) {
        return { type: 'template', templateId: recents[index].id };
      }
    }

    return null;
  }

  /**
   * Remove all context menus
   */
  async removeAll(): Promise<void> {
    return new Promise((resolve) => {
      chrome.contextMenus.removeAll(() => {
        this.isInitialized = false;
        resolve();
      });
    });
  }

  /**
   * Remove child menus (keep root)
   */
  private async removeChildMenus(): Promise<void> {
    const childIds = [
      MENU_ID_RECENT,
      MENU_ID_SEPARATOR,
      MENU_ID_ALL,
      'slashsnip-empty',
    ];

    // Also remove numbered items
    for (let i = 0; i < 10; i++) {
      childIds.push(`slashsnip-recent-${i}`);
    }

    for (const id of childIds) {
      try {
        await new Promise<void>((resolve) => {
          chrome.contextMenus.remove(id, () => {
            // Ignore errors for non-existent items
            chrome.runtime.lastError;
            resolve();
          });
        });
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Truncate text to max length
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }
}

// Export singleton
export const contextMenuService = new ContextMenuService();
