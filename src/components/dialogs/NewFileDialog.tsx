import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NewFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateFile: (name: string) => void
}

export function NewFileDialog({
  open,
  onOpenChange,
  onCreateFile,
}: NewFileDialogProps) {
  const [fileName, setFileName] = useState('')

  const sanitizeFileName = (name: string): string => {
    // Remove .md extension if present for sanitization
    const nameWithoutExt = name.endsWith('.md') ? name.slice(0, -3) : name
    // Replace any character that's not a-z, A-Z, 0-9, -, or _ with a hyphen
    const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '-')
    // Remove consecutive hyphens
    return sanitized.replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  const handleCreate = () => {
    if (fileName.trim()) {
      let name = sanitizeFileName(fileName.trim())
      if (!name) {
        // If sanitization results in empty string, use default name
        name = 'untitled'
      }
      // Append .md if not already present
      if (!name.endsWith('.md')) {
        name = `${name}.md`
      }
      onCreateFile(name)
      setFileName('')
      onOpenChange(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreate()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">New File</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new markdown file
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Input
            id="filename"
            placeholder="untitled"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-base h-11"
          />
          <p className="text-xs text-muted-foreground mt-2">
            .md extension will be added automatically
          </p>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2 gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!fileName.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
