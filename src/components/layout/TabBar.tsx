import { useState, useEffect } from 'react'
import { X, Plus, Clock } from 'lucide-react'
import { useFileStore } from '@/store'
import { useFileOperations } from '@/hooks/useFileOperations'
import { NewFileDialog } from '@/components/dialogs/NewFileDialog'
import { cn } from '@/lib/utils'
import { getAllFiles } from '@/lib/db/fileStore'
import { MarkdownFile } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DEFAULT_FILE_CONTENT } from '@/lib/constants'

export function TabBar() {
  const { tabs, files, activeFileId, setActiveFile, closeTab, openTab } = useFileStore()
  const { createNewFile } = useFileOperations()
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
  const [recentFiles, setRecentFiles] = useState<MarkdownFile[]>([])

  useEffect(() => {
    const loadRecentFiles = async () => {
      const allFiles = await getAllFiles()
      // Filter out files that are already open in tabs
      const closedFiles = allFiles.filter(file => !tabs.includes(file.id))
      const sorted = closedFiles.sort((a, b) => b.lastModified - a.lastModified)
      setRecentFiles(sorted.slice(0, 10))
    }
    loadRecentFiles()
  }, [tabs])

  if (tabs.length === 0) {
    return null
  }

  const truncateFileName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name
    return name.substring(0, maxLength - 3) + '...'
  }

  const handleCreateFile = async (name: string) => {
    try {
      await createNewFile(name, DEFAULT_FILE_CONTENT)
    } catch (error) {
      // Error is already logged in useFileOperations
    }
  }

  return (
    <div className="flex items-center border-b border-border bg-background overflow-x-auto relative">
      <div className="flex items-center flex-1 overflow-x-auto">
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
                closeTab(tabId)
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
          className="flex items-center justify-center w-10 py-2 border-r border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Create new file"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Recent files button - floating on right */}
      {recentFiles.length > 0 && (
        <div className="flex-shrink-0 border-l border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 px-4 py-2 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Open recent files"
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm">Recent</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {recentFiles.map((file) => (
                <DropdownMenuItem
                  key={file.id}
                  onClick={() => openTab(file.id)}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(file.lastModified, { addSuffix: true })}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <NewFileDialog
        open={isNewFileDialogOpen}
        onOpenChange={setIsNewFileDialogOpen}
        onCreateFile={handleCreateFile}
      />
    </div>
  )
}
