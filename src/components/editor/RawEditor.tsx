import { useState, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { EditorView } from '@codemirror/view'
import { useThemeStore } from '@/store'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#000000',
  },
  '.cm-gutters': {
    backgroundColor: '#000000 !important',
    borderRight: '1px solid hsl(0 0% 20%)',
  },
  '.cm-gutter': {
    backgroundColor: '#000000 !important',
  },
  '.cm-lineNumbers': {
    backgroundColor: '#000000 !important',
  },
  '.cm-content': {
    backgroundColor: '#000000',
  },
  '.cm-scroller': {
    backgroundColor: '#000000',
  },
}, { dark: true })

interface RawEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  lineWrapping?: boolean
}

export function RawEditor({ value, onChange, className, lineWrapping = false }: RawEditorProps) {
  const theme = useThemeStore((state) => state.theme)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const extensions = useMemo(() => [
    markdown(),
    ...(lineWrapping ? [EditorView.lineWrapping] : []),
    ...(theme === 'dark' ? [darkTheme] : []),
  ], [lineWrapping, theme])

  return (
    <div className={`relative group ${className}`}>
      <CodeMirror
        value={value}
        height="100%"
        theme={theme === 'dark' ? 'dark' : 'light'}
        extensions={extensions}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        className="h-full"
        style={{
          height: '100%',
          fontSize: '14px',
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-accent"
        title={copied ? 'Copied!' : 'Copy markdown'}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}
