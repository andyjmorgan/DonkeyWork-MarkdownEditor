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
    const preElement = node as HTMLElement
    const codeElement = node.firstChild as HTMLElement

    // Check for language in data-language attribute (used by mermaid) or class
    const dataLanguage = preElement.getAttribute('data-language')
    const classLanguage = codeElement.className.replace('language-', '')
    const language = dataLanguage || classLanguage || ''

    const trimmedContent = content.replace(/\n+$/, '') // Remove trailing newlines
    return `\n\`\`\`${language}\n${trimmedContent}\n\`\`\`\n`
  },
})

// Add table rule for GFM-style tables
turndownService.addRule('table', {
  filter: 'table',
  replacement: (content, node) => {
    const table = node as HTMLTableElement
    const rows = Array.from(table.querySelectorAll('tr'))

    if (rows.length === 0) return ''

    let markdown = '\n'

    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('th, td'))
      const cellContents = cells.map(cell => {
        return cell.textContent?.trim().replace(/\n/g, ' ') || ''
      })

      markdown += '| ' + cellContents.join(' | ') + ' |\n'

      // Add separator row after header
      if (rowIndex === 0 && row.querySelector('th')) {
        const separator = cells.map(() => '---').join(' | ')
        markdown += '| ' + separator + ' |\n'
      }
    })

    markdown += '\n'
    return markdown
  },
})

export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html)
}
