import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { familyService } from '@/services/family.service'
import { Avatar } from '@/components/ui'
import type { PersonDetail } from '@/types'
import { toRoman } from '../utils/treeRoman'
import { PATHS } from '@/routes/paths'

interface AncestryTimelineModalProps {
  isOpen: boolean
  onClose: () => void
  personId: number | null
  personName?: string
  onFocusOnTree?: (id: number) => void
}

export function AncestryTimelineModal({
  isOpen,
  onClose,
  personId,
  personName,
  onFocusOnTree,
}: AncestryTimelineModalProps) {
  const [ancestry, setAncestry] = useState<PersonDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAncestry = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await familyService.getAncestry(id)
      setAncestry(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Lỗi khi tải dòng dõi tổ tiên:', err)
      setError(err?.response?.data?.message || 'Không thể tải dòng dõi tổ tiên.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen && personId) {
      fetchAncestry(personId)
    } else if (!isOpen) {
      setAncestry([])
      setError(null)
    }
  }, [isOpen, personId, fetchAncestry])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const rootPerson = ancestry.length > 0 ? ancestry[0] : null
  const targetPerson = ancestry.length > 0 ? ancestry[ancestry.length - 1] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg flex-shrink-0">
              📜
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                Phả Đồ Cội Nguồn & Dòng Dõi Trực Hệ
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Truy vết huyết thống từ Cụ Khởi Tổ tới{' '}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {personName || targetPerson?.full_name || 'thành viên'}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors font-bold text-sm cursor-pointer"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-semibold">Đang truy xuất phả hệ tổ tiên...</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-center">
              <p className="text-rose-700 dark:text-rose-300 text-sm font-semibold mb-2">
                ⚠️ {error}
              </p>
              {personId && (
                <button
                  type="button"
                  onClick={() => fetchAncestry(personId)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Thử lại
                </button>
              )}
            </div>
          )}

          {!loading && !error && ancestry.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <span className="text-4xl mb-2 block">🌱</span>
              <p className="text-sm font-semibold">Không tìm thấy thông tin dòng dõi tổ tiên.</p>
            </div>
          )}

          {!loading && !error && ancestry.length > 0 && (
            <>
              {/* Summary Highlights Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-xs font-bold shadow-2xs">
                    {ancestry.length} Thế hệ
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    Từ <strong className="text-slate-900 dark:text-slate-100">{rootPerson?.full_name}</strong> đến{' '}
                    <strong className="text-slate-900 dark:text-slate-100">{targetPerson?.full_name}</strong>
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  Truyền thừa huyết thống chính tông
                </span>
              </div>

              {/* Vertical Step Line Timeline */}
              <div className="relative pl-6 sm:pl-8 space-y-4 pt-2 pb-2">
                {/* Connecting glowing line */}
                <div className="absolute left-[19px] sm:left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-amber-500 via-amber-400 to-amber-600 rounded-full" />

                {ancestry.map((item, index) => {
                  const isRoot = item.generation === 1 || index === 0
                  const isTarget = item.id === personId
                  const isFemale = item.gender?.toLowerCase() === 'female'

                  return (
                    <div key={item.id} className="relative group">
                      {/* Timeline Node Dot */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-3.5 w-4 h-4 rounded-full border-2 transition-transform duration-200 group-hover:scale-125 z-10 flex items-center justify-center ${
                          isRoot
                            ? 'bg-amber-500 border-white dark:border-slate-900 shadow-md ring-2 ring-amber-400'
                            : isTarget
                            ? 'bg-sky-500 border-white dark:border-slate-900 shadow-md ring-2 ring-sky-400'
                            : 'bg-white dark:bg-slate-900 border-amber-500'
                        }`}
                      >
                        {isRoot && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        {isTarget && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      {/* Card Content */}
                      <div
                        className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
                          isTarget
                            ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 shadow-sm'
                            : isRoot
                            ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
                          {/* Left Info: Avatar + Details */}
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <Avatar
                                src={item.avatar_url}
                                alt={item.full_name}
                                gender={item.gender}
                                size="custom"
                                shape="rounded-xl"
                                className="w-11 h-11 text-sm"
                                ringClassName={`ring-2 ${
                                  isRoot
                                    ? 'ring-amber-500'
                                    : isFemale
                                    ? 'ring-rose-400'
                                    : 'ring-sky-400'
                                }`}
                              />

                              {isRoot && (
                                <span className="absolute -top-1.5 -right-1.5 text-xs">👑</span>
                              )}
                            </div>

                            {/* Name & Generation Info */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                                  {item.full_name}
                                </span>

                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                                    isRoot
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                                      : isTarget
                                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300'
                                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                                  }`}
                                >
                                  {isRoot ? '👑 Cụ Khởi Tổ' : `Đời ${toRoman(item.generation)}`}
                                </span>

                                {isTarget && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-600 text-white shadow-2xs">
                                    🎯 Đang chọn
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                <span>{isFemale ? 'Nữ' : 'Nam'}</span>
                                <span>•</span>
                                <span>
                                  {item.birth_year ? `Năm sinh: ${item.birth_year}` : 'Chưa rõ năm sinh'}
                                  {item.death_year ? ` - Năm mất: ${item.death_year}` : item.is_alive ? ' (Còn sống)' : ''}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Actions: Định vị trên cây & Hồ sơ */}
                          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-1 sm:pt-0">
                            {onFocusOnTree && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose()
                                  onFocusOnTree(item.id)
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/80 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Định vị cụ tổ này trên cây phả hệ"
                              >
                                <span>🎯</span>
                                <span className="hidden sm:inline">Định vị</span>
                              </button>
                            )}

                            <Link
                              to={PATHS.PERSON_DETAIL.replace(':id', String(item.id))}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition-colors flex items-center gap-1"
                              title="Xem chi tiết hồ sơ"
                            >
                              <span>📄</span>
                              <span className="hidden sm:inline">Hồ sơ</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 italic hidden sm:inline">
            Nhấn vào "🎯 Định vị" để lướt camera cây gia phả đến vị trí cụ tổ tương ứng
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer ml-auto"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default AncestryTimelineModal
