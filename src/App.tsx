import { useEffect, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { AppLayout } from './components/layout/AppLayout'
import { WelcomeScreen } from './components/welcome/WelcomeScreen'
import { EditorView } from './components/editor/EditorView'
import { useFileStore } from './store'
import { useThemeStore } from './store'
import { MarkdownFile } from './types'
import { exportToPdf } from './lib/pdf/exporter'
import * as db from './lib/db/fileStore'
import { initDB } from './lib/db'
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

  // Load persisted files (web) or the file the app was launched with (Tauri), and subscribe
  // to macOS "Open With" events. Mounted exactly once at the App root so only a single
  // listener is registered regardless of how many components consume useFileOperations.
  useEffect(() => {
    const { addFile, loadFile } = useFileStore.getState()

    if (isTauri()) {
      let unlisten: (() => void) | undefined

      const initTauri = async () => {
        try {
          const { invoke } = await import('@tauri-apps/api/core')
          const openedFile = await invoke<{ path: string; name: string; content: string } | null>('get_opened_file')
          if (openedFile) {
            const file: MarkdownFile = {
              id: nanoid(),
              name: openedFile.name,
              content: openedFile.content,
              lastModified: Date.now(),
              isDirty: false,
              filePath: openedFile.path,
              isUntitled: false,
            }
            addFile(file)
          }
        } catch (error) {
          console.error('Failed to check for opened file:', error)
        }

        try {
          const { listen } = await import('@tauri-apps/api/event')
          const { invoke } = await import('@tauri-apps/api/core')
          unlisten = await listen<string[]>('open-file', async (event) => {
            for (const filePath of event.payload) {
              const currentFiles = useFileStore.getState().files
              const alreadyOpen = Array.from(currentFiles.values()).some(
                (f) => f.filePath === filePath
              )
              if (alreadyOpen) continue

              try {
                const result = await invoke<{ path: string; name: string; content: string }>('read_file', { path: filePath })
                const file: MarkdownFile = {
                  id: nanoid(),
                  name: result.name,
                  content: result.content,
                  lastModified: Date.now(),
                  isDirty: false,
                  filePath: result.path,
                  isUntitled: false,
                }
                addFile(file)
              } catch (error) {
                console.error('Failed to open file from event:', error)
              }
            }
          })
        } catch (error) {
          console.error('Failed to listen for open-file events:', error)
        }
      }

      initTauri()

      return () => { unlisten?.() }
    }

    // Web: restore IndexedDB-backed files into the store without opening tabs.
    const initWeb = async () => {
      try {
        await initDB()
        const savedFiles = await db.getAllFiles()
        savedFiles.forEach((file) => {
          loadFile({ ...file, isDirty: false })
        })
      } catch (error) {
        console.error('Failed to load files from IndexedDB:', error)
      }
    }

    initWeb()
  }, [])

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

  const handleExportMarkdown = useCallback(async () => {
    if (!activeFile) return

    const defaultName = activeFile.name.endsWith('.md') ? activeFile.name : `${activeFile.name}.md`

    if (isTauri()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core')
        const path = await invoke<string | null>('save_file_dialog', { defaultName })
        if (!path) return
        await invoke('write_file', { path, content: activeFile.content })
      } catch (error) {
        console.error('Failed to export markdown:', error)
        alert('Failed to export markdown. Please try again.')
      }
      return
    }

    const blob = new Blob([activeFile.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = defaultName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [activeFile])

  const handleExportPdf = useCallback(async () => {
    if (!activeFile) return

    const defaultName = activeFile.name.endsWith('.md')
      ? activeFile.name.replace('.md', '.pdf')
      : `${activeFile.name}.pdf`

    try {
      if (isTauri()) {
        // Clone the live preview DOM into a body-level container that the print
        // stylesheet promotes as the sole visible element. WebKit then runs its
        // native print pipeline on that container — fast, vector-quality, and
        // honors CSS page-break rules.
        const preview = document.querySelector<HTMLElement>('.ProseMirror')
        if (!preview) {
          alert('No preview content to export.')
          return
        }
        const printRoot = document.createElement('div')
        printRoot.id = 'print-root'
        printRoot.innerHTML = preview.innerHTML
        document.body.appendChild(printRoot)
        try {
          window.print()
        } finally {
          document.body.removeChild(printRoot)
        }
        return
      }

      await exportToPdf({
        markdown: activeFile.content,
        filename: defaultName,
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
          onExportMarkdown={handleExportMarkdown}
          onExportPdf={handleExportPdf}
        />
      ) : (
        <WelcomeScreen />
      )}
    </AppLayout>
  )
}

export default App
