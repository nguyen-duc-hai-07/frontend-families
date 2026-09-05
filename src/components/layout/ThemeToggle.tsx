import { useTheme } from '@/hooks/useTheme'
import { IconSun, IconMoon } from '@/components/ui/icons'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { actualTheme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Chuyển sang chế độ ${actualTheme === 'dark' ? 'sáng' : 'tối'}`}
      title={`Chuyển sang chế độ ${actualTheme === 'dark' ? 'sáng' : 'tối'}`}
      className={`p-2 rounded-xl text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface-2)] transition-colors ${className}`.trim()}
    >
      {actualTheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
    </button>
  )
}
