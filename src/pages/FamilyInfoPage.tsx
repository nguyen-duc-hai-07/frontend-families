import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Seo } from '@/components/common/Seo'
import { Card, Button, Input, Textarea } from '@/components/ui'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { familyService } from '@/services/family.service'
import { useFamily } from '@/hooks/useFamily'
import { useToast } from '@/hooks/useToast'
import { PATHS } from '@/routes/paths'

export default function FamilyInfoPage() {
  const navigate = useNavigate()
  const { currentFamilyId, currentFamily, setCurrentFamilyId, recentFamilies, addRecentFamily, refreshFamily } =
    useFamily()
  const { toast } = useToast()

  // Edit current family state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  // Switch family state
  const [targetIdInput, setTargetIdInput] = useState(String(currentFamilyId))

  // Create new family state
  const [newFamilyName, setNewFamilyName] = useState('')
  const [newFamilyDesc, setNewFamilyDesc] = useState('')
  const [creating, setCreating] = useState(false)

  // Delete family state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (currentFamily) {
      setName(currentFamily.name || '')
      setDescription(currentFamily.description || '')
      setTargetIdInput(String(currentFamily.id))
    }
  }, [currentFamily])

  const handleUpdateFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Tên dòng họ không được để trống')
      return
    }

    setSaving(true)
    try {
      const updated = await familyService.updateFamily(currentFamilyId, {
        name: name.trim(),
        description: description.trim() || undefined,
      })
      toast.success(`Cập nhật thông tin dòng họ "${updated.name}" thành công!`)
      addRecentFamily(updated.id, updated.name)
      await refreshFamily()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Không thể cập nhật thông tin dòng họ')
    } finally {
      setSaving(false)
    }
  }

  const handleSwitchFamily = async (idToSwitch: number) => {
    if (idToSwitch <= 0) return
    setCurrentFamilyId(idToSwitch)
    toast.success(`Đã chuyển sang dòng họ ID #${idToSwitch}`)
  }

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFamilyName.trim()) {
      toast.error('Vui lòng nhập tên dòng họ')
      return
    }

    setCreating(true)
    try {
      const created = await familyService.createFamily({
        name: newFamilyName.trim(),
        description: newFamilyDesc.trim() || undefined,
      })
      toast.success(`Tạo mới thành công dòng họ "${created.name}" (Mã ID: #${created.id})!`)
      addRecentFamily(created.id, created.name)
      setCurrentFamilyId(created.id)
      setNewFamilyName('')
      setNewFamilyDesc('')
      navigate(PATHS.HOME)
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Không thể tạo dòng họ mới')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteFamily = async () => {
    setDeleting(true)
    try {
      await familyService.deleteFamily(currentFamilyId)
      toast.success(`Đã xóa dòng họ #${currentFamilyId}`)
      setIsDeleteOpen(false)
      // Switch back to default 1
      setCurrentFamilyId(1)
      navigate(PATHS.HOME)
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Không thể xóa dòng họ')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <Seo
        title="Quản lý Dòng Họ & Thông Tin Phả Hệ"
        description="Quản lý thông tin dòng họ, lịch sử phát triển, chuyển đổi hoặc tạo mới các dòng họ."
      />

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--c-heading)] tracking-tight">
          Quản Lý Dòng Họ & Thông Tin Phả Hệ
        </h1>
        <p className="text-sm text-[var(--c-muted)] mt-1">
          Chỉnh sửa thông tin dòng họ hiện tại, tạo mới dòng họ hoặc chuyển đổi giữa các dòng họ trong hệ thống.
        </p>
      </div>

      {/* 1. Quick Switch Family */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--c-heading)] flex items-center gap-2">
          <span>🔄</span> Chuyển đổi Dòng họ đang làm việc
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--c-muted)]">Mã ID Dòng họ:</span>
            <input
              type="number"
              min={1}
              value={targetIdInput}
              onChange={(e) => setTargetIdInput(e.target.value)}
              className="w-24 px-3 py-1.5 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm font-bold text-[var(--c-text)] text-center focus:outline-hidden"
            />
          </div>

          <Button
            variant="secondary"
            onClick={() => handleSwitchFamily(Number(targetIdInput))}
            disabled={!targetIdInput || Number(targetIdInput) === currentFamilyId}
          >
            Chuyển dòng họ
          </Button>
        </div>

        {/* Recent Families */}
        {recentFamilies.length > 0 && (
          <div className="pt-3 border-t border-[var(--c-divider)]">
            <span className="text-xs text-[var(--c-muted)] block mb-2 font-medium">
              Các dòng họ đã mở gần đây:
            </span>
            <div className="flex flex-wrap gap-2">
              {recentFamilies.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setTargetIdInput(String(f.id))
                    handleSwitchFamily(f.id)
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                    f.id === currentFamilyId
                      ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-400 text-amber-900 dark:text-amber-200'
                      : 'bg-[var(--c-surface-2)] border-[var(--c-border)] text-[var(--c-text)] hover:border-amber-400'
                  }`}
                >
                  #{f.id} - {f.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 2. Edit Current Family Info */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--c-heading)] flex items-center gap-2">
            <span>🏛️</span> Thông tin Dòng họ hiện tại (ID #{currentFamilyId})
          </h2>

          <Button
            variant="danger"
            onClick={() => setIsDeleteOpen(true)}
            className="text-xs px-2.5 py-1"
          >
            🗑️ Xóa dòng họ này
          </Button>
        </div>

        <form onSubmit={handleUpdateFamily} className="space-y-4">
          <Input
            label="Tên dòng họ *"
            placeholder="VD: Dòng họ Nguyễn Bá"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Mô tả / Lịch sử nguồn gốc dòng họ"
            placeholder="VD: Dòng họ Nguyễn Bá khởi tổ tại thôn Kỳ Côi, tính đến nay đã truyền được nhiều thế hệ..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={saving}>
              Lưu thay đổi dòng họ
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Create New Family */}
      <Card className="p-6 space-y-4 border-dashed border-2">
        <h2 className="text-lg font-bold text-[var(--c-heading)] flex items-center gap-2">
          <span>➕</span> Tạo mới một Dòng họ khác
        </h2>
        <p className="text-xs text-[var(--c-muted)]">
          Tạo mới sẽ sinh mã dòng họ riêng biệt trên hệ thống backend, sẵn sàng để bắt đầu thêm Cụ Khởi Tổ và các nhánh con cháu.
        </p>

        <form onSubmit={handleCreateFamily} className="space-y-4">
          <Input
            label="Tên dòng họ mới *"
            placeholder="VD: Dòng họ Trần Văn"
            value={newFamilyName}
            onChange={(e) => setNewFamilyName(e.target.value)}
            required
          />

          <Textarea
            label="Mô tả / Ghi chú"
            placeholder="VD: Gốc tích tại Hải Dương..."
            value={newFamilyDesc}
            onChange={(e) => setNewFamilyDesc(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={creating}>
              Tạo dòng họ mới
            </Button>
          </div>
        </form>
      </Card>

      {/* Confirm Delete Family Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteFamily}
        loading={deleting}
        title="Xác nhận xóa dòng họ"
        message={
          <div>
            Bạn có chắc chắn muốn xóa dòng họ{' '}
            <strong className="text-rose-600">{currentFamily?.name || `#${currentFamilyId}`}</strong>{' '}
            không? Toàn bộ các nhánh cây phả hệ thuộc dòng họ này sẽ không còn hiển thị.
          </div>
        }
        confirmText="Xác nhận xóa"
      />
    </div>
  )
}
