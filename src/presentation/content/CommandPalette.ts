import { sendMessage } from '@infrastructure/chrome/messaging';
import { MESSAGE_TYPES } from '@shared/constants';
import type { TemplateDTO } from '@application/dto';
import type { SearchResult } from '@application/use-cases/templates/SearchTemplatesUseCase';

export interface CommandPaletteResult {
  cancelled: boolean;
  template: TemplateDTO | null;
}

/**
 * Shadow DOM command palette for quick template access
 */
export class CommandPalette {
  private container: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private resolvePromise: ((result: CommandPaletteResult) => void) | null = null;
  private searchInput: HTMLInputElement | null = null;
  private resultsList: HTMLUListElement | null = null;
  private previewPane: HTMLDivElement | null = null;
  private results: SearchResult[] = [];
  private selectedIndex = 0;
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Show the command palette and return selected template
   */
  async show(): Promise<CommandPaletteResult> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.render();
      this.loadInitialResults();
    });
  }

  /**
   * Close the command palette without selection
   */
  close(): void {
    this.cancel();
  }

  /**
   * Render the command palette in Shadow DOM
   */
  private render(): void {
    // Create container and shadow root
    this.container = document.createElement('div');
    this.container.id = 'slashsnip-command-palette-container';
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadowRoot.appendChild(style);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.cancel();
      }
    });

    // Create palette container
    const palette = document.createElement('div');
    palette.className = 'palette';
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-modal', 'true');
    palette.setAttribute('aria-label', 'Command Palette');

    // Search input container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const searchIcon = document.createElement('span');
    searchIcon.className = 'search-icon';
    searchIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="7" cy="7" r="5"/>
      <path d="M11 11L14 14"/>
    </svg>`;
    searchContainer.appendChild(searchIcon);

    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.className = 'search-input';
    this.searchInput.placeholder = 'Search templates...';
    this.searchInput.autocomplete = 'off';
    this.searchInput.spellcheck = false;
    this.searchInput.addEventListener('input', () => this.handleSearchInput());
    this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
    searchContainer.appendChild(this.searchInput);

    palette.appendChild(searchContainer);

    // Content area (results + preview)
    const contentArea = document.createElement('div');
    contentArea.className = 'content-area';

    // Results list
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'results-container';

    this.resultsList = document.createElement('ul');
    this.resultsList.className = 'results-list';
    this.resultsList.setAttribute('role', 'listbox');
    resultsContainer.appendChild(this.resultsList);

    contentArea.appendChild(resultsContainer);

    // Preview pane
    this.previewPane = document.createElement('div');
    this.previewPane.className = 'preview-pane';
    contentArea.appendChild(this.previewPane);

    palette.appendChild(contentArea);

    // Footer with keyboard hints
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.innerHTML = `
      <span class="hint"><kbd>↑↓</kbd> Navigate</span>
      <span class="hint"><kbd>Enter</kbd> Insert</span>
      <span class="hint"><kbd>Esc</kbd> Close</span>
    `;
    palette.appendChild(footer);

    overlay.appendChild(palette);
    this.shadowRoot.appendChild(overlay);

    // Append to body
    document.body.appendChild(this.container);

    // Focus search input
    requestAnimationFrame(() => {
      this.searchInput?.focus();
    });

    // Add global keyboard handler
    this.handleGlobalKeydown = this.handleGlobalKeydown.bind(this);
    document.addEventListener('keydown', this.handleGlobalKeydown, true);
  }

  /**
   * Load initial results (favorites and recent)
   */
  private async loadInitialResults(): Promise<void> {
    try {
      const response = await sendMessage<{ query: string }, SearchResult[]>(
        MESSAGE_TYPES.SEARCH_TEMPLATES,
        { query: '' }
      );

      if (response.success && response.data) {
        this.results = response.data;
        this.selectedIndex = 0;
        this.renderResults();
        this.updatePreview();
      }
    } catch (error) {
      console.error('[SlashSnip] Failed to load templates:', error);
    }
  }

  /**
   * Handle search input changes
   */
  private handleSearchInput(): void {
    // Debounce search
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.performSearch();
    }, 100);
  }

  /**
   * Perform search query
   */
  private async performSearch(): Promise<void> {
    const query = this.searchInput?.value ?? '';

    try {
      const response = await sendMessage<{ query: string }, SearchResult[]>(
        MESSAGE_TYPES.SEARCH_TEMPLATES,
        { query }
      );

      if (response.success && response.data) {
        this.results = response.data;
        this.selectedIndex = 0;
        this.renderResults();
        this.updatePreview();
      }
    } catch (error) {
      console.error('[SlashSnip] Search failed:', error);
    }
  }

  /**
   * Render search results
   */
  private renderResults(): void {
    const resultsList = this.resultsList;
    if (!resultsList) return;

    resultsList.innerHTML = '';

    if (this.results.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent = 'No templates found';
      resultsList.appendChild(empty);
      return;
    }

    this.results.forEach((result, index) => {
      const item = document.createElement('li');
      item.className = `result-item ${index === this.selectedIndex ? 'selected' : ''}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', index === this.selectedIndex ? 'true' : 'false');
      item.dataset.index = String(index);

      const template = result.template;

      item.innerHTML = `
        <div class="result-main">
          <span class="result-trigger">${this.escapeHtml(template.trigger)}</span>
          <span class="result-name">${this.escapeHtml(template.name)}</span>
        </div>
        <div class="result-preview">${this.escapeHtml(this.truncate(template.content, 60))}</div>
      `;

      item.addEventListener('click', () => this.selectItem(index));
      item.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.updateSelection();
        this.updatePreview();
      });

      resultsList.appendChild(item);
    });
  }

  /**
   * Update preview pane with selected template
   */
  private updatePreview(): void {
    if (!this.previewPane) return;

    if (this.results.length === 0 || this.selectedIndex >= this.results.length) {
      this.previewPane.innerHTML = `
        <div class="preview-empty">
          <p>Select a template to preview</p>
        </div>
      `;
      return;
    }

    const template = this.results[this.selectedIndex].template;

    this.previewPane.innerHTML = `
      <div class="preview-header">
        <span class="preview-trigger">${this.escapeHtml(template.trigger)}</span>
      </div>
      <div class="preview-name">${this.escapeHtml(template.name)}</div>
      <div class="preview-content"><pre>${this.escapeHtml(template.content)}</pre></div>
      <div class="preview-meta">
        ${template.usageCount > 0 ? `<span>Used ${template.usageCount} time${template.usageCount !== 1 ? 's' : ''}</span>` : ''}
        ${template.tags.length > 0 ? `<span class="tags">${template.tags.map(t => `<span class="tag">${this.escapeHtml(t)}</span>`).join('')}</span>` : ''}
      </div>
    `;
  }

  /**
   * Update visual selection state
   */
  private updateSelection(): void {
    if (!this.resultsList) return;

    const items = this.resultsList.querySelectorAll('.result-item');
    items.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;
      item.classList.toggle('selected', isSelected);
      item.setAttribute('aria-selected', isSelected ? 'true' : 'false');

      // Scroll into view if needed
      if (isSelected) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (this.results.length > 0) {
          this.selectedIndex = (this.selectedIndex + 1) % this.results.length;
          this.updateSelection();
          this.updatePreview();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (this.results.length > 0) {
          this.selectedIndex = (this.selectedIndex - 1 + this.results.length) % this.results.length;
          this.updateSelection();
          this.updatePreview();
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (this.results.length > 0 && this.selectedIndex < this.results.length) {
          this.selectItem(this.selectedIndex);
        }
        break;

      case 'Escape':
        e.preventDefault();
        this.cancel();
        break;
    }
  }

  /**
   * Handle global keydown for escape
   */
  private handleGlobalKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.cancel();
    }
  }

  /**
   * Select an item and resolve
   */
  private selectItem(index: number): void {
    if (index >= 0 && index < this.results.length) {
      const template = this.results[index].template;
      this.cleanup();
      this.resolvePromise?.({ cancelled: false, template });
    }
  }

  /**
   * Cancel and close
   */
  private cancel(): void {
    this.cleanup();
    this.resolvePromise?.({ cancelled: true, template: null });
  }

  /**
   * Clean up and remove the palette
   */
  private cleanup(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    document.removeEventListener('keydown', this.handleGlobalKeydown, true);

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.shadowRoot = null;
    this.searchInput = null;
    this.resultsList = null;
    this.previewPane = null;
    this.resolvePromise = null;
    this.results = [];
    this.selectedIndex = 0;
  }

  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Truncate text to max length
   */
  private truncate(text: string, maxLength: number): string {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= maxLength) return clean;
    return clean.slice(0, maxLength) + '...';
  }

  /**
   * Get scoped CSS styles for the command palette
   */
  private getStyles(): string {
    return `
      * {
        box-sizing: border-box;
      }

      .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 15vh;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      .palette {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        width: 640px;
        max-width: 90vw;
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideIn 0.15s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .search-container {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
        gap: 10px;
      }

      .search-icon {
        color: #9ca3af;
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }

      .search-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 16px;
        color: #1a1a1a;
        background: transparent;
      }

      .search-input::placeholder {
        color: #9ca3af;
      }

      .content-area {
        display: flex;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      .results-container {
        flex: 1;
        overflow-y: auto;
        border-right: 1px solid #e5e7eb;
        min-width: 240px;
      }

      .results-list {
        list-style: none;
        margin: 0;
        padding: 4px;
      }

      .result-item {
        padding: 10px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.1s;
      }

      .result-item:hover,
      .result-item.selected {
        background: #f3f4f6;
      }

      .result-item.selected {
        background: #e5e7eb;
      }

      .result-main {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 2px;
      }

      .result-trigger {
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        font-size: 13px;
        font-weight: 600;
        color: #4f46e5;
        background: #eef2ff;
        padding: 2px 6px;
        border-radius: 4px;
      }

      .favorite-star {
        color: #f59e0b;
        font-size: 12px;
      }

      .result-name {
        font-size: 14px;
        color: #374151;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .result-preview {
        font-size: 12px;
        color: #6b7280;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .empty-state {
        padding: 32px 16px;
        text-align: center;
        color: #6b7280;
        font-size: 14px;
      }

      .preview-pane {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        min-width: 200px;
      }

      .preview-empty {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
        font-size: 14px;
      }

      .preview-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .preview-trigger {
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        font-size: 15px;
        font-weight: 600;
        color: #4f46e5;
        background: #eef2ff;
        padding: 4px 8px;
        border-radius: 4px;
      }

      .preview-name {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 12px;
      }

      .preview-content {
        background: #f9fafb;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
      }

      .preview-content pre {
        margin: 0;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        font-size: 13px;
        color: #374151;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 200px;
        overflow-y: auto;
      }

      .preview-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 12px;
        color: #6b7280;
      }

      .tags {
        display: flex;
        gap: 4px;
      }

      .tag {
        background: #e5e7eb;
        padding: 2px 6px;
        border-radius: 4px;
      }

      .footer {
        padding: 10px 16px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 16px;
        background: #f9fafb;
      }

      .hint {
        font-size: 12px;
        color: #6b7280;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      kbd {
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        font-size: 11px;
        background: #e5e7eb;
        padding: 2px 5px;
        border-radius: 4px;
        border: 1px solid #d1d5db;
      }

      @media (prefers-color-scheme: dark) {
        .palette {
          background: #1f2937;
        }

        .search-container {
          border-bottom-color: #374151;
        }

        .search-icon {
          color: #6b7280;
        }

        .search-input {
          color: #f9fafb;
        }

        .search-input::placeholder {
          color: #6b7280;
        }

        .results-container {
          border-right-color: #374151;
        }

        .result-item:hover,
        .result-item.selected {
          background: #374151;
        }

        .result-item.selected {
          background: #4b5563;
        }

        .result-trigger {
          color: #818cf8;
          background: #312e81;
        }

        .result-name {
          color: #e5e7eb;
        }

        .result-preview {
          color: #9ca3af;
        }

        .empty-state {
          color: #9ca3af;
        }

        .preview-empty {
          color: #6b7280;
        }

        .preview-trigger {
          color: #818cf8;
          background: #312e81;
        }

        .preview-name {
          color: #f9fafb;
        }

        .preview-content {
          background: #111827;
        }

        .preview-content pre {
          color: #e5e7eb;
        }

        .preview-meta {
          color: #9ca3af;
        }

        .tag {
          background: #374151;
        }

        .footer {
          border-top-color: #374151;
          background: #111827;
        }

        .hint {
          color: #9ca3af;
        }

        kbd {
          background: #374151;
          border-color: #4b5563;
          color: #e5e7eb;
        }
      }
    `;
  }
}

// Export singleton instance
export const commandPalette = new CommandPalette();
