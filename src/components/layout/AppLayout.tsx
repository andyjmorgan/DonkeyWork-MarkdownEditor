import { ReactNode } from 'react'
import { TabBar } from './TabBar'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAutosave } from '@/hooks/useAutosave'

interface AppLayoutProps {
  children: ReactNode
  showTabs?: boolean
}

export function AppLayout({ children, showTabs = false }: AppLayoutProps) {
  // Run autosave hook (no UI, just side effects)
  useAutosave()

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/donkeywork.png"
              alt="DonkeyWork Logo"
              className="w-7 h-7"
            />
            <h1 className="text-xl font-semibold">Markdown Editor</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              asChild
            >
              <a
                href="https://github.com/andyjmorgan/DonkeyWork-MarkdownEditor"
                target="_blank"
                rel="noopener noreferrer"
                title="View on GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tab bar */}
      {showTabs && <TabBar />}

      {/* Main content area */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
