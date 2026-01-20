export interface MarkdownFile {
  id: string
  name: string
  content: string
  lastModified: number
  isDirty: boolean
  filePath?: string      // Real file path for Tauri
  isUntitled?: boolean   // True for unsaved new files
}

export interface FileState {
  files: Map<string, MarkdownFile>
  activeFileId: string | null
  tabs: string[]
}
