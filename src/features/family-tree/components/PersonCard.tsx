import React, { memo, useState } from 'react'
import type { PersonTreeNode } from '@/types'

export interface PersonCardProps {
  node: PersonTreeNode
  isRoot?: boolean
  isCollapsed?: boolean
  isSelected?: boolean
  isHighlighted?: boolean
  hasChildren?: boolean
  childCount?: number
  orientation?: 'top-down' | 'left-to-right'
  onToggleCollapse?: (id: number) => void
  onSelectPerson: (id: number) => void
}

import { toRoman } from '../utils/treeRoman'

export const PersonCard = memo(function PersonCard({
  node,
  isRoot = false,
  isCollapsed = false,
  isSelected = false,
  isHighlighted = false,
  hasChildren = false,
  childCount = 0,
  orientation = 'top-down',
  onToggleCollapse,
  onSelectPerson,
}: PersonCardProps) {
  const [imgError, setImgError] = useState(false)
  const isFemale = node.gender?.toLowerCase() === 'female'
  const isHorizontal = orientation === 'left-to-right'

  // Determine avatar representation
  const firstLetter = node.full_name?.trim().split(' ').pop()?.charAt(0) || node.full_name?.charAt(0) || '?'

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleCollapse?.(node.id)
  }

  const handleCardClick = () => {
    onSelectPerson(node.id)
  }

  // Gender color themes
  // Nam: Màu xanh dương nhẹ
  // Nữ: Màu hồng / cam nhạt
  const genderTheme = isFemale
    ? {
        cardBg:
          'bg-gradient-to-br from-rose-50/95 via-pink-50/80 to-amber-50/60 dark:from-slate-900/95 dark:via-rose-950/20 dark:to-slate-900/95',
        cardBorder: isSelected || isHighlighted
          ? 'border-amber-400 ring-2 ring-amber-400 dark:ring-amber-400 shadow-lg shadow-amber-500/20'
          : 'border-rose-200 hover:border-rose-400 dark:border-rose-800/40 dark:hover:border-rose-500/60 shadow-xs hover:shadow-md',
        nameText: 'text-rose-950 dark:text-rose-100 group-hover:text-rose-600 dark:group-hover:text-rose-300',
        badge: 'bg-rose-100/80 text-rose-800 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/50',
        genderPill: 'bg-rose-500 text-white',
        avatarBorder: 'ring-2 ring-rose-300 dark:ring-rose-500/50',
        avatarFallback: 'bg-gradient-to-tr from-rose-400 to-pink-500 text-white',
        genderIcon: '♀',
        genderLabel: 'Nữ',
      }
    : {
        cardBg:
          'bg-gradient-to-br from-sky-50/95 via-blue-50/80 to-indigo-50/60 dark:from-slate-900/95 dark:via-sky-950/20 dark:to-slate-900/95',
        cardBorder: isSelected || isHighlighted
          ? 'border-amber-400 ring-2 ring-amber-400 dark:ring-amber-400 shadow-lg shadow-amber-500/20'
          : 'border-sky-200 hover:border-sky-400 dark:border-sky-800/40 dark:hover:border-sky-500/60 shadow-xs hover:shadow-md',
        nameText: 'text-sky-950 dark:text-sky-100 group-hover:text-sky-600 dark:group-hover:text-sky-300',
        badge: 'bg-sky-100/80 text-sky-800 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/50',
        genderPill: 'bg-sky-500 text-white',
        avatarBorder: 'ring-2 ring-sky-300 dark:ring-sky-500/50',
        avatarFallback: 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white',
        genderIcon: '♂',
        genderLabel: 'Nam',
      }

  return (
    <div
      id={`person-card-${node.id}`}
      onClick={handleCardClick}
      className={`relative group select-none cursor-pointer rounded-2xl border transition-all duration-200 ${
        genderTheme.cardBg
      } ${genderTheme.cardBorder} ${
        isHorizontal ? 'w-[230px] h-[86px] p-2.5' : 'w-[214px] h-[94px] p-3'
      } ${isSelected || isHighlighted ? 'scale-105 z-20' : 'hover:-translate-y-0.5 z-10'}`}
      role="button"
      tabIndex={0}
      title={`${node.full_name} (Đời ${node.generation}) - Nhấn để xem chi tiết`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      <div className="flex items-center gap-3 h-full">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {node.avatar_url && !imgError ? (
            <img
              src={node.avatar_url}
              alt={node.full_name}
              onError={() => setImgError(true)}
              className={`w-11 h-11 rounded-full object-cover shadow-xs ${genderTheme.avatarBorder}`}
            />
          ) : (
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shadow-xs ${genderTheme.avatarFallback} ${genderTheme.avatarBorder}`}
            >
              {firstLetter}
            </div>
          )}

          {/* Gender Indicator Dot */}
          <span
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-900 shadow-xs ${genderTheme.genderPill}`}
            title={genderTheme.genderLabel}
          >
            {genderTheme.genderIcon}
          </span>
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 pr-1">
          {/* Generation & Honor Badge */}
          <div className="flex items-center gap-1.5 mb-1">
            {node.generation === 1 || isRoot ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/40">
                <span>👑</span> Cụ Khởi Tổ
              </span>
            ) : (
              <span
                className={`inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] font-semibold border ${genderTheme.badge}`}
              >
                Đời {toRoman(node.generation)}
              </span>
            )}
          </div>

          {/* Full Name */}
          <h4
            className={`font-bold text-[13.5px] leading-tight truncate transition-colors ${genderTheme.nameText}`}
            title={node.full_name}
          >
            {node.full_name}
          </h4>

          {/* Subtitle / Child count */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {hasChildren ? (
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {childCount} người con
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 italic">Hậu duệ</span>
            )}
          </div>
        </div>
      </div>

      {/* Expand / Collapse Branch Toggle Button */}
      {hasChildren && (
        <button
          type="button"
          onClick={handleToggleClick}
          className={`absolute flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs border transition-all duration-150 z-30 cursor-pointer ${
            isHorizontal
              ? '-right-3.5 top-1/2 -translate-y-1/2'
              : '-bottom-3 left-1/2 -translate-x-1/2'
          } ${
            isCollapsed
              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/90 dark:text-amber-200 dark:border-amber-700/80 hover:scale-105 active:scale-95'
              : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:scale-105 active:scale-95'
          }`}
          title={isCollapsed ? `Mở rộng ${childCount} con` : 'Thu gọn nhánh này'}
        >
          {isCollapsed ? (
            <>
              <span className="text-[10px]">＋</span>
              <span>{childCount} con</span>
            </>
          ) : (
            <>
              <span className="text-[10px]">－</span>
              <span>Thu gọn</span>
            </>
          )}
        </button>
      )}
    </div>
  )
})
