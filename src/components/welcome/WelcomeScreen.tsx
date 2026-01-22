import { useState, useEffect } from 'react'
import { Plus, Clock, FolderOpen, ChevronDown } from 'lucide-react'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFileStore } from '@/store'
import { DEFAULT_FILE_CONTENT } from '@/lib/constants'
import { isTauri, getStorage } from '@/lib/storage/provider'

export function WelcomeScreen() {
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
  const [recentFiles, setRecentFiles] = useState<MarkdownFile[]>([])
  const { createNewFile, openFile, loadFromFile } = useFileOperations()
  const { addFile } = useFileStore()
  const isDesktop = isTauri()

  useEffect(() => {
    const loadRecentFiles = async () => {
      if (isDesktop) {
        // Desktop mode: load from Tauri storage
        const storage = getStorage()
        if (storage.getRecentFiles) {
          const files = await storage.getRecentFiles()
          setRecentFiles(files)
        }
      } else {
        // Web mode: load from IndexedDB
        const files = await getAllFiles()
        const sorted = files.sort((a, b) => b.lastModified - a.lastModified)
        setRecentFiles(sorted.slice(0, 10))
      }
    }
    loadRecentFiles()
  }, [isDesktop])

  const handleCreateFile = async (name: string) => {
    try {
      await createNewFile(name, DEFAULT_FILE_CONTENT)
    } catch (error) {
      // Error is already logged in useFileOperations
    }
  }

  const handleDesktopNewFile = async () => {
    try {
      // In desktop mode, createNewFile will show the save dialog
      await createNewFile('untitled.md', DEFAULT_FILE_CONTENT)
    } catch (error) {
      // Error is already logged in useFileOperations
    }
  }

  const handleDesktopOpenFile = async () => {
    try {
      await openFile()
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

  const handleOpenRecentDesktop = (file: MarkdownFile) => {
    // In desktop mode, the file is already loaded with content
    addFile(file)
  }

  const handleOpenRecentWeb = (id: string) => {
    const { openTab } = useFileStore.getState()
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

        {/* Show file dropzone only in web mode */}
        {!isDesktop && (
          <>
            <FileDropzone onFileDrop={handleFileDrop} />

            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-border" />
              <span className="text-sm text-muted-foreground">OR</span>
              <div className="flex-1 border-t border-border" />
            </div>
          </>
        )}

        <div className="flex justify-center gap-3">
          {isDesktop ? (
            // Desktop mode: direct buttons for native dialogs
            <>
              <Button
                size="lg"
                onClick={handleDesktopNewFile}
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                New File
              </Button>

              {recentFiles.length > 0 ? (
                // Show dropdown with recents
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="lg" variant="outline" className="gap-2">
                      <FolderOpen className="w-5 h-5" />
                      Open
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    <DropdownMenuItem onClick={handleDesktopOpenFile}>
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Browse...
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {recentFiles.map((file) => (
                      <DropdownMenuItem
                        key={file.filePath}
                        onClick={() => handleOpenRecentDesktop(file)}
                      >
                        <div className="flex flex-col gap-1 w-full">
                          <div className="font-medium truncate">{file.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {file.filePath}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // No recents, just show button
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleDesktopOpenFile}
                  className="gap-2"
                >
                  <FolderOpen className="w-5 h-5" />
                  Open File
                </Button>
              )}
            </>
          ) : (
            // Web mode: dialog for new file, dropdown for recent
            <>
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
                        onClick={() => handleOpenRecentWeb(file.id)}
                      >
                        <div className="flex flex-col gap-1 w-full">
                          <div className="font-medium">{file.name}</div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </div>

      {/* Only show new file dialog in web mode */}
      {!isDesktop && (
        <NewFileDialog
          open={isNewFileDialogOpen}
          onOpenChange={setIsNewFileDialogOpen}
          onCreateFile={handleCreateFile}
        />
      )}
    </div>
  )
}
