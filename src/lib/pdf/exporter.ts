import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { markdownToHtml } from '@/lib/markdown/parser'
import mermaid from 'mermaid'

export interface ExportPdfOptions {
  filename?: string
  markdown: string
}

export async function exportToPdf({ filename = 'document.pdf', markdown }: ExportPdfOptions): Promise<void> {
  // Initialize mermaid with light theme
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
  })

  // Create a temporary container for rendering
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '210mm' // A4 width
  container.style.padding = '20mm'
  container.style.backgroundColor = '#ffffff'
  container.style.color = '#000000'
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif'
  container.style.fontSize = '12pt'
  container.style.lineHeight = '1.6'

  // Add prose styling for better typography
  container.className = 'prose prose-slate max-w-none'

  // Convert markdown to HTML
  const html = markdownToHtml(markdown)
  container.innerHTML = html

  document.body.appendChild(container)

  try {
    // Wait for images to load
    const images = container.querySelectorAll('img')
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve(null)
            } else {
              img.onload = () => resolve(null)
              img.onerror = () => resolve(null)
            }
          })
      )
    )

    // Render any mermaid diagrams
    const mermaidCodeBlocks = container.querySelectorAll('pre code.language-mermaid')
    for (let i = 0; i < mermaidCodeBlocks.length; i++) {
      const codeElement = mermaidCodeBlocks[i]
      const code = codeElement.textContent || ''

      if (code.trim()) {
        try {
          const { svg } = await mermaid.render(`mermaid-pdf-${Date.now()}-${i}`, code)

          // Create a div to hold the SVG and replace the pre element
          const svgContainer = document.createElement('div')
          svgContainer.className = 'mermaid-diagram-pdf'
          svgContainer.style.margin = '20px 0'
          svgContainer.style.textAlign = 'center'
          svgContainer.innerHTML = svg

          const preElement = codeElement.parentElement
          if (preElement?.parentElement) {
            preElement.parentElement.replaceChild(svgContainer, preElement)
          }
        } catch (error) {
          console.error('Failed to render mermaid diagram:', error)
        }
      }
    }

    // Wait a bit for mermaid to fully render
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Capture the content as canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    // Calculate PDF dimensions (A4 size)
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/png')

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Download the PDF
    pdf.save(filename)
  } finally {
    // Clean up
    document.body.removeChild(container)
  }
}
