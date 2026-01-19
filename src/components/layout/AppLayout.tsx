import { ReactNode } from 'react'
import { TabBar } from './TabBar'
import { ThemeToggle } from '@/components/common/ThemeToggle'

interface AppLayoutProps {
  children: ReactNode
  showTabs?: boolean
}

export function AppLayout({ children, showTabs = false }: AppLayoutProps) {
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
          <ThemeToggle />
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
