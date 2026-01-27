import type { Message, MessageResponse } from '@shared/types';
import type { MessageType } from '@shared/constants';

/**
 * Send a message to the background service worker
 */
export async function sendMessage<TPayload, TResponse>(
  type: MessageType,
  payload?: TPayload
): Promise<MessageResponse<TResponse>> {
  const message: Message<TPayload> = { type, payload };

  try {
    const response = await chrome.runtime.sendMessage(message);
    return response as MessageResponse<TResponse>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Message handler function type
 */
export type MessageHandler<TPayload = unknown, TResponse = unknown> = (
  payload: TPayload,
  sender: chrome.runtime.MessageSender
) => Promise<MessageResponse<TResponse>>;

/**
 * Message router for handling different message types
 */
export class MessageRouter {
  private handlers = new Map<MessageType, MessageHandler>();

  /**
   * Register a handler for a message type
   */
  on<TPayload, TResponse>(
    type: MessageType,
    handler: MessageHandler<TPayload, TResponse>
  ): void {
    this.handlers.set(type, handler as MessageHandler);
  }

  /**
   * Start listening for messages
   */
  listen(): void {
    chrome.runtime.onMessage.addListener(
      (message: Message, sender, sendResponse) => {
        const handler = this.handlers.get(message.type as MessageType);

        if (!handler) {
          sendResponse({
            success: false,
            error: `Unknown message type: ${message.type}`,
          });
          return true;
        }

        handler(message.payload, sender)
          .then(sendResponse)
          .catch((error) => {
            sendResponse({
              success: false,
              error: error instanceof Error ? error.message : 'Handler error',
            });
          });

        // Return true to indicate async response
        return true;
      }
    );
  }
}
