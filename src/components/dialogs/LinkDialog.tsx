import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsertLink: (url: string, text: string) => void
  initialUrl?: string
  initialText?: string
}

export function LinkDialog({ open, onOpenChange, onInsertLink, initialUrl = '', initialText = '' }: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl)
  const [text, setText] = useState(initialText)

  useEffect(() => {
    if (open) {
      setUrl(initialUrl)
      setText(initialText)
    }
  }, [open, initialUrl, initialText])

  const handleInsert = () => {
    if (url.trim()) {
      onInsertLink(url.trim(), text.trim() || url.trim())
      setUrl('')
      setText('')
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setUrl('')
    setText('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">Insert Link</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-text">Display Text</Label>
            <Input
              id="link-text"
              placeholder="Link text (optional)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInsert()
                }
              }}
            />
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2 gap-2">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!url.trim()}>
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
