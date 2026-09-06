import { useContext } from 'react'
import { FamilyContext, type FamilyContextType } from '@/contexts/family-context'

export function useFamily(): FamilyContextType {
  const context = useContext(FamilyContext)
  if (!context) {
    throw new Error('useFamily phải được sử dụng bên trong <FamilyProvider>')
  }
  return context
}

export default useFamily
