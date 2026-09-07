import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Seo } from '@/components/common/Seo'
import { Card, Pagination, PageSizeSelect, Skeleton, Button, Avatar } from '@/components/ui'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { PersonDetailModal } from '@/features/family-tree/components/PersonDetailModal'
import { PersonModalForm } from '@/features/family-tree/components/PersonModalForm'
import { RelationModalForm } from '@/features/family-tree/components/RelationModalForm'
import { familyService } from '@/services/family.service'
import { useFamily } from '@/hooks/useFamily'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'
import { PATHS } from '@/routes/paths'
import type { PersonDetail } from '@/types'

export default function PersonsPage() {
  const navigate = useNavigate()
  const { currentFamilyId, currentFamily } = useFamily()
  const { toast } = useToast()

  const [persons, setPersons] = useState<PersonDetail[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(12)
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 300)
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterGender, setFilterGender] = useState<string>('all')
  const [filterAlive, setFilterAlive] = useState<string>('all')
  const [filterBloodline, setFilterBloodline] = useState<string>('all')

  // Modals state
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null)
  const [editingPerson, setEditingPerson] = useState<PersonDetail | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [personToDelete, setPersonToDelete] = useState<PersonDetail | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Relation Modal
  const [relationSource, setRelationSource] = useState<PersonDetail | null>(null)
  const [relationMode, setRelationMode] = useState<'PARENT_CHILD' | 'MARRIAGE'>('PARENT_CHILD')
  const [isRelationOpen, setIsRelationOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      let genderParam: 'male' | 'female' | undefined = undefined
      if (filterGender === 'male' || filterGender === 'female') {
        genderParam = filterGender
      }

      let isAliveParam: boolean | undefined = undefined
      if (filterAlive === 'alive') isAliveParam = true
      else if (filterAlive === 'deceased') isAliveParam = false

      let isBloodlineParam: boolean | undefined = undefined
      if (filterBloodline === 'bloodline') isBloodlineParam = true
      else if (filterBloodline === 'inlaw') isBloodlineParam = false

      const res = await familyService.searchPersons({
        family_id: currentFamilyId,
        keyword: debouncedKeyword.trim() || undefined,
        gender: genderParam,
        is_alive: isAliveParam,
        is_bloodline: isBloodlineParam,
        page,
        size,
      })
      setPersons(res.content || [])
      setTotalAmount(res.amount ?? res.totalElements ?? res.content?.length ?? 0)
    } catch (err) {
      console.error('Lỗi nạp danh sách thành viên:', err)
      toast.error('Không thể tải danh sách thành viên')
    } finally {
      setLoading(false)
    }
  }, [currentFamilyId, debouncedKeyword, filterGender, filterAlive, filterBloodline, page, size, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Server-side filtering returns exact matches
  const filteredPersons = persons

  const totalPages = Math.ceil(totalAmount / size) || 1

  const handleDeleteConfirm = async () => {
    if (!personToDelete) return
    setDeleting(true)
    try {
      await familyService.deletePerson(personToDelete.id)
      toast.success(`Đã xóa thành viên "${personToDelete.full_name}"`)
      setPersonToDelete(null)
      loadData()
    } catch (err) {
      console.error('Lỗi xóa thành viên:', err)
      toast.error('Không thể xóa thành viên')
    } finally {
      setDeleting(false)
    }
  }

  const handleLocateOnTree = (personId: number) => {
    navigate(`${PATHS.HOME}?focus=${personId}`)
  }

  return (
    <div className="space-y-6 pb-12">
      <Seo
        title={`Danh sách thành viên – ${currentFamily?.name || 'Gia phả'}`}
        description="Tra cứu, tìm kiếm, chỉnh sửa và quản lý các thành viên trong dòng họ."
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--c-heading)] tracking-tight">
            Danh Sách Thành Viên Dòng Họ
          </h1>
          <p className="text-sm text-[var(--c-muted)] mt-1">
            {currentFamily?.name || 'Dòng họ'} ({currentFamily?.description || 'Phả hệ'}) • Tổng cộng:{' '}
            <strong className="text-amber-700 dark:text-amber-400 font-bold">{totalAmount}</strong> thành viên
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 shadow-sm text-sm"
          >
            <span>➕</span> Thêm thành viên
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--c-surface)] p-4 rounded-2xl border border-[var(--c-border)] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search keyword */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--c-muted-2)]">
              🔍
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm theo họ tên, quê quán..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPage(0)
              }}
              className="w-full pl-10 pr-4 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] placeholder-[var(--c-muted-2)] focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Gender filter */}
            <select
              value={filterGender}
              onChange={(e) => {
                setFilterGender(e.target.value)
                setPage(0)
              }}
              className="px-3 py-1.5 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-xs text-[var(--c-text)] focus:outline-hidden"
            >
              <option value="all">Tất cả giới tính</option>
              <option value="male">Nam giới</option>
              <option value="female">Nữ giới</option>
            </select>

            {/* Alive filter */}
            <select
              value={filterAlive}
              onChange={(e) => {
                setFilterAlive(e.target.value)
                setPage(0)
              }}
              className="px-3 py-1.5 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-xs text-[var(--c-text)] focus:outline-hidden"
            >
              <option value="all">Tất cả tình trạng</option>
              <option value="alive">🌿 Còn sống</option>
              <option value="deceased">🪷 Đã khuất</option>
            </select>

            {/* Bloodline filter */}
            <select
              value={filterBloodline}
              onChange={(e) => {
                setFilterBloodline(e.target.value)
                setPage(0)
              }}
              className="px-3 py-1.5 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-xs text-[var(--c-text)] focus:outline-hidden"
            >
              <option value="all">Tất cả nhánh</option>
              <option value="bloodline">Chính tộc</option>
              <option value="inlaw">Dâu / Rể</option>
            </select>

            {/* Page Size */}
            <PageSizeSelect
              value={size}
              onChange={(newSize) => {
                setSize(newSize)
                setPage(0)
              }}
              options={[12, 24, 48, 96]}
              unit="người"
            />
          </div>
        </div>
      </div>

      {/* Grid of Person Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-10 w-full mt-2" />
            </Card>
          ))}
        </div>
      ) : filteredPersons.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-base text-[var(--c-muted)]">
            {keyword ? `Không tìm thấy thành viên nào phù hợp với từ khóa "${keyword}".` : 'Chưa có thành viên nào trong danh sách.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredPersons.map((p) => {
            const isMale = p.gender?.toLowerCase() === 'male'
            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-amber-500/60 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  {/* Top: Avatar, Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="relative">
                      <Avatar
                        src={p.avatar_url}
                        alt={p.full_name}
                        gender={p.gender}
                        size="lg"
                        shape="circle"
                        ringClassName="border-2 border-amber-300 dark:border-amber-700 shadow-xs"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white dark:border-slate-900 flex items-center justify-center text-[9px] text-white ${
                          isMale ? 'bg-sky-600' : 'bg-rose-600'
                        }`}
                      >
                        {isMale ? '♂' : '♀'}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                        Đời {p.generation}
                      </span>
                      {p.is_bloodline ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Chính tộc
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Dâu / Rể
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name & Life Info */}
                  <h3
                    onClick={() => setSelectedPersonId(p.id)}
                    className="font-bold text-base text-[var(--c-heading)] group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors cursor-pointer truncate"
                    title={p.full_name}
                  >
                    {p.full_name}
                  </h3>

                  <div className="text-xs text-[var(--c-muted)] mt-1 space-y-0.5">
                    <p className="flex items-center gap-1">
                      {p.is_alive ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          🌿 Còn sống {p.birth_year ? `(s. ${p.birth_year})` : ''}
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">
                          🪷 Đã khuất {p.death_year ? `(mất ${p.death_year})` : ''}
                        </span>
                      )}
                    </p>

                    {p.birth_place && (
                      <p className="truncate" title={p.birth_place}>
                        📍 {p.birth_place}
                      </p>
                    )}

                    {p.occupation && (
                      <p className="truncate" title={p.occupation}>
                        💼 {p.occupation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="pt-3 mt-3 border-t border-[var(--c-divider)] flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPersonId(p.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 transition-colors"
                      title="Xem hồ sơ chi tiết"
                    >
                      Chi tiết
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPerson(p)}
                      className="p-1 text-slate-500 hover:text-amber-600 rounded-md hover:bg-[var(--c-surface-2)]"
                      title="Sửa thông tin"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRelationSource(p)
                        setRelationMode('MARRIAGE')
                        setIsRelationOpen(true)
                      }}
                      className="p-1 text-slate-500 hover:text-rose-600 rounded-md hover:bg-[var(--c-surface-2)]"
                      title="Thêm vợ/chồng"
                    >
                      💍
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRelationSource(p)
                        setRelationMode('PARENT_CHILD')
                        setIsRelationOpen(true)
                      }}
                      className="p-1 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-[var(--c-surface-2)]"
                      title="Gán quan hệ cha mẹ/con"
                    >
                      👨‍👧
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleLocateOnTree(p.id)}
                      className="p-1 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-md"
                      title="Xem trên cây gia phả"
                    >
                      🎯
                    </button>
                    <button
                      type="button"
                      onClick={() => setPersonToDelete(p)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Xóa thành viên"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p: number) => setPage(p)}
            totalItems={totalAmount}
            itemLabel="thành viên"
            pageSize={size}
          />
        </div>
      )}

      {/* Person Detail Modal */}
      <PersonDetailModal
        personId={selectedPersonId}
        isOpen={Boolean(selectedPersonId)}
        onClose={() => setSelectedPersonId(null)}
        onFocusPersonOnTree={handleLocateOnTree}
        onPersonUpdated={loadData}
        familyId={currentFamilyId}
      />

      {/* Edit Person Modal */}
      {editingPerson && (
        <PersonModalForm
          isOpen={Boolean(editingPerson)}
          onClose={() => setEditingPerson(null)}
          familyId={currentFamilyId}
          initialData={editingPerson}
          onSuccess={() => {
            loadData()
          }}
        />
      )}

      {/* Add New Person Modal */}
      <PersonModalForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        familyId={currentFamilyId}
        onSuccess={() => {
          loadData()
        }}
      />

      {/* Relation Modal (Marriage / Parent-Child) */}
      {relationSource && (
        <RelationModalForm
          isOpen={isRelationOpen}
          onClose={() => {
            setIsRelationOpen(false)
            setRelationSource(null)
          }}
          familyId={currentFamilyId}
          mode={relationMode}
          sourcePerson={{
            id: relationSource.id,
            full_name: relationSource.full_name,
            generation: relationSource.generation,
          }}
          onSuccess={() => {
            loadData()
          }}
        />
      )}

      {/* Confirm Delete Member Modal */}
      <ConfirmModal
        isOpen={Boolean(personToDelete)}
        onClose={() => setPersonToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Xóa thành viên"
        message={
          <div>
            Bạn có chắc chắn muốn xóa thành viên{' '}
            <strong className="text-rose-600">{personToDelete?.full_name}</strong> khỏi gia phả không?
          </div>
        }
        confirmText="Xác nhận xóa"
      />
    </div>
  )
}
