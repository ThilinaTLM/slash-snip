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
pnpm test             # Run Vitest in watch mode
pnpm test:ui          # Vitest with browser UI
pnpm test:coverage    # Single run with coverage report
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

- **Background Service Worker** (`presentation/background/`): Central message hub, manages storage operations
- **Content Script** (`presentation/content/`): Vanilla TypeScript, monitors input fields for triggers, handles expansion
- **Popup** (`presentation/popup/`): React app for quick template access
- **Options Page** (`presentation/options/`): React app for full template management

### Path Aliases

Configured in both `tsconfig.json` and `vite.config.ts`:
- `@domain/*` → `src/domain/*`
- `@application/*` → `src/application/*`
- `@infrastructure/*` → `src/infrastructure/*`
- `@presentation/*` → `src/presentation/*`
- `@shared/*` → `src/shared/*`
- `@di/*` → `src/di/*`

## Data Schemas

Core TypeScript interfaces are defined in the SRS (`docs/SRS.md`):

- **Template**: id, trigger, name, content, description?, categoryId?, tags[], siteRestrictions?, timestamps, usageCount, isFavorite
- **Category**: id, name, parentId?, order
- **Settings**: triggerDelimiters, enableCommandPalette, shortcuts, theme, storageMode

## Chrome Extension Details

- **Manifest V3** with service worker architecture
- **Permissions**: storage, clipboardWrite, contextMenus, activeTab
- **Default shortcut**: Alt+S to open popup
- Internationalization support via `_locales/` and `__MSG_*` placeholders
