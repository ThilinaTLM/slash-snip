# SlashSnip

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/dfkgkphjpoaehkdpfbnmngbeoaaikjll)](https://chromewebstore.google.com/detail/slashsnip/dfkgkphjpoaehkdpfbnmngbeoaaikjll)

A Chromium browser extension for text template expansion. Define templates with trigger shortcuts (e.g., `/fg`, `::email`) that expand into full text with support for dynamic placeholders.

## Features

- **Custom Triggers**: Define any trigger pattern like `/sig`, `::addr`, or `//todo`
- **Dynamic Placeholders**: Insert clipboard content, dates, user input, and more
- **Tab Stops**: Navigate through multiple fields after expansion
- **Organize Templates**: Group templates into categories for easy management
- **Import/Export**: Backup and restore your templates as JSON
- **Privacy-First**: All data stored locally, no external servers

## Placeholders

| Placeholder                | Description                             |
| -------------------------- | --------------------------------------- |
| `<clipboard>`              | Insert clipboard content                |
| `<selection>`              | Insert selected text                    |
| `<date:FORMAT>`            | Insert date (e.g., `<date:YYYY-MM-DD>`) |
| `<time:FORMAT>`            | Insert time (e.g., `<time:HH:mm>`)      |
| `<cursor>`                 | Position cursor after expansion         |
| `<input:Label>`            | Prompt for user input                   |
| `<input:Label:default>`    | Input with default value                |
| `<select:Label:opt1,opt2>` | Dropdown selection                      |
| `<tab:N>`                  | Tab stop for field navigation           |

Text transforms available: `:upper`, `:lower`, `:capitalize`, `:title`

## Installation

### From Source

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Build the extension: `pnpm build`
4. Open Chrome and go to `chrome://extensions`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the `dist/` folder

### From Chrome Web Store

[Install SlashSnip](https://chromewebstore.google.com/detail/slashsnip/dfkgkphjpoaehkdpfbnmngbeoaaikjll) from the Chrome Web Store.

## Usage

1. Click the extension icon or press `Alt+S` to open the options page
2. Create a new template with a trigger (e.g., `/hello`) and content
3. In any text field, type your trigger followed by Space/Tab/Enter
4. The trigger expands into your template content

## Development

```bash
pnpm dev          # Start dev server with HMR
pnpm build        # Production build
pnpm typecheck    # Type check
pnpm lint         # Lint code
pnpm test         # Run tests
```

## Architecture

SlashSnip follows Domain-Driven Design with clean architecture:

```
src/
├── domain/         # Core business logic
├── application/    # Use cases
├── infrastructure/ # Chrome APIs, storage
├── presentation/   # UI (React), content script, background worker
└── shared/         # Utilities, types, constants
```

## Privacy

SlashSnip stores all data locally on your device. No data is collected, transmitted, or shared. See [PRIVACY.md](PRIVACY.md) for details.

## License

[MIT](LICENSE)
