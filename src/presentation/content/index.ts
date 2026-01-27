// Content Script Entry Point
// Vanilla TypeScript for trigger detection and expansion

import { TriggerDetector, type TriggerMode } from './TriggerDetector';
import { TextExpander } from './TextExpander';
import { sendMessage } from '@infrastructure/chrome/messaging';
import { MESSAGE_TYPES, STORAGE_KEYS } from '@shared/constants';
import { PlaceholderProcessor } from '@domain/services';
import { ClipboardAdapter } from '@infrastructure/chrome/clipboard';
import { inputDialog } from './InputDialog';
import { tabStopManager } from './TabStopManager';
import type { TemplateDTO } from '@application/dto';
import type { PlaceholderContext } from '@shared/types';
import type { AppSettings } from '@shared/types/settings';
import { DEFAULT_SETTINGS } from '@shared/types/settings';

// Initialize services
const detector = new TriggerDetector();
const expander = new TextExpander();
const placeholderProcessor = new PlaceholderProcessor();
const clipboardAdapter = new ClipboardAdapter();

// Current settings cache
let currentSettings: AppSettings = DEFAULT_SETTINGS;

/**
 * Handle input events on text inputs, textareas, and contenteditable elements
 */
async function handleInput(event: Event): Promise<void> {
  const target = event.target;

  // Only handle text inputs, textareas, and contenteditable
  if (!isTextInput(target)) {
    return;
  }

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    // Standard input/textarea handling
    const cursorPosition = target.selectionStart ?? target.value.length;
    const match = detector.detectTriggerAtCursor(target.value, cursorPosition);

    console.log('[SlashSnip] Input detected:', {
      value: target.value,
      cursorPosition,
      match,
    });

    if (!match) {
      return;
    }

    console.log('[SlashSnip] Trigger match found:', match.trigger);

    const template = await fetchTemplate(match.trigger);
    if (!template) return;

    // Gather placeholder context
    const context = await gatherPlaceholderContext(target);

    // Check for interactive placeholders that require user input
    const interactiveFields = placeholderProcessor.analyzeInteractive(template.content);

    let inputValues: Record<string, string> = {};

    if (interactiveFields && interactiveFields.length > 0) {
      const result = await inputDialog.show(interactiveFields);
      if (result.cancelled) {
        console.log('[SlashSnip] User cancelled input dialog');
        return; // Abort expansion
      }
      inputValues = result.values;
    }

    // Process with context and any user inputs
    const processed = interactiveFields
      ? placeholderProcessor.processWithInputs(template.content, context, inputValues, interactiveFields)
      : placeholderProcessor.process(template.content, context);

    console.log('[SlashSnip] Processed content:', processed);

    expander.expand(target, match, processed.text, {
      cursorOffset: processed.cursorOffset,
    });

    // Activate tab stops if present
    if (processed.tabStops && processed.tabStops.length > 0) {
      tabStopManager.activate(target, processed.tabStops, match.startIndex);
    }

    // Increment usage count
    incrementUsage(template.id);
  } else if (target instanceof HTMLElement && target.isContentEditable) {
    // Contenteditable handling
    const result = detector.detectTriggerInContenteditable(target);

    console.log('[SlashSnip] Contenteditable input detected:', {
      text: result?.ctx?.text,
      match: result?.match,
    });

    if (!result) {
      return;
    }

    const { match, ctx } = result;

    console.log('[SlashSnip] Trigger match found:', match.trigger);

    const template = await fetchTemplate(match.trigger);
    if (!template) return;

    // Gather placeholder context
    const context = await gatherPlaceholderContext(target);

    // Check for interactive placeholders that require user input
    const interactiveFields = placeholderProcessor.analyzeInteractive(template.content);

    let inputValues: Record<string, string> = {};

    if (interactiveFields && interactiveFields.length > 0) {
      const result = await inputDialog.show(interactiveFields);
      if (result.cancelled) {
        console.log('[SlashSnip] User cancelled input dialog');
        return; // Abort expansion
      }
      inputValues = result.values;
    }

    // Process with context and any user inputs
    const processed = interactiveFields
      ? placeholderProcessor.processWithInputs(template.content, context, inputValues, interactiveFields)
      : placeholderProcessor.process(template.content, context);

    console.log('[SlashSnip] Processed content:', processed);

    expander.expandContenteditable(target, match, processed.text, ctx, {
      cursorOffset: processed.cursorOffset,
    });

    // Activate tab stops if present
    if (processed.tabStops && processed.tabStops.length > 0) {
      tabStopManager.activate(target, processed.tabStops, match.startIndex);
    }

    // Increment usage count
    incrementUsage(template.id);
  }
}

/**
 * Fetch template from background script by trigger
 */
async function fetchTemplate(trigger: string): Promise<TemplateDTO | null> {
  const response = await sendMessage<{ trigger: string }, TemplateDTO | null>(
    MESSAGE_TYPES.GET_BY_TRIGGER,
    { trigger }
  );

  console.log('[SlashSnip] Background response:', response);

  if (!response.success || !response.data) {
    console.log('[SlashSnip] No template found or error');
    return null;
  }

  console.log('[SlashSnip] Expanding template:', response.data.content);
  return response.data;
}

/**
 * Gather context for placeholder processing
 * Collects selection text and clipboard content
 */
async function gatherPlaceholderContext(
  _element: HTMLInputElement | HTMLTextAreaElement | HTMLElement
): Promise<PlaceholderContext> {
  // Get selected text (if any) - this would be selection before trigger was typed
  // Note: After typing the trigger, selection is typically collapsed
  const selection = window.getSelection();
  const selectedText = selection?.toString() ?? '';

  // Get clipboard content
  let clipboardText = '';
  try {
    clipboardText = await clipboardAdapter.read();
  } catch {
    console.log('[SlashSnip] Could not read clipboard');
  }

  return {
    selection: selectedText,
    clipboard: clipboardText,
  };
}

/**
 * Handle keydown for undo support (Ctrl+Z / Cmd+Z)
 */
function handleKeydown(event: KeyboardEvent): void {
  const target = event.target;

  if (!isTextInput(target)) {
    return;
  }

  // Check for Ctrl+Z or Cmd+Z
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    // Check if we have undo data
    const hasUndoData = !!(target as HTMLElement & { __slashsnipUndo?: unknown }).__slashsnipUndo;

    if (hasUndoData) {
      event.preventDefault();
      expander.undo(target as HTMLInputElement | HTMLTextAreaElement | HTMLElement);
    }
  }
}

/**
 * Check if element is a valid text input (input, textarea, or contenteditable)
 */
function isTextInput(element: EventTarget | null): element is HTMLInputElement | HTMLTextAreaElement | HTMLElement {
  if (!element || !(element instanceof HTMLElement)) {
    return false;
  }

  if (element instanceof HTMLTextAreaElement) {
    return true;
  }

  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase();
    // Include inputs without explicit type (defaults to text) and common text input types
    return type === '' || type === 'text' || type === 'search' || type === 'url' || type === 'email';
  }

  // Support contenteditable elements (used by ChatGPT, Gemini, etc.)
  if (element.isContentEditable) {
    return true;
  }

  return false;
}

/**
 * Increment usage count for a template (fire and forget)
 */
function incrementUsage(templateId: string): void {
  sendMessage<{ id: string }, void>(MESSAGE_TYPES.INCREMENT_USAGE, { id: templateId }).catch(
    (error) => {
      console.error('[SlashSnip] Failed to increment usage:', error);
    }
  );
}

/**
 * Load settings from Chrome storage and configure the detector
 */
async function loadSettings(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    const stored = result[STORAGE_KEYS.SETTINGS] as Partial<AppSettings> | undefined;
    currentSettings = { ...DEFAULT_SETTINGS, ...stored };
    applySettings(currentSettings);
  } catch (error) {
    console.error('[SlashSnip] Failed to load settings:', error);
  }
}

/**
 * Apply settings to the trigger detector
 */
function applySettings(settings: AppSettings): void {
  const mode: TriggerMode = settings.triggerKey === 'none' ? 'none' : 'delimiter';
  detector.setMode(mode);
  detector.setCaseSensitive(settings.caseSensitive);

  console.log('[SlashSnip] Settings applied:', {
    mode,
    caseSensitive: settings.caseSensitive,
  });

  // In "none" mode, we need to load known triggers
  if (mode === 'none') {
    loadKnownTriggers();
  }
}

/**
 * Load all known triggers for "none" mode matching
 */
async function loadKnownTriggers(): Promise<void> {
  try {
    const response = await sendMessage<object, TemplateDTO[]>(
      MESSAGE_TYPES.GET_TEMPLATES,
      {}
    );
    if (response.success && response.data) {
      const triggers = response.data.map((t) => t.trigger);
      detector.setKnownTriggers(triggers);
      console.log('[SlashSnip] Loaded', triggers.length, 'known triggers for immediate mode');
    }
  } catch (error) {
    console.error('[SlashSnip] Failed to load known triggers:', error);
  }
}

/**
 * Handle settings changes from Chrome storage
 */
function handleSettingsChange(
  changes: { [key: string]: chrome.storage.StorageChange },
  areaName: string
): void {
  if (areaName !== 'local') return;

  if (changes[STORAGE_KEYS.SETTINGS]) {
    const newSettings = changes[STORAGE_KEYS.SETTINGS].newValue as Partial<AppSettings> | undefined;
    currentSettings = { ...DEFAULT_SETTINGS, ...newSettings };
    applySettings(currentSettings);
    console.log('[SlashSnip] Settings changed:', currentSettings);
  }

  // Also reload triggers when templates change (for "none" mode)
  if (changes[STORAGE_KEYS.TEMPLATES] && detector.getMode() === 'none') {
    loadKnownTriggers();
  }
}

/**
 * Initialize content script
 */
async function init(): Promise<void> {
  // Load settings first
  await loadSettings();

  // Use event delegation on document for dynamic elements
  document.addEventListener('input', handleInput);
  document.addEventListener('keydown', handleKeydown);

  // Listen for settings changes
  chrome.storage.onChanged.addListener(handleSettingsChange);

  console.log('SlashSnip content script initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
