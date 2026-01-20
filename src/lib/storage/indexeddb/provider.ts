import { MarkdownFile } from '@/types'
import { IStorageProvider } from '../types'
import { getDB } from '@/lib/db'

/**
 * IndexedDB storage provider for web
 */
export class IndexedDBProvider implements IStorageProvider {
  async getAllFiles(): Promise<MarkdownFile[]> {
    const db = await getDB()
    const files = await db.getAll('files')
    return files
  }

  async getFile(id: string): Promise<MarkdownFile | undefined> {
    const db = await getDB()
    return await db.get('files', id)
  }

  async saveFile(file: MarkdownFile): Promise<void> {
    const db = await getDB()
    const fileToSave = {
      ...file,
      lastModified: Date.now(),
    }
    await db.put('files', fileToSave)
  }

  async deleteFile(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('files', id)
  }

  async updateFile(id: string, updates: Partial<MarkdownFile>): Promise<void> {
    const db = await getDB()
    const existingFile = await db.get('files', id)

    if (!existingFile) {
      throw new Error(`File with id ${id} not found`)
    }

    await db.put('files', {
      ...existingFile,
      ...updates,
      lastModified: Date.now(),
    })
  }

  async clearAllFiles(): Promise<void> {
    const db = await getDB()
    await db.clear('files')
  }
}
