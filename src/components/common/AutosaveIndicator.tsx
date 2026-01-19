import { useAutosave } from '@/hooks/useAutosave'
import { formatDistanceToNow } from 'date-fns'
import { Check, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SAVE_INDICATOR_DURATION } from '@/lib/constants'

export function AutosaveIndicator() {
  const { lastSaveTime, isSaving } = useAutosave()
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (lastSaveTime) {
      setShowSaved(true)
      const timer = setTimeout(() => {
        setShowSaved(false)
      }, SAVE_INDICATOR_DURATION)
      return () => clearTimeout(timer)
    }
  }, [lastSaveTime])

  if (!showSaved && !isSaving) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {isSaving ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      ) : showSaved && lastSaveTime ? (
        <>
          <Check className="h-3 w-3" />
          <span>Saved {formatDistanceToNow(lastSaveTime, { addSuffix: true })}</span>
        </>
      ) : null}
    </div>
  )
}
