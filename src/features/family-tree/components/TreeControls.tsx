import React, { useState } from 'react'

interface TreeControlsProps {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  onFitView: () => void
  onCollapseAll: () => void
  onExpandAll: () => void
}

export function TreeControls({
  scale,
  onZoomIn,
  onZoomOut,
  onResetView,
  onFitView,
  onCollapseAll,
  onExpandAll,
}: TreeControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleToggleFullscreen = () => {
    const viewport = document.querySelector('.family-tree-viewport')
    if (!viewport) return

    if (!document.fullscreenElement) {
      viewport.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  const zoomPercent = Math.round(scale * 100)

  return (
    <div className="tree-floating-controls" role="toolbar" aria-label="Tree Canvas Controls">
      {/* Zoom In */}
      <button
        type="button"
        onClick={onZoomIn}
        className="tree-control-btn"
        title="Phóng to (Zoom In)"
        aria-label="Phóng to"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Zoom % label */}
      <span className="text-xs font-mono font-semibold px-1 min-w-[42px] text-center text-slate-700 dark:text-slate-300 select-none">
        {zoomPercent}%
      </span>

      {/* Zoom Out */}
      <button
        type="button"
        onClick={onZoomOut}
        className="tree-control-btn"
        title="Thu nhỏ (Zoom Out)"
        aria-label="Thu nhỏ"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>

      <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-0.5" />

      {/* Reset View */}
      <button
        type="button"
        onClick={onResetView}
        className="tree-control-btn"
        title="Vị trí ban đầu (Cụ Khởi Tổ)"
        aria-label="Vị trí ban đầu"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>

      {/* Fit View */}
      <button
        type="button"
        onClick={onFitView}
        className="tree-control-btn"
        title="Hiển thị toàn cảnh (Fit view)"
        aria-label="Hiển thị toàn cảnh"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>

      <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-0.5" />

      {/* Expand All */}
      <button
        type="button"
        onClick={onExpandAll}
        className="tree-control-btn"
        title="Mở rộng tất cả các nhánh"
        aria-label="Mở rộng tất cả"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapse All */}
      <button
        type="button"
        onClick={onCollapseAll}
        className="tree-control-btn"
        title="Thu gọn các nhánh con"
        aria-label="Thu gọn tất cả"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
        </svg>
      </button>

      {/* Fullscreen */}
      <button
        type="button"
        onClick={handleToggleFullscreen}
        className="tree-control-btn"
        title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
        aria-label="Toàn màn hình"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {isFullscreen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0v5m0-5h5m6 6l5-5m0 0v5m0-5h-5m-6 6l-5 5m0 0v-5m0 5h5m6-6l5 5m0 0v-5m0 5h-5" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          )}
        </svg>
      </button>
    </div>
  )
}
