import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

interface ImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsertImage: (url: string) => void
}

export function ImageDialog({ open, onOpenChange, onInsertImage }: ImageDialogProps) {
  const [url, setUrl] = useState('')
  const [base64, setBase64] = useState('')
  const [imageError, setImageError] = useState(false)
  const [activeTab, setActiveTab] = useState<'url' | 'base64'>('url')

  const currentImageSrc = activeTab === 'url' ? url.trim() : base64.trim()

  const handleInsert = () => {
    const imageSrc = currentImageSrc
    if (imageSrc) {
      onInsertImage(imageSrc)
      setUrl('')
      setBase64('')
      setImageError(false)
      onOpenChange(false)
    }
  }

  const handleReset = () => {
    setUrl('')
    setBase64('')
    setImageError(false)
    setActiveTab('url')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'url' | 'base64')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="base64">Base64</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 mt-4">
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
          </TabsContent>

          <TabsContent value="base64" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="image-base64">Base64 Data URI</Label>
              <Textarea
                id="image-base64"
                placeholder="data:image/png;base64,iVBORw0KGgo..."
                value={base64}
                onChange={(e) => {
                  setBase64(e.target.value)
                  setImageError(false)
                }}
                rows={4}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Paste a data URI starting with <code className="bg-muted px-1 py-0.5 rounded">data:image/</code>
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Image Preview */}
        {currentImageSrc && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded-lg p-4 bg-muted/30 flex items-center justify-center min-h-[200px]">
              {imageError ? (
                <div className="text-sm text-muted-foreground">
                  Failed to load image
                </div>
              ) : (
                <img
                  src={currentImageSrc}
                  alt="Preview"
                  className="max-w-full max-h-[400px] object-contain rounded-md"
                  onError={() => setImageError(true)}
                  onLoad={() => setImageError(false)}
                />
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!currentImageSrc || imageError}>
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
