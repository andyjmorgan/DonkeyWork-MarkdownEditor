import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { all, createLowlight } from 'lowlight'
import { useEffect, useRef, useMemo } from 'react'
import { Toolbar } from '@/components/layout/Toolbar'
import { htmlToMarkdown } from '@/lib/markdown/serializer'
import { markdownToHtml } from '@/lib/markdown/parser'
import { CodeBlockWithCopy } from './CodeBlockWithCopy'
import { MermaidNode } from '@/lib/markdown/mermaidExtension'
import { TableWithControls } from './TableWithControls'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import './preview-editor.css'

const lowlight = createLowlight(all)

const CustomCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockWithCopy)
  },
})

const CustomTable = Table.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TableWithControls, {
      contentDOMElementTag: 'table',
    })
  },
})

interface PreviewEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
  onSave?: () => void
  onNew?: () => void
}

export function PreviewEditor({ content, onChange, className, onSave, onNew }: PreviewEditorProps) {
  const isUpdatingRef = useRef(false)
  const lastEmittedContentRef = useRef('')

  const extensions = useMemo(() => [
    StarterKit.configure({
      codeBlock: false, // Disable default code block (using custom)
    }),
    MermaidNode, // Must come before CustomCodeBlock to match mermaid blocks first
    CustomCodeBlock.configure({
      lowlight,
    }),
    Image.configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: {
        class: 'editor-image',
      },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary underline',
      },
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    CustomTable.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'editor-table',
      },
    }),
    TableRow,
    TableHeader,
    TableCell,
  ], [])

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions,
    content: '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-full p-4',
      },
    },
    onUpdate: ({ editor }) => {
      if (isUpdatingRef.current) return
      const html = editor.getHTML()
      const markdown = htmlToMarkdown(html)
      lastEmittedContentRef.current = markdown
      onChange(markdown)
    },
  })

  useEffect(() => {
    if (!editor) return

    // Don't update if this content was just emitted by this editor
    if (content === lastEmittedContentRef.current) {
      return
    }

    // Convert markdown to HTML
    const html = markdownToHtml(content)
    const currentHtml = editor.getHTML()

    // Only update if content has meaningfully changed
    if (html !== currentHtml) {
      isUpdatingRef.current = true
      editor.commands.setContent(html)
      isUpdatingRef.current = false
    }
  }, [editor, content])

  // Keyboard shortcuts
  useKeyboardShortcuts({ editor, onSave, onNew })

  if (!editor) {
    return null
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <Toolbar editor={editor} />
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}
