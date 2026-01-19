import { useCallback, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { saveAs as downloadFile } from 'file-saver'
import { useFileStore } from '@/store'
import { MarkdownFile } from '@/types'
import * as db from '@/lib/db/fileStore'
import { initDB } from '@/lib/db'

export function useFileOperations() {
  const {
    addFile,
    updateFile,
    removeFile,
    setActiveFile,
    closeTab,
    files,
    activeFileId,
  } = useFileStore()

  // Initialize DB and load files on mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        await initDB()
        const savedFiles = await db.getAllFiles()

        // Load all saved files into the store
        savedFiles.forEach((file) => {
          addFile({ ...file, isDirty: false })
        })
      } catch (error) {
        console.error('Failed to load files from IndexedDB:', error)
      }
    }

    loadFiles()
  }, []) // Empty deps - only run on mount

  const createNewFile = useCallback(
    async (name: string, content: string = '') => {
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

  const saveCurrentFile = useCallback(async () => {
    if (!activeFileId) return

    const file = files.get(activeFileId)
    if (!file) return

    try {
      await db.saveFile({ ...file, isDirty: false })
      updateFile(activeFileId, { isDirty: false })
    } catch (error) {
      console.error('Failed to save file:', error)
      throw error
    }
  }, [activeFileId, files, updateFile])

  const saveFileContent = useCallback(
    async (id: string, content: string) => {
      try {
        updateFile(id, { content })
        await db.updateFile(id, { content })
      } catch (error) {
        console.error('Failed to save file content:', error)
      }
    },
    [updateFile]
  )

  const deleteFile = useCallback(
    async (id: string) => {
      try {
        await db.deleteFile(id)
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
    saveCurrentFile,
    saveFileContent,
    deleteFile,
    saveAsMarkdown,
    loadFromFile,
  }
}
