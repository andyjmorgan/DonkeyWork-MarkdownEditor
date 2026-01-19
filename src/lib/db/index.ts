import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { MarkdownFile } from '@/types'

interface MarkItDownDB extends DBSchema {
  files: {
    key: string
    value: MarkdownFile
  }
}

const DB_NAME = 'markitdown-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<MarkItDownDB> | null = null

export async function initDB(): Promise<IDBPDatabase<MarkItDownDB>> {
  if (dbInstance) {
    return dbInstance
  }

  dbInstance = await openDB<MarkItDownDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object store for files
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' })
      }
    },
  })

  return dbInstance
}

export async function getDB(): Promise<IDBPDatabase<MarkItDownDB>> {
  if (!dbInstance) {
    return await initDB()
  }
  return dbInstance
}
