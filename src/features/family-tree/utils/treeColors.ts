export const GENERATION_COLORS: Record<number, string> = {
  1: '#8b5cf6', // Gốc / Đời 1 - Purple
  2: '#3b82f6', // Đời 2 - Blue
  3: '#06b6d4', // Đời 3 - Cyan
  4: '#10b981', // Đời 4 - Emerald
  5: '#f97316', // Đời 5 - Orange
  6: '#ef4444', // Đời 6 - Red
  7: '#ec4899', // Đời 7 - Pink
  8: '#a855f7', // Đời 8 - Violet
  9: '#f59e0b', // Đời 9 - Amber
  10: '#0ea5e9', // Đời 10 - Sky
  11: '#84cc16', // Đời 11 - Lime
  12: '#d946ef', // Đời 12 - Fuchsia
  13: '#6366f1', // Đời 13 - Indigo
  14: '#14b8a6', // Đời 14 - Teal
  15: '#e11d48', // Đời 15 - Rose
}

export function getGenerationColor(gen: number): string {
  if (gen <= 0) return '#8b5cf6'
  return GENERATION_COLORS[gen] || '#a855f7'
}

export const GENDER_COLORS = {
  male: '#38bdf8', // Sky / Cyan
  female: '#f472b6', // Pink / Rose
  deceased: '#94a3b8', // Gray
  selected: '#facc15', // Gold
}

export type TreeOrientation = 'horizontal' | 'vertical'
