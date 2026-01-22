import { IStorageProvider } from './types'
import { IndexedDBProvider } from './indexeddb/provider'
import { TauriFileSystemProvider } from './tauri/provider'

/**
 * Detect if running in Tauri
 */
export function isTauri(): boolean {
  // Tauri v2 uses __TAURI_INTERNALS__
  return '__TAURI_INTERNALS__' in window || '__TAURI__' in window
}

/**
 * Get the appropriate storage provider for the current environment
 */
export function getStorageProvider(): IStorageProvider {
  if (isTauri()) {
    return new TauriFileSystemProvider()
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
