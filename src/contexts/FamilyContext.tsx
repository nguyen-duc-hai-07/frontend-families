import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { FamilyContext } from './family-context'
import { familyService } from '@/services/family.service'
import type { FamilyInfo } from '@/types'

const LOCAL_STORAGE_FAMILY_ID = 'active_family_id'
const LOCAL_STORAGE_RECENT_FAMILIES = 'recent_families'

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [currentFamilyId, setFamilyIdState] = useState<number>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_FAMILY_ID)
    return saved ? Number(saved) : 1
  })

  const [recentFamilies, setRecentFamilies] = useState<{ id: number; name: string }[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RECENT_FAMILIES)
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return [{ id: 1, name: 'Gia đình họ Nguyễn' }]
  })

  const [currentFamily, setCurrentFamily] = useState<FamilyInfo | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const addRecentFamily = useCallback((id: number, name: string) => {
    setRecentFamilies((prev) => {
      const filtered = prev.filter((f) => f.id !== id)
      const next = [{ id, name }, ...filtered].slice(0, 10)
      localStorage.setItem(LOCAL_STORAGE_RECENT_FAMILIES, JSON.stringify(next))
      return next
    })
  }, [])

  const fetchFamily = useCallback(
    async (id: number) => {
      setLoading(true)
      try {
        const info = await familyService.getFamilyInfo(id)
        setCurrentFamily(info)
        addRecentFamily(info.id, info.name || `Dòng họ #${info.id}`)
      } catch (err) {
        console.error('Lỗi khi tải thông tin dòng họ:', err)
        // Fallback info if API error
        setCurrentFamily({
          id,
          name: id === 1 ? 'Gia đình họ Nguyễn' : `Dòng họ #${id}`,
          description: id === 1 ? 'Dòng Họ Nguyễn Hữu - Thôn Kỳ Côi' : '',
        })
      } finally {
        setLoading(false)
      }
    },
    [addRecentFamily],
  )

  const setCurrentFamilyId = useCallback(
    (id: number) => {
      localStorage.setItem(LOCAL_STORAGE_FAMILY_ID, String(id))
      setFamilyIdState(id)
    },
    [],
  )

  useEffect(() => {
    fetchFamily(currentFamilyId)
  }, [currentFamilyId, fetchFamily])

  const refreshFamily = useCallback(async () => {
    await fetchFamily(currentFamilyId)
  }, [currentFamilyId, fetchFamily])

  return (
    <FamilyContext.Provider
      value={{
        currentFamilyId,
        currentFamily,
        setCurrentFamilyId,
        recentFamilies,
        addRecentFamily,
        refreshFamily,
        loading,
      }}
    >
      {children}
    </FamilyContext.Provider>
  )
}
