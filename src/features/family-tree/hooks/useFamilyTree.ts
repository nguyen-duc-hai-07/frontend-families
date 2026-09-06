import { useState, useEffect, useCallback, useMemo } from 'react'
import { familyService } from '@/services/family.service'
import type { FamilyInfo, PersonTreeNode } from '@/types'

// Helper to count all nodes recursively
function countTreeNodes(nodes: PersonTreeNode[]): number {
  if (!Array.isArray(nodes)) return 0
  let count = 0
  for (const node of nodes) {
    if (!node) continue
    count += 1
    if (Array.isArray(node.children) && node.children.length > 0) {
      count += countTreeNodes(node.children)
    }
  }
  return count
}

// Helper to find the maximum generation in tree
function findMaxGeneration(nodes: PersonTreeNode[]): number {
  if (!Array.isArray(nodes)) return 1
  let maxGen = 1
  for (const node of nodes) {
    if (!node) continue
    if (node.generation > maxGen) maxGen = node.generation
    if (Array.isArray(node.children) && node.children.length > 0) {
      const childMax = findMaxGeneration(node.children)
      if (childMax > maxGen) maxGen = childMax
    }
  }
  return maxGen
}

// Helper to find ancestor path to a specific node ID
function findAncestorPath(
  nodes: PersonTreeNode[],
  targetId: number,
  currentPath: number[] = []
): number[] | null {
  if (!Array.isArray(nodes)) return null
  for (const node of nodes) {
    if (!node) continue
    if (node.id === targetId) {
      return currentPath
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      const found = findAncestorPath(node.children, targetId, [...currentPath, node.id])
      if (found) return found
    }
  }
  return null
}

// Helper to collect all node IDs with children
function collectParentNodeIds(nodes: PersonTreeNode[]): number[] {
  if (!Array.isArray(nodes)) return []
  const ids: number[] = []
  for (const node of nodes) {
    if (!node) continue
    if (Array.isArray(node.children) && node.children.length > 0) {
      ids.push(node.id)
      ids.push(...collectParentNodeIds(node.children))
    }
  }
  return ids
}

// Flatten all persons in tree for quick lookup & search
function flattenTreeNodes(nodes: PersonTreeNode[]): PersonTreeNode[] {
  if (!Array.isArray(nodes)) return []
  const result: PersonTreeNode[] = []
  function traverse(list: PersonTreeNode[]) {
    if (!Array.isArray(list)) return
    for (const item of list) {
      if (!item) continue
      result.push(item)
      if (Array.isArray(item.children) && item.children.length > 0) {
        traverse(item.children)
      }
    }
  }
  traverse(nodes)
  return result
}

export function useFamilyTree(initialFamilyId = 1) {
  const [familyId, setFamilyId] = useState<number>(initialFamilyId)
  const [familyInfo, setFamilyInfo] = useState<FamilyInfo | null>(null)
  const [treeData, setTreeData] = useState<PersonTreeNode[]>([])
  const [isAll, setIsAll] = useState<boolean>(true)
  const [maxGeneration, setMaxGeneration] = useState<number>(5)
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<number>>(new Set())
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null)
  const [highlightedPersonId, setHighlightedPersonId] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch Family Info
  const fetchFamilyInfo = useCallback(async (fId: number) => {
    try {
      const info = await familyService.getFamilyInfo(fId)
      setFamilyInfo(info)
    } catch (err: any) {
      console.error('Lỗi khi tải thông tin dòng họ:', err)
      setFamilyInfo({
        id: fId,
        name: 'Dòng Họ Nguyễn',
        description: 'Dòng Họ Nguyễn Hữu - Thôn Kỳ Côi',
      })
    }
  }, [])

  // Fetch Tree & Pre-collapse generation >= 3 by default
  const fetchTree = useCallback(
    async (fId: number, all: boolean, maxGen?: number) => {
      setLoading(true)
      setError(null)
      try {
        const data = await familyService.getFamilyTree({
          family_id: fId,
          is_all: all,
          max_generation: all ? undefined : maxGen,
        })
        const cleanData = Array.isArray(data) ? data : []
        setTreeData(cleanData)

        // Nếu xem tất cả thì thu gọn từ đời 3 trở đi để tránh quá tải
        // Nếu người dùng chọn lọc cụ thể N đời thì mở sẵn để thấy trọn vẹn N đời đó!
        const initialCollapsed = new Set<number>()
        function collectCollapsed(list: PersonTreeNode[]) {
          if (!Array.isArray(list)) return
          for (const item of list) {
            if (!item) continue
            const shouldCollapse = all ? item.generation >= 3 : item.generation >= (maxGen || 5)
            if (shouldCollapse && Array.isArray(item.children) && item.children.length > 0) {
              initialCollapsed.add(item.id)
            }
            if (Array.isArray(item.children) && item.children.length > 0) {
              collectCollapsed(item.children)
            }
          }
        }
        collectCollapsed(cleanData)
        setCollapsedNodeIds(initialCollapsed)
      } catch (err: any) {
        console.error('Lỗi khi tải cây phả hệ:', err)
        setError(err?.response?.data?.message || 'Không thể tải cây phả hệ. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    setFamilyId(initialFamilyId)
  }, [initialFamilyId])

  useEffect(() => {
    fetchFamilyInfo(familyId)
  }, [familyId, fetchFamilyInfo])

  useEffect(() => {
    fetchTree(familyId, isAll, maxGeneration)
  }, [familyId, isAll, maxGeneration, fetchTree])

  // Total members & max generation in current tree
  const totalMembers = useMemo(() => countTreeNodes(treeData), [treeData])
  const maxTreeGeneration = useMemo(() => findMaxGeneration(treeData), [treeData])
  const allPersons = useMemo(() => flattenTreeNodes(treeData), [treeData])

  // Toggle Collapse on a Node
  const toggleCollapse = useCallback((nodeId: number) => {
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  // Collapse All branches (keep roots visible)
  const collapseAll = useCallback(() => {
    const parentIds = collectParentNodeIds(treeData)
    setCollapsedNodeIds(new Set(parentIds))
  }, [treeData])

  // Expand All branches
  const expandAll = useCallback(() => {
    setCollapsedNodeIds(new Set())
  }, [])

  // Focus a person by ID:
  // Automatically expands all ancestors so the card is rendered, then sets highlight
  const focusPerson = useCallback(
    (personId: number) => {
      const ancestorPath = findAncestorPath(treeData, personId)
      if (ancestorPath && ancestorPath.length > 0) {
        setCollapsedNodeIds((prev) => {
          const next = new Set(prev)
          for (const ancestorId of ancestorPath) {
            next.delete(ancestorId)
          }
          return next
        })
      }
      setHighlightedPersonId(personId)
    },
    [treeData]
  )

  // Select person to view detail drawer
  const selectPerson = useCallback((personId: number | null) => {
    setSelectedPersonId(personId)
  }, [])

  // Refresh
  const refresh = useCallback(() => {
    fetchFamilyInfo(familyId)
    fetchTree(familyId, isAll, maxGeneration)
  }, [familyId, isAll, maxGeneration, fetchFamilyInfo, fetchTree])

  return {
    familyId,
    setFamilyId,
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
    setHighlightedPersonId,
    focusPerson,
    totalMembers,
    maxTreeGeneration,
    loading,
    error,
    refresh,
  }
}

export default useFamilyTree
