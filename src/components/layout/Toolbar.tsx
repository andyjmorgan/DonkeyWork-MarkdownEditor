import { Editor } from '@tiptap/react'
import { useState } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  CodeSquare,
  Network,
  ImagePlus,
  Table as TableIcon,
  Minus,
  Link as LinkIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ImageDialog } from '@/components/dialogs/ImageDialog'
import { MermaidDialog } from '@/components/dialogs/MermaidDialog'
import { LinkDialog } from '@/components/dialogs/LinkDialog'

interface ToolbarProps {
  editor: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [isMermaidDialogOpen, setIsMermaidDialogOpen] = useState(false)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkData, setLinkData] = useState({ url: '', text: '' })

  if (!editor) {
    return null
  }

  const handleInsertImage = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run()
  }

  const handleInsertMermaid = (code: string) => {
    editor.chain().focus().setMermaid({ code }).run()
  }

  const handleToggleLink = () => {
    const previousUrl = editor.getAttributes('link').href || ''
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')

    setLinkData({ url: previousUrl, text: selectedText })
    setIsLinkDialogOpen(true)
  }

  const handleInsertLink = (url: string, text: string) => {
    if (!url) return

    if (url === '' && editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // If there's selected text, just add the link
    const { from, to } = editor.state.selection
    if (from !== to) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    } else {
      // If no selection, insert text with link
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: text || url,
          marks: [{ type: 'link', attrs: { href: url } }],
        })
        .run()
    }
  }

  const ToolbarButton = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void
    active: boolean
    children: React.ReactNode
    title: string
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        'h-8 w-8 p-0',
        active && 'bg-accent text-accent-foreground'
      )}
      title={title}
    >
      {children}
    </Button>
  )

  return (
    <div className="flex items-center gap-1 flex-wrap px-2 py-1 border-b border-border bg-muted/50">
      {/* Headings */}
      <div className="flex items-center gap-0.5 border-r border-border pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Text formatting */}
      <div className="flex items-center gap-0.5 border-r border-border px-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Cmd+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Cmd+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Cmd+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Link & Image */}
      <div className="flex items-center gap-0.5 border-r border-border px-2">
        <ToolbarButton
          onClick={handleToggleLink}
          active={editor.isActive('link')}
          title="Insert Link (Cmd+K)"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setIsImageDialogOpen(true)}
          active={editor.isActive('image')}
          title="Insert Image"
        >
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5 border-r border-border px-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive('taskList')}
          title="Task List"
        >
          <ListChecks className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Blocks */}
      <div className="flex items-center gap-0.5 border-r border-border px-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <CodeSquare className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Table & Divider */}
      <div className="flex items-center gap-0.5 border-r border-border px-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          active={editor.isActive('table')}
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Mermaid Diagram */}
      <div className="flex items-center gap-0.5 px-2">
        <ToolbarButton
          onClick={() => setIsMermaidDialogOpen(true)}
          active={editor.isActive('mermaid')}
          title="Mermaid Diagram"
        >
          <Network className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <ImageDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        onInsertImage={handleInsertImage}
      />
      <MermaidDialog
        open={isMermaidDialogOpen}
        onOpenChange={setIsMermaidDialogOpen}
        onInsertMermaid={handleInsertMermaid}
      />
      <LinkDialog
        open={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        onInsertLink={handleInsertLink}
        initialUrl={linkData.url}
        initialText={linkData.text}
      />
    </div>
  )
}
