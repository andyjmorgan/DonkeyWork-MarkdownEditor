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
          flowchart: {
            useMaxWidth: true,
          },
        })

        // Generate unique ID for mermaid
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(id, code)
        setSvg(renderedSvg)
        setError('')

        // Enable pan-zoom controls after rendering
        setTimeout(() => {
          if (containerRef.current) {
            const svgElement = containerRef.current.querySelector('svg')
            if (svgElement) {
              svgElement.style.maxWidth = '100%'
              svgElement.style.height = 'auto'
            }
          }
        }, 0)
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
            style={{
              overflow: 'auto',
              cursor: 'grab',
              userSelect: 'none',
            }}
            onWheel={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault()
                const svgElement = containerRef.current?.querySelector('svg')
                if (svgElement) {
                  const currentScale = parseFloat(svgElement.style.transform?.match(/scale\(([\d.]+)\)/)?.[1] || '1')
                  const newScale = e.deltaY < 0 ? currentScale * 1.1 : currentScale * 0.9
                  svgElement.style.transform = `scale(${Math.max(0.1, Math.min(5, newScale))})`
                  svgElement.style.transformOrigin = 'center'
                }
              }
            }}
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
