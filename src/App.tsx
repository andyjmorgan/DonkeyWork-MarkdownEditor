import { useEffect, useCallback } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { WelcomeScreen } from './components/welcome/WelcomeScreen'
import { EditorView } from './components/editor/EditorView'
import { useFileStore } from './store'
import { useThemeStore } from './store'
import { exportToPdf } from './lib/pdf/exporter'

function App() {
  const tabs = useFileStore((state) => state.tabs)
  const activeFile = useFileStore((state) => state.getActiveFile())
  const theme = useThemeStore((state) => state.theme)
  const hasOpenFiles = tabs.length > 0

  // Initialize theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const handleDownloadMarkdown = useCallback(() => {
    if (!activeFile) return

    const blob = new Blob([activeFile.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = activeFile.name.endsWith('.md') ? activeFile.name : `${activeFile.name}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [activeFile])

  const handleExportPdf = useCallback(async () => {
    if (!activeFile) return

    try {
      const filename = activeFile.name.endsWith('.md')
        ? activeFile.name.replace('.md', '.pdf')
        : `${activeFile.name}.pdf`

      await exportToPdf({
        markdown: activeFile.content,
        filename,
      })
    } catch (error) {
      console.error('Failed to export PDF:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }, [activeFile])

  return (
    <AppLayout showTabs={hasOpenFiles}>
      {hasOpenFiles ? (
        <EditorView
          onDownloadMarkdown={handleDownloadMarkdown}
          onExportPdf={handleExportPdf}
        />
      ) : (
        <WelcomeScreen />
      )}
    </AppLayout>
  )
}

export default App
