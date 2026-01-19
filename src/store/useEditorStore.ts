import { create } from 'zustand'
import { SyncMode, EditorPane } from '@/types'

interface EditorStore {
  syncMode: SyncMode
  lastEditedPane: EditorPane

  // Actions
  setSyncMode: (mode: SyncMode) => void
  setLastEditedPane: (pane: EditorPane) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  syncMode: 'idle',
  lastEditedPane: 'raw',

  setSyncMode: (mode) => set({ syncMode: mode }),
  setLastEditedPane: (pane) => set({ lastEditedPane: pane }),
}))
