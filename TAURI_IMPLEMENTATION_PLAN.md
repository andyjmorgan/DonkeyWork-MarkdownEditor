# Tauri Desktop App Implementation Plan

## Overview
Convert the web-based markdown editor to a Tauri desktop application with native file system access.

## Current State (Web/IndexedDB)

**File Structure:**
- `MarkdownFile`: id, name, content, lastModified, isDirty
- Storage: IndexedDB (idb library)
- No file paths - just IDs and names
- Files created with nanoid, stored entirely in browser

**Current Operations:**
- Create new → stores in IndexedDB
- Load from file → reads File object, stores content in IndexedDB
- Save → saves to IndexedDB
- Save As → downloads via file-saver
- Autosave → saves all dirty files to IndexedDB every 3s
- Recent files → shown in WelcomeScreen, loaded from IndexedDB

## Phase 1: Tauri Setup ✓

1. Install Tauri CLI and dependencies
2. Initialize Tauri project structure
3. Configure Tauri for the Vite React app
4. Set up app icons and metadata
5. Verify app builds and runs on desktop
6. Test development workflow (hot reload, etc.)

## Phase 2: File System Abstraction

### 2.1 Update File Type
```typescript
interface MarkdownFile {
  id: string
  name: string
  content: string
  lastModified: number
  isDirty: boolean
  filePath?: string      // NEW: Real file path for Tauri
  isUntitled?: boolean   // NEW: True for unsaved new files
}
```

### 2.2 Create Storage Abstraction Layer
```
src/lib/storage/
├── types.ts              # IStorageProvider interface
├── provider.ts           # Factory to get correct provider
├── indexeddb/
│   └── provider.ts      # Web implementation (current code)
└── tauri/
    ├── provider.ts      # File system implementation
    ├── commands.ts      # Tauri invoke wrappers
    └── recent-files.ts  # Recent files stored in app config
```

**Interface:**
```typescript
interface IStorageProvider {
  getAllFiles(): Promise<MarkdownFile[]>
  getFile(id: string): Promise<MarkdownFile | undefined>
  saveFile(file: MarkdownFile): Promise<void>
  deleteFile(id: string): Promise<void>

  // Tauri-specific (no-op in web)
  openFileDialog(): Promise<MarkdownFile | null>
  saveFileDialog(file: MarkdownFile): Promise<MarkdownFile>
  getRecentFiles(): Promise<MarkdownFile[]>
}
```

### 2.3 Refactor Existing Code
- Move current IndexedDB code to `src/lib/storage/indexeddb/provider.ts`
- Implement `IStorageProvider` interface
- Update `useFileOperations` to use storage provider
- Add provider factory that detects Tauri vs web

## Phase 3: Tauri File System Provider

### 3.1 Rust Backend Commands
```rust
// src-tauri/src/commands.rs
#[tauri::command]
async fn open_file_dialog() -> Result<Option<FileData>, String>

#[tauri::command]
async fn save_file_dialog(content: String, filename: String) -> Result<String, String>

#[tauri::command]
async fn read_file(path: String) -> Result<String, String>

#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String>

#[tauri::command]
async fn get_recent_files() -> Result<Vec<String>, String>

#[tauri::command]
async fn add_recent_file(path: String) -> Result<(), String>
```

### 3.2 Frontend Provider
- Implement `TauriFileSystemProvider` using Tauri invoke
- Handle file dialogs (open/save)
- Read/write to disk
- Manage recent files list in app config

## Phase 4: File Menu Integration

### 4.1 Add File Menu Component
- **File > New**: Creates untitled file, no path, not auto-saved
- **File > Open**: Native file picker → loads from disk → has path → auto-saveable
- **File > Save**:
  - If `filePath` exists → save to path
  - Else → trigger Save As
- **File > Save As**: Always show save dialog, updates `filePath`
- **File > Recent Files**: Submenu with last 10 files (paths only, load on demand)

### 4.2 Keyboard Shortcuts
- `Cmd/Ctrl + N`: New file
- `Cmd/Ctrl + O`: Open file
- `Cmd/Ctrl + S`: Save file
- `Cmd/Ctrl + Shift + S`: Save As
- `Cmd/Ctrl + W`: Close tab (with prompt if dirty)

## Phase 5: Autosave Strategy

### 5.1 Web Behavior (Unchanged)
- All files autosave to IndexedDB every 3s
- No prompts, no dialogs

### 5.2 Tauri Behavior
- Only autosave files with `filePath`
- Skip untitled files (require manual Save As)
- Write directly to disk every 3s
- No dialog prompts
- Update lastModified timestamp

### 5.3 Implementation
- Update `useAutosave` hook to check for Tauri
- Filter files: only save those with `filePath` in Tauri mode
- Use storage provider for saves

## Phase 6: Dirty State & Prompts

### 6.1 Visual Indicators
- Show `*` in tab title when file is dirty
- Show dot indicator on close button

### 6.2 Unsaved Changes Dialogs
- **Before closing tab**: "Save changes to {filename}?"
  - Buttons: "Save", "Don't Save", "Cancel"
- **Before closing window**: "You have unsaved changes"
  - List dirty files
  - Buttons: "Save All", "Don't Save", "Cancel"
- **Before quitting app**: Same as window close

### 6.3 Implementation
- Add dialog component for unsaved changes
- Hook into tab close action
- Hook into window/app close events (Tauri)

## Phase 7: Recent Files

### 7.1 Web (Keep Current)
- Stay in WelcomeScreen
- Load from IndexedDB
- Show last 10 files

### 7.2 Tauri (Move to Menu)
- Remove from WelcomeScreen
- Add to File menu dropdown
- Store file paths in app config
- Load file content on demand
- Show last 10 files with full paths

## Phase 8: Error Handling

### 8.1 File System Errors
- **File not found**: "The file was moved or deleted"
- **Permission denied**: "You don't have permission to access this file"
- **Invalid path**: Validate before saving
- **Disk full**: Handle write errors gracefully

### 8.2 User Experience
- Show error toasts/dialogs
- Remove missing files from recent list
- Offer to close tab or keep in memory

## Phase 9: Additional Features

### 9.1 File Extension Enforcement
- Always use `.md` extension
- Auto-append if missing
- Filter file picker to `.md` files

### 9.2 File Metadata
- Store last opened time
- Track file size
- Show file info in status bar

## Future Enhancements (Post-MVP)

- **File watchers**: Detect external changes, prompt to reload
- **Multi-window support**: Open multiple windows
- **Workspace/folder opening**: Open entire folder as workspace
- **File templates**: Start from templates
- **Export to multiple formats**: HTML, DOCX, etc.
- **Version history**: Local git integration or snapshots
- **Conflict resolution**: Handle concurrent edits

## Implementation Checklist

### Phase 1: Tauri Setup
- [ ] Install Tauri dependencies
- [ ] Initialize Tauri project
- [ ] Configure tauri.conf.json
- [ ] Set up app icons
- [ ] Test dev build
- [ ] Test production build
- [ ] Verify hot reload works

### Phase 2: Storage Abstraction
- [ ] Create IStorageProvider interface
- [ ] Refactor IndexedDB code to provider
- [ ] Create provider factory
- [ ] Update useFileOperations
- [ ] Update useAutosave
- [ ] Test web app still works

### Phase 3: Tauri Provider
- [ ] Create Rust commands
- [ ] Create TypeScript wrapper
- [ ] Implement TauriFileSystemProvider
- [ ] Test file operations
- [ ] Handle errors

### Phase 4: File Menu
- [ ] Create FileMenu component
- [ ] Add to Header/MenuBar
- [ ] Implement New/Open/Save/Save As
- [ ] Add keyboard shortcuts
- [ ] Test all operations

### Phase 5: Autosave
- [ ] Update autosave logic for Tauri
- [ ] Skip untitled files
- [ ] Test autosave to disk
- [ ] Verify no data loss

### Phase 6: Dirty State
- [ ] Add visual indicators (* in tab)
- [ ] Create unsaved changes dialog
- [ ] Hook into close events
- [ ] Test all scenarios

### Phase 7: Recent Files
- [ ] Move to File menu in Tauri
- [ ] Store in app config
- [ ] Load on demand
- [ ] Test recent files list

### Phase 8: Polish
- [ ] Error handling and messages
- [ ] Loading states
- [ ] File path display
- [ ] Status bar info
- [ ] Testing on all platforms

## Platform Support

- macOS (primary development)
- Windows
- Linux

## Testing Strategy

1. **Unit tests**: Storage providers, file operations
2. **Integration tests**: Full file workflows
3. **Manual testing**:
   - Create/open/save files
   - Autosave behavior
   - Unsaved changes prompts
   - Recent files
   - Error scenarios
4. **Platform testing**: Verify on macOS, Windows, Linux
