import React, { useEffect, useState, useCallback } from 'react'
import { familyService } from '@/services/family.service'
import type { PersonDetail, SpouseDetail } from '@/types'
import { Modal, Button } from '@/components/ui'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { PersonModalForm } from './PersonModalForm'
import { RelationModalForm } from './RelationModalForm'
import { useToast } from '@/hooks/useToast'

interface PersonDetailModalProps {
  personId: number | null
  isOpen: boolean
  onClose: () => void
  onFocusPersonOnTree: (id: number) => void
  onPersonUpdated?: () => void
  familyId: number
}

function getMarriageStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case 'MARRIED':
      return {
        label: 'Đã kết hôn',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      }
    case 'WIDOWED':
      return {
        label: 'Đã góa',
        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      }
    case 'DIVORCED':
      return {
        label: 'Đã ly hôn',
        color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
      }
    default:
      return {
        label: status || 'Phối ngẫu',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      }
  }
}

export function PersonDetailModal({
  personId,
  isOpen,
  onClose,
  onFocusPersonOnTree,
  onPersonUpdated,
  familyId,
}: PersonDetailModalProps) {
  const { toast } = useToast()
  const [person, setPerson] = useState<PersonDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Sub-modal states
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddChildOpen, setIsAddChildOpen] = useState(false)
  const [isRelationOpen, setIsRelationOpen] = useState(false)
  const [relationMode, setRelationMode] = useState<'PARENT_CHILD' | 'MARRIAGE'>('PARENT_CHILD')

  // Delete person state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Delete marriage state
  const [marriageToDelete, setMarriageToDelete] = useState<SpouseDetail | null>(null)
  const [deletingMarriage, setDeletingMarriage] = useState(false)

  const loadPerson = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await familyService.getPersonDetail(id)
      setPerson(data)
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết người:', err)
      setError('Không thể tải thông tin thành viên này.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!personId || !isOpen) {
      setPerson(null)
      return
    }
    loadPerson(personId)
  }, [personId, isOpen, loadPerson])

  const handleSelectSpouse = (spouseId: number) => {
    loadPerson(spouseId)
  }

  const handleLocateOnTree = () => {
    if (person) {
      onFocusPersonOnTree(person.id)
      onClose()
    }
  }

  // Delete Member Handler
  const handleDeletePerson = async () => {
    if (!person) return
    setDeleting(true)
    try {
      await familyService.deletePerson(person.id)
      toast.success(`Đã xóa thành viên "${person.full_name}"`)
      setIsDeleteOpen(false)
      onClose()
      onPersonUpdated?.()
    } catch (err: any) {
      console.error('Lỗi xóa người:', err)
      toast.error('Không thể xóa thành viên này. Vui lòng thử lại.')
    } finally {
      setDeleting(false)
    }
  }

  // Delete Marriage Handler
  const handleDeleteMarriage = async () => {
    if (!marriageToDelete) return
    setDeletingMarriage(true)
    try {
      await familyService.deleteMarriage(marriageToDelete.marriage_id)
      toast.success(`Đã hủy liên kết hôn nhân với "${marriageToDelete.full_name}"`)
      setMarriageToDelete(null)
      if (person) {
        await loadPerson(person.id)
      }
      onPersonUpdated?.()
    } catch (err) {
      console.error('Lỗi hủy hôn nhân:', err)
      toast.error('Không thể hủy liên kết hôn nhân.')
    } finally {
      setDeletingMarriage(false)
    }
  }

  if (!isOpen) return null

  const isMale = person?.gender?.toLowerCase() === 'male'

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={person ? `Thông tin thành viên: ${person.full_name}` : 'Chi tiết thành viên'}
        maxWidth="lg"
      >
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-9 h-9 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Đang tải thông tin chi tiết...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-rose-600 space-y-3">
            <p>{error}</p>
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
          </div>
        ) : person ? (
          <div className="space-y-5">
            {/* Header Profile Summary */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700/60">
              {/* Avatar Large */}
              <div className="relative flex-shrink-0">
                {person.avatar_url ? (
                  <img
                    src={person.avatar_url}
                    alt={person.full_name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                  />
                ) : (
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-md ${
                      isMale
                        ? 'bg-gradient-to-tr from-sky-600 to-indigo-700'
                        : 'bg-gradient-to-tr from-rose-500 to-amber-600'
                    }`}
                  >
                    {person.full_name?.charAt(0) || 'N'}
                  </div>
                )}

                <span
                  className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs ${
                    isMale ? 'bg-sky-600' : 'bg-rose-600'
                  }`}
                >
                  {isMale ? 'Nam' : 'Nữ'}
                </span>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {person.full_name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                    Đời thứ {person.generation}
                  </span>
                  {person.is_bloodline ? (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      Chính tộc
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Dâu / Rể
                    </span>
                  )}
                </div>

                {/* Status Alive / Deceased */}
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs">
                  {person.is_alive ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Còn sống
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                      <span>🪷</span>
                      Đã khuất {person.death_year ? `(Năm ${person.death_year})` : ''}
                      {person.birth_year && person.death_year
                        ? ` • Hưởng thọ ${person.death_year - person.birth_year} tuổi`
                        : ''}
                    </span>
                  )}
                </div>

                {/* Action Bar inside Header (Edit, Delete, Add relations) */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-800/60 text-amber-900 dark:text-amber-200 transition-colors flex items-center gap-1"
                  >
                    <span>✏️</span> Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddChildOpen(true)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-900 dark:text-sky-200 transition-colors flex items-center gap-1"
                  >
                    <span>👶</span> Thêm con
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRelationMode('MARRIAGE')
                      setIsRelationOpen(true)
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-900 dark:text-rose-200 transition-colors flex items-center gap-1"
                  >
                    <span>💍</span> Thêm phối ngẫu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRelationMode('PARENT_CHILD')
                      setIsRelationOpen(true)
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 transition-colors flex items-center gap-1"
                  >
                    <span>👨‍👧</span> Gán cha/mẹ
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    <span>🗑️</span> Xóa
                  </button>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Năm sinh
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {person.birth_year || 'Chưa cập nhật'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Năm mất
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {person.death_year || (person.is_alive ? 'Còn sống' : 'Chưa cập nhật')}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Quê quán / Nơi sinh
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {person.birth_place || 'Chưa cập nhật'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Nghề nghiệp
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {person.occupation || 'Chưa cập nhật'}
                </span>
              </div>
            </div>

            {/* Biography & Memorial Notes */}
            {person.biography && (
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                  <span>📜</span> Tiểu sử & Ngày giỗ
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {person.biography}
                </p>
              </div>
            )}

            {/* Spouses (Vợ / Chồng) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>💍</span> Quan hệ Phu thê / Vợ chồng ({person.spouses?.length || 0})
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setRelationMode('MARRIAGE')
                    setIsRelationOpen(true)
                  }}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 hover:underline"
                >
                  + Kết nối thêm
                </button>
              </div>

              {person.spouses && person.spouses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {person.spouses.map((spouse: SpouseDetail) => {
                    const statusInfo = getMarriageStatusLabel(spouse.status)
                    return (
                      <div
                        key={spouse.marriage_id || spouse.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 hover:border-amber-500 dark:hover:border-amber-500 transition-all flex items-center justify-between gap-2 group shadow-2xs"
                      >
                        <div
                          onClick={() => handleSelectSpouse(spouse.id)}
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                              spouse.gender?.toLowerCase() === 'female'
                                ? 'bg-gradient-to-tr from-rose-500 to-amber-600'
                                : 'bg-gradient-to-tr from-sky-600 to-indigo-600'
                            }`}
                          >
                            {spouse.full_name?.charAt(0) || 'V'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                              {spouse.full_name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {spouse.birth_year ? `(s. ${spouse.birth_year})` : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Remove marriage relation button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setMarriageToDelete(spouse)
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Hủy liên kết hôn nhân này"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Chưa có thông tin hôn phối. Bấm nút "+ Kết nối thêm" để gán vợ/chồng.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="secondary"
                onClick={handleLocateOnTree}
                className="flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <span>🎯</span> Định vị trên cây
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={onClose} className="text-xs sm:text-sm">
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Edit Person Modal */}
      {person && (
        <PersonModalForm
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          familyId={familyId}
          initialData={person}
          onSuccess={(updated) => {
            setPerson(updated)
            onPersonUpdated?.()
          }}
        />
      )}

      {/* Add Child Modal */}
      {person && (
        <PersonModalForm
          isOpen={isAddChildOpen}
          onClose={() => setIsAddChildOpen(false)}
          familyId={familyId}
          prefill={{
            generation: (person.generation || 1) + 1,
            parent_id: person.id,
            parent_name: person.full_name,
            is_bloodline: true,
          }}
          onSuccess={() => {
            onPersonUpdated?.()
          }}
        />
      )}

      {/* Relation Modal (Marriage or Parent-Child) */}
      {person && (
        <RelationModalForm
          isOpen={isRelationOpen}
          onClose={() => setIsRelationOpen(false)}
          familyId={familyId}
          mode={relationMode}
          sourcePerson={{
            id: person.id,
            full_name: person.full_name,
            generation: person.generation,
          }}
          onSuccess={() => {
            loadPerson(person.id)
            onPersonUpdated?.()
          }}
        />
      )}

      {/* Confirm Delete Member Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeletePerson}
        loading={deleting}
        title="Xóa thành viên"
        message={
          <div>
            Bạn có chắc chắn muốn xóa thành viên{' '}
            <strong className="text-rose-600">{person?.full_name}</strong> khỏi gia phả không?
            Hành động này sẽ xóa các mối liên kết cha con và hôn phối liên quan.
          </div>
        }
        confirmText="Xác nhận xóa"
      />

      {/* Confirm Delete Marriage Modal */}
      <ConfirmModal
        isOpen={Boolean(marriageToDelete)}
        onClose={() => setMarriageToDelete(null)}
        onConfirm={handleDeleteMarriage}
        loading={deletingMarriage}
        title="Hủy liên kết hôn phối"
        message={
          <div>
            Bạn có chắc muốn hủy mối quan hệ vợ chồng giữa{' '}
            <strong>{person?.full_name}</strong> và{' '}
            <strong className="text-rose-600">{marriageToDelete?.full_name}</strong> không?
            (Thông tin cá nhân của 2 người vẫn được giữ nguyên).
          </div>
        }
        confirmText="Hủy liên kết"
      />
    </>
  )
}

export default PersonDetailModal
