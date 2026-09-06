import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { hierarchy, tree as d3Tree, type HierarchyPointNode } from 'd3-hierarchy'
import type { PersonTreeNode } from '@/types'
import { getGenerationColor, GENDER_COLORS, type TreeOrientation } from '../utils/treeColors'
import { TreeLegend } from './TreeLegend'

interface TreeSvgCanvasProps {
  treeData: PersonTreeNode[]
  loading: boolean
  orientation: TreeOrientation
  collapsedNodeIds: Set<number>
  selectedPersonId: number | null
  highlightedPersonId: number | null
  maxGeneration: number
  onToggleCollapse: (nodeId: number) => void
  onSelectPerson: (nodeId: number) => void
  onCenterNodeRef?: (fn: (nodeId: number) => void) => void
  svgRef?: React.RefObject<SVGSVGElement | null>
}

interface RenderNode {
  id: number
  data: PersonTreeNode
  x: number // canvas coordinate
  y: number // canvas coordinate
  generation: number
  hasChildren: boolean
  isCollapsed: boolean
  isSelected: boolean
  isHighlighted: boolean
}

interface RenderLink {
  id: string
  sourceId: number
  targetId: number
  pathD: string
  sourceGen: number
  targetGen: number
  isHighlighted: boolean
}

export function TreeSvgCanvas({
  treeData,
  loading,
  orientation,
  collapsedNodeIds,
  selectedPersonId,
  highlightedPersonId,
  maxGeneration,
  onToggleCollapse,
  onSelectPerson,
  onCenterNodeRef,
  svgRef: externalSvgRef,
}: TreeSvgCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const localSvgRef = useRef<SVGSVGElement | null>(null)
  const svgRef = externalSvgRef || localSvgRef

  // Pan & Zoom State
  const [transform, setTransform] = useState({ x: 100, y: 300, scale: 1.0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, startTx: 0, startTy: 0 })

  // Hovered node for tooltip
  const [hoveredNode, setHoveredNode] = useState<{
    node: RenderNode
    screenX: number
    screenY: number
  } | null>(null)

  // Find ancestor chain of selected / highlighted person
  const activeLineageIds = useMemo(() => {
    const targetId = highlightedPersonId || selectedPersonId
    if (!targetId || treeData.length === 0) return new Set<number>()

    const set = new Set<number>()
    function findPath(nodes: PersonTreeNode[], path: number[]): boolean {
      for (const n of nodes) {
        if (n.id === targetId) {
          path.forEach((id) => set.add(id))
          set.add(n.id)
          return true
        }
        if (n.children && n.children.length > 0) {
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

  // Build tree hierarchy and layout
  const { nodes, links, bounds } = useMemo(() => {
    if (treeData.length === 0) {
      return { nodes: [], links: [], bounds: { minX: 0, maxX: 1000, minY: 0, maxY: 1000 } }
    }

    // Wrap multiple roots if needed
    const rootData: PersonTreeNode =
      treeData.length === 1
        ? treeData[0]
        : {
            id: -99999,
            full_name: 'Dòng Họ',
            gender: 'male',
            generation: 0,
            avatar_url: null,
            children: treeData,
          }

    // Build d3 hierarchy with collapsed pruning
    const rootHierarchy = hierarchy<PersonTreeNode>(rootData, (d) => {
      if (d.id !== -99999 && collapsedNodeIds.has(d.id)) {
        return null
      }
      return d.children && d.children.length > 0 ? d.children : null
    })

    // Configure layout
    if (orientation === 'horizontal') {
      // Horizontal (Ngang): cụ tổ bên trái sang phải
      // NodeSize: [vertical separation between sibling nodes, horizontal generation depth separation]
      const layout = d3Tree<PersonTreeNode>().nodeSize([44, 210])
      layout(rootHierarchy)
    } else {
      // Vertical (Dọc): cụ tổ ở trên xuống dưới
      const layout = d3Tree<PersonTreeNode>().nodeSize([190, 85])
      layout(rootHierarchy)
    }

    const allDescendants = rootHierarchy.descendants() as HierarchyPointNode<PersonTreeNode>[]

    // Determine coordinate mapping
    // d3 returns d.x and d.y where:
    // In horizontal: screenX = d.y, screenY = d.x
    // In vertical: screenX = d.x, screenY = d.y
    const isHorizontal = orientation === 'horizontal'

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    const nodeList: RenderNode[] = []
    const nodeCoordMap = new Map<number, { x: number; y: number }>()

    for (const d of allDescendants) {
      // Exclude dummy virtual root from visual rendering
      if (d.data.id === -99999) continue

      const x = isHorizontal ? d.y : d.x
      const y = isHorizontal ? d.x : d.y

      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y

      nodeCoordMap.set(d.data.id, { x, y })

      const hasChildren = Boolean(d.data.children && d.data.children.length > 0)
      const isCollapsed = collapsedNodeIds.has(d.data.id)

      nodeList.push({
        id: d.data.id,
        data: d.data,
        x,
        y,
        generation: d.data.generation,
        hasChildren,
        isCollapsed,
        isSelected: selectedPersonId === d.data.id,
        isHighlighted: highlightedPersonId === d.data.id,
      })
    }

    // Build Links (cubic bezier curves)
    const linkList: RenderLink[] = []
    const allLinks = rootHierarchy.links()

    for (const link of allLinks) {
      if (link.source.data.id === -99999) continue

      const sourceCoords = nodeCoordMap.get(link.source.data.id)
      const targetCoords = nodeCoordMap.get(link.target.data.id)
      if (!sourceCoords || !targetCoords) continue

      const x0 = sourceCoords.x
      const y0 = sourceCoords.y
      const x1 = targetCoords.x
      const y1 = targetCoords.y

      let pathD = ''
      if (isHorizontal) {
        // Horizontal cubic bezier curve
        const mx = (x0 + x1) / 2
        pathD = `M ${x0},${y0} C ${mx},${y0} ${mx},${y1} ${x1},${y1}`
      } else {
        // Vertical cubic bezier curve
        const my = (y0 + y1) / 2
        pathD = `M ${x0},${y0} C ${x0},${my} ${x1},${my} ${x1},${y1}`
      }

      const isLineage =
        activeLineageIds.has(link.source.data.id) && activeLineageIds.has(link.target.data.id)

      linkList.push({
        id: `link-${link.source.data.id}-${link.target.data.id}`,
        sourceId: link.source.data.id,
        targetId: link.target.data.id,
        pathD,
        sourceGen: link.source.data.generation,
        targetGen: link.target.data.generation,
        isHighlighted: isLineage,
      })
    }

    return {
      nodes: nodeList,
      links: linkList,
      bounds: {
        minX: minX === Infinity ? 0 : minX,
        maxX: maxX === -Infinity ? 1000 : maxX,
        minY: minY === Infinity ? 0 : minY,
        maxY: maxY === -Infinity ? 1000 : maxY,
      },
    }
  }, [treeData, orientation, collapsedNodeIds, selectedPersonId, highlightedPersonId, activeLineageIds])

  // Center tree initially or on reset
  const handleResetView = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) return
    const container = containerRef.current
    const width = container.clientWidth || 1200
    const height = container.clientHeight || 800

    const treeWidth = Math.max(bounds.maxX - bounds.minX, 100)
    const treeHeight = Math.max(bounds.maxY - bounds.minY, 100)
    const treeCenterY = (bounds.minY + bounds.maxY) / 2
    const treeCenterX = (bounds.minX + bounds.maxX) / 2

    if (orientation === 'horizontal') {
      // Space for compact floating legend on left
      const paddingLeft = 200
      const paddingRight = 60
      const paddingTop = 40
      const paddingBottom = 40

      const availWidth = Math.max(width - paddingLeft - paddingRight, 200)
      const availHeight = Math.max(height - paddingTop - paddingBottom, 200)

      const scaleX = availWidth / treeWidth
      const scaleY = availHeight / treeHeight
      // Auto fit scale so that entire tree height and width fit inside the screen
      const fitScale = Math.min(scaleX, scaleY, 1.2)

      // Cụ Tổ (bounds.minX) starts at paddingLeft
      const targetX = paddingLeft - bounds.minX * fitScale
      // Center the tree vertically so neither the top nor bottom is cut off
      const targetY = height / 2 - treeCenterY * fitScale

      setTransform({
        x: Math.round(targetX),
        y: Math.round(targetY),
        scale: Number(fitScale.toFixed(4)),
      })
    } else {
      const paddingTop = 60
      const paddingBottom = 60
      const paddingSide = 60

      const availWidth = Math.max(width - paddingSide * 2, 200)
      const availHeight = Math.max(height - paddingTop - paddingBottom, 200)

      const scaleX = availWidth / treeWidth
      const scaleY = availHeight / treeHeight
      const fitScale = Math.min(scaleX, scaleY, 1.2)

      const targetX = width / 2 - treeCenterX * fitScale
      const targetY = paddingTop - bounds.minY * fitScale

      setTransform({
        x: Math.round(targetX),
        y: Math.round(targetY),
        scale: Number(fitScale.toFixed(4)),
      })
    }
  }, [nodes, bounds, orientation])

  // Initial center once nodes are computed
  useEffect(() => {
    if (nodes.length > 0 && !loading) {
      handleResetView()
    }
  }, [nodes.length, orientation, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Center on a specific node ID
  const centerOnNode = useCallback(
    (nodeId: number) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node || !containerRef.current) return
      const container = containerRef.current
      const width = container.clientWidth || 1000
      const height = container.clientHeight || 700

      // When focusing a person, zoom in to a comfortable reading scale
      const useScale = Math.max(transform.scale, 0.75)

      const targetX = width / 2 - node.x * useScale
      const targetY = height / 2 - node.y * useScale

      setTransform({
        x: Math.round(targetX),
        y: Math.round(targetY),
        scale: useScale,
      })
    },
    [nodes, transform.scale]
  )

  // Expose centerOnNode function to parent
  useEffect(() => {
    if (onCenterNodeRef) {
      onCenterNodeRef(centerOnNode)
    }
  }, [centerOnNode, onCenterNodeRef])

  // Focus effect when highlightedPersonId changes
  useEffect(() => {
    if (highlightedPersonId) {
      centerOnNode(highlightedPersonId)
    }
  }, [highlightedPersonId, centerOnNode])

  // Zoom Helpers
  const handleZoomIn = () => {
    setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.25, 3.0) }))
  }

  const handleZoomOut = () => {
    setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale / 1.25, 0.2) }))
  }

  // Pan Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click initiates dragging
    if (e.button !== 0) return
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startTx: transform.x,
      startTy: transform.y,
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    setTransform((prev) => ({
      ...prev,
      x: dragStartRef.current.startTx + dx,
      y: dragStartRef.current.startTy + dy,
    }))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Wheel Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88
    const newScale = Math.min(Math.max(transform.scale * zoomFactor, 0.15), 3.5)

    // Zoom toward cursor focal point
    const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale)
    const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale)

    setTransform({
      x: Math.round(newX),
      y: Math.round(newY),
      scale: newScale,
    })
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className={`relative w-full h-full min-h-[600px] select-none overflow-hidden bg-[#0e131f] cursor-${
        isDragging ? 'grabbing' : 'grab'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.04) 0%, transparent 60%),
          radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 28px 28px',
      }}
    >
      {/* 1. Floating Legend (Top Left) */}
      <TreeLegend maxGeneration={maxGeneration} className="absolute top-4 left-4" />

      {/* 2. Floating Zoom Controls (Bottom Right - as in screenshot) */}
      <div className="absolute bottom-6 right-6 flex flex-col items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-2xl z-20">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white text-base font-bold transition-colors"
          title="Phóng to (+)"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 text-sm transition-colors"
          title="Về trung tâm (Reset View)"
        >
          🏠
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white text-base font-bold transition-colors"
          title="Thu nhỏ (-)"
        >
          -
        </button>
      </div>

      {/* 3. Main SVG Tree Layer */}
      <svg
        ref={svgRef}
        className="w-full h-full pointer-events-auto"
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* Subtle Glow Filter for Selected Node */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
          className="transition-transform duration-75 ease-out"
        >
          {/* A. RENDER CONNECTOR LINKS */}
          <g className="tree-links-layer">
            {links.map((link) => (
              <path
                key={link.id}
                d={link.pathD}
                fill="none"
                stroke={link.isHighlighted ? '#f59e0b' : '#475569'}
                strokeWidth={link.isHighlighted ? 2.5 : 1.5}
                strokeOpacity={link.isHighlighted ? 0.95 : 0.75}
                vectorEffect="non-scaling-stroke"
                className="transition-all duration-300 hover:stroke-amber-400 hover:stroke-width-[2.5px]"
              />
            ))}
          </g>

          {/* B. RENDER TREE NODES */}
          <g className="tree-nodes-layer">
            {nodes.map((node) => {
              const genColor = getGenerationColor(node.generation)
              const isFemale = node.data.gender === 'female'
              const genderBorder = isFemale ? GENDER_COLORS.female : GENDER_COLORS.male
              const isSelected = node.isSelected || node.isHighlighted

              // Dynamic radius so dots remain clearly visible at small scale
              const baseR = node.generation === 1 ? 8 : 6.5
              const nodeR = Math.max(baseR, Math.min(5.5 / Math.pow(transform.scale, 0.45), 24))
              const showLabel = transform.scale >= 0.25 || isSelected || node.isHighlighted

              return (
                <g
                  key={`node-${node.id}`}
                  id={`tree-node-${node.id}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectPerson(node.id)
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    if (node.hasChildren) {
                      onToggleCollapse(node.id)
                    }
                  }}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect()
                    if (rect) {
                      setHoveredNode({
                        node,
                        screenX: e.clientX - rect.left,
                        screenY: e.clientY - rect.top,
                      })
                    }
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Selection Glow Ring */}
                  {isSelected && (
                    <circle
                      r={nodeR + 6}
                      fill="none"
                      stroke="#facc15"
                      strokeWidth={3}
                      strokeDasharray="4 2"
                      vectorEffect="non-scaling-stroke"
                      className="animate-spin-slow"
                      filter="url(#glow)"
                    />
                  )}

                  {/* Main Circle Node */}
                  <circle
                    r={nodeR}
                    fill={genColor}
                    stroke={genderBorder}
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                    className="transition-transform group-hover:scale-125"
                  />

                  {/* Collapse / Expand Indicator Dot if has children */}
                  {node.hasChildren && (
                    <circle
                      cx={orientation === 'horizontal' ? nodeR : 0}
                      cy={orientation === 'horizontal' ? 0 : nodeR}
                      r={Math.max(2.5, Math.min(3.5 / Math.pow(transform.scale, 0.3), 8))}
                      fill={node.isCollapsed ? '#f59e0b' : '#10b981'}
                      stroke="#0f172a"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleCollapse(node.id)
                      }}
                    >
                      <title>{node.isCollapsed ? 'Mở rộng nhánh con' : 'Thu gọn nhánh con'}</title>
                    </circle>
                  )}

                  {/* Node Label Text */}
                  {showLabel && (
                    orientation === 'horizontal' ? (
                      /* Horizontal layout: label to the right of circle */
                      <g transform={`translate(${nodeR + 6}, 0)`}>
                        <text
                          y={-2}
                          className={`text-xs font-semibold select-none ${
                            isSelected ? 'font-bold' : ''
                          }`}
                          fill={isSelected ? '#facc15' : '#f1f5f9'}
                          style={{ fontSize: '11.5px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                        >
                          {node.data.full_name}
                        </text>
                        <text
                          y={11}
                          className="text-[9.5px] select-none"
                          fill="#94a3b8"
                          style={{ fontSize: '9.5px' }}
                        >
                          {`Đời ${node.generation}`}
                        </text>
                      </g>
                    ) : (
                      /* Vertical layout: label below circle */
                      <g transform={`translate(0, ${nodeR + 8})`}>
                        <text
                          textAnchor="middle"
                          className={`text-xs font-semibold select-none ${
                            isSelected ? 'font-bold' : ''
                          }`}
                          fill={isSelected ? '#facc15' : '#f1f5f9'}
                          style={{ fontSize: '11px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                        >
                          {node.data.full_name}
                        </text>
                        <text
                          y={12}
                          textAnchor="middle"
                          className="text-[9px] select-none"
                          fill="#94a3b8"
                          style={{ fontSize: '9px' }}
                        >
                          {`Đời ${node.generation}`}
                        </text>
                      </g>
                    )
                  )}
                </g>
              )
            })}
          </g>
        </g>
      </svg>

      {/* 4. Rich Hover Tooltip */}
      {hoveredNode && (
        <div
          className="pointer-events-none absolute z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs p-3 rounded-2xl border border-slate-700 shadow-2xl space-y-1.5 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{
            left: `${hoveredNode.screenX}px`,
            top: `${hoveredNode.screenY - 12}px`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{hoveredNode.node.data.gender === 'female' ? '👩' : '👨'}</span>
            <span className="font-bold text-sm text-slate-100">
              {hoveredNode.node.data.full_name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span
              className="px-1.5 py-0.5 rounded font-semibold text-white"
              style={{ backgroundColor: getGenerationColor(hoveredNode.node.generation) }}
            >
              Đời {hoveredNode.node.generation}
            </span>
            <span>{hoveredNode.node.data.gender === 'female' ? 'Nữ' : 'Nam'}</span>
            {hoveredNode.node.hasChildren && (
              <span className="text-emerald-400">
                • {hoveredNode.node.data.children?.length || 0} con
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800">
            Click để xem chi tiết • Double-click để thu gọn
          </div>
        </div>
      )}

      {/* 5. Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center z-40">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm font-semibold text-slate-200">
            Đang dựng cây gia phả...
          </span>
        </div>
      )}

      {/* 6. Empty State */}
      {!loading && nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
          <span className="text-5xl mb-3">🌱</span>
          <p className="font-bold text-base text-slate-200">Chưa có dữ liệu cây phả hệ</p>
          <p className="text-xs text-slate-500 mt-1">Bấm "+ Gốc" ở bảng bên trái để thêm Cụ Tổ đầu tiên.</p>
        </div>
      )}
    </div>
  )
}
