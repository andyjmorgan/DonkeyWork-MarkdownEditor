# DonkeyWork Markdown Editor

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff)](https://vitejs.dev/)

A beautiful, minimalistic markdown WYSIWYG editor with split-view editing, live preview, and powerful features for modern markdown workflows.

![DonkeyWork Editor Screenshot](./docs/screenshots/main-interface.png)

## Features

### Core Editing
- **Dual-Pane Split View** - Edit raw markdown and see live preview side-by-side
- **Both Panes Editable** - Seamlessly switch between raw markdown (CodeMirror) and rich WYSIWYG (Tiptap)
- **Real-time Sync** - Changes in either pane instantly reflect in the other
- **Multi-File Tabs** - Work with multiple markdown files simultaneously

### Content Features
- **Mermaid Diagram Support** - Create flowcharts, sequence diagrams, and more
- **GitHub Flavored Markdown** - Full GFM support including tables, task lists, and strikethrough
- **Syntax Highlighting** - Code blocks with automatic language detection
- **Rich Text Formatting** - Headings, lists, blockquotes, links, images, and tables

### User Experience
- **Dark/Light Theme** - Beautiful themes that are easy on the eyes
- **Auto-save** - Automatic saves every 3 seconds to IndexedDB
- **PDF Export** - Export your markdown documents to PDF with one click
- **Drag & Drop** - Import markdown files by dragging them into the editor
- **Keyboard Shortcuts** - Speed up your workflow with comprehensive shortcuts

### Technical
- **IndexedDB Storage** - All files stored locally in your browser
- **Offline-First** - Works completely offline, no server required
- **Type-Safe** - Built with TypeScript for reliability
- **Responsive Design** - Works beautifully on desktop and tablet

## Screenshots

### Split View Editing
![Split View](./docs/screenshots/split-view.png)

### Dark Mode
![Dark Mode](./docs/screenshots/dark-mode.png)

### Mermaid Diagrams
![Mermaid Diagrams](./docs/screenshots/mermaid-diagram.png)

## Tech Stack

### Frontend Framework
- **React 18.2** - Modern React with hooks and concurrent features
- **TypeScript 5.2** - Type-safe development
- **Vite 5.0** - Lightning-fast build tool and dev server

### UI & Styling
- **TailwindCSS 3.4** - Utility-first CSS framework
- **Shadcn UI** - Beautiful, accessible component library
- **Lucide React** - Consistent icon set

### Editors
- **CodeMirror 6** - Powerful, extensible code editor for raw markdown
- **Tiptap 3.15** - Headless rich text editor built on ProseMirror
- **@uiw/react-codemirror** - React wrapper for CodeMirror

### Markdown Processing
- **Marked 17.0** - Fast markdown parser
- **React Markdown 10.1** - Render markdown as React components
- **Remark GFM** - GitHub Flavored Markdown support
- **Turndown 7.2** - HTML to markdown converter

### Additional Features
- **Mermaid 11.12** - Diagram and chart generation
- **jsPDF 4.0** - PDF generation
- **html2canvas 1.4** - Screenshot rendering for PDF export
- **Lowlight 3.3** - Syntax highlighting for code blocks

### State & Storage
- **Zustand 5.0** - Lightweight state management
- **idb 8.0** - IndexedDB wrapper for persistent storage
- **nanoid 5.1** - Unique ID generation

## Getting Started

### Prerequisites
- **Node.js** 18+
- **npm** or **yarn** or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/markitdown-editor.git

# Navigate to the project directory
cd markitdown-editor

# Install dependencies
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `dist` directory.

## Development

### Project Structure

```
markitdown-editor/
├── src/
│   ├── components/
│   │   ├── common/          # Shared components (ThemeToggle, AutosaveIndicator)
│   │   ├── dialogs/         # Modal dialogs (NewFile, Link, Image, Mermaid)
│   │   ├── editor/          # Editor components (RawEditor, PreviewEditor)
│   │   ├── layout/          # Layout components (AppLayout, Toolbar, TabBar)
│   │   ├── ui/              # Shadcn UI components
│   │   └── welcome/         # Welcome screen and file dropzone
│   ├── hooks/               # Custom React hooks
│   │   ├── useAutosave.ts
│   │   ├── useFileOperations.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useMediaQuery.ts
│   ├── lib/
│   │   ├── db/              # IndexedDB operations
│   │   ├── markdown/        # Markdown parsing and serialization
│   │   └── pdf/             # PDF export functionality
│   ├── store/               # Zustand state stores
│   │   ├── useEditorStore.ts
│   │   ├── useFileStore.ts
│   │   └── useThemeStore.ts
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### Code Style

This project uses ESLint for code quality:

```bash
npm run lint
```

### State Management

The application uses Zustand for state management with three main stores:

- **`useFileStore`** - Manages files, tabs, and file operations
- **`useEditorStore`** - Manages editor state and view modes
- **`useThemeStore`** - Manages theme preferences

### Storage

Files are stored in IndexedDB using the `idb` library. The database schema includes:
- **files** - Stores file content, metadata, and timestamps
- Automatic cleanup of old files
- Efficient querying and updates

## Docker

### Building the Docker Image

```bash
docker build -t markitdown-editor .
```

### Running with Docker

```bash
docker run -p 5173:5173 markitdown-editor
```

### Docker Compose

```bash
docker-compose up
```

The application will be available at `http://localhost:5173`

## Keyboard Shortcuts

### File Operations
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | Create new file |
| `Ctrl/Cmd + S` | Save current file (triggers immediate save) |

### Text Formatting
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Bold text |
| `Ctrl/Cmd + I` | Italic text |
| `Ctrl/Cmd + U` | Underline text |
| `Ctrl/Cmd + K` | Insert/edit link |

### Headings
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + 1` | Toggle Heading 1 |
| `Ctrl/Cmd + 2` | Toggle Heading 2 |
| `Ctrl/Cmd + 3` | Toggle Heading 3 |

### Lists & Blocks
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Shift + L` | Toggle bullet list |
| `Ctrl/Cmd + Shift + O` | Toggle ordered list |
| `Ctrl/Cmd + Shift + T` | Toggle task list |
| `Ctrl/Cmd + E` | Toggle code block |
| `Ctrl/Cmd + Shift + Q` | Toggle blockquote |

## Architecture Overview

### Component Architecture

The application follows a modular component architecture:

1. **Layout Layer** - `AppLayout` provides the overall structure with toolbar, tab bar, and content area
2. **View Layer** - `EditorView` orchestrates the split view and manages editor synchronization
3. **Editor Layer** - `RawEditor` (CodeMirror) and `PreviewEditor` (Tiptap) handle the actual editing
4. **Dialog Layer** - Modal dialogs for file operations and content insertion

### Data Flow

```
User Input → Editor Component → Store Update → IndexedDB Save
                                     ↓
                              Other Components Update (via Zustand)
```

### Autosave Mechanism

- Monitors file content changes via Zustand store
- Debounces saves to 3-second intervals
- Updates IndexedDB in background
- Shows visual indicator during save operations

### Markdown Synchronization

When editing in either pane:
1. Raw Editor → Content changes → Parse to HTML → Update Preview Editor
2. Preview Editor → Content changes → Serialize to Markdown → Update Raw Editor

Both editors stay in sync using a bidirectional synchronization system.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

**Note:** IndexedDB support is required. The application will not work in browsers with IndexedDB disabled.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Write clean, readable TypeScript code
- Follow React best practices and hooks guidelines
- Use functional components with TypeScript
- Add TypeScript types for all props and functions
- Keep components small and focused
- Write meaningful commit messages

## Roadmap

Future enhancements being considered:

- [ ] Real-time collaboration
- [ ] Cloud sync (optional)
- [ ] More export formats (DOCX, HTML)
- [ ] Custom themes and editor preferences
- [ ] File system API integration
- [ ] Math equation support (KaTeX)
- [ ] Search and replace across files
- [ ] Version history and time travel
- [ ] Mobile app (React Native)

## Known Issues

- PDF export may have rendering issues with complex Mermaid diagrams
- Very large files (>10MB) may experience performance degradation
- Safari may have occasional IndexedDB issues on iOS

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **CodeMirror** - Excellent code editor component
- **Tiptap** - Powerful headless editor framework
- **Shadcn UI** - Beautiful component library
- **Mermaid** - Amazing diagram generation
- The entire open-source community

## Support

If you encounter any issues or have questions:

- Open an issue on [GitHub Issues](https://github.com/yourusername/markitdown-editor/issues)
- Check existing issues for solutions
- Provide detailed bug reports with steps to reproduce

## Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Website: [yourwebsite.com](https://yourwebsite.com)

---

Made with ❤️ using React, TypeScript, and lots of markdown
