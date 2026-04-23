import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { MermaidDiagram } from '@/components/editor/MermaidDiagram'

export const MermaidNode = Node.create({
  name: 'mermaid',

  priority: 1000, // Higher priority than code blocks to match first

  group: 'block',

  content: 'text*',

  marks: '',

  code: true,

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      language: {
        default: 'mermaid',
        parseHTML: (element) => element.getAttribute('data-language'),
        renderHTML: (attributes) => {
          return {
            'data-language': attributes.language,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'pre[data-language="mermaid"]',
        preserveWhitespace: 'full',
      },
      {
        tag: 'pre',
        getAttrs: (node) => {
          const code = node.querySelector('code')
          if (code?.className.includes('language-mermaid')) {
            return { language: 'mermaid' }
          }
          return false
        },
        preserveWhitespace: 'full',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes(HTMLAttributes, { 'data-language': 'mermaid' }),
      ['code', {}, 0],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidDiagram)
  },

  addCommands() {
    return {
      setMermaid:
        (attributes?: { code?: string }) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ commands }: any) => {
          const code = attributes?.code || 'graph TD\n  A[Start] --> B[End]'
          return commands.insertContent({
            type: this.name,
            content: [{ type: 'text', text: code }],
          })
        },
    }
  },
})
