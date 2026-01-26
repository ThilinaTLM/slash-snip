/**
 * Port interface for clipboard operations
 * Allows reading and writing to the system clipboard
 */
export interface IClipboardPort {
  /**
   * Read text content from the clipboard
   * @returns The clipboard text content, or empty string if unavailable/denied
   */
  read(): Promise<string>;

  /**
   * Write text content to the clipboard
   * @param text - The text to write to the clipboard
   */
  write(text: string): Promise<void>;
}
