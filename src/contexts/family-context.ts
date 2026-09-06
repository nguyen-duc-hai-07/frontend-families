import { createContext } from 'react'
import type { FamilyInfo } from '@/types'

export interface FamilyContextType {
  currentFamilyId: number
  currentFamily: FamilyInfo | null
  setCurrentFamilyId: (id: number) => void
  recentFamilies: { id: number; name: string }[]
  addRecentFamily: (id: number, name: string) => void
  refreshFamily: () => Promise<void>
  loading: boolean
}

export const FamilyContext = createContext<FamilyContextType | null>(null)
