# Software Requirements Specification

## SlashSnip - Text Template Browser Extension

**Version:** 1.0
**Date:** 2026-01-26
**Status:** Draft

---

## 1. Introduction

### 1.1 Purpose

SlashSnip is a free and open-source browser extension that enables users to create, manage, and expand text templates using customizable trigger shortcuts. It aims to improve productivity by automating repetitive typing tasks.

### 1.2 Scope

The extension will work on Chromium-based browsers (Chrome, Edge, Brave, etc.) and allow users to:

- Define text templates with trigger shortcuts
- Expand templates in any text input field
- Use dynamic placeholders for contextual content
- Organize and manage templates efficiently

### 1.3 Target Users

- Developers (code snippets, commit messages, PR templates)
- Customer support (canned responses)
- Writers (boilerplate text, formatting)
- General users (email signatures, form filling, frequently typed text)

---

## 2. Functional Requirements

### 2.1 Template Management

#### FR-2.1.1 Create Template

- Users shall be able to create new templates with:
  - **Trigger:** A unique shortcut string (e.g., `/fg`, `::email`)
  - **Name:** A human-readable name for the template
  - **Content:** The text to expand, including placeholders
  - **Description:** Optional description of the template's purpose
  - **Category:** Optional folder/category assignment
  - **Tags:** Optional tags for organization

#### FR-2.1.2 Edit Template

- Users shall be able to modify all fields of existing templates
- Changes shall take effect immediately without browser restart

#### FR-2.1.3 Delete Template

- Users shall be able to delete templates
- System shall prompt for confirmation before deletion

#### FR-2.1.4 Duplicate Template

- Users shall be able to duplicate an existing template as a starting point for a new one

#### FR-2.1.5 Template Validation

- System shall validate that triggers are unique
- System shall warn users of potential conflicts with existing triggers
- Triggers must be at least 2 characters long

### 2.2 Template Expansion

#### FR-2.2.1 Trigger Detection

- System shall monitor text input in supported fields
- When a trigger is typed followed by a delimiter (space, tab, enter, or punctuation), the system shall expand the template
- Expansion shall replace the trigger text with the template content

#### FR-2.2.2 Supported Input Fields

- Standard text inputs (`<input type="text">`)
- Textareas (`<textarea>`)
- Content-editable elements (`contenteditable="true"`)
- Rich text editors (CodeMirror, Monaco, ProseMirror, etc.)

#### FR-2.2.3 Expansion Cancellation

- Users shall be able to undo expansion using Ctrl+Z / Cmd+Z
- Pressing Escape during multi-step input shall cancel expansion

### 2.3 Placeholders

#### FR-2.3.1 Basic Placeholders

| Placeholder   | Description                              |
| ------------- | ---------------------------------------- |
| `<clipboard>` | Inserts current clipboard text content   |
| `<cursor>`    | Positions cursor here after expansion    |
| `<selection>` | Inserts currently selected text (if any) |

#### FR-2.3.2 Date/Time Placeholders

| Placeholder         | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `<date>`            | Current date in locale format                                |
| `<date:FORMAT>`     | Current date in specified format (e.g., `<date:YYYY-MM-DD>`) |
| `<time>`            | Current time in locale format                                |
| `<time:FORMAT>`     | Current time in specified format (e.g., `<time:HH:mm>`)      |
| `<datetime:FORMAT>` | Combined date and time                                       |

Supported format tokens:

- `YYYY` - 4-digit year
- `MM` - 2-digit month
- `DD` - 2-digit day
- `HH` - 2-digit hour (24h)
- `hh` - 2-digit hour (12h)
- `mm` - 2-digit minute
- `ss` - 2-digit second
- `A` / `a` - AM/PM

#### FR-2.3.3 User Input Placeholders

| Placeholder                     | Description                             |
| ------------------------------- | --------------------------------------- |
| `<input:Label>`                 | Prompts user for input with given label |
| `<input:Label:default>`         | Prompts with a default value            |
| `<select:Label:opt1,opt2,opt3>` | Dropdown selection                      |

#### FR-2.3.4 Tab Stops

| Placeholder       | Description                |
| ----------------- | -------------------------- |
| `<tab:1>`         | First tab stop             |
| `<tab:2>`         | Second tab stop            |
| `<tab:N>`         | Nth tab stop               |
| `<tab:1:default>` | Tab stop with default text |

Users can press Tab to jump between tab stops sequentially.

#### FR-2.3.5 Transform Placeholders

| Placeholder         | Description                               |
| ------------------- | ----------------------------------------- |
| `<clipboard:upper>` | Clipboard content in UPPERCASE            |
| `<clipboard:lower>` | Clipboard content in lowercase            |
| `<clipboard:title>` | Clipboard content in Title Case           |
| `<clipboard:trim>`  | Clipboard content with trimmed whitespace |
| `<selection:upper>` | Selected text in UPPERCASE                |
| `<selection:lower>` | Selected text in lowercase                |

### 2.4 Organization

#### FR-2.4.1 Categories/Folders

- Users shall be able to create categories to organize templates
- Categories can be nested (subcategories)
- Templates can belong to one category

#### FR-2.4.2 Tags

- Users shall be able to assign multiple tags to templates
- Users shall be able to filter templates by tags

#### FR-2.4.3 Search

- Users shall be able to search templates by:
  - Trigger
  - Name
  - Content
  - Tags
- Search shall support fuzzy matching

### 2.5 Quick Access

#### FR-2.5.1 Command Palette

- Users shall be able to open a command palette with a keyboard shortcut (default: Ctrl+Shift+Space)
- Palette shall allow searching and inserting templates without typing triggers
- Palette shall show template preview before insertion

#### FR-2.5.2 Context Menu

- Right-click context menu shall show "Insert Template" submenu
- Submenu shall list recently used and favorited templates

### 2.6 Import/Export

#### FR-2.6.1 Export

- Users shall be able to export templates as JSON file
- Export options: all templates, selected category, selected templates

#### FR-2.6.2 Import

- Users shall be able to import templates from JSON file
- System shall handle conflicts (duplicate triggers) with user choice:
  - Skip duplicates
  - Overwrite existing
  - Rename imported

#### FR-2.6.3 Sync (Optional - Future)

- Users may optionally sync templates via GitHub Gist
- Sync shall be opt-in and respect user privacy

### 2.7 Site-Specific Settings

#### FR-2.7.1 Site Restrictions

- Users shall be able to enable/disable templates per website
- Blacklist mode: templates work everywhere except listed sites
- Whitelist mode: templates only work on listed sites

#### FR-2.7.2 Site-Specific Templates

- Templates can be configured to only expand on specific domains
- Useful for context-specific snippets (e.g., GitHub-only templates)

---

## 3. Non-Functional Requirements

### 3.1 Performance

#### NFR-3.1.1 Expansion Speed

- Template expansion shall complete in under 50ms for templates without user input
- User shall not perceive any lag during typing

#### NFR-3.1.2 Memory Usage

- Extension shall use less than 50MB of memory during normal operation
- Extension shall not cause noticeable browser slowdown

#### NFR-3.1.3 Startup Time

- Extension shall be ready to use within 500ms of browser start

### 3.2 Usability

#### NFR-3.2.1 Learning Curve

- Basic functionality (create and use templates) shall be learnable within 5 minutes
- Interface shall follow familiar patterns from similar tools

#### NFR-3.2.2 Accessibility

- Extension popup and options shall be keyboard navigable
- UI shall support screen readers
- Color contrast shall meet WCAG AA standards

### 3.3 Reliability

#### NFR-3.3.1 Data Persistence

- Templates shall persist across browser restarts
- Templates shall not be lost during extension updates

#### NFR-3.3.2 Error Handling

- Invalid placeholders shall be inserted as literal text (not crash)
- System shall gracefully handle clipboard access denial

### 3.4 Security

#### NFR-3.4.1 Permissions

- Extension shall request minimal required permissions
- Clipboard access shall only be requested when needed

#### NFR-3.4.2 Data Privacy

- All template data shall be stored locally by default
- No data shall be sent to external servers without explicit user consent
- No analytics or tracking

### 3.5 Compatibility

#### NFR-3.5.1 Browser Support

- Chrome 88+
- Edge 88+
- Brave (latest)
- Other Chromium-based browsers

#### NFR-3.5.2 Website Compatibility

- Extension shall work with major websites including:
  - Gmail, Outlook
  - GitHub, GitLab
  - Slack, Discord
  - Notion, Google Docs
  - Stack Overflow
  - Social media platforms

---

## 4. User Interface Requirements

### 4.1 Extension Popup

#### UI-4.1.1 Layout

- Search bar at top
- List of templates (grouped by category or flat)
- Quick actions: New template, Settings, Help
- Recent/Favorites section

#### UI-4.1.2 Template List Item

- Display: Trigger, Name, Preview (truncated)
- Actions: Edit, Delete, Favorite, Copy trigger

### 4.2 Options Page

#### UI-4.2.1 Sections

- **Templates:** Full template management interface
- **Categories:** Manage categories and organization
- **Settings:** General preferences
- **Import/Export:** Data management
- **About:** Version info, links, credits

#### UI-4.2.2 Template Editor

- Trigger input with validation
- Name input
- Content textarea with:
  - Syntax highlighting for placeholders
  - Placeholder insertion toolbar/menu
  - Preview pane
- Category selector
- Tags input
- Site restrictions configuration

### 4.3 Command Palette

#### UI-4.3.1 Layout

- Floating modal overlay
- Search input (auto-focused)
- Filtered template list
- Keyboard navigation (arrow keys, Enter to select)
- Preview of selected template

### 4.4 Input Dialog

#### UI-4.4.1 Multi-Input Form

- When template has `<input:>` placeholders, show dialog
- Display all input fields in order
- Support for default values
- Cancel and Insert buttons
- Keyboard: Enter to submit, Escape to cancel

---

## 5. Technical Requirements

### 5.1 Architecture

#### TR-5.1.1 Components

- **Background Service Worker:** Manages storage, handles messages
- **Content Script:** Monitors input fields, handles expansion
- **Popup:** Quick access UI
- **Options Page:** Full management interface

#### TR-5.1.2 Storage

- Use Chrome Storage API (sync or local based on user preference)
- Storage schema shall support migration for future updates

### 5.2 Data Schema

#### TR-5.2.1 Template Object

```typescript
interface Template {
  id: string; // Unique identifier (UUID)
  trigger: string; // Expansion trigger
  name: string; // Display name
  content: string; // Template content with placeholders
  description?: string; // Optional description
  categoryId?: string; // Optional category reference
  tags: string[]; // Array of tag strings
  siteRestrictions?: {
    mode: "blacklist" | "whitelist";
    domains: string[];
  };
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
  usageCount: number; // Usage statistics
  isFavorite: boolean; // Favorite flag
}
```

#### TR-5.2.2 Category Object

```typescript
interface Category {
  id: string; // Unique identifier
  name: string; // Display name
  parentId?: string; // Parent category (for nesting)
  order: number; // Sort order
}
```

#### TR-5.2.3 Settings Object

```typescript
interface Settings {
  triggerDelimiters: string[]; // Characters that trigger expansion
  enableCommandPalette: boolean;
  commandPaletteShortcut: string;
  defaultExpansionEnabled: boolean;
  globalBlacklist: string[]; // Sites where extension is disabled
  theme: "light" | "dark" | "system";
  storageMode: "local" | "sync";
}
```

### 5.3 Permissions Required

- `storage` - Store templates and settings
- `clipboardRead` - For `<clipboard>` placeholder
- `activeTab` - For site-specific features
- `contextMenus` - For right-click menu

---

## 6. Future Considerations

The following features are out of scope for v1.0 but may be considered for future releases:

- **Firefox Support:** Port to Firefox WebExtensions API
- **Cloud Sync:** Optional sync via user's cloud storage
- **Template Sharing:** Share individual templates via URL/code
- **Community Library:** Browse and import community-created templates
- **JavaScript Expressions:** `<js:expression>` for advanced users
- **Nested Templates:** Include one template within another
- **Rich Text Support:** HTML/Markdown formatting in templates
- **AI Integration:** AI-powered template suggestions

---

## 7. Glossary

| Term                | Definition                                                              |
| ------------------- | ----------------------------------------------------------------------- |
| **Trigger**         | The shortcut text that initiates template expansion                     |
| **Placeholder**     | Special syntax within templates that gets replaced with dynamic content |
| **Expansion**       | The process of replacing a trigger with its template content            |
| **Tab Stop**        | A position in expanded text where the cursor can be moved via Tab key   |
| **Command Palette** | A searchable popup for quickly finding and inserting templates          |

---

## 8. Revision History

| Version | Date       | Author | Description   |
| ------- | ---------- | ------ | ------------- |
| 1.0     | 2026-01-26 | -      | Initial draft |
