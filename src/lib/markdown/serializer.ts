import TurndownService from 'turndown'

// Create a turndown service instance with GFM-like options
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  strongDelimiter: '**',
})

// Add task list rule
turndownService.addRule('taskList', {
  filter: (node) => {
    return (
      node.nodeName === 'LI' &&
      node.parentNode?.nodeName === 'UL' &&
      (node.getAttribute('data-type') === 'taskItem' ||
        (node as HTMLLIElement).firstChild?.nodeName === 'INPUT')
    )
  },
  replacement: (content, node) => {
    const input = node.querySelector('input[type="checkbox"]')
    const checked = input && (input as HTMLInputElement).checked
    // Remove extra newlines and trim content
    const cleanContent = content.trim().replace(/\n+/g, ' ')
    return `- [${checked ? 'x' : ' '}] ${cleanContent}\n`
  },
})

// Add strikethrough rule
turndownService.addRule('strikethrough', {
  filter: ['del', 's', 'strike'],
  replacement: (content) => {
    return `~~${content}~~`
  },
})

// Add underline rule (convert to markdown emphasis)
turndownService.addRule('underline', {
  filter: ['u'],
  replacement: (content) => {
    return `_${content}_`
  },
})

// Add code block rule to remove trailing newlines
turndownService.addRule('codeBlock', {
  filter: (node) => {
    return node.nodeName === 'PRE' && node.firstChild?.nodeName === 'CODE'
  },
  replacement: (content, node) => {
    const codeElement = node.firstChild as HTMLElement
    const language = codeElement.className.replace('language-', '') || ''
    const trimmedContent = content.replace(/\n+$/, '') // Remove trailing newlines
    return `\n\`\`\`${language}\n${trimmedContent}\n\`\`\`\n`
  },
})

export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html)
}
