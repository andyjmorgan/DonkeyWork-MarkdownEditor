import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useFileStore } from '@/store'
import { useFileOperations } from '@/hooks/useFileOperations'
import { NewFileDialog } from '@/components/dialogs/NewFileDialog'
import { cn } from '@/lib/utils'

export function TabBar() {
  const { tabs, files, activeFileId, setActiveFile } = useFileStore()
  const { deleteFile, createNewFile } = useFileOperations()
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)

  if (tabs.length === 0) {
    return null
  }

  const truncateFileName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name
    return name.substring(0, maxLength - 3) + '...'
  }

  const handleCreateFile = async (name: string) => {
    try {
      await createNewFile(name, '# Welcome\n\nStart writing your markdown here...')
    } catch (error) {
      console.error('Failed to create file:', error)
    }
  }

  return (
    <div className="flex items-center border-b border-border bg-background overflow-x-auto">
      {tabs.map((tabId) => {
        const file = files.get(tabId)
        if (!file) return null

        const isActive = tabId === activeFileId

        return (
          <div
            key={tabId}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border-r border-border cursor-pointer transition-colors group',
              'hover:bg-accent',
              isActive && 'bg-accent'
            )}
            onClick={() => setActiveFile(tabId)}
          >
            <span className={cn(
              'text-sm',
              isActive ? 'font-medium' : 'text-muted-foreground'
            )}>
              {truncateFileName(file.name)}
            </span>
            {file.isDirty && (
              <span className="w-2 h-2 rounded-full bg-primary" title="Unsaved changes" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteFile(tabId)
              }}
              className={cn(
                'p-0.5 rounded hover:bg-background/50 transition-opacity',
                'opacity-0 group-hover:opacity-100',
                isActive && 'opacity-100'
              )}
              aria-label="Close tab"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )
      })}

      {/* New file button */}
      <button
        onClick={() => setIsNewFileDialogOpen(true)}
        className="flex items-center gap-2 px-4 py-2 border-r border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Create new file"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">New</span>
      </button>

      <NewFileDialog
        open={isNewFileDialogOpen}
        onOpenChange={setIsNewFileDialogOpen}
        onCreateFile={handleCreateFile}
      />
    </div>
  )
}
