import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import mermaid from 'mermaid'
import { useThemeStore } from '@/store/useThemeStore'

interface MermaidDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsertMermaid: (code: string) => void
}

const DEFAULT_MERMAID = `graph TD
  A[Start] --> B[End]`

export function MermaidDialog({ open, onOpenChange, onInsertMermaid }: MermaidDialogProps) {
  const [code, setCode] = useState(DEFAULT_MERMAID)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    if (open) {
      // Reset to default when dialog opens
      setCode(DEFAULT_MERMAID)
      setError('')
    }
  }, [open])

  useEffect(() => {
    const renderPreview = async () => {
      if (!code.trim()) {
        setPreview('')
        setError('')
        return
      }

      try {
        // Initialize mermaid with current theme
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
        })

        const id = `mermaid-preview-${Date.now()}`
        const { svg } = await mermaid.render(id, code)
        setPreview(svg)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
        setPreview('')
      }
    }

    const debounce = setTimeout(renderPreview, 500)
    return () => clearTimeout(debounce)
  }, [code, theme])

  const handleInsert = () => {
    if (code.trim()) {
      onInsertMermaid(code.trim())
      setCode(DEFAULT_MERMAID)
      setError('')
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setCode(DEFAULT_MERMAID)
    setError('')
    onOpenChange(false)
  }

  const handleUseDefault = () => {
    setCode(DEFAULT_MERMAID)
    setError('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[85vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">Insert Mermaid Diagram</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 px-6 pb-6 flex-1 overflow-hidden">
          {/* Left: Code Editor */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Code</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUseDefault}
                className="h-7 text-xs -mr-2"
              >
                Reset
              </Button>
            </div>
            <Textarea
              id="mermaid-code"
              placeholder="graph TD&#10;  A[Start] --> B[End]"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono text-sm resize-none flex-1 min-h-[320px]"
            />
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">Preview</span>
            <div className="border rounded-md bg-background/50 flex items-center justify-center flex-1 overflow-auto p-4">
              {error ? (
                <div className="text-center">
                  <div className="text-sm text-destructive font-medium mb-2">Invalid Syntax</div>
                  <pre className="text-xs text-muted-foreground max-w-md">{error}</pre>
                </div>
              ) : preview ? (
                <div
                  className="mermaid-preview"
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              ) : (
                <div className="text-sm text-muted-foreground">
                  No preview
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2 gap-2">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!code.trim() || !!error}>
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
