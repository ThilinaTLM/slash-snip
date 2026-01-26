import type { IClipboardPort } from '@application/ports/IClipboardPort';

/**
 * Chrome/Browser clipboard adapter using the Clipboard API
 */
export class ClipboardAdapter implements IClipboardPort {
  /**
   * Read text from the clipboard
   * Returns empty string if clipboard is empty, access denied, or an error occurs
   */
  async read(): Promise<string> {
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        console.warn('[SlashSnip] Clipboard API not available');
        return '';
      }

      const text = await navigator.clipboard.readText();
      return text ?? '';
    } catch (error) {
      // Permission denied or other error - fail gracefully
      if (error instanceof Error) {
        console.warn('[SlashSnip] Clipboard read failed:', error.message);
      }
      return '';
    }
  }

  /**
   * Write text to the clipboard
   */
  async write(text: string): Promise<void> {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        console.warn('[SlashSnip] Clipboard API not available for writing');
        return;
      }

      await navigator.clipboard.writeText(text);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('[SlashSnip] Clipboard write failed:', error.message);
      }
    }
  }
}
