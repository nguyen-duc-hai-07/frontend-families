import React, { useState, useRef, useEffect, useMemo } from 'react'
import type { PersonTreeNode } from '@/types'
import { toRoman } from '../utils/treeRoman'

export type TreeViewMode = 'top-down' | 'left-to-right' | 'accordion'

interface TreeToolbarProps {
  viewMode: TreeViewMode
  onChangeViewMode: (mode: TreeViewMode) => void
  allPersons: PersonTreeNode[]
  totalMembers: number
  maxTreeGeneration: number
  isAll?: boolean
  maxGeneration?: number
  onChangeGenerationFilter?: (isAll: boolean, maxGen?: number) => void
  onFocusPerson: (personId: number) => void
  onAddRootPerson: () => void
  onAddChildPerson?: () => void
  selectedPersonId: number | null
  highlightedPersonId?: number | null
  onClearHighlight?: () => void
  onCollapseAll: () => void
  onExpandAll: () => void
  onExport: () => void
  onRefresh: () => void
  loading?: boolean
}

export function TreeToolbar({
  viewMode,
  onChangeViewMode,
  allPersons,
  totalMembers,
  maxTreeGeneration,
  isAll = true,
  maxGeneration = 5,
  onChangeGenerationFilter,
  onFocusPerson,
  onAddRootPerson,
  onAddChildPerson,
  selectedPersonId,
  highlightedPersonId,
  onClearHighlight,
  onCollapseAll,
  onExpandAll,
  onExport,
  onRefresh,
  loading = false,
}: TreeToolbarProps) {
  const [keyword, setKeyword] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [inputGen, setInputGen] = useState<string>(isAll ? '' : String(maxGeneration || ''))
  const searchBoxRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isAll) {
      setInputGen('')
    } else if (maxGeneration) {
      setInputGen(String(maxGeneration))
    }
  }, [isAll, maxGeneration])

  const handleApplyGen = () => {
    const val = parseInt(inputGen.trim(), 10)
    if (!isNaN(val) && val > 0) {
      onChangeGenerationFilter?.(false, val)
    } else {
      onChangeGenerationFilter?.(true)
    }
  }

  const handleToggleAll = () => {
    onChangeGenerationFilter?.(true)
  }

  // Autocomplete matching persons from memory
  const searchResults = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return []
    return allPersons.filter((p) => p.full_name?.toLowerCase().includes(q)).slice(0, 10)
  }, [allPersons, keyword])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectPerson = (personId: number) => {
    setDropdownOpen(false)
    setKeyword('')
    onFocusPerson(personId)
  }

  const highlightedPerson = useMemo(() => {
    if (!highlightedPersonId) return null
    return allPersons.find((p) => p.id === highlightedPersonId) || null
  }, [allPersons, highlightedPersonId])

  return (
    <header className="px-3 sm:px-5 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs z-30 flex-shrink-0 transition-colors duration-250">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left Section: 3 View Mode Tabs */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden xl:inline mr-1">
            Chế độ xem:
          </span>

          {/* Tab 1: Top-Down Tree (⭐ Khuyên dùng PC) */}
          <button
            type="button"
            onClick={() => onChangeViewMode('top-down')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              viewMode === 'top-down'
                ? 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            title="Dạng 1: Cây phả hệ phân nhánh dọc từ trên xuống (Tối ưu cho PC)"
          >
            <span>🌲</span>
            <span>Cây Dọc</span>
            <span className="hidden sm:inline text-[10px] opacity-80 font-normal">(Top-Down)</span>
          </button>

          {/* Tab 2: Left-to-Right Tree */}
          <button
            type="button"
            onClick={() => onChangeViewMode('left-to-right')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              viewMode === 'left-to-right'
                ? 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            title="Dạng 2: Cây ngang từ trái sang phải (Thoáng tên tiếng Việt, cuộn như dòng thời gian)"
          >
            <span>↔️</span>
            <span>Cây Ngang</span>
            <span className="hidden sm:inline text-[10px] opacity-80 font-normal">(Left-Right)</span>
          </button>

          {/* Tab 3: Collapsible List / Accordion (⭐ Tối ưu Mobile) */}
          <button
            type="button"
            onClick={() => onChangeViewMode('accordion')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              viewMode === 'accordion'
                ? 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            title="Dạng 3: Dạng Danh bạ phân cấp (Tối ưu số 1 cho Mobile, vuốt chạm mượt mà)"
          >
            <span>📱</span>
            <span>Danh Bạ</span>
            <span className="hidden sm:inline text-[10px] opacity-80 font-normal">(Mobile)</span>
          </button>
        </div>

        {/* Center Section: Quick Search Member Bar with Autocomplete */}
        <div ref={searchBoxRef} className="relative flex-1 max-w-xs md:max-w-sm lg:max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setDropdownOpen(true)
              }}
              onFocus={() => {
                if (keyword.trim()) setDropdownOpen(true)
              }}
              placeholder={highlightedPerson ? `Đang xem: ${highlightedPerson.full_name}` : 'Tìm nhanh thành viên trên cây...'}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
            />
            {keyword ? (
              <button
                type="button"
                onClick={() => {
                  setKeyword('')
                  onClearHighlight?.()
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            ) : highlightedPerson ? (
              <button
                type="button"
                onClick={onClearHighlight}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300/60 dark:border-amber-700/60 cursor-pointer"
                title="Bỏ định vị (cho phép cuộn tự do)"
              >
                Bỏ chọn ✕
              </button>
            ) : null}
          </div>

          {/* Autocomplete Dropdown */}
          {dropdownOpen && keyword.trim() && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-72 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.length > 0 ? (
                searchResults.map((person) => {
                  const isFemale = person.gender?.toLowerCase() === 'female'
                  return (
                    <div
                      key={person.id}
                      onClick={() => handleSelectPerson(person.id)}
                      className="p-2.5 hover:bg-amber-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between gap-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0 ${
                            isFemale
                              ? 'bg-gradient-to-tr from-rose-400 to-pink-500'
                              : 'bg-gradient-to-tr from-sky-500 to-blue-600'
                          }`}
                        >
                          {person.full_name?.charAt(0) || 'N'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                            {person.full_name}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Đời {toRoman(person.generation)} • {isFemale ? 'Nữ' : 'Nam'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex-shrink-0">
                        Định vị 🎯
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400">
                  Không tìm thấy thành viên "{keyword}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Action Buttons & Stats */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 flex-wrap">
          {/* Generation Filter Input */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] hidden sm:inline whitespace-nowrap">
              Số đời:
            </span>
            <input
              type="number"
              min={1}
              max={30}
              value={inputGen}
              onChange={(e) => setInputGen(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyGen()
              }}
              placeholder={isAll ? 'Tất cả' : String(maxGeneration || 5)}
              className="w-16 px-1 py-0.5 text-center font-bold text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-amber-600 dark:text-amber-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              title="Nhập số đời muốn xem (nhấn Enter hoặc nút Lọc)"
            />
            <button
              type="button"
              onClick={handleApplyGen}
              className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer shadow-2xs"
              title="Lọc hiển thị theo số đời"
            >
              Lọc
            </button>
            <button
              type="button"
              onClick={handleToggleAll}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                isAll
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
              }`}
              title="Hiển thị tất cả các đời"
            >
              Tất cả
            </button>
          </div>

          {/* Quick Action: + Gốc */}
          <button
            type="button"
            onClick={onAddRootPerson}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            title="Thêm Cụ Khởi Tổ / Người Gốc mới"
          >
            <span>👑</span>
            <span>+ Gốc</span>
          </button>

          {/* Quick Action: + Con */}
          {onAddChildPerson && (
            <button
              type="button"
              onClick={onAddChildPerson}
              disabled={!selectedPersonId}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center gap-1 shadow-xs disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
              title={
                selectedPersonId
                  ? 'Thêm con cho thành viên đang chọn'
                  : 'Chọn một người trên cây để thêm con'
              }
            >
              <span>👶</span>
              <span>+ Con</span>
            </button>
          )}

          {/* Quick Action: Mở hết / Thu gọn */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={onExpandAll}
              className="px-2 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Mở rộng tất cả các nhánh"
            >
              ⊞ Mở hết
            </button>
            <button
              type="button"
              onClick={onCollapseAll}
              className="px-2 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Thu gọn các nhánh con"
            >
              ⊟ Thu gọn
            </button>
          </div>

          {/* Quick Action: Xuất */}
          <button
            type="button"
            onClick={onExport}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            title="Xuất ảnh cây gia phả"
          >
            <span>📤</span>
            <span className="hidden sm:inline">Xuất ảnh</span>
          </button>

          {/* Quick Action: Làm mới */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Làm mới cây phả hệ"
            aria-label="Làm mới"
          >
            <span className={`inline-block ${loading ? 'animate-spin' : ''}`}>🔄</span>
          </button>

          {/* Stats Badge */}
          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200/60 dark:border-amber-800/60">
              {maxTreeGeneration} Đời
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              {totalMembers} Người
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default TreeToolbar
