import React, { useState, useMemo, memo } from 'react'
import type { PersonTreeNode } from '@/types'
import { toRoman } from '../utils/treeRoman'

interface TreeAccordionViewProps {
  treeData: PersonTreeNode[]
  collapsedNodeIds: Set<number>
  selectedPersonId: number | null
  onToggleCollapse: (id: number) => void
  onSelectPerson: (id: number) => void
  onCollapseAll: () => void
  onExpandAll: () => void
}

interface AccordionItemProps {
  node: PersonTreeNode
  collapsedNodeIds: Set<number>
  selectedPersonId: number | null
  searchQuery: string
  matchedIds: Set<number>
  onToggleCollapse: (id: number) => void
  onSelectPerson: (id: number) => void
}

// Highlight search query in name
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>
  const q = query.trim().toLowerCase()
  const idx = text.toLowerCase().indexOf(q)
  if (idx === -1) return <span>{text}</span>

  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + q.length)
  const after = text.slice(idx + q.length)

  return (
    <span>
      {before}
      <mark className="bg-amber-200 dark:bg-amber-800 text-slate-900 dark:text-white rounded-xs px-0.5 font-bold">
        {match}
      </mark>
      {after}
    </span>
  )
}

const AccordionItem = memo(function AccordionItem({
  node,
  collapsedNodeIds,
  selectedPersonId,
  searchQuery,
  matchedIds,
  onToggleCollapse,
  onSelectPerson,
}: AccordionItemProps) {
  const [imgError, setImgError] = useState(false)
  const hasChildren = Boolean(node.children && node.children.length > 0)
  const isCollapsed = collapsedNodeIds.has(node.id)
  const isSelected = selectedPersonId === node.id
  const isFemale = node.gender?.toLowerCase() === 'female'
  const isMatched = searchQuery.trim() !== '' && matchedIds.has(node.id)

  const firstLetter =
    node.full_name?.trim().split(' ').pop()?.charAt(0) || node.full_name?.charAt(0) || '?'

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      onToggleCollapse(node.id)
    }
  }

  const handleRowClick = () => {
    onSelectPerson(node.id)
  }

  return (
    <li className="list-none select-none">
      <div
        id={`accordion-node-${node.id}`}
        onClick={handleRowClick}
        className={`group flex items-center justify-between gap-2.5 p-2.5 sm:p-3 my-1 rounded-xl border transition-all duration-150 cursor-pointer ${
          isSelected
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400 dark:ring-amber-500 shadow-md'
            : isMatched
            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60'
            : isFemale
            ? 'bg-gradient-to-r from-rose-50/60 to-white dark:from-rose-950/20 dark:to-slate-900/60 border-rose-100 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700/60 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            : 'bg-gradient-to-r from-sky-50/60 to-white dark:from-sky-950/20 dark:to-slate-900/60 border-sky-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700/60 hover:bg-sky-50 dark:hover:bg-sky-950/30'
        }`}
      >
        {/* Left: Expand toggle, Avatar, Generation Badge, Name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Toggle button */}
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={!hasChildren}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors flex-shrink-0 ${
              hasChildren
                ? 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer font-bold'
                : 'text-slate-300 dark:text-slate-700 cursor-default'
            }`}
            title={
              hasChildren
                ? isCollapsed
                  ? `Mở rộng ${node.children.length} người con`
                  : 'Thu gọn nhánh con'
                : 'Không có con'
            }
          >
            {hasChildren ? (
              <span className={`inline-block transition-transform duration-150 ${isCollapsed ? '' : 'rotate-90'}`}>
                ▶
              </span>
            ) : (
              <span>•</span>
            )}
          </button>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {node.avatar_url && !imgError ? (
              <img
                src={node.avatar_url}
                alt={node.full_name}
                onError={() => setImgError(true)}
                className={`w-9 h-9 rounded-full object-cover shadow-2xs border ${
                  isFemale ? 'border-rose-400' : 'border-sky-400'
                }`}
              />
            ) : (
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs text-white ${
                  isFemale
                    ? 'bg-gradient-to-tr from-rose-400 to-pink-500'
                    : 'bg-gradient-to-tr from-sky-500 to-blue-600'
                }`}
              >
                {firstLetter}
              </div>
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8.5px] font-bold text-white shadow-2xs ${
                isFemale ? 'bg-rose-500' : 'bg-sky-500'
              }`}
            >
              {isFemale ? '♀' : '♂'}
            </span>
          </div>

          {/* Generation Badge */}
          <span
            className={`px-1.5 py-0.5 rounded text-[10.5px] font-bold flex-shrink-0 ${
              node.generation === 1
                ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700'
                : isFemale
                ? 'bg-rose-100/80 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/40'
                : 'bg-sky-100/80 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/40'
            }`}
          >
            {node.generation === 1 ? '👑 Đời I (Cụ Tổ)' : `Đời ${toRoman(node.generation)}`}
          </span>

          {/* Full Name */}
          <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            <HighlightText text={node.full_name} query={searchQuery} />
          </span>
        </div>

        {/* Right: Child count badge & View detail action */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasChildren && (
            <span
              onClick={handleToggleClick}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                isCollapsed
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
              title="Nhấn để mở / thu gọn nhánh con"
            >
              {isCollapsed ? `＋ ${node.children.length} con` : `${node.children.length} con`}
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelectPerson(node.id)
            }}
            className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/60 text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 transition-colors flex items-center gap-0.5"
            title="Xem hồ sơ chi tiết"
          >
            <span>Hồ sơ</span>
            <span className="text-[10px]">›</span>
          </button>
        </div>
      </div>

      {/* Children Subtree */}
      {hasChildren && !isCollapsed && (
        <ul className="pl-4 sm:pl-7 border-l-2 border-slate-200 dark:border-slate-800 ml-3.5 sm:ml-4 space-y-0.5">
          {node.children.map((child) => (
            <AccordionItem
              key={child.id}
              node={child}
              collapsedNodeIds={collapsedNodeIds}
              selectedPersonId={selectedPersonId}
              searchQuery={searchQuery}
              matchedIds={matchedIds}
              onToggleCollapse={onToggleCollapse}
              onSelectPerson={onSelectPerson}
            />
          ))}
        </ul>
      )}
    </li>
  )
})

export function TreeAccordionView({
  treeData,
  collapsedNodeIds,
  selectedPersonId,
  onToggleCollapse,
  onSelectPerson,
  onCollapseAll,
  onExpandAll,
}: TreeAccordionViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Find all nodes matching search query
  const matchedIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return new Set<number>()
    const set = new Set<number>()
    function traverse(nodes: PersonTreeNode[]) {
      for (const n of nodes) {
        if (n.full_name?.toLowerCase().includes(q)) {
          set.add(n.id)
        }
        if (n.children && n.children.length > 0) {
          traverse(n.children)
        }
      }
    }
    traverse(treeData)
    return set
  }, [treeData, searchQuery])

  // Count total persons
  const totalCount = useMemo(() => {
    let count = 0
    function traverse(nodes: PersonTreeNode[]) {
      for (const n of nodes) {
        count++
        if (n.children && n.children.length > 0) {
          traverse(n.children)
        }
      }
    }
    traverse(treeData)
    return count
  }, [treeData])

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      {/* Top Filter and Actions Bar */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Tìm nhanh thành viên theo tên..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            👤
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {searchQuery
              ? `Tìm thấy ${matchedIds.size} kết quả`
              : `${totalCount} thành viên`}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onExpandAll}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Mở rộng tất cả"
            >
              ⊞ Mở hết
            </button>
            <button
              type="button"
              onClick={onCollapseAll}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Thu gọn tất cả"
            >
              ⊟ Thu gọn
            </button>
          </div>
        </div>
      </div>

      {/* Accordion Tree List Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {treeData.length > 0 ? (
          <ul className="space-y-1 max-w-4xl mx-auto p-0 m-0">
            {treeData.map((rootNode) => (
              <AccordionItem
                key={rootNode.id}
                node={rootNode}
                collapsedNodeIds={collapsedNodeIds}
                selectedPersonId={selectedPersonId}
                searchQuery={searchQuery}
                matchedIds={matchedIds}
                onToggleCollapse={onToggleCollapse}
                onSelectPerson={onSelectPerson}
              />
            ))}
          </ul>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-center">
            <span className="text-4xl mb-2">🌱</span>
            <p className="font-semibold text-sm">Chưa có dữ liệu cây gia phả</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TreeAccordionView
