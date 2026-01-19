import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileDropzoneProps {
  onFileDrop: (file: File) => void
}

export function FileDropzone({ onFileDrop }: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileDrop(acceptedFiles[0])
      }
    },
    [onFileDrop]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md', '.markdown'],
      'text/plain': ['.txt'],
    },
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-12 cursor-pointer transition-colors',
        'hover:border-primary hover:bg-accent/50',
        isDragActive
          ? 'border-primary bg-accent'
          : 'border-muted-foreground/25'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        {isDragActive ? (
          <div>
            <p className="text-lg font-medium">Drop your file here</p>
            <p className="text-sm text-muted-foreground mt-1">
              Release to open the file
            </p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium">Drop a markdown file here</p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse your files
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supports .md, .markdown, and .txt files
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
