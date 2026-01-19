import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileDropzone } from './FileDropzone'
import { NewFileDialog } from '@/components/dialogs/NewFileDialog'
import { useFileOperations } from '@/hooks/useFileOperations'

export function WelcomeScreen() {
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
  const { createNewFile, loadFromFile } = useFileOperations()

  const handleCreateFile = async (name: string) => {
    try {
      await createNewFile(name, '# Welcome\n\nStart writing your markdown here...')
    } catch (error) {
      console.error('Failed to create file:', error)
    }
  }

  const handleFileDrop = async (file: File) => {
    try {
      await loadFromFile(file)
    } catch (error) {
      console.error('Failed to load file:', error)
    }
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
          <h1 className="text-4xl font-bold">Welcome to Markdown Editor</h1>
          <p className="text-lg text-muted-foreground">
            A beautiful, minimalistic markdown editor with live preview
          </p>
        </div>

        <FileDropzone onFileDrop={handleFileDrop} />

        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-border" />
          <span className="text-sm text-muted-foreground">OR</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => setIsNewFileDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New File
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>Features:</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <span>• Split view editing</span>
            <span>• Live preview</span>
            <span>• Mermaid diagrams</span>
            <span>• PDF export</span>
            <span>• Autosave</span>
            <span>• Dark mode</span>
          </div>
        </div>
      </div>

      <NewFileDialog
        open={isNewFileDialogOpen}
        onOpenChange={setIsNewFileDialogOpen}
        onCreateFile={handleCreateFile}
      />
    </div>
  )
}
