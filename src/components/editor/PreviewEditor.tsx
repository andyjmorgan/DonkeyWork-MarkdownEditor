import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import { all, createLowlight } from 'lowlight'
import { useEffect, useRef } from 'react'
import { Toolbar } from '@/components/layout/Toolbar'
import { htmlToMarkdown } from '@/lib/markdown/serializer'
import { markdownToHtml } from '@/lib/markdown/parser'
import { CodeBlockWithCopy } from './CodeBlockWithCopy'
import { MermaidNode } from '@/lib/markdown/mermaidExtension'
import './preview-editor.css'

const lowlight = createLowlight(all)

const CustomCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockWithCopy)
  },
})

interface PreviewEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
}

export function PreviewEditor({ content, onChange, className }: PreviewEditorProps) {
  const isUpdatingRef = useRef(false)
  const lastEmittedContentRef = useRef('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block
      }),
      CustomCodeBlock.configure({
        lowlight,
      }),
      MermaidNode,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
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

  return (
    <div className={`flex flex-col ${className}`}>
      <Toolbar editor={editor} />
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}
