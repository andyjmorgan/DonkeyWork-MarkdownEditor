import { useEffect, useState } from 'react'
import { useFileStore } from '@/store'
import { saveFile } from '@/lib/db/fileStore'
import { AUTOSAVE_INTERVAL } from '@/lib/constants'

export function useAutosave() {
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const autosaveInterval = setInterval(async () => {
      // Get fresh state from store on each interval tick
      const { files, updateFile } = useFileStore.getState()

      // Find all dirty files
      const dirtyFiles = Array.from(files.values()).filter(file => file.isDirty)

      if (dirtyFiles.length === 0) {
        return
      }

      setIsSaving(true)

      try {
        // Save all dirty files to IndexedDB
        await Promise.all(
          dirtyFiles.map(async (file) => {
            await saveFile(file)
            // Mark file as clean in store
            updateFile(file.id, { isDirty: false })
          })
        )

        setLastSaveTime(Date.now())
      } catch (error) {
        console.error('[Autosave] Error:', error)
      } finally {
        setIsSaving(false)
      }
    }, AUTOSAVE_INTERVAL)

    return () => clearInterval(autosaveInterval)
  }, [])

  return {
    lastSaveTime,
    isSaving,
  }
}
