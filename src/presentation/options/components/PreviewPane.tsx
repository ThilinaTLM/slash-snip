import React, { useMemo } from 'react';

interface PreviewPaneProps {
  content: string;
}

/**
 * Format a date according to a format string
 * Simplified version for preview
 */
function formatDate(format: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours24 = String(now.getHours()).padStart(2, '0');
  const hours12 = String(now.getHours() % 12 || 12).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';

  return format
    .replace(/YYYY/g, String(year))
    .replace(/YY/g, String(year).slice(-2))
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hours24)
    .replace(/hh/g, hours12)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds)
    .replace(/A/g, ampm)
    .replace(/a/g, ampm.toLowerCase());
}

/**
 * Resolve placeholders for preview display
 */
function resolvePreview(content: string): React.ReactNode[] {
  if (!content) {
    return [];
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  // Pattern to match all placeholders
  const pattern =
    /<(clipboard|cursor|selection|date|time|datetime|input|select|tab)(?::([^>]+))?>/g;

  let match;
  while ((match = pattern.exec(content)) !== null) {
    // Add text before the placeholder
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const [fullMatch, type, arg] = match;
    let preview: string;

    switch (type) {
      case 'clipboard':
        preview = '[clipboard]';
        if (arg) {
          preview = `[clipboard:${arg}]`;
        }
        break;

      case 'cursor':
        preview = '[cursor]';
        break;

      case 'selection':
        preview = '[selection]';
        if (arg) {
          preview = `[selection:${arg}]`;
        }
        break;

      case 'date':
        if (arg) {
          preview = formatDate(arg);
        } else {
          const now = new Date();
          preview = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        }
        break;

      case 'time':
        if (arg) {
          preview = formatDate(arg);
        } else {
          const now = new Date();
          preview = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        }
        break;

      case 'datetime':
        if (arg) {
          preview = formatDate(arg);
        } else {
          const now = new Date();
          preview = now.toLocaleString();
        }
        break;

      case 'input':
        preview = `[input: ${arg || 'Value'}]`;
        break;

      case 'select':
        if (arg) {
          const options = arg.split('|');
          preview = `[select: ${options[0]}]`;
        } else {
          preview = '[select]';
        }
        break;

      case 'tab':
        if (arg) {
          const tabParts = arg.split(':');
          if (tabParts.length > 1) {
            preview = `[tab ${tabParts[0]}: ${tabParts[1]}]`;
          } else {
            preview = `[tab ${tabParts[0]}]`;
          }
        } else {
          preview = '[tab]';
        }
        break;

      default:
        preview = fullMatch;
    }

    // Add placeholder with styling
    const isResolved = type === 'date' || type === 'time' || type === 'datetime';
    parts.push(
      <span
        key={key++}
        className={isResolved ? '' : 'preview-placeholder'}
        title={fullMatch}
      >
        {preview}
      </span>
    );

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

export function PreviewPane({ content }: PreviewPaneProps): React.ReactElement {
  const preview = useMemo(() => resolvePreview(content), [content]);

  return (
    <div className="preview-pane">
      <h3>Preview</h3>
      <div className="preview-content">
        {preview.length > 0 ? (
          preview
        ) : (
          <span className="preview-empty">
            Enter template content to see a preview
          </span>
        )}
      </div>
    </div>
  );
}
