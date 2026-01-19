export type SyncMode = 'raw-to-preview' | 'preview-to-raw' | 'idle'

export type EditorPane = 'raw' | 'preview'

export interface EditorState {
  syncMode: SyncMode
  lastEditedPane: EditorPane
}

export type Theme = 'light' | 'dark'
