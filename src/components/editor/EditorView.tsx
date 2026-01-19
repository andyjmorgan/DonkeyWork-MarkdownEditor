import { useCallback, useState, useEffect } from 'react'
import { SplitView } from '@/components/layout/SplitView'
import { RawEditor } from './RawEditor'
import { PreviewEditor } from './PreviewEditor'
import { ViewModeToggle, ViewMode } from '@/components/layout/ViewModeToggle'
import { useFileStore } from '@/store'
import { useFileOperations } from '@/hooks/useFileOperations'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export function EditorView() {
  const activeFile = useFileStore((state) => state.getActiveFile())
  const { saveFileContent } = useFileOperations()
  const [viewMode, setViewMode] = useState<ViewMode>('split')
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
          <h3 className="text-sm font-medium">Markdown</h3>
          {viewMode !== 'split' && (
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
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
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <PreviewEditor
          content={activeFile.content}
          onChange={handlePreviewChange}
          className="flex-1 flex flex-col overflow-hidden"
        />
      </div>
    </div>
  )

  if (viewMode === 'code') {
    return rawEditorPane
  }

  if (viewMode === 'preview') {
    return previewEditorPane
  }

  // Split view
  return (
    <SplitView
      left={
        <div className="h-full flex flex-col">
          <div className="h-[45px] px-4 border-b border-border bg-muted/50 flex items-center justify-between">
            <h3 className="text-sm font-medium">Markdown</h3>
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
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <PreviewEditor
              content={activeFile.content}
              onChange={handlePreviewChange}
              className="flex-1 flex flex-col overflow-hidden"
            />
          </div>
        </div>
      }
    />
  )
}
