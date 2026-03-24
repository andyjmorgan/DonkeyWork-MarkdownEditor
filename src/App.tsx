import { useEffect, useCallback } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { WelcomeScreen } from './components/welcome/WelcomeScreen'
import { EditorView } from './components/editor/EditorView'
import { useFileStore } from './store'
import { useThemeStore } from './store'
import { exportToPdf } from './lib/pdf/exporter'
import { isTauri } from './lib/storage/provider'

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

  // Check for updates on launch (Tauri only)
  useEffect(() => {
    if (!isTauri()) return

    const checkForUpdates = async () => {
      try {
        const { check } = await import('@tauri-apps/plugin-updater')
        const update = await check()
        if (update) {
          const confirmed = window.confirm(
            `A new version (${update.version}) is available. Would you like to update now?`
          )
          if (confirmed) {
            await update.downloadAndInstall()
            const { relaunch } = await import('@tauri-apps/plugin-process')
            await relaunch()
          }
        }
      } catch (error) {
        console.error('Failed to check for updates:', error)
      }
    }

    checkForUpdates()
  }, [])

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
