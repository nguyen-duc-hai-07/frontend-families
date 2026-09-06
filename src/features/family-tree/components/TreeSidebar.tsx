import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { familyService } from '@/services/family.service'
import type { FamilyInfo, PersonDetail, PersonTreeNode } from '@/types'
import { PATHS } from '@/routes/paths'
import type { TreeOrientation } from '../utils/treeColors'

interface TreeSidebarProps {
  familyInfo?: FamilyInfo | null
  selectedPersonId: number | null
  orientation: TreeOrientation
  treeData: PersonTreeNode[]
  onAddRootPerson: () => void
  onAddChildPerson: () => void
  onEditPerson: () => void
  onDeletePerson: () => void
  onChangeOrientation: (orientation: TreeOrientation) => void
  onCollapseAll: () => void
  onExpandAll: () => void
  onExport: () => void
  onImport: () => void
  onSelectPerson: (id: number | null) => void
  onFocusPerson: (id: number) => void
  onAddSpouse: () => void
}

export function TreeSidebar({
  familyInfo,
  selectedPersonId,
  orientation,
  treeData: _treeData,
  onAddRootPerson,
  onAddChildPerson,
  onEditPerson,
  onDeletePerson,
  onChangeOrientation,
  onCollapseAll,
  onExpandAll,
  onExport,
  onImport,
  onSelectPerson,
  onFocusPerson,
  onAddSpouse,
}: TreeSidebarProps) {
  const [personDetail, setPersonDetail] = useState<PersonDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Fetch person detail whenever selectedPersonId changes
  useEffect(() => {
    if (!selectedPersonId) {
      setPersonDetail(null)
      return
    }

    let isMounted = true
    setLoadingDetail(true)

    familyService
      .getPersonDetail(selectedPersonId)
      .then((data) => {
        if (isMounted) {
          setPersonDetail(data)
        }
      })
      .catch((err) => {
        console.error('Lỗi lấy chi tiết người:', err)
      })
      .finally(() => {
        if (isMounted) {
          setLoadingDetail(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedPersonId])

  const isMale = personDetail?.gender === 'female' ? false : true

  return (
    <aside className="w-full md:w-80 lg:w-[340px] flex-shrink-0 bg-slate-950/95 text-slate-200 border-r border-slate-800/80 flex flex-col h-full overflow-hidden shadow-2xl z-20">
      {/* 1. Header with Family Title */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🌲</span>
          <div className="min-w-0">
            <h1 className="font-bold text-base text-amber-400 truncate leading-tight">
              {familyInfo?.name || 'Gia Phả Dòng Họ'}
            </h1>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {familyInfo?.description || 'Phả hệ trực quan'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Action Buttons Toolbar (Row 1, Row 2, Row 3) */}
      <div className="p-3 border-b border-slate-800/80 space-y-2 bg-slate-900/30">
        {/* Row 1: + Gốc | + Con | ✏️ Sửa | 🗑️ | ↔ Ngang */}
        <div className="grid grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={onAddRootPerson}
            className="flex items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
            title="Thêm Cụ Tổ / Người Gốc"
          >
            + Gốc
          </button>
          <button
            type="button"
            onClick={onAddChildPerson}
            disabled={!selectedPersonId}
            className="flex items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-30 disabled:cursor-not-allowed"
            title={selectedPersonId ? 'Thêm con cho người đang chọn' : 'Chọn 1 người trên cây để thêm con'}
          >
            + Con
          </button>
          <button
            type="button"
            onClick={onEditPerson}
            disabled={!selectedPersonId}
            className="flex items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-30 disabled:cursor-not-allowed"
            title="Sửa thông tin người đang chọn"
          >
            ✏️ Sửa
          </button>
          <button
            type="button"
            onClick={onDeletePerson}
            disabled={!selectedPersonId}
            className="flex items-center justify-center py-1.5 px-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-30 disabled:cursor-not-allowed"
            title="Xóa người đang chọn"
          >
            🗑️
          </button>
          <button
            type="button"
            onClick={() => onChangeOrientation('horizontal')}
            className={`flex items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg font-semibold text-xs transition-colors shadow-xs border ${
              orientation === 'horizontal'
                ? 'bg-indigo-600 text-white border-indigo-500 ring-1 ring-indigo-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Hiển thị cây dạng Ngang (Cụ tổ bên trái sang phải)"
          >
            ↔ Ngang
          </button>
        </div>

        {/* Row 2: ↕ Dọc | ⊟ Thu gọn | ⊞ Mở rộng | 📤 Xuất */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => onChangeOrientation('vertical')}
            className={`flex items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg font-semibold text-xs transition-colors shadow-xs border ${
              orientation === 'vertical'
                ? 'bg-indigo-600 text-white border-indigo-500 ring-1 ring-indigo-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Hiển thị cây dạng Dọc (Từ trên xuống dưới)"
          >
            ↕ Dọc
          </button>
          <button
            type="button"
            onClick={onCollapseAll}
            className="flex items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors shadow-xs border border-slate-700"
            title="Thu gọn tất cả các nhánh"
          >
            ⊟ Thu gọn
          </button>
          <button
            type="button"
            onClick={onExpandAll}
            className="flex items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors shadow-xs border border-slate-700"
            title="Mở rộng toàn bộ cây"
          >
            ⊞ Mở rộng
          </button>
          <button
            type="button"
            onClick={onExport}
            className="flex items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors shadow-xs"
            title="Xuất ảnh cây gia phả"
          >
            📤 Xuất
          </button>
        </div>

        {/* Row 3: 📁 Nhập */}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onImport}
            className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs transition-colors shadow-xs border border-slate-700"
            title="Nhập dữ liệu phả hệ"
          >
            <span>📁</span> Nhập dữ liệu
          </button>
        </div>
      </div>

      {/* 3. Detail View / Empty State */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedPersonId ? (
          /* Empty State: Silhouette avatar and instruction as in screenshot */
          <div className="h-full flex flex-col items-center justify-center text-center py-12 px-2 text-slate-400 select-none">
            <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-5xl text-slate-600 mb-4 shadow-inner">
              👤
            </div>
            <p className="font-semibold text-sm text-slate-200">
              Bấm vào một người để xem chi tiết
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Double-click để thu gọn / mở rộng nhánh
            </p>
          </div>
        ) : loadingDetail ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Đang tải thông tin...</span>
          </div>
        ) : personDetail ? (
          /* Detailed Person Card */
          <div className="space-y-4">
            {/* Top Profile Box */}
            <div className="flex items-start gap-3.5 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {personDetail.avatar_url ? (
                  <img
                    src={personDetail.avatar_url}
                    alt={personDetail.full_name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                  />
                ) : (
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-md ${
                      isMale
                        ? 'bg-gradient-to-tr from-sky-600 to-indigo-700'
                        : 'bg-gradient-to-tr from-rose-500 to-amber-600'
                    }`}
                  >
                    {personDetail.full_name.charAt(0) || 'N'}
                  </div>
                )}
                <span
                  className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white shadow-xs ${
                    isMale ? 'bg-sky-600' : 'bg-rose-600'
                  }`}
                >
                  {isMale ? '♂' : '♀'}
                </span>
              </div>

              {/* Name & Quick Badges */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h2 className="font-bold text-base text-slate-100 truncate">
                    {personDetail.full_name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => onSelectPerson(null)}
                    className="text-slate-500 hover:text-slate-300 text-xs px-1"
                    title="Đóng chi tiết"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Đời thứ {personDetail.generation}
                  </span>
                  {personDetail.is_bloodline ? (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Chính tộc
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-400">
                      Dâu / Rể
                    </span>
                  )}
                  {personDetail.is_alive ? (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                      🌿 Còn sống
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-400">
                      🪷 Đã khuất
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions for Selected Person */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onFocusPerson(personDetail.id)}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <span>🎯</span> Định vị
              </button>
              <Link
                to={PATHS.PERSON_DETAIL.replace(':id', String(personDetail.id))}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <span>📄</span> Hồ sơ đầy đủ
              </Link>
            </div>

            {/* Bio Info Section */}
            <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Năm sinh:</span>
                <span className="font-semibold text-slate-200">
                  {personDetail.birth_year ? `${personDetail.birth_year}` : 'Chưa rõ'}
                </span>
              </div>
              {!personDetail.is_alive && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Năm mất:</span>
                  <span className="font-semibold text-slate-200">
                    {personDetail.death_year ? `${personDetail.death_year}` : 'Chưa rõ'}
                  </span>
                </div>
              )}
              {personDetail.birth_place && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Quê quán:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[180px]">
                    {personDetail.birth_place}
                  </span>
                </div>
              )}
              {personDetail.occupation && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Nghề nghiệp:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[180px]">
                    {personDetail.occupation}
                  </span>
                </div>
              )}
              {personDetail.biography && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Tiểu sử:</span>
                  <p className="text-slate-300 italic text-[11px] leading-relaxed bg-slate-950/60 p-2 rounded-lg">
                    {personDetail.biography}
                  </p>
                </div>
              )}
            </div>

            {/* Spouses List */}
            <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
                  <span>💍</span> Hôn phối ({personDetail.spouses?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={onAddSpouse}
                  className="text-[11px] text-amber-400 hover:underline font-semibold"
                >
                  + Thêm
                </button>
              </div>

              {personDetail.spouses && personDetail.spouses.length > 0 ? (
                <div className="space-y-1.5">
                  {personDetail.spouses.map((spouse) => (
                    <div
                      key={spouse.id}
                      onClick={() => onFocusPerson(spouse.id)}
                      className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>{spouse.gender === 'female' ? '👩' : '👨'}</span>
                        <span className="font-semibold text-slate-200">
                          {spouse.full_name}
                        </span>
                        {spouse.birth_year && (
                          <span className="text-slate-500 text-[10px]">
                            ({spouse.birth_year})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-amber-400 hover:underline">
                        Định vị
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic py-1">
                  Chưa có thông tin hôn phối.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
