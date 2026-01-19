import { useEffect, useState } from 'react'
import { MarkdownFile } from '@/types'
import { getAllFiles } from '@/lib/db/fileStore'
import { useFileStore } from '@/store'
import { useFileOperations } from '@/hooks/useFileOperations'
import { FileText, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

export function RecentFiles() {
  const [recentFiles, setRecentFiles] = useState<MarkdownFile[]>([])
  const [loading, setLoading] = useState(true)
  const { openTab } = useFileStore()
  const { deleteFile } = useFileOperations()

  useEffect(() => {
    const loadRecentFiles = async () => {
      try {
        console.log('[RecentFiles] Loading files from IndexedDB...')
        const files = await getAllFiles()
        console.log('[RecentFiles] Loaded files:', files)
        console.log('[RecentFiles] Number of files:', files.length)

        // Sort by lastModified descending (most recent first)
        const sorted = files.sort((a, b) => b.lastModified - a.lastModified)
        setRecentFiles(sorted.slice(0, 10)) // Show max 10 recent files
        console.log('[RecentFiles] Set recent files:', sorted.slice(0, 10))
      } catch (error) {
        console.error('[RecentFiles] Failed to load recent files:', error)
      } finally {
        setLoading(false)
        console.log('[RecentFiles] Loading complete')
      }
    }

    loadRecentFiles()
  }, [])

  const handleOpenFile = (id: string) => {
    openTab(id)
  }

  const handleDeleteFile = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent opening the file when deleting

    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(id)
        setRecentFiles((prev) => prev.filter((file) => file.id !== id))
      } catch (error) {
        console.error('Failed to delete file:', error)
      }
    }
  }

  const getPreview = (content: string): string => {
    // Remove markdown syntax and get first line
    const cleaned = content
      .replace(/^#+\s+/gm, '') // Remove headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
      .trim()

    const firstLine = cleaned.split('\n')[0] || 'Empty file'
    return firstLine.length > 80 ? firstLine.slice(0, 80) + '...' : firstLine
  }

  if (loading) {
    console.log('[RecentFiles] Rendering loading state')
    return (
      <div className="w-full">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Files
        </h2>
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    )
  }

  if (recentFiles.length === 0) {
    console.log('[RecentFiles] No files found, returning null')
    return null
  }

  console.log('[RecentFiles] Rendering', recentFiles.length, 'files')

  return (
    <div className="w-full pb-8">
      <div className="w-full max-w-2xl mx-auto px-8 mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Files
        </h2>
      </div>
      <div className="relative w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div className="flex gap-4 pb-4 pl-[calc(50vw-336px+2rem)] snap-x snap-mandatory">
          {recentFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => handleOpenFile(file.id)}
              className="group relative flex-shrink-0 w-72 p-5 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all cursor-pointer snap-start"
            >
              {/* Delete button - top right corner */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleDeleteFile(file.id, e)}
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Delete file"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>

              {/* Icon */}
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base truncate">{file.name}</div>
                </div>
              </div>

              {/* Preview */}
              <div className="text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[2.5rem]">
                {getPreview(file.content)}
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(file.lastModified, { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>

        {/* Fade overlay on right if scrollable */}
        {recentFiles.length > 3 && (
          <div className="absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  )
}
