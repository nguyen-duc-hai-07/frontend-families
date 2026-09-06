export type Gender = 'male' | 'female'

export type MarriageStatus = 'MARRIED' | 'DIVORCED' | 'WIDOWED'

export interface FamilyInfo {
  id: number
  name: string
  description: string
}

export interface FamilyRequest {
  name: string
  description?: string
}

export interface PersonTreeNode {
  id: number
  full_name: string
  gender: Gender
  generation: number
  avatar_url: string | null
  children: PersonTreeNode[]
}

export interface SpouseDetail {
  marriage_id: number
  id: number
  full_name: string
  gender: Gender
  avatar_url: string | null
  birth_year: number | null
  death_year: number | null
  is_alive: boolean
  status: MarriageStatus
}

export interface PersonDetail {
  id: number
  family_id: number
  full_name: string
  gender: Gender
  birth_year: number | null
  death_year: number | null
  birth_place: string | null
  occupation: string | null
  biography: string | null
  avatar_url: string | null
  generation: number
  is_alive: boolean
  is_bloodline: boolean
  spouses: SpouseDetail[]
}

export interface PersonRequest {
  family_id: number
  full_name: string
  gender?: Gender
  birth_year?: number | null
  death_year?: number | null
  birth_place?: string | null
  occupation?: string | null
  biography?: string | null
  avatar_url?: string | null
  generation?: number
  is_alive?: boolean
  is_bloodline?: boolean
}

export interface ParentRequest {
  family_id: number
  parent_id: number
  child_id: number
}

export interface ParentResponse {
  id: number
  family_id: number
  parent_id: number
  child_id: number
}

export interface MarriageRequest {
  family_id: number
  person_a_id: number
  person_b_id: number
  status?: MarriageStatus
}

export interface MarriageResponse {
  id: number
  family_id: number
  person_a_id: number
  person_b_id: number
  status: MarriageStatus
}

export interface FamilyTreeQueryParams {
  family_id: number
  is_all?: boolean
  max_generation?: number
}

export interface PersonSearchQueryParams {
  family_id: number
  keyword?: string
  gender?: Gender
  is_alive?: boolean
  is_bloodline?: boolean
  page?: number
  size?: number
}
