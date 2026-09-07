import React, { useState, useEffect, useRef } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { familyService } from '@/services/family.service'
import { fileService } from '@/services/file.service'
import { useToast } from '@/hooks/useToast'
import type { PersonDetail, PersonRequest, Gender } from '@/types'

interface PersonModalFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (person: PersonDetail) => void
  familyId: number
  initialData?: PersonDetail | null
  prefill?: {
    generation?: number
    parent_id?: number
    parentId?: number
    parent_name?: string
    parentName?: string
    is_bloodline?: boolean
    isBloodline?: boolean
  }
}

export function PersonModalForm({
  isOpen,
  onClose,
  onSuccess,
  familyId,
  initialData,
  prefill,
}: PersonModalFormProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEdit = Boolean(initialData && initialData.id)

  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [generation, setGeneration] = useState(1)
  const [isAlive, setIsAlive] = useState(true)
  const [isBloodline, setIsBloodline] = useState(true)
  const [birthYear, setBirthYear] = useState<string>('')
  const [deathYear, setDeathYear] = useState<string>('')
  const [birthPlace, setBirthPlace] = useState('')
  const [occupation, setOccupation] = useState('')
  const [biography, setBiography] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [imgError, setImgError] = useState(false)

  const [uploadingImage, setUploadingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setImgError(false)
  }, [avatarUrl])

  useEffect(() => {
    if (!isOpen) return

    if (initialData) {
      setFullName(initialData.full_name || '')
      setGender(initialData.gender?.toLowerCase() === 'female' ? 'female' : 'male')
      setGeneration(initialData.generation || 1)
      setIsAlive(initialData.is_alive ?? true)
      setIsBloodline(initialData.is_bloodline ?? true)
      setBirthYear(initialData.birth_year ? String(initialData.birth_year) : '')
      setDeathYear(initialData.death_year ? String(initialData.death_year) : '')
      setBirthPlace(initialData.birth_place || '')
      setOccupation(initialData.occupation || '')
      setBiography(initialData.biography || '')
      setAvatarUrl(initialData.avatar_url || '')
      setShowUrlInput(Boolean(initialData.avatar_url))
    } else {
      setFullName('')
      setGender('male')
      setGeneration(prefill?.generation ?? 1)
      setIsAlive(true)
      setIsBloodline(prefill?.is_bloodline ?? prefill?.isBloodline ?? true)
      setBirthYear('')
      setDeathYear('')
      setBirthPlace('')
      setOccupation('')
      setBiography('')
      setAvatarUrl('')
      setShowUrlInput(false)
    }
    setErrorMsg(null)
  }, [isOpen, initialData, prefill])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WebP...)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`Dung lượng ảnh vượt quá 10MB (${(file.size / (1024 * 1024)).toFixed(2)}MB)`)
      return
    }

    setUploadingImage(true)
    setErrorMsg(null)
    try {
      const res = await fileService.uploadFile(file)
      setAvatarUrl(res.url)
      setShowUrlInput(true)
      toast.success('Tải ảnh đại diện thành công!')
    } catch (err: any) {
      console.error('Lỗi upload avatar:', err)
      const msg =
        err.response?.data?.data?.message ||
        err.response?.data?.message ||
        err.message ||
        'Không thể tải ảnh lên'
      setErrorMsg(msg)
      toast.error(msg)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên thành viên')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    const payload: PersonRequest = {
      family_id: familyId,
      full_name: fullName.trim(),
      gender,
      generation: Number(generation) || 1,
      is_alive: isAlive,
      is_bloodline: isBloodline,
      birth_year: birthYear ? parseInt(birthYear, 10) : null,
      death_year: !isAlive && deathYear ? parseInt(deathYear, 10) : null,
      birth_place: birthPlace.trim() || null,
      occupation: occupation.trim() || null,
      biography: biography.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    }

    try {
      let savedPerson: PersonDetail
      if (isEdit && initialData?.id) {
        savedPerson = await familyService.updatePerson(initialData.id, payload)
        toast.success(`Cập nhật thành viên "${fullName}" thành công!`)
      } else {
        savedPerson = await familyService.createPerson(payload)

        // If this new person was added as child of someone, create parent relation
        const parentId = prefill?.parent_id ?? prefill?.parentId
        const parentName = prefill?.parent_name ?? prefill?.parentName
        if (parentId) {
          try {
            await familyService.createParentRelation({
              family_id: familyId,
              parent_id: parentId,
              child_id: savedPerson.id,
            })
            toast.success(`Đã thêm thành viên và liên kết với cha/mẹ "${parentName || parentId}"`)
          } catch (relErr) {
            console.warn('Lỗi gán quan hệ cha mẹ tự động:', relErr)
          }
        } else {
          toast.success(`Tạo mới thành viên "${fullName}" thành công!`)
        }
      }

      onSuccess(savedPerson)
      onClose()
    } catch (err: any) {
      console.error('Lỗi lưu thành viên:', err)
      const msg =
        err.response?.data?.data?.message ||
        err.response?.data?.message ||
        err.message ||
        'Không thể lưu thông tin thành viên. Vui lòng kiểm tra lại.'
      setErrorMsg(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Sửa thông tin: ${initialData?.full_name}` : 'Thêm thành viên mới'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {prefill?.parentName && !isEdit && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <span>👶</span>
            <span>
              Thành viên này sẽ tự động được gán là <strong>con</strong> của{' '}
              <strong>{prefill.parentName}</strong> (Đời {prefill.generation || generation}).
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Row: Avatar + Full Name */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* Avatar Preview & Upload */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-300 dark:border-amber-700 bg-slate-100 dark:bg-slate-800 shadow-sm flex items-center justify-center">
              {avatarUrl && !imgError ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-3xl font-bold text-white ${
                    gender === 'female'
                      ? 'bg-gradient-to-tr from-rose-400 to-pink-600'
                      : 'bg-gradient-to-tr from-sky-500 to-blue-600'
                  }`}
                >
                  {fullName?.trim() ? fullName.trim().split(' ').pop()?.charAt(0) : (gender === 'female' ? '👩' : '👨')}
                </div>
              )}

              {uploadingImage && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-semibold">
                  <span className="animate-spin mr-1">⏳</span> Đang tải...
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-2 py-1 text-xs font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-200 transition-colors"
                title="Tải ảnh từ máy"
              >
                {uploadingImage ? 'Đang tải...' : '📷 Tải ảnh'}
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="Nhập hoặc dán URL ảnh"
              >
                🔗 URL
              </button>
            </div>

            {avatarUrl && (
              <button
                type="button"
                onClick={() => {
                  setAvatarUrl('')
                  setImgError(false)
                }}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline"
              >
                🗑️ Xóa ảnh
              </button>
            )}

            {showUrlInput && (
              <div className="w-full max-w-[200px] mt-1 animate-in fade-in">
                <input
                  type="url"
                  placeholder="Dán URL ảnh (https://...)"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-[var(--c-bg)] border border-[var(--c-border)] rounded-lg text-[var(--c-text)] focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            )}
          </div>

          {/* Core Info */}
          <div className="flex-1 space-y-3 w-full">
            <Input
              label="Họ và tên *"
              placeholder="Ví dụ: Nguyễn Bá Dự"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                  Giới tính *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                  Đời thứ mấy *
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={generation}
                  onChange={(e) => setGeneration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  required
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                  Dòng máu
                </label>
                <select
                  value={isBloodline ? 'true' : 'false'}
                  onChange={(e) => setIsBloodline(e.target.value === 'true')}
                  className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="true">Chính tộc</option>
                  <option value="false">Dâu / Rể</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Alive & Years */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
          <div>
            <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
              Tình trạng
            </label>
            <select
              value={isAlive ? 'true' : 'false'}
              onChange={(e) => setIsAlive(e.target.value === 'true')}
              className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="true">🌿 Còn sống</option>
              <option value="false">🪷 Đã khuất</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
              Năm sinh
            </label>
            <input
              type="number"
              placeholder="VD: 1950"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
              Năm mất {!isAlive && '(Nếu đã khuất)'}
            </label>
            <input
              type="number"
              placeholder="VD: 2010"
              value={deathYear}
              disabled={isAlive}
              onChange={(e) => setDeathYear(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Birth place & Occupation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Quê quán / Nơi sinh"
            placeholder="VD: Thôn Kỳ Côi, Hải Phòng"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
          />
          <Input
            label="Nghề nghiệp"
            placeholder="VD: Kỹ sư, Nhà giáo, Hưu trí..."
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
          />
        </div>

        {/* Biography & Memorial Notes */}
        <div>
          <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
            Tiểu sử, chức vụ, nơi an táng & ngày giỗ âm lịch
          </label>
          <textarea
            rows={3}
            placeholder="VD: Giỗ ngày 27/12 âm lịch. Nguyên là trưởng chi 2..."
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-y"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--c-border)]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo thành viên'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default PersonModalForm
