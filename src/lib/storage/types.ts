import { MarkdownFile } from '@/types'

/**
 * Storage provider interface
 * Abstracts storage layer to support both web (IndexedDB) and desktop (file system)
 */
export interface IStorageProvider {
  /**
   * Get all files available in storage
   * Web: Returns all files from IndexedDB
   * Tauri: Returns empty array (files opened on demand)
   */
  getAllFiles(): Promise<MarkdownFile[]>

  /**
   * Get a specific file by ID
   */
  getFile(id: string): Promise<MarkdownFile | undefined>

  /**
   * Save a file to storage
   * Web: Saves to IndexedDB
   * Tauri: Writes to disk if filePath exists, otherwise no-op
   */
  saveFile(file: MarkdownFile): Promise<void>

  /**
   * Delete a file from storage
   * Web: Removes from IndexedDB
   * Tauri: No-op (doesn't delete files from disk)
   */
  deleteFile(id: string): Promise<void>

  /**
   * Update specific fields of a file
   */
  updateFile(id: string, updates: Partial<MarkdownFile>): Promise<void>

  /**
   * Clear all files (web only, used for debugging)
   */
  clearAllFiles(): Promise<void>

  /**
   * Open file dialog (Tauri only)
   * Returns null if user cancels
   */
  openFileDialog?(): Promise<MarkdownFile | null>

  /**
   * Save file dialog (Tauri only)
   * Shows save dialog and writes file to chosen path
   */
  saveFileDialog?(file: MarkdownFile): Promise<MarkdownFile>

  /**
   * Get recent files (Tauri only)
   * Returns list of recently opened file paths
   */
  getRecentFiles?(): Promise<MarkdownFile[]>
}

/**
 * Storage provider type
 */
export type StorageProviderType = 'indexeddb' | 'tauri'
