import { marked } from 'marked'

// Configure marked with GFM and other options
marked.setOptions({
  gfm: true,
  breaks: false,
})

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown) as string
}
