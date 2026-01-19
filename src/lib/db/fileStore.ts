import { getDB } from './index'
import { MarkdownFile } from '@/types'

export async function getAllFiles(): Promise<MarkdownFile[]> {
  const db = await getDB()
  return await db.getAll('files')
}

export async function getFile(id: string): Promise<MarkdownFile | undefined> {
  const db = await getDB()
  return await db.get('files', id)
}

export async function saveFile(file: MarkdownFile): Promise<void> {
  const db = await getDB()
  await db.put('files', {
    ...file,
    lastModified: Date.now(),
  })
}

export async function deleteFile(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('files', id)
}

export async function updateFile(
  id: string,
  updates: Partial<MarkdownFile>
): Promise<void> {
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

export async function clearAllFiles(): Promise<void> {
  const db = await getDB()
  await db.clear('files')
}
