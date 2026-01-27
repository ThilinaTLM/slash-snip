# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SlashSnip is a Chromium browser extension for text template expansion. Users define templates with trigger shortcuts (e.g., `/fg`, `::email`) that expand into full text with support for dynamic placeholders like `<clipboard>`, `<date:YYYY-MM-DD>`, `<input:Label>`, and tab stops.

## Build & Development Commands

```bash
pnpm dev              # Start Vite dev server with HMR
pnpm build            # TypeScript check + Vite production build
pnpm typecheck        # Run tsc --noEmit
pnpm lint             # ESLint check
pnpm lint:fix         # ESLint with auto-fix
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting
pnpm test             # Run Vitest in watch mode
pnpm test:ui          # Vitest with browser UI
pnpm test:coverage    # Single run with coverage report
pnpm test path/to/file.test.ts  # Run specific test file
```

To load the extension in Chrome: build the project, then load `dist/` as an unpacked extension.

## Architecture

This project follows **Domain-Driven Design (DDD)** with clean architecture layers:

```
src/
├── domain/           # Core business logic (no external dependencies)
│   ├── entities/     # Template, Category entities
│   ├── value-objects/
│   ├── repositories/ # Repository interfaces (ITemplateRepository, etc.)
│   ├── services/     # Domain services
│   ├── events/       # Domain events
│   └── errors/       # Domain-specific errors
├── application/      # Use cases and application services
│   ├── use-cases/    # templates/, categories/, settings/, import-export/
│   ├── dto/          # Data transfer objects
│   ├── ports/        # Port interfaces for infrastructure
│   └── services/     # Application services
├── infrastructure/   # External implementations
│   ├── chrome/       # Chrome APIs (storage, messaging, clipboard, context-menu, commands)
│   ├── persistence/  # Repository implementations
│   ├── adapters/     # External service adapters
│   └── event-bus/    # Event system implementation
├── presentation/     # UI and extension entry points
│   ├── background/   # Service worker (message routing)
│   ├── content/      # Content script (trigger detection, expansion)
│   ├── popup/        # Extension popup (React)
│   ├── options/      # Full options page (React)
│   └── shared/       # Shared UI components
├── shared/           # Cross-cutting utilities
│   ├── types/
│   ├── constants/
│   └── utils/
└── di/               # Dependency injection container
```

### Key Extension Components

- **Background Service Worker** (`presentation/background/`): Central message hub, handles storage operations via use cases. Uses `MessageRouter` for typed message handling.
- **Content Script** (`presentation/content/`): Vanilla TypeScript, monitors input fields for triggers, handles expansion. Key classes: `TriggerDetector`, `TextExpander`, `PlaceholderProcessor`, `CommandPalette`, `TabStopManager`.
- **Options Page** (`presentation/options/`): React app for full template management with Base UI components.

### Message Flow

Content script ↔ Background communication uses Chrome messaging with typed message handlers:
1. Content script detects trigger via `TriggerDetector`
2. Sends `GET_BY_TRIGGER` message to background
3. Background resolves via `GetTemplateByTriggerUseCase` and returns template
4. Content script expands via `TextExpander`, processes placeholders via `PlaceholderProcessor`

Message types are defined in `src/shared/constants/index.ts` (`MESSAGE_TYPES`).

### Path Aliases

Configured in both `tsconfig.json` and `vite.config.ts`:
- `@domain/*` → `src/domain/*`
- `@application/*` → `src/application/*`
- `@infrastructure/*` → `src/infrastructure/*`
- `@presentation/*` → `src/presentation/*`
- `@shared/*` → `src/shared/*`
- `@di/*` → `src/di/*`
- `@ui/*` → `src/presentation/shared/ui/*`
- `@lib/*` → `src/presentation/shared/lib/*`

## Data Schemas

Core entities are defined in `src/domain/entities/`:

- **Template**: id, trigger, name, content, groupId?, tags[], createdAt, updatedAt, usageCount
- **Category**: id, name, parentId?, order
- **Group**: id, name, templateIds[], createdAt, updatedAt

Settings (`src/shared/types/settings.ts`):
- **AppSettings**: triggerKey ('space'|'tab'|'enter'), caseSensitive, treePanelWidth

## Chrome Extension Details

- **Manifest V3** with service worker architecture
- **Permissions**: storage, clipboardWrite, contextMenus, activeTab
- **Default shortcut**: Alt+S to open popup
- Internationalization support via `_locales/` and `__MSG_*` placeholders

## Testing

Tests use Vitest and are co-located with source files using `.test.ts` suffix.

## Placeholder System

Placeholders are processed by `PlaceholderProcessor` (`src/domain/services/`). Supported placeholders:

- `<clipboard>`, `<selection>` - Insert clipboard/selection content, supports transforms (`:upper`, `:lower`, etc.)
- `<date:FORMAT>`, `<time:FORMAT>`, `<datetime:FORMAT>` - Date/time with custom formats
- `<cursor>` - Position cursor after expansion
- `<input:Label>`, `<input:Label:default>` - Prompt user for input
- `<select:Label:opt1,opt2,opt3>` - Dropdown selection
- `<tab:N>`, `<tab:N:default>` - Tab stops for multi-field navigation
