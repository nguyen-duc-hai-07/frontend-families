import React, { useRef, useCallback, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Seo } from '@/components/common/Seo'
import { useFamily } from '@/hooks/useFamily'
import { useFamilyTree } from '../hooks/useFamilyTree'
import { TreeToolbar, type TreeViewMode } from '../components/TreeToolbar'
import { D3TreeCanvas } from '../components/D3TreeCanvas'
import { TreeAccordionView } from '../components/TreeAccordionView'
import { PersonDetailDrawer } from '../components/PersonDetailDrawer'
import { PersonModalForm } from '../components/PersonModalForm'
import { RelationModalForm } from '../components/RelationModalForm'
import { TreeImportExportModal } from '../components/TreeImportExportModal'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { familyService } from '@/services/family.service'
import { useToast } from '@/hooks/useToast'
import type { PersonDetail, PersonTreeNode } from '@/types'

// Helper to find person by ID in tree hierarchy
function findPersonInTree(nodes: PersonTreeNode[], id: number): PersonTreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children && n.children.length > 0) {
      const found = findPersonInTree(n.children, id)
      if (found) return found
    }
  }
  return null
}

export default function FamilyTreePage() {
  const [searchParams] = useSearchParams()
  const focusParam = searchParams.get('focus')

  const { currentFamilyId, currentFamily, refreshFamily } = useFamily()
  const { toast } = useToast()

  const {
    familyId,
    familyInfo,
    treeData,
    allPersons,
    isAll,
    setIsAll,
    maxGeneration,
    setMaxGeneration,
    collapsedNodeIds,
    toggleCollapse,
    collapseAll,
    expandAll,
    selectedPersonId,
    selectPerson,
    highlightedPersonId,
    focusPerson,
    totalMembers,
    maxTreeGeneration,
    loading,
    error,
    refresh,
  } = useFamilyTree(currentFamilyId)

  const handleChangeGenerationFilter = useCallback(
    (all: boolean, maxGen?: number) => {
      setIsAll(all)
      if (typeof maxGen === 'number') {
        setMaxGeneration(maxGen)
      }
    },
    [setIsAll, setMaxGeneration]
  )

  // Camera pan to Cụ Khởi Tổ trigger when clicking Mở hết / Thu gọn
  const [centerRootTrigger, setCenterRootTrigger] = useState(0)

  const handleCollapseAll = useCallback(() => {
    collapseAll()
    setCenterRootTrigger((prev) => prev + 1)
  }, [collapseAll])

  const handleExpandAll = useCallback(() => {
    expandAll()
    setCenterRootTrigger((prev) => prev + 1)
  }, [expandAll])

  // 3 View Modes: 'top-down' (PC), 'left-to-right' (Timeline), 'accordion' (Mobile)
  // Default to accordion if screen is mobile (<768px), otherwise top-down
  const [viewMode, setViewMode] = useState<TreeViewMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'accordion'
    }
    return 'top-down'
  })

  // Modals state
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false)
  const [addPrefill, setAddPrefill] = useState<{
    generation?: number
    parent_id?: number
    parent_name?: string
    is_bloodline?: boolean
  } | null>(null)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [personToEdit, setPersonToEdit] = useState<PersonDetail | null>(null)

  const [isAddSpouseOpen, setIsAddSpouseOpen] = useState(false)
  const [spouseSourcePerson, setSpouseSourcePerson] = useState<PersonDetail | null>(null)

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [personToDelete, setPersonToDelete] = useState<PersonDetail | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [isImportExportOpen, setIsImportExportOpen] = useState(false)

  // Center node function ref exposed by D3TreeCanvas
  const centerNodeFnRef = useRef<((nodeId: number) => void) | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const handleCenterNodeRef = useCallback((fn: (nodeId: number) => void) => {
    centerNodeFnRef.current = fn
  }, [])

  // Handle focusing person
  const handleFocusPerson = useCallback(
    (personId: number) => {
      focusPerson(personId)
      if (viewMode === 'accordion') {
        // Scroll to node in accordion
        setTimeout(() => {
          const el = document.getElementById(`accordion-node-${personId}`)
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 120)
      } else if (centerNodeFnRef.current) {
        setTimeout(() => {
          centerNodeFnRef.current?.(personId)
        }, 80)
      }
    },
    [focusPerson, viewMode]
  )

  // URL query parameter ?focus=ID listener
  useEffect(() => {
    if (focusParam) {
      const pid = parseInt(focusParam, 10)
      if (!isNaN(pid) && pid > 0) {
        handleFocusPerson(pid)
      }
    }
  }, [focusParam, handleFocusPerson])

  // Refresh entire tree and family
  const handleRefreshAll = useCallback(() => {
    refresh()
    refreshFamily()
  }, [refresh, refreshFamily])

  // 1. Action: + Gốc (Thêm Cụ Tổ)
  const handleAddRootPerson = () => {
    setAddPrefill({
      generation: 1,
      is_bloodline: true,
    })
    setIsAddPersonOpen(true)
  }

  // 2. Action: + Con (Thêm con cho người đang chọn)
  const handleAddChildPerson = () => {
    if (!selectedPersonId) {
      toast.info('Vui lòng chọn một thành viên trước để thêm con.')
      return
    }
    const node = findPersonInTree(treeData, selectedPersonId)
    setAddPrefill({
      parent_id: selectedPersonId,
      parent_name: node?.full_name || `ID #${selectedPersonId}`,
      generation: node ? node.generation + 1 : 2,
      is_bloodline: true,
    })
    setIsAddPersonOpen(true)
  }

  // 3. Action: ✏️ Sửa
  const handleEditPerson = (person: PersonDetail) => {
    setPersonToEdit(person)
    setIsEditOpen(true)
  }

  // 4. Action: 🗑️ Xóa thành viên
  const handleDeletePerson = (person: PersonDetail) => {
    setPersonToDelete(person)
    setIsDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!personToDelete) return
    setDeleting(true)
    try {
      await familyService.deletePerson(personToDelete.id)
      toast.success(`Đã xóa "${personToDelete.full_name}" khỏi cây phả hệ!`)
      setIsDeleteConfirmOpen(false)
      setPersonToDelete(null)
      selectPerson(null)
      handleRefreshAll()
    } catch (err: any) {
      console.error('Lỗi khi xóa thành viên:', err)
      const msg = err.response?.data?.data?.message || err.message || 'Không thể xóa thành viên.'
      toast.error(msg)
    } finally {
      setDeleting(false)
    }
  }

  // 5. Action: + Thêm Hôn Phối
  const handleAddSpouse = (person: PersonDetail) => {
    setSpouseSourcePerson(person)
    setIsAddSpouseOpen(true)
  }

  const activeFamily = familyInfo || currentFamily

  return (
    <div className="relative flex flex-col flex-1 w-full h-full min-h-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Seo
        title={`${activeFamily?.description || activeFamily?.name || 'Phả Hệ Dòng Họ'} – Cây Gia Phả`}
        description="Sơ đồ cây phả hệ dòng họ trực quan 3 chế độ xem: Cây dọc top-down, cây ngang left-to-right, và danh bạ accordion tối ưu mobile."
      />

      {/* TOP UNIFIED TOOLBAR */}
      <TreeToolbar
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        allPersons={allPersons}
        totalMembers={totalMembers}
        maxTreeGeneration={maxTreeGeneration}
        isAll={isAll}
        maxGeneration={maxGeneration}
        onChangeGenerationFilter={handleChangeGenerationFilter}
        onFocusPerson={handleFocusPerson}
        onAddRootPerson={handleAddRootPerson}
        onAddChildPerson={selectedPersonId ? handleAddChildPerson : undefined}
        selectedPersonId={selectedPersonId}
        highlightedPersonId={highlightedPersonId}
        onClearHighlight={() => focusPerson(null)}
        onCollapseAll={handleCollapseAll}
        onExpandAll={handleExpandAll}
        onExport={() => setIsImportExportOpen(true)}
        onRefresh={handleRefreshAll}
        loading={loading}
      />

      {/* ERROR BANNER IF ANY */}
      {error && (
        <div className="p-3 mx-4 mt-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between shadow-xs">
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={handleRefreshAll}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold text-xs transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* MAIN VIEW AREA (3 DẠNG THIẾT KẾ CÂY GIA PHẢ) */}
      <div className="flex-1 relative w-full h-full min-h-0 overflow-hidden flex flex-col">
        {viewMode === 'top-down' ? (
          /* Dạng 1: Cây phả hệ phân nhánh dọc từ trên xuống (Top-Down Tree) ⭐ Khuyên dùng PC */
          <D3TreeCanvas
            treeData={treeData}
            orientation="top-down"
            collapsedNodeIds={collapsedNodeIds}
            selectedPersonId={selectedPersonId}
            highlightedPersonId={highlightedPersonId}
            centerRootTrigger={centerRootTrigger}
            loading={loading}
            onToggleCollapse={toggleCollapse}
            onSelectPerson={selectPerson}
            onCollapseAll={handleCollapseAll}
            onExpandAll={handleExpandAll}
            onCenterNodeRef={handleCenterNodeRef}
            svgRef={svgRef}
          />
        ) : viewMode === 'left-to-right' ? (
          /* Dạng 2: Cây ngang từ trái sang phải (Left-to-Right Tree) */
          <D3TreeCanvas
            treeData={treeData}
            orientation="left-to-right"
            collapsedNodeIds={collapsedNodeIds}
            selectedPersonId={selectedPersonId}
            highlightedPersonId={highlightedPersonId}
            centerRootTrigger={centerRootTrigger}
            loading={loading}
            onToggleCollapse={toggleCollapse}
            onSelectPerson={selectPerson}
            onCollapseAll={handleCollapseAll}
            onExpandAll={handleExpandAll}
            onCenterNodeRef={handleCenterNodeRef}
            svgRef={svgRef}
          />
        ) : (
          /* Dạng 3: Dạng Danh bạ phân cấp (Collapsible List / Accordion) ⭐ Tối ưu Mobile */
          <TreeAccordionView
            treeData={treeData}
            collapsedNodeIds={collapsedNodeIds}
            selectedPersonId={selectedPersonId}
            centerRootTrigger={centerRootTrigger}
            onToggleCollapse={toggleCollapse}
            onSelectPerson={selectPerson}
            onCollapseAll={handleCollapseAll}
            onExpandAll={handleExpandAll}
          />
        )}
      </div>

      {/* RIGHT DRAWER: Khi click vào thẻ, mở drawer gọi API GET /api/v1/persons/{id} */}
      <PersonDetailDrawer
        personId={selectedPersonId}
        isOpen={Boolean(selectedPersonId)}
        onClose={() => selectPerson(null)}
        onFocusOnTree={handleFocusPerson}
        onEditPerson={handleEditPerson}
        onAddChild={(person) => {
          setAddPrefill({
            parent_id: person.id,
            parent_name: person.full_name,
            generation: (person.generation || 1) + 1,
            is_bloodline: true,
          })
          setIsAddPersonOpen(true)
        }}
        onAddSpouse={handleAddSpouse}
        onDeletePerson={handleDeletePerson}
        onPersonUpdated={handleRefreshAll}
      />

      {/* MODAL: Thêm người mới (+ Gốc hoặc + Con) */}
      <PersonModalForm
        isOpen={isAddPersonOpen}
        onClose={() => {
          setIsAddPersonOpen(false)
          setAddPrefill(null)
        }}
        familyId={familyId}
        prefill={addPrefill || undefined}
        onSuccess={() => {
          handleRefreshAll()
        }}
      />

      {/* MODAL: Sửa thông tin thành viên */}
      {personToEdit && (
        <PersonModalForm
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false)
            setPersonToEdit(null)
          }}
          familyId={familyId}
          initialData={personToEdit}
          onSuccess={() => {
            handleRefreshAll()
          }}
        />
      )}

      {/* MODAL: Thêm Hôn Phối */}
      {spouseSourcePerson && (
        <RelationModalForm
          isOpen={isAddSpouseOpen}
          onClose={() => {
            setIsAddSpouseOpen(false)
            setSpouseSourcePerson(null)
          }}
          familyId={familyId}
          sourcePerson={spouseSourcePerson}
          mode="MARRIAGE"
          onSuccess={() => {
            handleRefreshAll()
          }}
        />
      )}

      {/* MODAL: Xác nhận xóa người */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false)
          setPersonToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa thành viên"
        message={`Bạn có chắc chắn muốn xóa "${personToDelete?.full_name || 'thành viên này'}" khỏi cây phả hệ? Hành động này sẽ xóa các mối quan hệ liên quan.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        variant="danger"
        loading={deleting}
      />

      {/* MODAL: Xuất / Nhập cây phả hệ */}
      <TreeImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        treeData={treeData}
        familyName={activeFamily?.name}
        svgRef={svgRef}
      />
    </div>
  )
}
