import React, { useState } from 'react'
import { getGenerationColor } from '../utils/treeColors'

interface TreeLegendProps {
  maxGeneration: number
  className?: string
}

export function TreeLegend({ maxGeneration, className = '' }: TreeLegendProps) {
  const [collapsed, setCollapsed] = useState(false)

  const generations = Array.from({ length: Math.min(Math.max(maxGeneration, 1), 12) }, (_, i) => i + 1)

  return (
    <div
      className={`bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-800/80 p-2.5 shadow-2xl text-[11px] text-slate-200 select-none z-20 transition-all max-w-[170px] ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-800/80">
        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
          Chú giải
        </span>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="text-[10px] text-slate-400 hover:text-white px-1 py-0.2 rounded bg-slate-800/60"
        >
          {collapsed ? 'Hiện' : 'Ẩn'}
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {/* GIỚI TÍNH */}
          <div>
            <div className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
              Giới tính
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sky-400 font-bold text-sm">♂</span>
                <span>Nam</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400 font-bold text-sm">♀</span>
                <span>Nữ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                <span>Đã mất</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-yellow-400 inline-block shadow-xs" />
                <span>Đang chọn</span>
              </div>
            </div>
          </div>

          {/* MÀU THEO ĐỜI */}
          <div>
            <div className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
              Màu theo đời
            </div>
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shadow-xs"
                  style={{ backgroundColor: getGenerationColor(1) }}
                />
                <span>Gốc (Cụ tổ)</span>
              </div>
              {generations.map((gen) => {
                if (gen === 1) return null
                return (
                  <div key={gen} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shadow-xs"
                      style={{ backgroundColor: getGenerationColor(gen) }}
                    />
                    <span>Đời {gen}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* THU GỌN */}
          <div>
            <div className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
              Thu gọn
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-xs" />
                <span>Có con (mở)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs" />
                <span>Có con (đóng)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
