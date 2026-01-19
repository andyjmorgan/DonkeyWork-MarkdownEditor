import { ReactNode, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SplitViewProps {
  left: ReactNode
  right: ReactNode
}

export function SplitView({ left, right }: SplitViewProps) {
  const [leftWidth, setLeftWidth] = useState(50) // percentage
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const offsetX = e.clientX - containerRect.left
      const newLeftWidth = (offsetX / containerRect.width) * 100

      // Clamp between 20% and 80%
      const clampedWidth = Math.max(20, Math.min(80, newLeftWidth))
      setLeftWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  return (
    <div ref={containerRef} className="flex h-full relative">
      <div
        className="overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>

      {/* Draggable divider */}
      <div
        className={cn(
          'w-1 bg-border hover:bg-primary cursor-col-resize transition-colors relative group',
          isDragging && 'bg-primary'
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Wider hit area for easier grabbing */}
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      <div
        className="overflow-hidden"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>
    </div>
  )
}
