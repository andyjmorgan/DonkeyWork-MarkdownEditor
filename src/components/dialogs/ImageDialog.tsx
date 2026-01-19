import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsertImage: (url: string, width?: number) => void
}

export function ImageDialog({ open, onOpenChange, onInsertImage }: ImageDialogProps) {
  const [url, setUrl] = useState('')
  const [width, setWidth] = useState<string>('100')
  const [imageError, setImageError] = useState(false)

  const handleInsert = () => {
    if (url.trim()) {
      const widthNum = parseInt(width) || 100
      onInsertImage(url.trim(), widthNum)
      setUrl('')
      setWidth('100')
      setImageError(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setImageError(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInsert()
                }
              }}
            />
          </div>

          {/* Image Preview */}
          {url.trim() && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-muted/30 flex items-center justify-center min-h-[200px]">
                {imageError ? (
                  <div className="text-sm text-muted-foreground">
                    Failed to load image
                  </div>
                ) : (
                  <img
                    src={url}
                    alt="Preview"
                    style={{ width: `${width}%`, height: 'auto' }}
                    className="max-h-[400px] object-contain rounded-md"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="image-width">Size (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="image-width"
                type="range"
                min="10"
                max="100"
                step="5"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12 text-right">
                {width}%
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setUrl('')
            setWidth('100')
            setImageError(false)
            onOpenChange(false)
          }}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!url.trim() || imageError}>
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
