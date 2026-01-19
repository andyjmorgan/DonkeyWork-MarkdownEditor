export interface MarkdownFile {
  id: string
  name: string
  content: string
  lastModified: number
  isDirty: boolean
}

export interface FileState {
  files: Map<string, MarkdownFile>
  activeFileId: string | null
  tabs: string[]
}
