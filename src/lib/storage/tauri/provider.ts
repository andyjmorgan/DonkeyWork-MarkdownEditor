import { invoke } from '@tauri-apps/api/core'
import { nanoid } from 'nanoid'
import { MarkdownFile } from '@/types'
import { IStorageProvider } from '../types'

interface FileResult {
  path: string
  name: string
  content: string
}

/**
 * Tauri file system storage provider
 * Uses native file dialogs and file system access
 */
export class TauriFileSystemProvider implements IStorageProvider {
  // In-memory cache of open files (by ID)
  private openFiles: Map<string, MarkdownFile> = new Map()

  async getAllFiles(): Promise<MarkdownFile[]> {
    // In Tauri mode, we don't persist a list of files
    // Files are opened on demand via file dialogs
    return Array.from(this.openFiles.values())
  }

  async getFile(id: string): Promise<MarkdownFile | undefined> {
    return this.openFiles.get(id)
  }

  async saveFile(file: MarkdownFile): Promise<void> {
    // Update in-memory cache
    this.openFiles.set(file.id, file)

    // If file has a path, write to disk
    if (file.filePath) {
      await invoke('write_file', {
        path: file.filePath,
        content: file.content,
      })
    }
  }

  async deleteFile(id: string): Promise<void> {
    // Just remove from in-memory cache, don't delete from disk
    this.openFiles.delete(id)
  }

  async updateFile(id: string, updates: Partial<MarkdownFile>): Promise<void> {
    const file = this.openFiles.get(id)
    if (!file) return

    const updatedFile = {
      ...file,
      ...updates,
      lastModified: Date.now(),
    }
    this.openFiles.set(id, updatedFile)

    // If content was updated and file has a path, write to disk
    if (updates.content !== undefined && file.filePath) {
      await invoke('write_file', {
        path: file.filePath,
        content: updatedFile.content,
      })
    }
  }

  async clearAllFiles(): Promise<void> {
    this.openFiles.clear()
  }

  /**
   * Open a file using native file dialog
   */
  async openFileDialog(): Promise<MarkdownFile | null> {
    const result = await invoke<FileResult | null>('open_file_dialog')

    if (!result) {
      return null
    }

    // Check if file is already open
    const existingFile = Array.from(this.openFiles.values()).find(
      (f) => f.filePath === result.path
    )
    if (existingFile) {
      return existingFile
    }

    const file: MarkdownFile = {
      id: nanoid(),
      name: result.name,
      content: result.content,
      lastModified: Date.now(),
      isDirty: false,
      filePath: result.path,
      isUntitled: false,
    }

    this.openFiles.set(file.id, file)

    // Add to recent files
    await this.addToRecentFiles(result.path)

    return file
  }

  /**
   * Show save dialog and write file to chosen path
   */
  async saveFileDialog(file: MarkdownFile): Promise<MarkdownFile> {
    const defaultName = file.name.endsWith('.md') ? file.name : `${file.name}.md`

    const path = await invoke<string | null>('save_file_dialog', {
      defaultName,
    })

    if (!path) {
      throw new Error('Save cancelled')
    }

    // Extract filename from path
    const name = path.split('/').pop() || defaultName

    const updatedFile: MarkdownFile = {
      ...file,
      name,
      filePath: path,
      isUntitled: false,
      isDirty: false,
      lastModified: Date.now(),
    }

    // Write to disk
    await invoke('write_file', {
      path,
      content: file.content,
    })

    this.openFiles.set(file.id, updatedFile)

    // Add to recent files
    await this.addToRecentFiles(path)

    return updatedFile
  }

  /**
   * Get recent files from app data
   */
  async getRecentFiles(): Promise<MarkdownFile[]> {
    const results = await invoke<FileResult[]>('get_recent_files')

    return results.map((result) => ({
      id: nanoid(),
      name: result.name,
      content: result.content,
      lastModified: Date.now(),
      isDirty: false,
      filePath: result.path,
      isUntitled: false,
    }))
  }

  /**
   * Add a file to recent files list
   */
  async addToRecentFiles(filePath: string): Promise<void> {
    await invoke('add_recent_file', { path: filePath })
  }

  /**
   * Clear recent files list
   */
  async clearRecentFiles(): Promise<void> {
    await invoke('clear_recent_files')
  }
}
