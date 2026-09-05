import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PATHS } from '@/routes/paths'
import { IconUser, IconDashboard, IconLogOut } from '@/components/ui/icons'

export function UserDropdown() {
  const { user, isAdmin, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const updateAvatar = () => {
      if (!user) {
        setAvatarUrl('')
        return
      }
      const candidates = [
        user.id ? `user_avatar_${user.id}` : null,
        user.username ? `user_avatar_${user.username}` : null,
      ].filter(Boolean) as string[]

      for (const key of candidates) {
        const val = localStorage.getItem(key)
        if (val) {
          setAvatarUrl(val)
          return
        }
      }
      setAvatarUrl((user as any)?.avatarUrl || (user as any)?.avatar_url || '')
    }
    updateAvatar()

    window.addEventListener('avatar-changed', updateAvatar)
    return () => window.removeEventListener('avatar-changed', updateAvatar)
  }, [user?.id, user?.username, user])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    navigate(PATHS.HOME)
  }

  const displayName = (user?.displayName || user?.username || 'Người dùng').trim()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover border border-amber-500"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
          {displayName}
        </span>
        <span className="text-[10px] text-slate-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400">Đăng nhập với tư cách</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {displayName}
            </p>
            {isAdmin && (
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 rounded-full">
                ADMINISTRATOR
              </span>
            )}
          </div>

          <Link
            to={PATHS.PROFILE}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <IconUser size={16} className="text-slate-500" />
            <span>Thông tin cá nhân</span>
          </Link>

          {isAdmin && (
            <Link
              to={PATHS.ADMIN}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <IconDashboard size={16} className="text-amber-600" />
              <span>Trang quản trị (Admin)</span>
            </Link>
          )}

          <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <IconLogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
