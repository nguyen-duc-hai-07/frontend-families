import React from 'react'
import type { FamilyInfo } from '@/types'

interface FamilyHeaderProps {
  familyInfo: FamilyInfo | null
  totalMembers: number
  maxTreeGeneration: number
  onRefresh: () => void
}

export function FamilyHeader({
  familyInfo,
  totalMembers,
  maxTreeGeneration,
  onRefresh,
}: FamilyHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 text-white shadow-lg p-5 sm:p-6 mb-4 border border-amber-700/40">
      {/* Decorative Traditional Asian Watermark Background Pattern */}
      <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none flex items-center justify-end pr-8">
        <svg viewBox="0 0 200 200" className="w-64 h-64 text-amber-300 fill-current">
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M100 20 A80 80 0 0 1 100 180 A40 40 0 0 1 100 100 A40 40 0 0 0 100 20" />
          <circle cx="100" cy="60" r="10" />
          <circle cx="100" cy="140" r="10" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Clan Title & Subtitle */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
              Phả Hệ Dòng Họ
            </span>
            <span className="text-xs text-amber-200/80">Hệ Thống Trực Quan Hóa Cây Gia Phả</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase drop-shadow-xs">
            {familyInfo?.description || familyInfo?.name || 'Dòng Họ Nguyễn Hữu - Thôn Kỳ Côi'}
          </h1>

          <p className="text-sm text-amber-100/80 max-w-2xl font-light">
            Cây phả hệ phân cấp từ Cụ Khởi Tổ nối dõi qua các chi phái và thế hệ con cháu
          </p>
        </div>

        {/* Right: Summary Highlights & Quick Action */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Generations Card */}
          <div className="px-3.5 py-2 rounded-xl bg-black/25 backdrop-blur-xs border border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
              🏛️
            </div>
            <div>
              <span className="block text-[11px] text-amber-200/70 font-medium">Thế hệ</span>
              <span className="block text-sm font-bold text-white">{maxTreeGeneration} Đời</span>
            </div>
          </div>

          {/* Members Card */}
          <div className="px-3.5 py-2 rounded-xl bg-black/25 backdrop-blur-xs border border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
              👥
            </div>
            <div>
              <span className="block text-[11px] text-amber-200/70 font-medium">Thành viên hiển thị</span>
              <span className="block text-sm font-bold text-white">{totalMembers} người</span>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-100 transition-colors border border-white/10 flex items-center justify-center"
            title="Tải lại dữ liệu phả hệ"
            aria-label="Tải lại cây"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
