import { useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { WelcomeScreen } from './components/welcome/WelcomeScreen'
import { EditorView } from './components/editor/EditorView'
import { useFileStore } from './store'
import { useThemeStore } from './store'

function App() {
  const tabs = useFileStore((state) => state.tabs)
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

  return (
    <AppLayout showTabs={hasOpenFiles}>
      {hasOpenFiles ? <EditorView /> : <WelcomeScreen />}
    </AppLayout>
  )
}

export default App
