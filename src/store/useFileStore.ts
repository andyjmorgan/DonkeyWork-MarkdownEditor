import { create } from 'zustand'
import { MarkdownFile } from '@/types'

interface FileStore {
  files: Map<string, MarkdownFile>
  activeFileId: string | null
  tabs: string[]

  // Actions
  addFile: (file: MarkdownFile) => void
  loadFile: (file: MarkdownFile) => void
  updateFile: (id: string, updates: Partial<MarkdownFile>) => void
  removeFile: (id: string) => void
  setActiveFile: (id: string | null) => void
  openTab: (id: string) => void
  closeTab: (id: string) => void
  getActiveFile: () => MarkdownFile | null
  getFile: (id: string) => MarkdownFile | null
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: new Map(),
  activeFileId: null,
  tabs: [],

  addFile: (file) =>
    set((state) => {
      const newFiles = new Map(state.files)
      newFiles.set(file.id, file)
      return {
        files: newFiles,
        tabs: state.tabs.includes(file.id) ? state.tabs : [...state.tabs, file.id],
        activeFileId: file.id,
      }
    }),

  loadFile: (file) =>
    set((state) => {
      const newFiles = new Map(state.files)
      newFiles.set(file.id, file)
      return { files: newFiles }
    }),

  updateFile: (id, updates) =>
    set((state) => {
      const file = state.files.get(id)
      if (!file) return state

      const newFiles = new Map(state.files)
      newFiles.set(id, {
        ...file,
        ...updates,
        lastModified: Date.now(),
        isDirty: true,
      })
      return { files: newFiles }
    }),

  removeFile: (id) =>
    set((state) => {
      const newFiles = new Map(state.files)
      newFiles.delete(id)

      const newTabs = state.tabs.filter((tabId) => tabId !== id)
      const newActiveId =
        state.activeFileId === id
          ? newTabs.length > 0
            ? newTabs[newTabs.length - 1]
            : null
          : state.activeFileId

      return {
        files: newFiles,
        tabs: newTabs,
        activeFileId: newActiveId,
      }
    }),

  setActiveFile: (id) =>
    set({ activeFileId: id }),

  openTab: (id) =>
    set((state) => ({
      tabs: state.tabs.includes(id) ? state.tabs : [...state.tabs, id],
      activeFileId: id,
    })),

  closeTab: (id) =>
    set((state) => {
      const closedIndex = state.tabs.indexOf(id)
      const newTabs = state.tabs.filter((tabId) => tabId !== id)

      let newActiveId = state.activeFileId

      // Only change active file if we're closing the currently active tab
      if (state.activeFileId === id) {
        if (newTabs.length === 0) {
          newActiveId = null
        } else {
          // Try to activate the tab that was to the right of the closed tab
          // If the closed tab was the last one, activate the new last tab
          const newIndex = Math.min(closedIndex, newTabs.length - 1)
          newActiveId = newTabs[newIndex]
        }
      }

      return {
        tabs: newTabs,
        activeFileId: newActiveId,
      }
    }),

  getActiveFile: () => {
    const state = get()
    return state.activeFileId ? state.files.get(state.activeFileId) || null : null
  },

  getFile: (id) => {
    const state = get()
    return state.files.get(id) || null
  },
}))
