import React, { useEffect } from 'react'
import type { PersonTreeNode } from '@/types'
import { TreeNodeItem } from './TreeNodeItem'
import { useCanvasPanZoom } from '../hooks/useCanvasPanZoom'
import { TreeControls } from './TreeControls'

interface TreeCanvasProps {
  treeData: PersonTreeNode[]
  loading: boolean
  collapsedNodeIds: Set<number>
  highlightedPersonId: number | null
  onToggleCollapse: (id: number) => void
  onSelectPerson: (id: number) => void
  onCollapseAll: () => void
  onExpandAll: () => void
  onCenterNodeRef?: (centerFn: (nodeId: number) => void) => void
}

export function TreeCanvas({
  treeData,
  loading,
  collapsedNodeIds,
  highlightedPersonId,
  onToggleCollapse,
  onSelectPerson,
  onCollapseAll,
  onExpandAll,
  onCenterNodeRef,
}: TreeCanvasProps) {
  const {
    scale,
    position,
    isDragging,
    smoothTransition,
    viewportRef,
    contentRef,
    zoomIn,
    zoomOut,
    resetView,
    fitView,
    centerOnNode,
    panZoomEvents,
  } = useCanvasPanZoom({ minScale: 0.15, maxScale: 2.5, initialScale: 1.0 })

  // Expose centerOnNode to parent
  useEffect(() => {
    if (onCenterNodeRef) {
      onCenterNodeRef(centerOnNode)
    }
  }, [centerOnNode, onCenterNodeRef])

  // Center tree on initial load or when treeData changes
  useEffect(() => {
    if (treeData.length > 0 && !loading) {
      const timer = setTimeout(() => {
        resetView()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [treeData, loading, resetView])

  // When highlighted person changes, center on them
  useEffect(() => {
    if (highlightedPersonId) {
      const timer = setTimeout(() => {
        centerOnNode(highlightedPersonId, 1.0)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [highlightedPersonId, centerOnNode])

  return (
    <div
      ref={viewportRef}
      className={`family-tree-viewport ${isDragging ? 'is-dragging' : ''}`}
      {...panZoomEvents}
    >
      {/* Draggable & Scalable Canvas Layer */}
      <div
        ref={contentRef}
        className={`family-tree-canvas ${smoothTransition ? 'smooth-transition' : ''}`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
        }}
      >
        {treeData.length > 0 ? (
          <div className="family-tree-roots-container">
            {treeData.map((rootNode) => (
              <ul key={rootNode.id} className="flex justify-center p-0 m-0 list-none">
                <TreeNodeItem
                  node={rootNode}
                  isRoot={true}
                  collapsedNodeIds={collapsedNodeIds}
                  highlightedPersonId={highlightedPersonId}
                  onToggleCollapse={onToggleCollapse}
                  onSelectPerson={onSelectPerson}
                />
              </ul>
            ))}
          </div>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-3xl mb-3">
              🌱
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Chưa có dữ liệu cây phả hệ
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Không tìm thấy thành viên trong cây phả hệ phù hợp với tiêu chí lọc hiện tại.
            </p>
          </div>
        ) : null}
      </div>

      {/* Floating Canvas Controls */}
      <TreeControls
        scale={scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        onFitView={fitView}
        onCollapseAll={onCollapseAll}
        onExpandAll={onExpandAll}
      />
    </div>
  )
}
