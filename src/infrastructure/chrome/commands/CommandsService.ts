/**
 * Service for handling Chrome keyboard commands
 */
export class CommandsService {
  private handlers: Map<string, () => void | Promise<void>> = new Map();

  /**
   * Register a handler for a specific command
   */
  on(command: string, handler: () => void | Promise<void>): void {
    this.handlers.set(command, handler);
  }

  /**
   * Remove a handler for a specific command
   */
  off(command: string): void {
    this.handlers.delete(command);
  }

  /**
   * Start listening for commands
   */
  listen(): void {
    chrome.commands.onCommand.addListener(async (command) => {
      console.log('[SlashSnip] Command received:', command);
      const handler = this.handlers.get(command);
      if (handler) {
        try {
          await handler();
        } catch (error) {
          console.error('[SlashSnip] Command handler error:', error);
        }
      }
    });
  }
}

// Export singleton
export const commandsService = new CommandsService();
