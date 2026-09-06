export const PATHS = {
  HOME: '/',
  FAMILY_TREE: '/family-tree',
  PERSONS: '/persons',
  PERSON_DETAIL: '/persons/:id',
  RELATIONS: '/relations',
  FAMILY_INFO: '/family-info',
} as const

/**
 * Remove Vietnamese accents and convert string to URL-safe slug.
 */
export function slugify(input: string): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
}

export const toPersonDetail = (id: number | string) => `/persons/${id}`
