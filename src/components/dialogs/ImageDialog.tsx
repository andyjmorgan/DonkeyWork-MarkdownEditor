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
      <DialogContent className="sm:max-w-4xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">Insert Image</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-5 gap-4 px-6 pb-6">
          {/* Left: Preview - Takes up 3 columns */}
          <div className="col-span-3 flex flex-col gap-3">
            <span className="text-sm font-medium">Preview</span>
            <div className="border rounded-md bg-background/50 flex items-center justify-center min-h-[320px] overflow-hidden">
              {!currentImageSrc ? (
                <div className="text-sm text-muted-foreground">
                  No preview
                </div>
              ) : imageError ? (
                <div className="text-sm text-destructive">
                  Failed to load
                </div>
              ) : (
                <img
                  src={currentImageSrc}
                  alt="Preview"
                  className="max-w-full max-h-[400px] object-contain"
                  onError={() => setImageError(true)}
                  onLoad={() => setImageError(false)}
                />
              )}
            </div>
          </div>

          {/* Right: Input - Takes up 2 columns */}
          <div className="col-span-2 flex flex-col gap-3">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'url' | 'base64')} className="w-full">
              <TabsList>
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="base64">Base64</TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="mt-4">
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
              </TabsContent>

              <TabsContent value="base64" className="mt-4">
                <Textarea
                  id="image-base64"
                  placeholder="data:image/png;base64,..."
                  value={base64}
                  onChange={(e) => {
                    setBase64(e.target.value)
                    setImageError(false)
                  }}
                  rows={12}
                  className="font-mono text-xs resize-none"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2 gap-2">
          <Button variant="ghost" onClick={handleReset}>
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
