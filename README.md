# Markdown Editor

A native desktop markdown editor with WYSIWYG editing, split-view, and live preview. Built with Tauri v2, React, and TypeScript.

## Features

- **Split View Editing** -- Edit raw markdown (CodeMirror) alongside a live WYSIWYG preview (Tiptap), with changes synced in real time between both panes.
- **Multi-Tab Interface** -- Work with multiple markdown files at once using a tabbed editor.
- **Native File Dialogs** -- Open, save, and create files through system-native file dialogs powered by Tauri.
- **File Associations** -- Double-click `.md` or `.markdown` files in your OS to open them directly in the editor.
- **Recent Files** -- Quick access to recently opened documents from the file menu.
- **Mermaid Diagrams** -- Render flowcharts, sequence diagrams, Gantt charts, and other Mermaid diagram types inline.
- **GitHub Flavored Markdown** -- Full support for tables, task lists, strikethrough, and fenced code blocks.
- **PDF Export** -- Export any document to PDF with a single click.
- **Dark and Light Themes** -- Switch between dark and light themes with smooth transitions.
- **Auto-Save** -- Files with a path on disk are automatically saved every 3 seconds.
- **Keyboard Shortcuts** -- Standard shortcuts for all common operations (see below).
- **Drag and Drop** -- Import markdown files by dragging them into the editor window.

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop runtime | Tauri v2 (Rust backend) |
| Frontend framework | React 18, TypeScript 5 |
| Build tool | Vite 5 |
| Raw markdown editor | CodeMirror 6 |
| WYSIWYG editor | Tiptap 3 |
| Styling | TailwindCSS, Radix UI primitives |
| State management | Zustand |
| Diagram rendering | Mermaid |
| PDF generation | jsPDF, html2canvas |

## Platforms

- **macOS** (Apple Silicon) -- code-signed and notarized DMG
- **Windows** -- MSI and NSIS installers

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- Platform-specific Tauri prerequisites: https://v2.tauri.app/start/prerequisites/

### Development

```bash
npm install
npm run tauri dev
```

The app will launch with hot-reload enabled. The Vite dev server runs at `http://localhost:5173` and the Tauri window connects to it automatically.

### Production Build

```bash
npm run tauri build
```

Built artifacts (DMG, MSI, or NSIS installer) are placed in `src-tauri/target/release/bundle/`.

## Keyboard Shortcuts

### File Operations

| Shortcut | Action |
|---|---|
| Cmd/Ctrl + N | New file |
| Cmd/Ctrl + O | Open file |
| Cmd/Ctrl + S | Save file |
| Cmd/Ctrl + Shift + S | Save as |
| Cmd/Ctrl + W | Close tab |

### Formatting

| Shortcut | Action |
|---|---|
| Cmd/Ctrl + B | Bold |
| Cmd/Ctrl + I | Italic |
| Cmd/Ctrl + U | Underline |
| Cmd/Ctrl + K | Insert link |
| Cmd/Ctrl + E | Code block |
| Cmd/Ctrl + 1/2/3 | Heading level 1/2/3 |
| Cmd/Ctrl + Shift + L | Bullet list |
| Cmd/Ctrl + Shift + O | Ordered list |
| Cmd/Ctrl + Shift + T | Task list |
| Cmd/Ctrl + Shift + Q | Blockquote |

## Project Structure

```
markitdown-editor/
  src/                  # React frontend
    components/         # UI components (editor, layout, dialogs, welcome)
    hooks/              # Custom React hooks (file operations, autosave)
    lib/                # Utilities and storage providers
    store/              # Zustand state management
    types/              # TypeScript type definitions
  src-tauri/            # Tauri / Rust backend
    src/lib.rs          # Tauri commands (file I/O, recent files, dialogs)
    tauri.conf.json     # App configuration and bundle settings
    icons/              # App icons for all platforms
  .github/workflows/    # CI/CD (PR builds, releases, container publishing)
```

## License

MIT

---

Built by [DonkeyWork](https://github.com/andyjmorgan).
