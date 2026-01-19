import { useEffect, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { EditorView } from '@codemirror/view'
import { useThemeStore } from '@/store'

interface RawEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  lineWrapping?: boolean
}

export function RawEditor({ value, onChange, className, lineWrapping = false }: RawEditorProps) {
  const theme = useThemeStore((state) => state.theme)
  const editorRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={editorRef} className={className}>
      <CodeMirror
        value={value}
        height="100%"
        theme={theme === 'dark' ? 'dark' : 'light'}
        extensions={[
          markdown(),
          ...(lineWrapping ? [EditorView.lineWrapping] : []),
        ]}
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
    </div>
  )
}
