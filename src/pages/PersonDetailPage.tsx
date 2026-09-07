import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Seo } from '@/components/common/Seo'
import { Card, Button } from '@/components/ui'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { PersonModalForm } from '@/features/family-tree/components/PersonModalForm'
import { RelationModalForm } from '@/features/family-tree/components/RelationModalForm'
import { AncestryTimelineModal } from '@/features/family-tree/components/AncestryTimelineModal'
import { familyService } from '@/services/family.service'
import { fileService } from '@/services/file.service'
import { useFamily } from '@/hooks/useFamily'
import { useToast } from '@/hooks/useToast'
import { PATHS } from '@/routes/paths'
import type { PersonDetail, SpouseDetail, PersonRequest } from '@/types'

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentFamilyId } = useFamily()
  const { toast } = useToast()

  const [person, setPerson] = useState<PersonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingAvatar, setUpdatingAvatar] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [isAncestryOpen, setIsAncestryOpen] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  // Edit / Relation Modals
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddChildOpen, setIsAddChildOpen] = useState(false)
  const [isRelationOpen, setIsRelationOpen] = useState(false)
  const [relationMode, setRelationMode] = useState<'PARENT_CHILD' | 'MARRIAGE'>('PARENT_CHILD')

  // Delete modals
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [marriageToDelete, setMarriageToDelete] = useState<SpouseDetail | null>(null)

  const personId = Number(id)

  useEffect(() => {
    setImgError(false)
    setIsEditingUrl(false)
    setCustomUrl(person?.avatar_url || '')
  }, [person?.avatar_url])

  const loadPerson = useCallback(async () => {
    if (!personId) return
    setLoading(true)
    setError(null)
    try {
      const data = await familyService.getPersonDetail(personId)
      setPerson(data)
    } catch (err: any) {
      console.error('Lỗi khi tải chi tiết thành viên:', err)
      setError(err?.response?.data?.message || 'Không tìm thấy thông tin thành viên này.')
    } finally {
      setLoading(false)
    }
  }, [personId])

  useEffect(() => {
    loadPerson()
  }, [loadPerson])

  const handleDeletePerson = async () => {
    if (!person) return
    setDeleting(true)
    try {
      await familyService.deletePerson(person.id)
      toast.success(`Đã xóa thành viên "${person.full_name}"`)
      navigate(PATHS.PERSONS)
    } catch (err) {
      console.error('Lỗi xóa người:', err)
      toast.error('Không thể xóa thành viên.')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteMarriage = async () => {
    if (!marriageToDelete) return
    try {
      await familyService.deleteMarriage(marriageToDelete.marriage_id)
      toast.success(`Đã hủy quan hệ hôn nhân với "${marriageToDelete.full_name}"`)
      setMarriageToDelete(null)
      loadPerson()
    } catch (err) {
      console.error('Lỗi hủy hôn phối:', err)
      toast.error('Không thể hủy quan hệ hôn phối.')
    }
  }

  // Upload/change avatar directly
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !person) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WebP...)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`Dung lượng ảnh vượt quá 10MB (${(file.size / (1024 * 1024)).toFixed(2)}MB)`)
      return
    }

    setUpdatingAvatar(true)
    try {
      const uploadRes = await fileService.uploadFile(file)
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
      setImgError(false)
      toast.success('Đã cập nhật ảnh đại diện thành công!')
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

  // Save custom avatar URL directly
  const handleSaveCustomUrl = async () => {
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
        avatar_url: customUrl.trim() || null,
      }

      const updated = await familyService.updatePerson(person.id, payload)
      setPerson(updated)
      setImgError(false)
      setIsEditingUrl(false)
      toast.success('Đã lưu liên kết ảnh đại diện thành công!')
    } catch (err: any) {
      console.error('Lỗi khi lưu link ảnh đại diện:', err)
      const msg = err.response?.data?.data?.message || err.message || 'Không thể lưu link ảnh đại diện'
      toast.error(msg)
    } finally {
      setUpdatingAvatar(false)
    }
  }

  // Delete avatar: calls updatePerson with avatar_url: null
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
    } catch (err: any) {
      console.error('Lỗi khi xóa ảnh đại diện:', err)
      const msg = err.response?.data?.data?.message || err.message || 'Không thể xóa ảnh đại diện'
      toast.error(msg)
    } finally {
      setUpdatingAvatar(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--c-muted)]">Đang tải hồ sơ thành viên...</p>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <p className="text-4xl">⚠️</p>
        <h2 className="text-xl font-bold text-[var(--c-heading)]">
          {error || 'Không tìm thấy thành viên'}
        </h2>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(PATHS.PERSONS)}>
            ← Về danh sách
          </Button>
          <Button variant="primary" onClick={loadPerson}>
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  const isMale = person.gender?.toLowerCase() === 'male'

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <Seo title={`Hồ sơ: ${person.full_name} – Đời thứ ${person.generation}`} />

      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-[var(--c-muted)] hover:text-amber-600 flex items-center gap-1 transition-colors"
        >
          <span>←</span> Quay lại
        </button>

        <Link
          to={`${PATHS.HOME}?focus=${person.id}`}
          className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
        >
          <span>🎯</span> Xem trên cây gia phả
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar Large with upload/delete actions */}
        <div className="relative flex-shrink-0 flex flex-col items-center">
          <div className="relative group/avatar">
            {person.avatar_url && !imgError ? (
              <img
                src={person.avatar_url}
                alt={person.full_name}
                onError={() => setImgError(true)}
                className="w-28 h-28 rounded-3xl object-cover border-4 border-amber-300 dark:border-amber-700 shadow-md"
              />
            ) : (
              <div
                className={`w-28 h-28 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-md ${
                  isMale
                    ? 'bg-gradient-to-tr from-sky-600 to-indigo-700'
                    : 'bg-gradient-to-tr from-rose-500 to-amber-600'
                }`}
              >
                {person.full_name?.charAt(0) || 'N'}
              </div>
            )}

            {/* Spinner Overlay */}
            {updatingAvatar && (
              <div className="absolute inset-0 rounded-3xl bg-black/60 flex items-center justify-center text-white text-xs font-semibold z-20">
                <span className="animate-spin">⏳</span>
              </div>
            )}

            {/* Hover Overlay Button to Change Avatar */}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={updatingAvatar}
              title="Đổi ảnh đại diện (Tải từ máy)"
              className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold transition-opacity duration-150 cursor-pointer z-10"
            >
              <span className="text-xl">📷</span>
              <span>Đổi ảnh</span>
            </button>

            {/* Gender Badge */}
            <span
              className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs z-10 ${
                isMale ? 'bg-sky-600' : 'bg-rose-600'
              }`}
            >
              {isMale ? 'Nam' : 'Nữ'}
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Quick Avatar Actions under picture */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={updatingAvatar}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
              title="Tải lên ảnh từ máy"
            >
              <span>📷</span>
              <span>{person.avatar_url ? 'Đổi' : 'Tải'}</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>

            <button
              type="button"
              onClick={() => {
                setCustomUrl(person.avatar_url || '')
                setIsEditingUrl(!isEditingUrl)
              }}
              disabled={updatingAvatar}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-0.5"
              title="Dán link liên kết ảnh URL"
            >
              <span>🔗</span>
              <span>URL</span>
            </button>

            {person.avatar_url && (
              <>
                <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={updatingAvatar}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-0.5"
                  title="Xóa ảnh đại diện (đặt về null)"
                >
                  <span>🗑️</span>
                  <span>Xóa</span>
                </button>
              </>
            )}
          </div>

          {/* Inline Direct URL Input Box */}
          {isEditingUrl && (
            <div className="w-56 mt-2.5 p-2.5 rounded-xl bg-[var(--c-surface-2)] border border-[var(--c-border)] flex flex-col gap-1.5 shadow-sm animate-in fade-in">
              <div className="text-[11px] font-bold text-[var(--c-heading)] flex items-center justify-between">
                <span>🔗 URL ảnh đại diện</span>
                <button
                  type="button"
                  onClick={() => setIsEditingUrl(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-[var(--c-bg)] border border-[var(--c-border)] rounded-md text-[var(--c-text)] focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingUrl(false)}
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomUrl}
                  disabled={updatingAvatar}
                  className="px-2.5 py-0.5 text-[11px] font-semibold rounded bg-amber-600 hover:bg-amber-500 text-white cursor-pointer shadow-2xs"
                >
                  {updatingAvatar ? '...' : 'Lưu URL'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Core Info */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--c-heading)]">
              {person.full_name}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
              Đời thứ {person.generation}
            </span>
            {person.is_bloodline ? (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Chính tộc
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Dâu / Rể
              </span>
            )}
          </div>

          <p className="text-sm">
            {person.is_alive ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center sm:justify-start gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Còn sống {person.birth_year ? `(Sinh năm ${person.birth_year})` : ''}
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                🪷 Đã khuất {person.death_year ? `(Năm ${person.death_year})` : ''}
                {person.birth_year && person.death_year
                  ? ` • Hưởng thọ ${person.death_year - person.birth_year} tuổi`
                  : ''}
              </span>
            )}
          </p>

          {/* Actions button bar */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsAncestryOpen(true)}
              className="text-xs bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-700/80 font-bold"
              title="Xem toàn bộ dòng dõi tổ tiên trực hệ từ Cụ Khởi Tổ"
            >
              <span>📜</span> Xem dòng dõi tổ tiên
            </Button>
            <Button variant="secondary" onClick={() => setIsEditOpen(true)} className="text-xs">
              <span>✏️</span> Sửa thông tin
            </Button>
            <Button variant="secondary" onClick={() => setIsAddChildOpen(true)} className="text-xs">
              <span>👶</span> Thêm con
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setRelationMode('MARRIAGE')
                setIsRelationOpen(true)
              }}
              className="text-xs"
            >
              <span>💍</span> Thêm vợ/chồng
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setRelationMode('PARENT_CHILD')
                setIsRelationOpen(true)
              }}
              className="text-xs"
            >
              <span>👨‍👧</span> Gán cha mẹ
            </Button>
            <Button variant="danger" onClick={() => setIsDeleteOpen(true)} className="text-xs">
              <span>🗑️</span> Xóa
            </Button>
          </div>
        </div>
      </div>

      {/* Info Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-xs text-[var(--c-muted)] block">Năm sinh</span>
          <span className="text-base font-semibold text-[var(--c-heading)]">
            {person.birth_year || 'Chưa cập nhật'}
          </span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-[var(--c-muted)] block">Năm mất</span>
          <span className="text-base font-semibold text-[var(--c-heading)]">
            {person.death_year || (person.is_alive ? 'Còn sống' : 'Chưa cập nhật')}
          </span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-[var(--c-muted)] block">Quê quán / Nơi sinh</span>
          <span className="text-base font-semibold text-[var(--c-heading)]">
            {person.birth_place || 'Chưa cập nhật'}
          </span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-[var(--c-muted)] block">Nghề nghiệp / Chức vị</span>
          <span className="text-base font-semibold text-[var(--c-heading)]">
            {person.occupation || 'Chưa cập nhật'}
          </span>
        </Card>
      </div>

      {/* Biography */}
      {person.biography && (
        <Card className="p-5 space-y-2 border-amber-300/40 bg-amber-50/40 dark:bg-amber-950/20">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <span>📜</span> Tiểu sử & Ghi chú ngày giỗ
          </h3>
          <p className="text-sm text-[var(--c-text)] leading-relaxed whitespace-pre-line">
            {person.biography}
          </p>
        </Card>
      )}

      {/* Spouses List */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--c-heading)] flex items-center gap-2">
            <span>💍</span> Quan hệ Phu thê / Vợ chồng ({person.spouses?.length || 0})
          </h3>
          <button
            type="button"
            onClick={() => {
              setRelationMode('MARRIAGE')
              setIsRelationOpen(true)
            }}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
          >
            + Kết nối vợ/chồng
          </button>
        </div>

        {person.spouses && person.spouses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {person.spouses.map((spouse) => (
              <div
                key={spouse.marriage_id}
                className="p-3.5 rounded-2xl bg-[var(--c-surface-2)] border border-[var(--c-border)] flex items-center justify-between gap-3"
              >
                <Link
                  to={PATHS.PERSON_DETAIL.replace(':id', String(spouse.id))}
                  className="flex items-center gap-3 flex-1 min-w-0 group"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                      spouse.gender?.toLowerCase() === 'female'
                        ? 'bg-gradient-to-tr from-rose-500 to-amber-600'
                        : 'bg-gradient-to-tr from-sky-600 to-indigo-600'
                    }`}
                  >
                    {spouse.full_name?.charAt(0) || 'V'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--c-heading)] group-hover:text-amber-600 truncate">
                      {spouse.full_name}
                    </p>
                    <p className="text-xs text-[var(--c-muted)]">
                      {spouse.birth_year ? `s. ${spouse.birth_year}` : ''} • {spouse.status}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setMarriageToDelete(spouse)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Hủy kết hôn"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--c-muted)] italic">
            Chưa có thông tin phối ngẫu cho thành viên này.
          </p>
        )}
      </Card>

      {/* Modals */}
      <PersonModalForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        familyId={currentFamilyId}
        initialData={person}
        onSuccess={() => {
          loadPerson()
        }}
      />

      <PersonModalForm
        isOpen={isAddChildOpen}
        onClose={() => setIsAddChildOpen(false)}
        familyId={currentFamilyId}
        prefill={{
          generation: (person.generation || 1) + 1,
          parent_id: person.id,
          parent_name: person.full_name,
          is_bloodline: true,
        }}
        onSuccess={() => {
          loadPerson()
        }}
      />

      <RelationModalForm
        isOpen={isRelationOpen}
        onClose={() => setIsRelationOpen(false)}
        familyId={currentFamilyId}
        mode={relationMode}
        sourcePerson={{
          id: person.id,
          full_name: person.full_name,
          generation: person.generation,
        }}
        onSuccess={() => {
          loadPerson()
        }}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeletePerson}
        loading={deleting}
        title="Xóa thành viên"
        message={
          <div>
            Bạn có chắc chắn muốn xóa thành viên{' '}
            <strong className="text-rose-600">{person.full_name}</strong> khỏi gia phả không?
          </div>
        }
        confirmText="Xác nhận xóa"
      />

      <ConfirmModal
        isOpen={Boolean(marriageToDelete)}
        onClose={() => setMarriageToDelete(null)}
        onConfirm={handleDeleteMarriage}
        title="Hủy liên kết hôn nhân"
        message={
          <div>
            Bạn có chắc muốn hủy mối quan hệ vợ chồng giữa{' '}
            <strong>{person.full_name}</strong> và{' '}
            <strong className="text-rose-600">{marriageToDelete?.full_name}</strong> không?
          </div>
        }
        confirmText="Hủy liên kết"
      />

      {/* Modal: Phả Đồ Cội Nguồn & Dòng Dõi Trực Hệ */}
      {person && (
        <AncestryTimelineModal
          isOpen={isAncestryOpen}
          onClose={() => setIsAncestryOpen(false)}
          personId={person.id}
          personName={person.full_name}
          onFocusOnTree={(focusId) => navigate(`${PATHS.FAMILY_TREE}?focus=${focusId}`)}
        />
      )}
    </div>
  )
}
