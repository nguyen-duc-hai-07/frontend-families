import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { familyService } from '@/services/family.service'
import { fileService } from '@/services/file.service'
import { useToast } from '@/hooks/useToast'
import type { PersonDetail, SpouseDetail, PersonRequest } from '@/types'
import { PATHS } from '@/routes/paths'
import { toRoman } from '../utils/treeRoman'
import { AncestryTimelineModal } from './AncestryTimelineModal'

interface PersonDetailDrawerProps {
  personId: number | null
  isOpen: boolean
  onClose: () => void
  onFocusOnTree?: (id: number) => void
  onEditPerson?: (person: PersonDetail) => void
  onAddChild?: (person: PersonDetail) => void
  onAddSpouse?: (person: PersonDetail) => void
  onDeletePerson?: (person: PersonDetail) => void
  onPersonUpdated?: (person: PersonDetail) => void
}

function getMarriageStatusBadge(status: string) {
  switch (status) {
    case 'MARRIED':
      return {
        label: 'Đã kết hôn',
        cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200',
      }
    case 'WIDOWED':
      return {
        label: 'Đã góa',
        cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
      }
    case 'DIVORCED':
      return {
        label: 'Đã ly hôn',
        cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200',
      }
    default:
      return {
        label: status || 'Hôn phối',
        cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200',
      }
  }
}

export function PersonDetailDrawer({
  personId,
  isOpen,
  onClose,
  onFocusOnTree,
  onEditPerson,
  onAddChild,
  onAddSpouse,
  onDeletePerson,
  onPersonUpdated,
}: PersonDetailDrawerProps) {
  const { toast } = useToast()
  const [currentId, setCurrentId] = useState<number | null>(personId)
  const [person, setPerson] = useState<PersonDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingAvatar, setUpdatingAvatar] = useState(false)
  const [isAncestryOpen, setIsAncestryOpen] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setCurrentId(personId)
  }, [personId])

  const loadDetail = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await familyService.getPersonDetail(id)
      setPerson(data)
    } catch (err) {
      console.error('Lỗi tải thông tin chi tiết thành viên:', err)
      setError('Không thể tải chi tiết thành viên này.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen && currentId) {
      loadDetail(currentId)
    } else if (!isOpen) {
      setPerson(null)
    }
  }, [isOpen, currentId, loadDetail])

  // ESC key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Avatar Update handler: upload new file and call familyService.updatePerson
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !person) return

    setUpdatingAvatar(true)
    try {
      // 1. Tải ảnh lên
      const uploadRes = await fileService.uploadFile(file)

      // 2. Cập nhật person với avatarURL mới
      const payload: PersonRequest = {
        family_id: person.family_id,
        full_name: person.full_name,
        gender: person.gender,
        generation: person.generation,
        is_alive: person.is_alive,
        is_bloodline: person.is_bloodline,
        birth_year: person.birth_year,
        death_year: person.death_year,
        birth_place: person.birth_place,
        occupation: person.occupation,
        biography: person.biography,
        avatar_url: uploadRes.url,
      }

      const updated = await familyService.updatePerson(person.id, payload)
      setPerson(updated)
      toast.success('Đã cập nhật ảnh đại diện thành công!')
      onPersonUpdated?.(updated)
    } catch (err: any) {
      console.error('Lỗi khi cập nhật ảnh đại diện:', err)
      const msg = err.response?.data?.data?.message || err.message || 'Không thể cập nhật ảnh đại diện'
      toast.error(msg)
    } finally {
      setUpdatingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

  // Avatar Delete handler: call familyService.updatePerson with avatar_url: null
  const handleDeleteAvatar = async () => {
    if (!person) return

    setUpdatingAvatar(true)
    try {
      const payload: PersonRequest = {
        family_id: person.family_id,
        full_name: person.full_name,
        gender: person.gender,
        generation: person.generation,
        is_alive: person.is_alive,
        is_bloodline: person.is_bloodline,
        birth_year: person.birth_year,
        death_year: person.death_year,
        birth_place: person.birth_place,
        occupation: person.occupation,
        biography: person.biography,
        avatar_url: null,
      }

      const updated = await familyService.updatePerson(person.id, payload)
      setPerson(updated)
      toast.success('Đã xóa ảnh đại diện thành công!')
      onPersonUpdated?.(updated)
    } catch (err: any) {
      console.error('Lỗi khi xóa ảnh đại diện:', err)
      const msg = err.response?.data?.data?.message || err.message || 'Không thể xóa ảnh đại diện'
      toast.error(msg)
    } finally {
      setUpdatingAvatar(false)
    }
  }

  if (!isOpen) return null

  const isMale = person?.gender?.toLowerCase() === 'male'
  const firstLetter =
    person?.full_name?.trim().split(' ').pop()?.charAt(0) || person?.full_name?.charAt(0) || '?'

  const age =
    person && person.birth_year && person.death_year
      ? person.death_year - person.birth_year
      : null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside
        className="relative w-full max-w-md md:max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden z-10 transform transition-transform duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        aria-label="Thông tin chi tiết thành viên"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Hồ Sơ Thành Viên
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chi tiết phả hệ & tiểu sử
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Đóng (ESC)"
            aria-label="Đóng ngăn kéo"
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Đang tải thông tin chi tiết...</span>
            </div>
          ) : error ? (
            <div className="py-16 text-center space-y-3 text-rose-500">
              <p className="text-sm font-semibold">{error}</p>
              <button
                type="button"
                onClick={() => currentId && loadDetail(currentId)}
                className="px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold"
              >
                Thử lại
              </button>
            </div>
          ) : person ? (
            <>
              {/* Profile Card Header */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isMale
                    ? 'bg-gradient-to-br from-sky-50/80 via-blue-50/60 to-slate-50 dark:from-slate-800/80 dark:via-sky-950/30 dark:to-slate-900 border-sky-200/80 dark:border-sky-800/60'
                    : 'bg-gradient-to-br from-rose-50/80 via-pink-50/60 to-slate-50 dark:from-slate-800/80 dark:via-rose-950/30 dark:to-slate-900 border-rose-200/80 dark:border-rose-800/60'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Large Avatar with Direct Upload & Delete */}
                  <div className="relative flex-shrink-0 flex flex-col items-center">
                    <div className="relative group/avatar">
                      {person.avatar_url ? (
                        <img
                          src={person.avatar_url}
                          alt={person.full_name}
                          className={`w-20 h-20 rounded-2xl object-cover shadow-md ring-2 ${
                            isMale ? 'ring-sky-400' : 'ring-rose-400'
                          }`}
                        />
                      ) : (
                        <div
                          className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-md ring-2 ${
                            isMale
                              ? 'bg-gradient-to-tr from-sky-500 to-blue-700 ring-sky-400'
                              : 'bg-gradient-to-tr from-rose-400 to-pink-600 ring-rose-400'
                          }`}
                        >
                          {firstLetter}
                        </div>
                      )}

                      {/* Updating Spinner */}
                      {updatingAvatar && (
                        <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center text-white text-xs font-semibold z-20">
                          <span className="animate-spin">⏳</span>
                        </div>
                      )}

                      {/* Hover Overlay Button to Change Avatar */}
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={updatingAvatar}
                        title="Đổi ảnh đại diện"
                        className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-semibold transition-opacity duration-150 cursor-pointer z-10"
                      >
                        <span className="text-base">📷</span>
                        <span>Đổi ảnh</span>
                      </button>

                      {/* Gender Badge */}
                      <span
                        className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white shadow-xs z-10 ${
                          isMale ? 'bg-sky-600' : 'bg-rose-600'
                        }`}
                      >
                        {isMale ? '♂' : '♀'}
                      </span>
                    </div>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Quick Avatar Actions under picture */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={updatingAvatar}
                        className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
                        title="Tải lên hoặc đổi ảnh đại diện"
                      >
                        <span>📷</span>
                        <span>{person.avatar_url ? 'Đổi' : 'Thêm'}</span>
                      </button>

                      {person.avatar_url && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
                          <button
                            type="button"
                            onClick={handleDeleteAvatar}
                            disabled={updatingAvatar}
                            className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-0.5"
                            title="Xóa ảnh đại diện (đặt về null)"
                          >
                            <span>🗑️</span>
                            <span>Xóa</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Name and Badges */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                      {person.full_name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/70 dark:border-amber-700/60">
                        {person.generation === 1 ? '👑 Cụ Khởi Tổ' : `Đời thứ ${toRoman(person.generation)}`}
                      </span>

                      {person.is_bloodline ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
                          Chính tộc
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/60 dark:border-slate-700/60">
                          Dâu / Rể
                        </span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="text-xs pt-0.5">
                      {person.is_alive ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Còn sống
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                          <span>🪷</span>
                          Đã khuất
                          {person.death_year ? ` (Năm ${person.death_year})` : ''}
                          {age ? ` • Hưởng thọ ${age} tuổi` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons inside Drawer */}
                <div className="grid grid-cols-4 gap-1.5 mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => onEditPerson?.(person)}
                    className="py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1 border border-amber-400/30"
                    title="Sửa thông tin thành viên"
                  >
                    <span>✏️</span> Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddChild?.(person)}
                    className="py-1.5 px-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1 border border-sky-400/30"
                    title="Thêm con cho thành viên này"
                  >
                    <span>👶</span> + Con
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddSpouse?.(person)}
                    className="py-1.5 px-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1 border border-rose-400/30"
                    title="Thêm phối ngẫu (Vợ / Chồng)"
                  >
                    <span>💍</span> + Phối ngẫu
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeletePerson?.(person)}
                    className="py-1.5 px-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-colors flex items-center justify-center gap-1 border border-rose-500/30"
                    title="Xóa thành viên khỏi gia phả"
                  >
                    <span>🗑️</span> Xóa
                  </button>
                </div>

                {/* Ancestry Lineage Quick Action Banner */}
                <button
                  type="button"
                  onClick={() => setIsAncestryOpen(true)}
                  className="w-full mt-2.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
                  title="Xem toàn bộ dòng dõi tổ tiên trực hệ từ Cụ Khởi Tổ"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">📜</span>
                    <span className="font-bold">Xem Dòng Dõi Tổ Tiên</span>
                  </div>
                  <span className="text-amber-100 group-hover:translate-x-0.5 transition-transform text-xs font-semibold flex items-center gap-0.5">
                    Truy vết cội nguồn ›
                  </span>
                </button>
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Năm sinh
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {person.birth_year ? `${person.birth_year}` : 'Chưa rõ'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Năm mất
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {person.death_year ? `${person.death_year}` : person.is_alive ? 'Còn sống' : 'Chưa rõ'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Quê quán / Nơi sinh
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {person.birth_place || 'Chưa cập nhật'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                    Nghề nghiệp
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {person.occupation || 'Chưa cập nhật'}
                  </span>
                </div>
              </div>

              {/* Biography & Memorial Section */}
              {person.biography && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400">
                    <span>📜</span>
                    <span>Tiểu sử & Ngày giỗ</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line italic">
                    {person.biography}
                  </p>
                </div>
              )}

              {/* Spouses List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>💍</span> Hôn phối ({person.spouses?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => onAddSpouse?.(person)}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                  >
                    + Thêm
                  </button>
                </div>

                {person.spouses && person.spouses.length > 0 ? (
                  <div className="space-y-2">
                    {person.spouses.map((spouse: SpouseDetail) => {
                      const status = getMarriageStatusBadge(spouse.status)
                      return (
                        <div
                          key={spouse.marriage_id || spouse.id}
                          onClick={() => setCurrentId(spouse.id)}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer flex items-center justify-between transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                                spouse.gender?.toLowerCase() === 'female'
                                  ? 'bg-gradient-to-tr from-rose-400 to-pink-600'
                                  : 'bg-gradient-to-tr from-sky-500 to-blue-600'
                              }`}
                            >
                              {spouse.full_name?.charAt(0) || 'V'}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                {spouse.full_name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${status.cls}`}>
                                  {status.label}
                                </span>
                                {spouse.birth_year && (
                                  <span className="text-[11px] text-slate-400">
                                    (s. {spouse.birth_year})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <span className="text-xs text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform font-bold">
                            ›
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    Chưa có thông tin hôn phối. Nhấn "+ Thêm" để gán vợ/chồng.
                  </p>
                )}
              </div>

              {/* Bottom Nav Links */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                {onFocusOnTree && (
                  <button
                    type="button"
                    onClick={() => {
                      onFocusOnTree(person.id)
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-300/60 dark:border-slate-700"
                  >
                    <span>🎯</span> Định vị trên cây
                  </button>
                )}

                <Link
                  to={PATHS.PERSON_DETAIL.replace(':id', String(person.id))}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>📄</span> Xem hồ sơ đầy đủ
                </Link>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Phả Đồ Dòng Dõi Tổ Tiên */}
        {person && (
          <AncestryTimelineModal
            isOpen={isAncestryOpen}
            onClose={() => setIsAncestryOpen(false)}
            personId={person.id}
            personName={person.full_name}
            onFocusOnTree={onFocusOnTree}
          />
        )}
      </aside>
    </div>
  )
}

export default PersonDetailDrawer
