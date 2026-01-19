# Markdown Editor - Implementation Progress

## Project Overview
A beautiful, minimalistic markdown WYSIWYG editor with split view (raw markdown + live preview), both panes editable. Features dark/light theme support, autosave, multi-file tab management, and mobile-responsive design.

**Status**: Core functionality complete, ready for advanced features

---

## ✅ Completed Features

### Phase 1: Project Foundation
- [x] Vite + React 18 + TypeScript project setup
- [x] Tailwind CSS v3 with dark mode configuration
- [x] Shadcn UI component library integration
- [x] Project folder structure (components, lib, store, hooks, types)
- [x] TypeScript type definitions for files and editor state
- [x] PostCSS and autoprefixer configuration

**Key Files**:
- `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`
- `src/types/file.ts`, `src/types/editor.ts`

### Phase 2: State Management & Storage
- [x] Zustand stores for file management, editor state, and theme
- [x] IndexedDB wrapper using `idb` library
- [x] File CRUD operations (create, read, update, delete)
- [x] Persistent storage with automatic loading on mount
- [x] File operations hook (`useFileOperations`)

**Key Files**:
- `src/store/useFileStore.ts` - Central file state management
- `src/store/useEditorStore.ts` - Editor sync state
- `src/store/useThemeStore.ts` - Theme with localStorage persistence
- `src/lib/db/index.ts` - IndexedDB initialization
- `src/lib/db/fileStore.ts` - File CRUD operations
- `src/hooks/useFileOperations.ts` - File operation abstractions

**Storage Schema**:
```typescript
{
  files: Map<fileId, {
    id: string,
    name: string,
    content: string (raw markdown),
    lastModified: number,
    isDirty: boolean
  }>,
  activeFileId: string | null,
  tabs: string[]
}
```

### Phase 3: File Management UI
- [x] WelcomeScreen with file dropzone (react-dropzone)
- [x] NewFileDialog for creating new markdown files
- [x] TabBar for multi-file management
- [x] Tab close functionality with active tab tracking
- [x] File name truncation for long names
- [x] Dirty indicator (dot) for unsaved changes

**Key Files**:
- `src/components/welcome/WelcomeScreen.tsx`
- `src/components/welcome/FileDropzone.tsx`
- `src/components/dialogs/NewFileDialog.tsx`
- `src/components/layout/TabBar.tsx`

**Features**:
- Drag and drop .md, .markdown, .txt files
- Create new files with custom names
- Switch between open files via tabs
- Close tabs individually
- Visual indicator for unsaved changes

### Phase 4: Raw Markdown Editor
- [x] CodeMirror 6 integration (`@uiw/react-codemirror`)
- [x] Markdown syntax highlighting
- [x] Line numbers and code folding
- [x] Dark/light theme support
- [x] Debounced content updates to store
- [x] Mobile word wrapping (responsive)

**Key Files**:
- `src/components/editor/RawEditor.tsx`

**Features**:
- Full markdown syntax highlighting
- Line numbers, folding, bracket matching
- Auto-completion, search, history
- Responsive word wrapping on mobile (≤768px)
- Theme-aware (switches with app theme)

### Phase 5: Preview Editor (WYSIWYG)
- [x] Tiptap editor integration
- [x] StarterKit extensions (headings, bold, italic, lists, etc.)
- [x] Custom extensions (Underline, TaskList, TaskItem)
- [x] Formatting toolbar with buttons
- [x] Dark/light theme prose styling
- [x] Real-time preview rendering

**Key Files**:
- `src/components/editor/PreviewEditor.tsx`
- `src/components/layout/Toolbar.tsx`
- `src/components/editor/preview-editor.css`

**Toolbar Features**:
- Text formatting: Bold, Italic, Underline, Strikethrough, Inline Code
- Headings: H1, H2, H3
- Lists: Bullet, Numbered, Task/Checklist
- Blocks: Blockquote, Code Block

### Phase 6: Markdown Conversion & Sync
- [x] Markdown to HTML parser using `marked`
- [x] HTML to Markdown serializer using `turndown`
- [x] Bidirectional sync between raw and preview editors
- [x] Infinite loop prevention with refs
- [x] Cursor position preservation
- [x] GFM support (tables, strikethrough, task lists)

**Key Files**:
- `src/lib/markdown/parser.ts` - Markdown → HTML
- `src/lib/markdown/serializer.ts` - HTML → Markdown

**Sync Flow**:
```
Raw Editor (markdown)
  ↓ onChange
File Store (markdown)
  ↓ props
Preview Editor
  ↓ parser (markdown → HTML)
Tiptap Display
  ↓ onUpdate
  ↓ serializer (HTML → markdown)
File Store (markdown)
  ↓ props
Raw Editor
```

**Loop Prevention**:
- `lastEmittedContentRef` tracks last emitted content
- Skip update if content matches what was just emitted
- `isUpdatingRef` prevents onChange during programmatic updates

### Layout & UI Components
- [x] AppLayout with header, tabs, and main content area
- [x] SplitView with draggable resizable divider
- [x] ViewModeToggle for Code/Preview/Split modes
- [x] ThemeToggle button (Sun/Moon icons)
- [x] DonkeyWork logo and branding

**Key Files**:
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/SplitView.tsx`
- `src/components/layout/ViewModeToggle.tsx`
- `src/components/common/ThemeToggle.tsx`
- `src/components/editor/EditorView.tsx`

**SplitView Features**:
- Draggable divider between panes
- Resizable from 20% to 80%
- Hover and drag visual feedback
- Smooth resize with percentage-based widths

**View Modes**:
- **Code**: Raw markdown editor only
- **Preview**: WYSIWYG editor only
- **Split**: Side-by-side editors with sync

### Responsive Design & Mobile
- [x] Media query hook (`useMediaQuery`)
- [x] Mobile-optimized view mode toggle placement
- [x] No split mode on mobile (Code/Preview only)
- [x] Word wrapping enabled on mobile
- [x] Headers hidden on mobile to maximize space
- [x] Centered toggle section on mobile
- [x] Responsive breakpoint: 768px

**Key Files**:
- `src/hooks/useMediaQuery.ts`

**Mobile Layout** (≤768px):
```
┌─────────────────────────┐
│  [Code] [Preview]       │ ← Centered toggle section
├─────────────────────────┤
│                         │
│    Editor Content       │
│   (full screen space)   │
│                         │
└─────────────────────────┘
```

**Desktop Layout** (>768px):
```
┌──────────────┬──────────────┐
│ Markdown     │ Preview   [≡]│ ← Headers with inline toggle
├──────────────┼──────────────┤
│              │              │
│ Raw Editor   │ WYSIWYG      │
│              │              │
└──────────────┴──────────────┘
```

### Theme & Styling
- [x] Light/dark mode with CSS variables
- [x] Theme persistence in localStorage
- [x] Smooth theme transitions
- [x] Custom scrollbar styling (theme-aware)
- [x] Shadcn UI color system (HSL variables)
- [x] Prose styling for preview content
- [x] CodeMirror theme sync

**Key Files**:
- `src/index.css` - Global styles and CSS variables
- `tailwind.config.js` - Theme configuration

**Scrollbar Theming**:
- Light mode: Subtle gray scrollbars
- Dark mode: More visible scrollbars
- Hover effects for better UX
- Webkit and Firefox support

### Branding
- [x] DonkeyWork logo from chat.donkeywork.dev
- [x] Logo in header (28x28px)
- [x] Updated app title: "Markdown Editor"
- [x] Favicon integration
- [x] Theme toggle in top right

**Assets**:
- `public/donkeywork.png` - Main logo
- `public/donkeywork-icon.ico` - Favicon

---

## 📊 Architecture Summary

### Tech Stack
```json
{
  "core": "Vite + React 18 + TypeScript",
  "styling": "TailwindCSS v3 + Shadcn UI",
  "editors": {
    "raw": "CodeMirror 6 with markdown support",
    "preview": "Tiptap with custom extensions"
  },
  "storage": "IndexedDB (idb library)",
  "state": "Zustand with persist middleware",
  "markdown": {
    "parser": "marked (markdown → HTML)",
    "serializer": "turndown (HTML → markdown)"
  },
  "utils": "react-dropzone, nanoid, lucide-react"
}
```

### Component Hierarchy
```
App
└── AppLayout
    ├── Header (Logo + Title + ThemeToggle)
    ├── TabBar (when files open)
    └── Main Content
        ├── WelcomeScreen (no files)
        └── EditorView (has files)
            ├── ViewModeToggle
            ├── RawEditor (CodeMirror)
            ├── PreviewEditor (Tiptap + Toolbar)
            └── SplitView (both editors)
```

### Data Flow
```
User Input → Editor Component → useFileOperations
  → useFileStore (Zustand) → IndexedDB
  → Auto-save (future) → Persistence
```

### File Structure
```
src/
├── components/
│   ├── ui/              # Shadcn: Button, Dialog, Input, Label
│   ├── layout/          # AppLayout, Header, Toolbar, TabBar, SplitView
│   ├── editor/          # RawEditor, PreviewEditor, EditorView
│   ├── welcome/         # WelcomeScreen, FileDropzone
│   ├── dialogs/         # NewFileDialog
│   └── common/          # ThemeToggle
├── lib/
│   ├── db/              # IndexedDB wrapper, file CRUD
│   ├── markdown/        # Parser (marked), Serializer (turndown)
│   └── utils.ts         # cn() utility
├── store/               # Zustand stores (file, editor, theme)
├── hooks/               # useFileOperations, useMediaQuery
└── types/               # TypeScript interfaces
```

---

## 🚧 Pending Features

### Phase 7: Mermaid Diagrams
- [ ] MermaidDiagram component
- [ ] Mermaid code block detection
- [ ] Diagram rendering with error handling
- [ ] Tiptap custom node for Mermaid

### Phase 8: Menu Bar & Shortcuts
- [ ] Header MenuBar (File, Edit, Format, View menus)
- [ ] Keyboard shortcuts hook
- [ ] Cmd+B, Cmd+I, Cmd+S, etc.
- [ ] Menu items for all toolbar actions

### Phase 9: Autosave
- [ ] Autosave hook (30s interval)
- [ ] AutosaveIndicator component
- [ ] Silent save to IndexedDB
- [ ] "Last saved" timestamp display

### Phase 10: Export & Download
- [ ] Save As dialog
- [ ] Download markdown file (.md)
- [ ] PDF export with jsPDF + html2canvas
- [ ] Force light theme for PDF
- [ ] Mermaid diagrams as images in PDF

### Phase 12: Polish & Testing
- [ ] Error boundaries
- [ ] Loading states
- [ ] Animations and transitions
- [ ] Edge case testing (large files, many tabs)
- [ ] Cross-browser testing
- [ ] Performance optimization

---

## 📈 Statistics

- **Total Components**: 25+
- **Lines of Code**: ~3000+
- **Dependencies**: 25+ packages
- **Supported File Types**: .md, .markdown, .txt
- **Mobile Breakpoint**: 768px
- **Storage**: IndexedDB (unlimited)
- **Themes**: Light + Dark

---

## 🎯 Current Status

**Working Features**:
✅ Create/load/save markdown files
✅ Multi-file tab management
✅ Dual editor (raw + preview) with live sync
✅ Formatting toolbar with 15+ actions
✅ Dark/light theme with persistence
✅ Mobile responsive (word wrap, optimized layout)
✅ Draggable splitter for resizing panes
✅ File persistence with IndexedDB
✅ Drag & drop file loading

**Ready For**:
- Advanced features (Mermaid, autosave, export)
- Keyboard shortcuts
- Menu bar
- PDF generation
- Production deployment

---

## 🔧 How to Run

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Dev Server**: http://localhost:5173

---

## 📝 Notes

- Theme preference saved to localStorage
- Files saved to IndexedDB (persists across sessions)
- Mobile: Code or Preview only (no split)
- Desktop: All three view modes available
- Markdown sync prevents infinite loops
- Word wrapping enabled on mobile for better UX
- Scrollbars themed for light/dark mode
- Tab management supports unlimited files

---

**Last Updated**: 2026-01-19
**Version**: MVP (Core Complete)
