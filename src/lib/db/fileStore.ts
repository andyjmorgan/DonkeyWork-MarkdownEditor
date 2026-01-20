import { MarkdownFile } from '@/types'
import { getStorage } from '@/lib/storage/provider'

/**
 * File storage operations using the abstracted storage provider
 * Automatically uses IndexedDB for web or file system for Tauri
 */

export async function getAllFiles(): Promise<MarkdownFile[]> {
  const storage = getStorage()
  return await storage.getAllFiles()
}

export async function getFile(id: string): Promise<MarkdownFile | undefined> {
  const storage = getStorage()
  return await storage.getFile(id)
}

export async function saveFile(file: MarkdownFile): Promise<void> {
  const storage = getStorage()
  return await storage.saveFile(file)
}

export async function deleteFile(id: string): Promise<void> {
  const storage = getStorage()
  return await storage.deleteFile(id)
}

export async function updateFile(
  id: string,
  updates: Partial<MarkdownFile>
): Promise<void> {
  const storage = getStorage()
  return await storage.updateFile(id, updates)
}

export async function clearAllFiles(): Promise<void> {
  const storage = getStorage()
  return await storage.clearAllFiles()
}
