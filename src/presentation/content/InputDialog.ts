import type { InputFieldDefinition, InputDialogResult } from '@shared/types';

/**
 * Shadow DOM dialog for collecting user input during template expansion
 */
export class InputDialog {
  private container: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private resolvePromise: ((result: InputDialogResult) => void) | null = null;

  /**
   * Show the input dialog and collect values for all fields
   */
  async show(fields: InputFieldDefinition[]): Promise<InputDialogResult> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.render(fields);
    });
  }

  /**
   * Render the dialog in Shadow DOM
   */
  private render(fields: InputFieldDefinition[]): void {
    // Create container and shadow root
    this.container = document.createElement('div');
    this.container.id = 'slashsnip-input-dialog-container';
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadowRoot.appendChild(style);

    // Create dialog structure
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.cancel();
      }
    });

    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'dialog-title');

    // Title
    const title = document.createElement('h2');
    title.id = 'dialog-title';
    title.className = 'title';
    title.textContent = 'Template Input';
    dialog.appendChild(title);

    // Form
    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit(fields);
    });

    // Create input fields
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const fieldContainer = document.createElement('div');
      fieldContainer.className = 'field';

      const label = document.createElement('label');
      label.setAttribute('for', `field-${field.id}`);
      label.textContent = field.label;
      fieldContainer.appendChild(label);

      if (field.type === 'select' && field.options) {
        const select = document.createElement('select');
        select.id = `field-${field.id}`;
        select.name = field.id;
        select.setAttribute('data-field-id', field.id);

        for (const option of field.options) {
          const optElement = document.createElement('option');
          optElement.value = option;
          optElement.textContent = option;
          if (option === field.defaultValue) {
            optElement.selected = true;
          }
          select.appendChild(optElement);
        }

        fieldContainer.appendChild(select);
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `field-${field.id}`;
        input.name = field.id;
        input.setAttribute('data-field-id', field.id);
        if (field.defaultValue) {
          input.value = field.defaultValue;
        }
        input.placeholder = field.label;

        // Auto-focus first field
        if (i === 0) {
          input.autofocus = true;
        }

        fieldContainer.appendChild(input);
      }

      form.appendChild(fieldContainer);
    }

    // Button container
    const buttons = document.createElement('div');
    buttons.className = 'buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this.cancel());
    buttons.appendChild(cancelBtn);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-submit';
    submitBtn.textContent = 'Insert';
    buttons.appendChild(submitBtn);

    form.appendChild(buttons);
    dialog.appendChild(form);
    overlay.appendChild(dialog);
    this.shadowRoot.appendChild(overlay);

    // Append to body
    document.body.appendChild(this.container);

    // Focus first input
    requestAnimationFrame(() => {
      const firstInput = this.shadowRoot?.querySelector(
        'input, select'
      ) as HTMLElement | null;
      firstInput?.focus();
    });

    // Add global keyboard handler
    this.handleKeydown = this.handleKeydown.bind(this);
    document.addEventListener('keydown', this.handleKeydown, true);
  }

  /**
   * Handle keyboard events
   */
  private handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.cancel();
    }
  }

  /**
   * Submit the dialog with collected values
   */
  private submit(fields: InputFieldDefinition[]): void {
    const values: Record<string, string> = {};

    for (const field of fields) {
      const element = this.shadowRoot?.querySelector(
        `[data-field-id="${field.id}"]`
      ) as HTMLInputElement | HTMLSelectElement | null;
      values[field.id] = element?.value ?? '';
    }

    this.close();
    this.resolvePromise?.({ cancelled: false, values });
  }

  /**
   * Cancel the dialog
   */
  private cancel(): void {
    this.close();
    this.resolvePromise?.({ cancelled: true, values: {} });
  }

  /**
   * Clean up and remove the dialog
   */
  private close(): void {
    document.removeEventListener('keydown', this.handleKeydown, true);

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.shadowRoot = null;
    this.resolvePromise = null;
  }

  /**
   * Get scoped CSS styles for the dialog
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
        align-items: center;
        justify-content: center;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      .dialog {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        min-width: 320px;
        max-width: 480px;
        max-height: 80vh;
        overflow-y: auto;
        padding: 20px;
        animation: slideIn 0.15s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .title {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
        color: #1a1a1a;
      }

      .field {
        margin-bottom: 16px;
      }

      label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 500;
        color: #4a4a4a;
      }

      input, select {
        width: 100%;
        padding: 10px 12px;
        font-size: 14px;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        background: #fff;
        color: #1a1a1a;
        transition: border-color 0.15s, box-shadow 0.15s;
      }

      input:focus, select:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }

      input::placeholder {
        color: #9ca3af;
      }

      select {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 8px center;
        background-repeat: no-repeat;
        background-size: 20px;
        padding-right: 36px;
      }

      .buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }

      .btn {
        padding: 10px 18px;
        font-size: 14px;
        font-weight: 500;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.15s, transform 0.1s;
        border: none;
      }

      .btn:active {
        transform: scale(0.98);
      }

      .btn-cancel {
        background: #f3f4f6;
        color: #4b5563;
      }

      .btn-cancel:hover {
        background: #e5e7eb;
      }

      .btn-submit {
        background: #4f46e5;
        color: #fff;
      }

      .btn-submit:hover {
        background: #4338ca;
      }

      @media (prefers-color-scheme: dark) {
        .dialog {
          background: #1f2937;
          color: #f9fafb;
        }

        .title {
          color: #f9fafb;
        }

        label {
          color: #d1d5db;
        }

        input, select {
          background: #374151;
          border-color: #4b5563;
          color: #f9fafb;
        }

        input::placeholder {
          color: #6b7280;
        }

        input:focus, select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .btn-cancel {
          background: #374151;
          color: #d1d5db;
        }

        .btn-cancel:hover {
          background: #4b5563;
        }
      }
    `;
  }
}

// Export singleton instance
export const inputDialog = new InputDialog();
