import { useState, useRef, useCallback, useEffect } from 'react'

interface Position {
  x: number
  y: number
}

interface UseCanvasPanZoomOptions {
  minScale?: number
  maxScale?: number
  initialScale?: number
}

export function useCanvasPanZoom({
  minScale = 0.15,
  maxScale = 2.5,
  initialScale = 1.0,
}: UseCanvasPanZoomOptions = {}) {
  const [scale, setScale] = useState<number>(initialScale)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [smoothTransition, setSmoothTransition] = useState<boolean>(false)

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  })

  const pinchStartRef = useRef<{ distance: number; initialScale: number } | null>(null)
  const transitionTimerRef = useRef<any>(null)

  const enableSmoothTransition = useCallback((durationMs = 400) => {
    setSmoothTransition(true)
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current)
    }
    transitionTimerRef.current = setTimeout(() => {
      setSmoothTransition(false)
    }, durationMs)
  }, [])

  // Clamp utility
  const clampScale = useCallback(
    (s: number) => Math.min(Math.max(s, minScale), maxScale),
    [minScale, maxScale]
  )

  // Zoom In
  const zoomIn = useCallback(() => {
    enableSmoothTransition()
    setScale((prev) => clampScale(prev * 1.25))
  }, [clampScale, enableSmoothTransition])

  // Zoom Out
  const zoomOut = useCallback(() => {
    enableSmoothTransition()
    setScale((prev) => clampScale(prev / 1.25))
  }, [clampScale, enableSmoothTransition])

  // Set Zoom directly
  const setZoom = useCallback(
    (newScale: number) => {
      enableSmoothTransition()
      setScale(clampScale(newScale))
    },
    [clampScale, enableSmoothTransition]
  )

  // Reset View to Top Root Ancestor
  const resetView = useCallback(() => {
    enableSmoothTransition()
    const viewport = viewportRef.current
    const content = contentRef.current

    if (!viewport || !content) {
      setScale(1.0)
      setPosition({ x: 0, y: 40 })
      return
    }

    const vpRect = viewport.getBoundingClientRect()
    const contentWidth = content.scrollWidth || content.offsetWidth

    const targetScale = 1.0
    // Center horizontally, place near top
    const targetX = Math.round((vpRect.width - contentWidth * targetScale) / 2)
    const targetY = 40

    setScale(targetScale)
    setPosition({ x: targetX, y: targetY })
  }, [enableSmoothTransition])

  // Fit View (show entire tree within viewport)
  const fitView = useCallback(() => {
    enableSmoothTransition()
    const viewport = viewportRef.current
    const content = contentRef.current

    if (!viewport || !content) {
      resetView()
      return
    }

    const vpRect = viewport.getBoundingClientRect()
    const contentWidth = content.scrollWidth || content.offsetWidth || 1000
    const contentHeight = content.scrollHeight || content.offsetHeight || 800

    const padding = 60
    const availWidth = vpRect.width - padding * 2
    const availHeight = vpRect.height - padding * 2

    const scaleX = availWidth / contentWidth
    const scaleY = availHeight / contentHeight
    const targetScale = clampScale(Math.min(scaleX, scaleY, 1.0))

    const targetX = Math.round((vpRect.width - contentWidth * targetScale) / 2)
    const targetY = Math.round(Math.max(padding, (vpRect.height - contentHeight * targetScale) / 2))

    setScale(targetScale)
    setPosition({ x: targetX, y: targetY })
  }, [clampScale, enableSmoothTransition, resetView])

  // Center on a specific person card by DOM ID
  const centerOnNode = useCallback(
    (nodeId: number, targetScale = 1.0) => {
      enableSmoothTransition(450)
      const viewport = viewportRef.current
      const content = contentRef.current
      const cardEl = document.getElementById(`tree-card-${nodeId}`)

      if (!viewport || !content || !cardEl) {
        return
      }

      const vpRect = viewport.getBoundingClientRect()
      const contentRect = content.getBoundingClientRect()
      const cardRect = cardEl.getBoundingClientRect()

      // Calculate card position relative to unscaled content
      const cardXInContent = (cardRect.left - contentRect.left) / scale + cardRect.width / (2 * scale)
      const cardYInContent = (cardRect.top - contentRect.top) / scale + cardRect.height / (2 * scale)

      const finalScale = clampScale(targetScale)
      const targetX = Math.round(vpRect.width / 2 - cardXInContent * finalScale)
      const targetY = Math.round(vpRect.height / 2 - cardYInContent * finalScale)

      setScale(finalScale)
      setPosition({ x: targetX, y: targetY })
    },
    [clampScale, enableSmoothTransition, scale]
  )

  // Mouse / Pointer Drag Handlers
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag on left mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return

    // Don't initiate canvas drag if clicked on an interactive button or card
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('.branch-toggle-btn') || target.closest('.tree-floating-controls')) {
      return
    }

    setIsDragging(true)
    setSmoothTransition(false)
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    }

    if (viewportRef.current) {
      viewportRef.current.setPointerCapture(e.pointerId)
    }
  }, [position.x, position.y])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return

      const deltaX = e.clientX - dragStartRef.current.startX
      const deltaY = e.clientY - dragStartRef.current.startY

      setPosition({
        x: Math.round(dragStartRef.current.posX + deltaX),
        y: Math.round(dragStartRef.current.posY + deltaY),
      })
    },
    [isDragging]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false)
      if (viewportRef.current) {
        try {
          viewportRef.current.releasePointerCapture(e.pointerId)
        } catch {
          // Ignore if pointer capture already released
        }
      }
    }
  }, [isDragging])

  // Wheel Zoom (centered around mouse cursor)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const viewport = viewportRef.current
      if (!viewport) return

      const vpRect = viewport.getBoundingClientRect()
      const cursorX = e.clientX - vpRect.left
      const cursorY = e.clientY - vpRect.top

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85
      const newScale = clampScale(scale * zoomFactor)

      if (newScale === scale) return

      // Keep cursor position fixed in content space
      const newX = cursorX - (cursorX - position.x) * (newScale / scale)
      const newY = cursorY - (cursorY - position.y) * (newScale / scale)

      setSmoothTransition(false)
      setScale(newScale)
      setPosition({ x: Math.round(newX), y: Math.round(newY) })
    },
    [clampScale, position.x, position.y, scale]
  )

  // Attach non-passive wheel listener to allow e.preventDefault()
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    viewport.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      viewport.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  // Touch Pinch-to-zoom
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        pinchStartRef.current = { distance: dist, initialScale: scale }
      }
    },
    [scale]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 2 && pinchStartRef.current) {
        e.preventDefault()
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        const ratio = dist / pinchStartRef.current.distance
        const newScale = clampScale(pinchStartRef.current.initialScale * ratio)
        setScale(newScale)
      }
    },
    [clampScale]
  )

  const handleTouchEnd = useCallback(() => {
    pinchStartRef.current = null
  }, [])

  return {
    scale,
    position,
    isDragging,
    smoothTransition,
    viewportRef,
    contentRef,
    zoomIn,
    zoomOut,
    setZoom,
    resetView,
    fitView,
    centerOnNode,
    panZoomEvents: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}
