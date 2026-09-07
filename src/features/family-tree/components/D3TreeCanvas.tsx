import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { hierarchy, tree as d3Tree, type HierarchyPointNode } from 'd3-hierarchy'
import type { PersonTreeNode } from '@/types'
import { PersonCard } from './PersonCard'

export interface D3TreeCanvasProps {
  treeData: PersonTreeNode[]
  orientation: 'top-down' | 'left-to-right'
  collapsedNodeIds: Set<number>
  selectedPersonId: number | null
  highlightedPersonId: number | null
  centerRootTrigger?: number
  loading?: boolean
  onToggleCollapse: (id: number) => void
  onSelectPerson: (id: number) => void
  onCollapseAll: () => void
  onExpandAll: () => void
  onCenterNodeRef?: (fn: (nodeId: number) => void) => void
  svgRef?: React.RefObject<SVGSVGElement | null>
}

interface LayoutNode {
  id: number
  data: PersonTreeNode
  cardLeft: number
  cardTop: number
  centerX: number
  centerY: number
  generation: number
  hasChildren: boolean
  childCount: number
  isCollapsed: boolean
  isSelected: boolean
  isHighlighted: boolean
}

interface LayoutLink {
  id: string
  sourceId: number
  targetId: number
  pathD: string
  isHighlighted: boolean
}

export function D3TreeCanvas({
  treeData,
  orientation,
  collapsedNodeIds,
  selectedPersonId,
  highlightedPersonId,
  centerRootTrigger,
  loading = false,
  onToggleCollapse,
  onSelectPerson,
  onCollapseAll,
  onExpandAll,
  onCenterNodeRef,
  svgRef: externalSvgRef,
}: D3TreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const localSvgRef = useRef<SVGSVGElement | null>(null)
  const svgRef = externalSvgRef || localSvgRef

  // Pan & Zoom State
  const [transform, setTransform] = useState({ x: 60, y: 40, scale: 0.95 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ startX: 0, startY: 0, startTx: 0, startTy: 0 })

  // Find ancestor chain for highlighted path
  const activeLineageIds = useMemo(() => {
    const targetId = highlightedPersonId || selectedPersonId
    if (!targetId || !Array.isArray(treeData) || treeData.length === 0) return new Set<number>()

    const set = new Set<number>()
    function findPath(nodes: PersonTreeNode[], path: number[]): boolean {
      if (!Array.isArray(nodes)) return false
      for (const n of nodes) {
        if (!n) continue
        if (n.id === targetId) {
          path.forEach((id) => set.add(id))
          set.add(n.id)
          return true
        }
        if (Array.isArray(n.children) && n.children.length > 0) {
          if (findPath(n.children, [...path, n.id])) {
            return true
          }
        }
      }
      return false
    }

    findPath(treeData, [])
    return set
  }, [selectedPersonId, highlightedPersonId, treeData])

  // Card sizing constants
  const isTopDown = orientation === 'top-down'
  const cardW = isTopDown ? 214 : 230
  const cardH = isTopDown ? 94 : 86
  const gapX = isTopDown ? 44 : 76
  const gapY = isTopDown ? 64 : 24

  // Compute Layout via d3-hierarchy with coordinate normalization
  const { nodes, links, bounds } = useMemo(() => {
    if (!Array.isArray(treeData) || treeData.length === 0) {
      return {
        nodes: [],
        links: [],
        bounds: { minX: 0, maxX: 800, minY: 0, maxY: 600, width: 800, height: 600 },
      }
    }

    // Wrap multiple roots if needed
    const rootData: PersonTreeNode =
      treeData.length === 1
        ? treeData[0]
        : {
            id: -99999,
            full_name: 'Gia Phả',
            gender: 'male',
            generation: 0,
            avatar_url: null,
            children: treeData,
          }

    // Build hierarchy with collapsed pruning
    const rootHierarchy = hierarchy<PersonTreeNode>(rootData, (d) => {
      if (d.id !== -99999 && collapsedNodeIds.has(d.id)) {
        return null
      }
      return Array.isArray(d.children) && d.children.length > 0 ? d.children : null
    })

    // Setup d3 tree layout
    if (isTopDown) {
      const layout = d3Tree<PersonTreeNode>().nodeSize([cardW + gapX, cardH + gapY])
      layout(rootHierarchy)
    } else {
      const layout = d3Tree<PersonTreeNode>().nodeSize([cardH + gapY, cardW + gapX])
      layout(rootHierarchy)
    }

    const allDescendants = rootHierarchy.descendants() as HierarchyPointNode<PersonTreeNode>[]

    // 1st Pass: Find min/max bounds in d3 space
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    for (const d of allDescendants) {
      if (d.data.id === -99999) continue
      const rawLeft = isTopDown ? d.x - cardW / 2 : d.y
      const rawTop = isTopDown ? d.y : d.x - cardH / 2

      if (rawLeft < minX) minX = rawLeft
      if (rawLeft + cardW > maxX) maxX = rawLeft + cardW
      if (rawTop < minY) minY = rawTop
      if (rawTop + cardH > maxY) maxY = rawTop + cardH
    }

    if (minX === Infinity) {
      minX = 0
      maxX = 800
      minY = 0
      maxY = 600
    }

    // Shift coordinates so everything is strictly positive and comfortable
    const shiftX = -minX + 80
    const shiftY = -minY + 60

    const nodeList: LayoutNode[] = []
    const nodeMap = new Map<number, LayoutNode>()

    for (const d of allDescendants) {
      if (d.data.id === -99999) continue

      let cardLeft = 0
      let cardTop = 0
      let centerX = 0
      let centerY = 0

      if (isTopDown) {
        centerX = d.x + shiftX
        centerY = d.y + cardH / 2 + shiftY
        cardLeft = d.x - cardW / 2 + shiftX
        cardTop = d.y + shiftY
      } else {
        centerX = d.y + cardW / 2 + shiftX
        centerY = d.x + shiftY
        cardLeft = d.y + shiftX
        cardTop = d.x - cardH / 2 + shiftY
      }

      const hasChildren = Boolean(
        d.data.children && Array.isArray(d.data.children) && d.data.children.length > 0
      )
      const childCount = hasChildren ? d.data.children.length : 0
      const isCollapsed = collapsedNodeIds.has(d.data.id)

      const nodeObj: LayoutNode = {
        id: d.data.id,
        data: d.data,
        cardLeft,
        cardTop,
        centerX,
        centerY,
        generation: d.data.generation,
        hasChildren,
        childCount,
        isCollapsed,
        isSelected: selectedPersonId === d.data.id,
        isHighlighted: highlightedPersonId === d.data.id,
      }

      nodeList.push(nodeObj)
      nodeMap.set(d.data.id, nodeObj)
    }

    // Build Connectors (Links)
    const linkList: LayoutLink[] = []
    const allLinks = rootHierarchy.links()

    for (const link of allLinks) {
      if (link.source.data.id === -99999) continue

      const sourceNode = nodeMap.get(link.source.data.id)
      const targetNode = nodeMap.get(link.target.data.id)
      if (!sourceNode || !targetNode) continue

      let pathD = ''
      if (isTopDown) {
        // From bottom center of source to top center of target
        const x0 = sourceNode.centerX
        const y0 = sourceNode.cardTop + cardH
        const x1 = targetNode.centerX
        const y1 = targetNode.cardTop
        const yMid = (y0 + y1) / 2

        // Smooth cubic bezier
        pathD = `M ${x0},${y0} C ${x0},${yMid} ${x1},${yMid} ${x1},${y1}`
      } else {
        // From right center of source to left center of target
        const x0 = sourceNode.cardLeft + cardW
        const y0 = sourceNode.centerY
        const x1 = targetNode.cardLeft
        const y1 = targetNode.centerY
        const xMid = (x0 + x1) / 2

        // Smooth cubic bezier
        pathD = `M ${x0},${y0} C ${xMid},${y0} ${xMid},${y1} ${x1},${y1}`
      }

      const isLineage =
        activeLineageIds.has(sourceNode.id) && activeLineageIds.has(targetNode.id)

      linkList.push({
        id: `link-${sourceNode.id}-${targetNode.id}`,
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        pathD,
        isHighlighted: isLineage,
      })
    }

    const totalWidth = maxX - minX + cardW + 160
    const totalHeight = maxY - minY + cardH + 160

    return {
      nodes: nodeList,
      links: linkList,
      bounds: {
        minX: 80,
        maxX: 80 + totalWidth,
        minY: 60,
        maxY: 60 + totalHeight,
        width: totalWidth,
        height: totalHeight,
      },
    }
  }, [treeData, isTopDown, cardW, cardH, gapX, gapY, collapsedNodeIds, selectedPersonId, highlightedPersonId, activeLineageIds])

  // Center or Fit View
  const handleFitView = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) return
    const container = containerRef.current
    const vpW = container.clientWidth || 1000
    const vpH = container.clientHeight || 700

    const treeW = Math.max(bounds.width, 200)
    const treeH = Math.max(bounds.height, 200)

    const padding = 60
    const availW = Math.max(vpW - padding * 2, 200)
    const availH = Math.max(vpH - padding * 2, 200)

    const scaleX = availW / treeW
    const scaleY = availH / treeH
    const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.25), 1.0)

    const targetX = Math.round((vpW - treeW * fitScale) / 2)
    const targetY = Math.round(Math.max(30, (vpH - treeH * fitScale) / 2))

    setTransform({
      x: targetX,
      y: targetY,
      scale: Number(fitScale.toFixed(3)),
    })
  }, [nodes, bounds])

  const handleResetView = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) return
    const container = containerRef.current
    const vpW = container.clientWidth || 1000
    const vpH = container.clientHeight || 700

    // Find root node (Cụ Khởi Tổ / đời 1)
    const rootNode = nodes.find((n) => n.generation === 1) || nodes[0]
    const targetScale = 0.95

    if (isTopDown) {
      // Top-Down: Center horizontally on Cụ Khởi Tổ, positioned comfortably at top
      const targetX = Math.round(vpW / 2 - rootNode.centerX * targetScale)
      const targetY = Math.round(Math.max(20, 60 - rootNode.cardTop * targetScale))
      setTransform({
        x: targetX,
        y: targetY,
        scale: targetScale,
      })
    } else {
      // Left-to-Right: Center vertically on Cụ Khởi Tổ, positioned at left
      const targetX = Math.round(Math.max(30, 60 - rootNode.cardLeft * targetScale))
      const targetY = Math.round(vpH / 2 - rootNode.centerY * targetScale)
      setTransform({
        x: targetX,
        y: targetY,
        scale: targetScale,
      })
    }
  }, [nodes, isTopDown])

  // Keep current transform in ref so callbacks don't re-create on every pan/zoom step
  const transformRef = useRef(transform)
  useEffect(() => {
    transformRef.current = transform
  }, [transform])

  const hasInitializedRef = useRef(false)
  const lastCenteredHighlightIdRef = useRef<number | null>(null)

  // Reset initialization flag when orientation changes
  useEffect(() => {
    hasInitializedRef.current = false
  }, [orientation])

  // Initial auto center on root node when tree is first loaded
  useEffect(() => {
    if (nodes.length > 0 && !loading && !hasInitializedRef.current && !highlightedPersonId) {
      hasInitializedRef.current = true
      handleResetView()
    }
  }, [nodes.length, loading, highlightedPersonId, handleResetView])

  // ResizeObserver: only auto-center if view has not been initialized yet
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 50 && entry.contentRect.height > 50) {
          if (!hasInitializedRef.current && nodes.length > 0 && !highlightedPersonId) {
            hasInitializedRef.current = true
            handleResetView()
          }
        }
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [nodes.length, highlightedPersonId, handleResetView])

  // Center on Cụ Khởi Tổ whenever Mở hết (Expand All) or Thu gọn (Collapse All) is triggered
  const pendingCenterRootRef = useRef(false)
  useEffect(() => {
    if (centerRootTrigger && centerRootTrigger > 0) {
      pendingCenterRootRef.current = true
    }
  }, [centerRootTrigger])

  useEffect(() => {
    if (pendingCenterRootRef.current && nodes.length > 0) {
      pendingCenterRootRef.current = false
      const timer = setTimeout(() => {
        handleResetView()
      }, 40)
      return () => clearTimeout(timer)
    }
  }, [nodes, handleResetView])

  // Center on a specific node ID (only depends on nodes, reads scale from transformRef)
  const centerOnNode = useCallback(
    (nodeId: number) => {
      const targetNode = nodes.find((n) => n.id === nodeId)
      if (!targetNode || !containerRef.current) return
      const container = containerRef.current
      const vpW = container.clientWidth || 1000
      const vpH = container.clientHeight || 700

      const curScale = transformRef.current.scale
      const useScale = Math.max(curScale, 0.85)
      const targetX = vpW / 2 - targetNode.centerX * useScale
      const targetY = vpH / 2 - targetNode.centerY * useScale

      setTransform({
        x: Math.round(targetX),
        y: Math.round(targetY),
        scale: useScale,
      })
    },
    [nodes]
  )

  // Expose centerOnNode to parent
  useEffect(() => {
    if (onCenterNodeRef) {
      onCenterNodeRef(centerOnNode)
    }
  }, [centerOnNode, onCenterNodeRef])

  // Center ONLY ONCE when highlightedPersonId actually changes to a new ID
  useEffect(() => {
    if (highlightedPersonId) {
      if (lastCenteredHighlightIdRef.current !== highlightedPersonId) {
        lastCenteredHighlightIdRef.current = highlightedPersonId
        const timer = setTimeout(() => {
          centerOnNode(highlightedPersonId)
        }, 50)
        return () => clearTimeout(timer)
      }
    } else {
      lastCenteredHighlightIdRef.current = null
    }
  }, [highlightedPersonId, centerOnNode])

  // Zoom Controls
  const handleZoomIn = () => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(Number((prev.scale * 1.2).toFixed(2)), 2.6),
    }))
  }

  const handleZoomOut = () => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(Number((prev.scale / 1.2).toFixed(2)), 0.2),
    }))
  }

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    // Ignore drag start if clicking interactive buttons or card
    if (target.closest('button') || target.closest('.person-card-interactive')) return

    setIsDragging(true)
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTx: transform.x,
      startTy: transform.y,
    }
    containerRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.startX
    const dy = e.clientY - dragStartRef.current.startY
    setTransform((prev) => ({
      ...prev,
      x: dragStartRef.current.startTx + dx,
      y: dragStartRef.current.startTy + dy,
    }))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false)
      try {
        containerRef.current?.releasePointerCapture(e.pointerId)
      } catch {
        // Ignore
      }
    }
  }

  // Wheel Zoom towards cursor focal point
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88
    const newScale = Math.min(Math.max(transform.scale * zoomFactor, 0.2), 2.8)

    const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale)
    const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale)

    setTransform({
      x: Math.round(newX),
      y: Math.round(newY),
      scale: Number(newScale.toFixed(3)),
    })
  }

  const canvasWidth = Math.max(bounds.width + 500, 3000)
  const canvasHeight = Math.max(bounds.height + 500, 3000)

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className={`relative w-full h-full min-h-0 flex-1 overflow-hidden select-none bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-250 cursor-${
        isDragging ? 'grabbing' : 'grab'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.03) 0%, transparent 60%),
          radial-gradient(var(--c-border, #cbd5e1) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 28px 28px',
      }}
    >
      {/* Zoom / Viewport Toolbar (Bottom Right) */}
      <div className="absolute bottom-5 right-5 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl z-40">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          title="Phóng to (+)"
          aria-label="Phóng to"
        >
          ＋
        </button>

        <span className="text-xs font-mono font-semibold px-1 min-w-[42px] text-center text-slate-600 dark:text-slate-400">
          {Math.round(transform.scale * 100)}%
        </span>

        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          title="Thu nhỏ (-)"
          aria-label="Thu nhỏ"
        >
          －
        </button>

        <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        <button
          type="button"
          onClick={handleResetView}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 transition-colors"
          title="Vị trí ban đầu"
          aria-label="Khởi tạo vị trí"
        >
          🎯
        </button>

        <button
          type="button"
          onClick={handleFitView}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          title="Hiển thị toàn bộ cây (Fit view)"
          aria-label="Hiển thị toàn cảnh"
        >
          ⛶
        </button>

        <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        <button
          type="button"
          onClick={onExpandAll}
          className="px-2 h-8 rounded-xl flex items-center justify-center text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          title="Mở rộng tất cả các nhánh"
        >
          ⊞ Mở hết
        </button>

        <button
          type="button"
          onClick={onCollapseAll}
          className="px-2 h-8 rounded-xl flex items-center justify-center text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          title="Thu gọn các nhánh con"
        >
          ⊟ Thu gọn
        </button>
      </div>

      {/* Main Transformable Canvas Workspace */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Layer 1: SVG Connector Paths */}
        <svg
          ref={svgRef}
          className="absolute top-0 left-0 overflow-visible pointer-events-none"
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
        >
          <defs>
            <linearGradient id="link-grad-male" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="link-grad-female" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f472b6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {links.map((link) => (
            <path
              key={link.id}
              d={link.pathD}
              fill="none"
              stroke={link.isHighlighted ? '#f59e0b' : '#94a3b8'}
              strokeWidth={link.isHighlighted ? 3 : 2}
              strokeOpacity={link.isHighlighted ? 1 : 0.65}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-colors duration-200"
            />
          ))}
        </svg>

        {/* Layer 2: Interactive HTML Cards */}
        <div className="absolute top-0 left-0 pointer-events-auto">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute person-card-interactive"
              style={{
                left: `${node.cardLeft}px`,
                top: `${node.cardTop}px`,
              }}
            >
              <PersonCard
                node={node.data}
                isRoot={node.generation === 1}
                isCollapsed={node.isCollapsed}
                isSelected={node.isSelected}
                isHighlighted={node.isHighlighted}
                hasChildren={node.hasChildren}
                childCount={node.childCount}
                orientation={orientation}
                onToggleCollapse={onToggleCollapse}
                onSelectPerson={onSelectPerson}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs flex flex-col items-center justify-center z-50">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm font-semibold text-white">Đang tải cây phả hệ...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
          <span className="text-5xl mb-3">🌱</span>
          <p className="font-bold text-base text-slate-800 dark:text-slate-200">
            Chưa có thành viên nào trong cây gia phả
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Bấm nút "+ Gốc" trên thanh công cụ để thêm Cụ Khởi Tổ đầu tiên.
          </p>
        </div>
      )}
    </div>
  )
}

export default D3TreeCanvas
