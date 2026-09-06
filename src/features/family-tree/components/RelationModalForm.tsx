import React, { useState, useEffect } from 'react'
import { Modal, Button } from '@/components/ui'
import { familyService } from '@/services/family.service'
import { useToast } from '@/hooks/useToast'
import type { MarriageStatus, PersonDetail } from '@/types'

interface RelationModalFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  familyId: number
  mode: 'PARENT_CHILD' | 'MARRIAGE'
  sourcePerson?: { id: number; full_name?: string; fullName?: string; generation?: number } | null
}

export function RelationModalForm({
  isOpen,
  onClose,
  onSuccess,
  familyId,
  mode,
  sourcePerson,
}: RelationModalFormProps) {
  const { toast } = useToast()

  // Target Person Search
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<PersonDetail[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedTargetPerson, setSelectedTargetPerson] = useState<PersonDetail | null>(null)

  // Marriage status
  const [marriageStatus, setMarriageStatus] = useState<MarriageStatus>('MARRIED')

  // Is source person the parent or child?
  const [sourceRole, setSourceRole] = useState<'PARENT' | 'CHILD'>('PARENT')

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setSearchKeyword('')
      setSearchResults([])
      setSelectedTargetPerson(null)
      setMarriageStatus('MARRIED')
      setSourceRole('PARENT')
      setErrorMsg(null)
      return
    }
  }, [isOpen])

  // Handle Search members in family
  useEffect(() => {
    if (!searchKeyword.trim() || searchKeyword.trim().length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await familyService.searchPersons({
          family_id: familyId,
          keyword: searchKeyword.trim(),
          page: 0,
          size: 15,
        })
        // Filter out sourcePerson from results
        const filtered = (res.content || []).filter((p) => p.id !== sourcePerson?.id)
        setSearchResults(filtered)
      } catch (err) {
        console.error('Lỗi tìm kiếm thành viên:', err)
      } finally {
        setSearching(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchKeyword, familyId, sourcePerson?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTargetPerson) {
      setErrorMsg('Vui lòng tìm và chọn đối tượng cần liên kết quan hệ')
      return
    }

    if (!sourcePerson) {
      setErrorMsg('Thiếu thông tin người gốc để liên kết')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      if (mode === 'PARENT_CHILD') {
        const parentId = sourceRole === 'PARENT' ? sourcePerson.id : selectedTargetPerson.id
        const childId = sourceRole === 'PARENT' ? selectedTargetPerson.id : sourcePerson.id

        await familyService.createParentRelation({
          family_id: familyId,
          parent_id: parentId,
          child_id: childId,
        })

        toast.success('Gán quan hệ Cha/Mẹ - Con thành công!')
      } else {
        await familyService.createMarriage({
          family_id: familyId,
          person_a_id: sourcePerson.id,
          person_b_id: selectedTargetPerson.id,
          status: marriageStatus,
        })

        toast.success('Gán quan hệ hôn phối thành công!')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Lỗi lưu quan hệ:', err)
      const msg =
        err.response?.data?.data?.message ||
        err.response?.data?.message ||
        err.message ||
        'Không thể lưu quan hệ. Vui lòng kiểm tra lại.'
      setErrorMsg(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const isParentChild = mode === 'PARENT_CHILD'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isParentChild ? 'Gán quan hệ Cha/Mẹ - Con' : 'Gán quan hệ Hôn phối (Phu thê)'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Source Person Banner */}
        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 flex items-center justify-between text-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Thành viên gốc:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {sourcePerson?.full_name || sourcePerson?.fullName || `ID: #${sourcePerson?.id}`}
            </span>
            {sourcePerson?.generation && (
              <span className="ml-2 px-2 py-0.5 rounded text-xs bg-amber-200 dark:bg-amber-900/60 font-semibold text-amber-900 dark:text-amber-200">
                Đời {sourcePerson.generation}
              </span>
            )}
          </div>
          <span className="text-2xl">
            {isParentChild ? '👨‍👧' : '💍'}
          </span>
        </div>

        {/* Parent-child role selection */}
        {isParentChild && (
          <div>
            <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
              Vai trò của {sourcePerson?.full_name || sourcePerson?.fullName}:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSourceRole('PARENT')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  sourceRole === 'PARENT'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-[var(--c-surface)] text-[var(--c-text)] border-[var(--c-border)] hover:bg-[var(--c-surface-2)]'
                }`}
              >
                Là Cha / Mẹ (Gán con vào)
              </button>
              <button
                type="button"
                onClick={() => setSourceRole('CHILD')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  sourceRole === 'CHILD'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-[var(--c-surface)] text-[var(--c-text)] border-[var(--c-border)] hover:bg-[var(--c-surface-2)]'
                }`}
              >
                Là Con (Gán cha/mẹ vào)
              </button>
            </div>
          </div>
        )}

        {/* Marriage Status Selection */}
        {!isParentChild && (
          <div>
            <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
              Tình trạng hôn nhân:
            </label>
            <select
              value={marriageStatus}
              onChange={(e) => setMarriageStatus(e.target.value as MarriageStatus)}
              className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="MARRIED">Đã kết hôn (MARRIED)</option>
              <option value="WIDOWED">Đã góa (WIDOWED)</option>
              <option value="DIVORCED">Đã ly hôn (DIVORCED)</option>
            </select>
          </div>
        )}

        {/* Search for Target Person */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[var(--c-muted)]">
            {isParentChild
              ? sourceRole === 'PARENT'
                ? 'Tìm người con cần liên kết:'
                : 'Tìm người cha/mẹ cần liên kết:'
              : 'Tìm người phối ngẫu (vợ/chồng) cần liên kết:'}
          </label>

          <input
            type="text"
            placeholder="Gõ tên thành viên để tìm kiếm (tối thiểu 2 ký tự)..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />

          {searching && (
            <p className="text-xs text-slate-500 animate-pulse">Đang tìm kiếm thành viên...</p>
          )}

          {/* Search Dropdown / List */}
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1 p-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              {searchResults.map((person) => {
                const isSelected = selectedTargetPerson?.id === person.id
                return (
                  <div
                    key={person.id}
                    onClick={() => {
                      setSelectedTargetPerson(person)
                      setSearchResults([])
                    }}
                    className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'bg-amber-600 text-white font-semibold'
                        : 'hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{person.gender?.toLowerCase() === 'female' ? '👩' : '👨'}</span>
                      <span className="font-semibold">{person.full_name}</span>
                      <span className="opacity-70">
                        (Đời {person.generation} {person.birth_year ? `• s.${person.birth_year}` : ''})
                      </span>
                    </div>
                    <span>{isSelected ? '✓ Đã chọn' : 'Chọn'}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Selected Target Banner */}
          {selectedTargetPerson && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-medium">Đã chọn: </span>
                <strong>{selectedTargetPerson.full_name}</strong> (Đời {selectedTargetPerson.generation})
              </div>
              <button
                type="button"
                onClick={() => setSelectedTargetPerson(null)}
                className="text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              >
                Đổi người khác
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--c-border)]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={!selectedTargetPerson}
          >
            Lưu quan hệ
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default RelationModalForm
