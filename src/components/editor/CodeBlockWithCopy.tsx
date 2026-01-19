import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { Copy, Check } from 'lucide-react'
import { useState, useRef } from 'react'

export function CodeBlockWithCopy({ node }: NodeViewProps) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  const handleCopy = async () => {
    if (preRef.current) {
      const code = preRef.current.textContent || ''
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div className="code-block-container">
        <button
          className={`code-block-copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          aria-label="Copy code"
          type="button"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        <pre ref={preRef}>
          <NodeViewContent as="code" />
        </pre>
      </div>
    </NodeViewWrapper>
  )
}
