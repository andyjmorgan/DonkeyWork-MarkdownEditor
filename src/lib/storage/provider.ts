import { IStorageProvider } from './types'
import { IndexedDBProvider } from './indexeddb/provider'

/**
 * Detect if running in Tauri
 */
function isTauri(): boolean {
  return '__TAURI__' in window
}

/**
 * Get the appropriate storage provider for the current environment
 */
export function getStorageProvider(): IStorageProvider {
  if (isTauri()) {
    // TODO: Return TauriFileSystemProvider once implemented
    throw new Error('Tauri storage provider not yet implemented')
  }

  return new IndexedDBProvider()
}

/**
 * Singleton instance
 */
let storageProvider: IStorageProvider | null = null

/**
 * Get the global storage provider instance
 */
export function getStorage(): IStorageProvider {
  if (!storageProvider) {
    storageProvider = getStorageProvider()
  }
  return storageProvider
}
