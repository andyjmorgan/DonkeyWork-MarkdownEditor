import { useCallback, useState, useEffect } from 'react'
import { SplitView } from '@/components/layout/SplitView'
import { RawEditor } from './RawEditor'
import { PreviewEditor } from './PreviewEditor'
import { ViewModeToggle, ViewMode } from '@/components/layout/ViewModeToggle'
import { NewFileDialog } from '@/components/dialogs/NewFileDialog'
import { useFileStore } from '@/store'
import { useFileOperations } from '@/hooks/useFileOperations'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DEFAULT_FILE_CONTENT } from '@/lib/constants'

interface EditorViewProps {
  onDownloadMarkdown: () => void
  onExportPdf: () => void
}

export function EditorView({ onDownloadMarkdown, onExportPdf }: EditorViewProps) {
  const activeFile = useFileStore((state) => state.getActiveFile())
  const { saveFileContent, createNewFile, openFile } = useFileOperations()
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Force code or preview mode on mobile (no split)
  useEffect(() => {
    if (isMobile && viewMode === 'split') {
      setViewMode('code')
    }
  }, [isMobile, viewMode])

  const handleRawChange = useCallback(
    (content: string) => {
      if (activeFile) {
        saveFileContent(activeFile.id, content)
      }
    },
    [activeFile, saveFileContent]
  )

  const handlePreviewChange = useCallback(
    (content: string) => {
      if (activeFile) {
        saveFileContent(activeFile.id, content)
      }
    },
    [activeFile, saveFileContent]
  )

  const handleSave = useCallback(() => {
    if (!activeFile) return

    // Download the markdown file
    const blob = new Blob([activeFile.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = activeFile.name.endsWith('.md') ? activeFile.name : `${activeFile.name}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [activeFile])

  const handleNew = useCallback(() => {
    setIsNewFileDialogOpen(true)
  }, [])

  const handleOpen = useCallback(async () => {
    try {
      await openFile()
    } catch (error) {
      // Error is already logged in useFileOperations
    }
  }, [openFile])

  const handleCreateFile = useCallback(
    async (name: string) => {
      try {
        await createNewFile(name, DEFAULT_FILE_CONTENT)
      } catch (error) {
        // Error is already logged in useFileOperations
      }
    },
    [createNewFile]
  )

  if (!activeFile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No file selected</p>
      </div>
    )
  }

  const rawEditorPane = (
    <div className="h-full flex flex-col">
      {/* Mobile: Show toggle in its own section */}
      {isMobile && (
        <div className="px-4 py-2 border-b border-border bg-background flex items-center justify-center">
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showSplit={false}
          />
        </div>
      )}
      {/* Desktop: Show header with toggle */}
      {!isMobile && (
        <div className="h-[45px] px-4 border-b border-border bg-muted/50 flex items-center justify-between">
          <h3 className="text-sm font-medium">Code</h3>
          {viewMode !== 'split' && (
            <div className="flex items-center gap-2">
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-3 text-xs">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onDownloadMarkdown}>
                    Download as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExportPdf}>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <RawEditor
          value={activeFile.content}
          onChange={handleRawChange}
          className="h-full"
          lineWrapping={isMobile}
        />
      </div>
    </div>
  )

  const previewEditorPane = (
    <div className="h-full flex flex-col">
      {/* Mobile: Show toggle in its own section */}
      {isMobile && (
        <div className="px-4 py-2 border-b border-border bg-background flex items-center justify-center">
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showSplit={false}
          />
        </div>
      )}
      {/* Desktop: Show header with toggle */}
      {!isMobile && (
        <div className="h-[45px] px-4 border-b border-border bg-muted/50 flex items-center justify-between">
          <h3 className="text-sm font-medium">Preview</h3>
          {viewMode !== 'split' && (
            <div className="flex items-center gap-2">
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-3 text-xs">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onDownloadMarkdown}>
                    Download as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExportPdf}>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <PreviewEditor
          content={activeFile.content}
          onChange={handlePreviewChange}
          className="flex-1 flex flex-col overflow-hidden"
          onSave={handleSave}
          onNew={handleNew}
          onOpen={handleOpen}
        />
      </div>
    </div>
  )

  if (viewMode === 'code') {
    return (
      <>
        {rawEditorPane}
        <NewFileDialog
          open={isNewFileDialogOpen}
          onOpenChange={setIsNewFileDialogOpen}
          onCreateFile={handleCreateFile}
        />
      </>
    )
  }

  if (viewMode === 'preview') {
    return (
      <>
        {previewEditorPane}
        <NewFileDialog
          open={isNewFileDialogOpen}
          onOpenChange={setIsNewFileDialogOpen}
          onCreateFile={handleCreateFile}
        />
      </>
    )
  }

  // Split view
  return (
    <>
      <SplitView
        left={
          <div className="h-full flex flex-col">
            <div className="h-[45px] px-4 border-b border-border bg-muted/50 flex items-center justify-between">
              <h3 className="text-sm font-medium">Code</h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <RawEditor
                value={activeFile.content}
                onChange={handleRawChange}
                className="h-full"
                lineWrapping={isMobile}
              />
            </div>
          </div>
        }
        right={
          <div className="h-full flex flex-col">
            <div className="h-[45px] px-4 border-b border-border bg-muted/50 flex items-center justify-between">
              <h3 className="text-sm font-medium">Preview</h3>
              <div className="flex items-center gap-2">
                <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-3 text-xs">
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onDownloadMarkdown}>
                      Download as Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExportPdf}>
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <PreviewEditor
                content={activeFile.content}
                onChange={handlePreviewChange}
                className="flex-1 flex flex-col overflow-hidden"
                onSave={handleSave}
                onNew={handleNew}
              />
            </div>
          </div>
        }
      />
      <NewFileDialog
        open={isNewFileDialogOpen}
        onOpenChange={setIsNewFileDialogOpen}
        onCreateFile={handleCreateFile}
      />
    </>
  )
}
