import { marked } from 'marked'

// Configure marked with GFM and other options
marked.setOptions({
  gfm: true,
  breaks: false,
})

function convertTaskListsToTiptap(html: string): string {
  // Convert GFM task lists to Tiptap-compatible format
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Find all list items that contain task list checkboxes
  const listItems = doc.querySelectorAll('li')

  listItems.forEach((li) => {
    const checkbox = li.querySelector('input[type="checkbox"]')
    if (checkbox) {
      const ul = li.parentElement
      if (ul && ul.tagName === 'UL') {
        // Mark the UL as a task list
        ul.setAttribute('data-type', 'taskList')

        // Mark the LI as a task item
        li.setAttribute('data-type', 'taskItem')
        li.setAttribute('data-checked', checkbox.hasAttribute('checked') ? 'true' : 'false')
      }
    }
  })

  // Remove trailing newlines from code blocks
  const codeBlocks = doc.querySelectorAll('pre code')
  codeBlocks.forEach((code) => {
    if (code.textContent) {
      code.textContent = code.textContent.replace(/\n+$/, '')
    }
  })

  return doc.body.innerHTML
}

export function markdownToHtml(markdown: string): string {
  const html = marked.parse(markdown) as string
  return convertTaskListsToTiptap(html)
}
