import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

// Initialize mermaid with dark theme support
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
})

export function MermaidDiagram({ node, updateAttributes }: NodeViewProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)
  const codeRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const renderDiagram = async () => {
      const code = node.textContent || ''

      if (!code.trim()) {
        setSvg('')
        setError('')
        return
      }

      try {
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
  }, [node.textContent])

  // Update theme when dark mode changes
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
    })
  }, [])

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
