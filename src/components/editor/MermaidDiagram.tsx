import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { useThemeStore } from '@/store/useThemeStore'

export function MermaidDiagram({ node, updateAttributes }: NodeViewProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)
  const codeRef = useRef<HTMLPreElement>(null)
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    const renderDiagram = async () => {
      const code = node.textContent || ''

      if (!code.trim()) {
        setSvg('')
        setError('')
        return
      }

      try {
        // Initialize mermaid with current theme
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
        })

        // Generate unique ID for mermaid
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(id, code)
        setSvg(renderedSvg)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
        setSvg('')
      }
    }

    renderDiagram()
  }, [node.textContent, theme])

  return (
    <NodeViewWrapper className="mermaid-diagram-wrapper">
      <div className="mermaid-diagram-container">
        {svg ? (
          <div
            ref={containerRef}
            className="mermaid-diagram-output"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : error ? (
          <div className="mermaid-diagram-error">
            <div className="mermaid-error-title">Mermaid Syntax Error</div>
            <pre className="mermaid-error-message">{error}</pre>
            <div className="mermaid-error-code">
              <pre ref={codeRef}>
                <NodeViewContent as="code" />
              </pre>
            </div>
          </div>
        ) : (
          <div className="mermaid-diagram-placeholder">
            <pre ref={codeRef}>
              <NodeViewContent as="code" />
            </pre>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
