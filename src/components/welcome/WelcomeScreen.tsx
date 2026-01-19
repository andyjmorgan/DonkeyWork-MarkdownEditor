import { useState, useEffect } from 'react'
import { Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileDropzone } from './FileDropzone'
import { NewFileDialog } from '@/components/dialogs/NewFileDialog'
import { useFileOperations } from '@/hooks/useFileOperations'
import { getAllFiles } from '@/lib/db/fileStore'
import { MarkdownFile } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFileStore } from '@/store'
import { formatDistanceToNow } from 'date-fns'
import { DEFAULT_FILE_CONTENT } from '@/lib/constants'

export function WelcomeScreen() {
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
  const [recentFiles, setRecentFiles] = useState<MarkdownFile[]>([])
  const { createNewFile, loadFromFile } = useFileOperations()
  const { openTab } = useFileStore()

  useEffect(() => {
    const loadRecentFiles = async () => {
      const files = await getAllFiles()
      const sorted = files.sort((a, b) => b.lastModified - a.lastModified)
      setRecentFiles(sorted.slice(0, 10))
    }
    loadRecentFiles()
  }, [])

  const handleCreateFile = async (name: string) => {
    try {
      await createNewFile(name, DEFAULT_FILE_CONTENT)
    } catch (error) {
      // Error is already logged in useFileOperations
    }
  }

  const handleFileDrop = async (file: File) => {
    try {
      await loadFromFile(file)
    } catch (error) {
      // Error is already logged in useFileOperations
    }
  }

  const handleOpenRecent = (id: string) => {
    openTab(id)
  }

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <img
              src="/donkeywork.png"
              alt="DonkeyWork Logo"
              className="w-24 h-24"
            />
          </div>
          <h1 className="text-4xl font-bold">DonkeyWork Markdown Editor</h1>
          <p className="text-lg text-muted-foreground">
            A beautiful, minimalistic markdown editor with live preview
          </p>
        </div>

        <FileDropzone onFileDrop={handleFileDrop} />

        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-border" />
          <span className="text-sm text-muted-foreground">OR</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <div className="flex justify-center gap-3">
          <Button
            size="lg"
            onClick={() => setIsNewFileDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New File
          </Button>

          {recentFiles.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" variant="outline" className="gap-2">
                  <Clock className="w-5 h-5" />
                  Open Recent
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {recentFiles.map((file) => (
                  <DropdownMenuItem
                    key={file.id}
                    onClick={() => handleOpenRecent(file.id)}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(file.lastModified, { addSuffix: true })}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <NewFileDialog
        open={isNewFileDialogOpen}
        onOpenChange={setIsNewFileDialogOpen}
        onCreateFile={handleCreateFile}
      />
    </div>
  )
}
