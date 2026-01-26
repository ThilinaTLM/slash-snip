// Common types used across layers

import type { MESSAGE_TYPES } from '../constants';

/**
 * Timestamp in milliseconds since epoch
 */
export type Timestamp = number;

/**
 * UUID string
 */
export type UUID = string;

/**
 * Message payload structure for Chrome messaging
 */
export interface Message<T = unknown> {
  type: keyof typeof MESSAGE_TYPES;
  payload?: T;
}

/**
 * Response structure for Chrome messaging
 */
export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
