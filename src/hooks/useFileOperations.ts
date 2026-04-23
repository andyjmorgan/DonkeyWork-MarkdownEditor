import { useCallback } from 'react'
import { nanoid } from 'nanoid'
import { saveAs as downloadFile } from 'file-saver'
import { useFileStore } from '@/store'
import { MarkdownFile } from '@/types'
import * as db from '@/lib/db/fileStore'
import { getStorage, isTauri } from '@/lib/storage/provider'

export function useFileOperations() {
  const {
    addFile,
    updateFile,
    removeFile,
    files,
    activeFileId,
  } = useFileStore()

  const createNewFile = useCallback(
    async (name: string, content: string = '') => {
      const storage = getStorage()

      // In Tauri mode, show save dialog first
      if (isTauri() && storage.saveFileDialog) {
        const tempFile: MarkdownFile = {
          id: nanoid(),
          name,
          content,
          lastModified: Date.now(),
          isDirty: false,
          isUntitled: true,
        }

        try {
          const savedFile = await storage.saveFileDialog(tempFile)
          addFile(savedFile)
          return savedFile
        } catch (error) {
          console.error('Save dialog error:', error)
          // User cancelled the save dialog
          if ((error as Error).message === 'Save cancelled') {
            return null
          }
          throw error
        }
      }

      // Web mode: save to IndexedDB
      const newFile: MarkdownFile = {
        id: nanoid(),
        name,
        content,
        lastModified: Date.now(),
        isDirty: false,
      }

      try {
        await db.saveFile(newFile)
        addFile(newFile)
        return newFile
      } catch (error) {
        console.error('Failed to create new file:', error)
        throw error
      }
    },
    [addFile]
  )

  const openFile = useCallback(async () => {
    const storage = getStorage()

    if (!isTauri() || !storage.openFileDialog) {
      console.warn('Open file dialog not available')
      return null
    }

    try {
      const file = await storage.openFileDialog()
      if (file) {
        addFile(file)
        return file
      }
      return null
    } catch (error) {
      console.error('Failed to open file:', error)
      throw error
    }
  }, [addFile])

  const saveCurrentFile = useCallback(async () => {
    if (!activeFileId) return

    const file = files.get(activeFileId)
    if (!file) return

    const storage = getStorage()

    try {
      await storage.saveFile({ ...file, isDirty: false })
      updateFile(activeFileId, { isDirty: false })
    } catch (error) {
      console.error('Failed to save file:', error)
      throw error
    }
  }, [activeFileId, files, updateFile])

  const saveFileContent = useCallback(
    async (id: string, content: string) => {
      const storage = getStorage()
      updateFile(id, { content })
      try {
        await storage.updateFile(id, { content })
      } catch (error) {
        console.error('Failed to save file content:', error)
      }
    },
    [updateFile]
  )

  const deleteFile = useCallback(
    async (id: string) => {
      const storage = getStorage()
      try {
        await storage.deleteFile(id)
        removeFile(id)
      } catch (error) {
        console.error('Failed to delete file:', error)
        throw error
      }
    },
    [removeFile]
  )

  const saveAsMarkdown = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    downloadFile(blob, filename.endsWith('.md') ? filename : `${filename}.md`)
  }, [])

  const loadFromFile = useCallback(
    async (file: File) => {
      try {
        const content = await file.text()
        const name = file.name.replace(/\.md$/, '')
        return await createNewFile(name, content)
      } catch (error) {
        console.error('Failed to load file:', error)
        throw error
      }
    },
    [createNewFile]
  )

  return {
    createNewFile,
    openFile,
    saveCurrentFile,
    saveFileContent,
    deleteFile,
    saveAsMarkdown,
    loadFromFile,
  }
}
