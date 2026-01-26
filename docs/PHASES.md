# Implementation Phases

This document breaks down the SlashSnip implementation into testable milestones. Each phase produces a working extension that can be loaded and tested before proceeding.

---

## Phase 1: Minimal Viable Extension

**Goal:** A working extension that can expand simple text templates.

### Features
- Extension infrastructure (Manifest V3, service worker, content script, popup)
- Template entity with basic fields (id, trigger, name, content, timestamps)
- Chrome Storage API integration for persistence
- Trigger detection in `<input>` and `<textarea>` elements
- Literal text expansion (no placeholders yet)
- Basic popup UI:
  - List templates with trigger and name
  - Create new template form
  - Delete template

### Testable Outcomes
- [ ] Extension loads in Chrome without errors
- [ ] Can create a template via popup
- [ ] Typing `/test ` in a text input expands to template content
- [ ] Templates persist across browser restarts

### Architecture Foundations
- DDD folder structure
- Template entity and repository interface
- Chrome storage adapter
- Content script message passing to background

---

## Phase 2: Core Placeholders

**Goal:** Add dynamic content placeholders to templates.

### Features
- Placeholder parser and processor
- Basic placeholders:
  - `<clipboard>` - Insert clipboard content
  - `<cursor>` - Position cursor after expansion
  - `<selection>` - Insert selected text
- Date/time placeholders:
  - `<date>`, `<date:FORMAT>`
  - `<time>`, `<time:FORMAT>`
  - `<datetime:FORMAT>`
- Undo expansion with Ctrl+Z / Cmd+Z
- ContentEditable element support

### Testable Outcomes
- [ ] `<clipboard>` inserts clipboard content
- [ ] `<cursor>` positions cursor correctly
- [ ] `<date:YYYY-MM-DD>` outputs formatted date
- [ ] Ctrl+Z undoes the last expansion
- [ ] Works in Gmail compose, Notion, etc. (contenteditable)

### Architecture Additions
- Placeholder domain service
- Clipboard port and Chrome adapter
- Expansion history for undo

---

## Phase 3: Interactive Templates

**Goal:** Templates that prompt for user input and support multi-field navigation.

### Features
- User input placeholders:
  - `<input:Label>`
  - `<input:Label:default>`
  - `<select:Label:opt1,opt2,opt3>`
- Tab stops:
  - `<tab:N>` and `<tab:N:default>`
  - Tab key navigation between stops
- Transform modifiers:
  - `<clipboard:upper>`, `<clipboard:lower>`, `<clipboard:title>`, `<clipboard:trim>`
  - `<selection:upper>`, `<selection:lower>`
- Input dialog UI (floating modal)

### Testable Outcomes
- [ ] Template with `<input:Name>` shows dialog prompting for Name
- [ ] Select placeholder shows dropdown options
- [ ] Tab stops allow jumping through fields with Tab key
- [ ] `<clipboard:upper>` converts clipboard to UPPERCASE
- [ ] Escape cancels multi-step input

### Architecture Additions
- Input dialog component (injected into page)
- Tab stop navigation state machine
- Text transform utilities

---

## Phase 4: Organization & Management

**Goal:** Full template management with categories, tags, and search.

### Features
- Category entity with nesting support
- Assign templates to categories
- Tag system (multiple tags per template)
- Search functionality:
  - By trigger, name, content, tags
  - Fuzzy matching
- Full Options page UI:
  - Template list with filters
  - Template editor with all fields
  - Category management
  - Placeholder insertion toolbar
  - Preview pane
- Template validation (unique triggers, min length)
- Duplicate template action

### Testable Outcomes
- [ ] Can create categories and subcategories
- [ ] Can assign templates to categories
- [ ] Search finds templates by partial trigger match
- [ ] Options page shows full template editor
- [ ] Validation prevents duplicate triggers

### Architecture Additions
- Category entity and repository
- Search/filter domain service
- Options page React application

---

## Phase 5: Quick Access

**Goal:** Fast template insertion without typing triggers.

### Features
- Command palette:
  - Keyboard shortcut (Ctrl+Shift+Space)
  - Fuzzy search
  - Template preview
  - Keyboard navigation
- Context menu integration:
  - "Insert Template" submenu
  - Recent templates
  - Favorites
- Favorite templates
- Usage tracking (usageCount)
- Recent templates list

### Testable Outcomes
- [ ] Ctrl+Shift+Space opens command palette
- [ ] Can search and insert template from palette
- [ ] Right-click shows Insert Template menu
- [ ] Favoriting a template adds it to quick access
- [ ] Usage count increments on each expansion

### Architecture Additions
- Command palette component (injected overlay)
- Context menu Chrome API integration
- Usage statistics service

---

## Phase 6: Advanced Features

**Goal:** Import/export and site-specific controls.

### Features
- Export templates:
  - All templates
  - Selected category
  - Selected templates
  - JSON format
- Import templates:
  - JSON file upload
  - Conflict handling (skip, overwrite, rename)
- Site-specific restrictions:
  - Per-template domain whitelist/blacklist
  - Global site blacklist
- Settings page:
  - Trigger delimiters configuration
  - Theme (light/dark/system)
  - Storage mode (local/sync)

### Testable Outcomes
- [ ] Export downloads JSON file with templates
- [ ] Import loads templates from JSON
- [ ] Duplicate trigger during import prompts for action
- [ ] Template with domain whitelist only expands on those sites
- [ ] Global blacklist disables extension on specified sites

### Architecture Additions
- Import/Export use cases
- Site restriction domain service
- Settings entity and storage

---

## Phase Summary

| Phase | Focus | Key Deliverable |
|-------|-------|-----------------|
| 1 | Foundation | Working expansion of literal text |
| 2 | Placeholders | Dynamic content (`<clipboard>`, `<date>`) |
| 3 | Interactivity | User prompts and tab stops |
| 4 | Organization | Categories, tags, search, options page |
| 5 | Quick Access | Command palette, context menu |
| 6 | Advanced | Import/export, site restrictions |

---

## Dependency Graph

```
Phase 1 (Foundation)
    ↓
Phase 2 (Placeholders)
    ↓
Phase 3 (Interactive)
    ↓
Phase 4 (Organization)
    ↓
Phase 5 (Quick Access)
    ↓
Phase 6 (Advanced)
```

Each phase depends on the previous phases being complete. However, Phase 4-6 have some flexibility in ordering if priorities change.
