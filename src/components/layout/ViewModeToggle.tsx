import { Code2, Eye, Columns2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ViewMode = 'code' | 'preview' | 'split'

interface ViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  showSplit?: boolean
}

export function ViewModeToggle({ viewMode, onViewModeChange, showSplit = true }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('code')}
        className={cn(
          'h-7 px-3 text-xs',
          viewMode === 'code' && 'bg-background shadow-sm'
        )}
        title="Code only"
      >
        <Code2 className="h-3.5 w-3.5 mr-1.5" />
        Code
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('preview')}
        className={cn(
          'h-7 px-3 text-xs',
          viewMode === 'preview' && 'bg-background shadow-sm'
        )}
        title="Preview only"
      >
        <Eye className="h-3.5 w-3.5 mr-1.5" />
        Preview
      </Button>
      {showSplit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('split')}
          className={cn(
            'h-7 px-3 text-xs',
            viewMode === 'split' && 'bg-background shadow-sm'
          )}
          title="Split view"
        >
          <Columns2 className="h-3.5 w-3.5 mr-1.5" />
          Split
        </Button>
      )}
    </div>
  )
}
