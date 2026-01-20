# DonkeyWork Markdown Editor

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)

A beautiful, minimalistic markdown WYSIWYG editor with split-view editing, live preview, and powerful features.

## Features

- **Dual-Pane Split View** - Edit raw markdown (CodeMirror) and see live WYSIWYG preview (Tiptap) side-by-side
- **Real-time Sync** - Changes in either pane instantly reflect in the other
- **Multi-File Tabs** - Work with multiple markdown files simultaneously
- **Mermaid Diagrams** - Create flowcharts, sequence diagrams, and more
- **GitHub Flavored Markdown** - Tables, task lists, strikethrough, and more
- **Dark/Light Theme** - Beautiful themes with smooth transitions
- **Auto-save** - Automatic saves every 3 seconds to IndexedDB
- **PDF Export** - Export documents to PDF with one click
- **Drag & Drop** - Import markdown files by dragging them in
- **Offline-First** - Works completely offline with IndexedDB storage

## Tech Stack

**Core:** React 18, TypeScript 5.2, Vite 5.0, TailwindCSS, Shadcn UI

**Editors:** CodeMirror 6 (raw), Tiptap 3 (WYSIWYG)

**Features:** Mermaid diagrams, jsPDF export, Zustand state, IndexedDB storage

## Quick Start

### Docker (Recommended)

```bash
docker compose up
```

Visit `http://localhost:3000`

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Docker Deployment

The application is available as a Docker image from GitHub Container Registry:

```bash
# Pull the latest image
docker pull ghcr.io/andyjmorgan/donkeywork-markdowneditor:latest

# Run with Docker
docker run -p 3000:80 ghcr.io/andyjmorgan/donkeywork-markdowneditor:latest

# Or use docker-compose
docker compose up
```

## Keyboard Shortcuts

### File Operations
- `Ctrl/Cmd + N` - New file
- `Ctrl/Cmd + S` - Save (immediate)

### Formatting
- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline
- `Ctrl/Cmd + K` - Link
- `Ctrl/Cmd + 1/2/3` - Headings
- `Ctrl/Cmd + E` - Code block
- `Ctrl/Cmd + Shift + L` - Bullet list
- `Ctrl/Cmd + Shift + O` - Ordered list
- `Ctrl/Cmd + Shift + T` - Task list
- `Ctrl/Cmd + Shift + Q` - Blockquote

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires IndexedDB support.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with React, TypeScript, and Vite
