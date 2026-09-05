import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/user.service'
import { fileService } from '@/services/file.service'
import { tokenStorage } from '@/services/tokenStorage'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/utils/error'
import { decodeJwt } from '@/utils/jwt'
import type { UserResponse } from '@/types'
import { PATHS } from '@/routes/paths'
import { Seo } from '@/components/common/Seo'
import { Button, Input, Modal, Badge } from '@/components/ui'
import { IconUser, IconMail, IconLock, IconEye, IconEyeOff } from '@/components/ui/icons'

export default function ProfilePage() {
  const { user, isAdmin, logout } = useAuth()
  const { toast } = useToast()

  const [userInfo, setUserInfo] = useState<UserResponse | null>(null)

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showUrlModal, setShowUrlModal] = useState(false)
  const [customAvatarUrl, setCustomAvatarUrl] = useState('')
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Edit Profile Modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Change Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const userIdentifier = user?.id ? String(user.id) : user?.username || ''

  const saveAvatar = (url: string) => {
    setAvatarUrl(url)
    if (user?.id) localStorage.setItem(`user_avatar_${user.id}`, url)
    if (user?.username) localStorage.setItem(`user_avatar_${user.username}`, url)
    if (userIdentifier) localStorage.setItem(`user_avatar_${userIdentifier}`, url)
    window.dispatchEvent(new Event('avatar-changed'))
  }

  useEffect(() => {
    const loadSavedAvatar = () => {
      if (!user) return ''
      const candidates = [
        user.id ? `user_avatar_${user.id}` : null,
        user.username ? `user_avatar_${user.username}` : null,
        userIdentifier ? `user_avatar_${userIdentifier}` : null,
      ].filter(Boolean) as string[]

      for (const key of candidates) {
        const val = localStorage.getItem(key)
        if (val) return val
      }
      return (user as any)?.avatarUrl || (user as any)?.avatar_url || ''
    }

    setAvatarUrl(loadSavedAvatar() || '')
  }, [user?.id, user?.username, userIdentifier, user])

  useEffect(() => {
    async function fetchUserData() {
      if (!user?.username && !user?.id) return
      try {
        let currentUserId = user?.id

        if (!currentUserId) {
          const token = tokenStorage.getAccessToken()
          if (token) {
            const claims = decodeJwt(token) as any
            const tId = claims?.userId ?? claims?.user_id ?? claims?.id
            if (tId) currentUserId = Number(tId)
          }
        }

        if (currentUserId) {
          try {
            const u = await userService.getUserById(currentUserId)
            if (u) {
              setUserInfo(u)
              setEditUsername(u.username || '')
              setEditEmail(u.email || '')
              setEditPhone(u.phoneNumber || u.phone_number || u.phone || '')
            }
          } catch {
            // Backend might not support /users/{id} for non-admin
            setEditUsername(user?.username || '')
            setEditEmail(user?.email || '')
            setEditPhone(user?.phoneNumber || '')
          }
        } else {
          setEditUsername(user?.username || '')
          setEditEmail(user?.email || '')
          setEditPhone(user?.phoneNumber || '')
        }
      } catch (err) {
        console.error('Lỗi tải thông tin người dùng:', err)
      }
    }
    fetchUserData()
  }, [user?.id, user?.username, user?.email, user?.phoneNumber])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WebP...).', 'error')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast('Dung lượng ảnh tối đa là 10MB.', 'error')
      return
    }

    setUploadingAvatar(true)
    try {
      try {
        const res = await fileService.uploadFile(file)
        saveAvatar(res.url)
        toast('Cập nhật ảnh đại diện thành công!', 'success')
      } catch {
        // Fallback to local base64
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            saveAvatar(reader.result)
            toast('Đã lưu ảnh đại diện (cục bộ)!', 'success')
          }
        }
        reader.readAsDataURL(file)
      }
    } catch (err) {
      toast(`Lỗi khi tải ảnh: ${getErrorMessage(err)}`, 'error')
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const handleSaveCustomUrl = (e: FormEvent) => {
    e.preventDefault()
    const cleanUrl = customAvatarUrl.trim()
    if (!cleanUrl) return
    saveAvatar(cleanUrl)
    toast('Đã cập nhật ảnh đại diện!', 'success')
    setShowUrlModal(false)
    setCustomAvatarUrl('')
  }

  const handleRemoveAvatar = () => {
    setAvatarUrl('')
    if (user?.id) localStorage.removeItem(`user_avatar_${user.id}`)
    if (user?.username) localStorage.removeItem(`user_avatar_${user.username}`)
    if (userIdentifier) localStorage.removeItem(`user_avatar_${userIdentifier}`)
    window.dispatchEvent(new Event('avatar-changed'))
    toast('Đã gỡ ảnh đại diện.', 'info')
  }

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault()
    const targetId = user?.id || userInfo?.id
    if (!targetId) {
      toast('Không tìm thấy ID người dùng để cập nhật.', 'error')
      return
    }

    setSavingProfile(true)
    try {
      const updated = await userService.updateUser(targetId, {
        username: editUsername.trim() || undefined,
        email: editEmail.trim() || undefined,
        phoneNumber: editPhone.trim() || undefined,
      })
      setUserInfo(updated)
      toast('Cập nhật thông tin thành công!', 'success')
      setShowEditModal(false)
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!newPassword) {
      toast('Vui lòng nhập mật khẩu mới.', 'error')
      return
    }
    if (newPassword.length < 8) {
      toast('Mật khẩu mới phải có ít nhất 8 ký tự.', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      toast('Mật khẩu xác nhận không trùng khớp.', 'error')
      return
    }

    const targetId = user?.id || userInfo?.id
    if (!targetId) {
      toast('Không tìm thấy ID người dùng.', 'error')
      return
    }

    setSavingPassword(true)
    try {
      await userService.updateUser(targetId, {
        password: newPassword,
      })
      toast('Đổi mật khẩu thành công!', 'success')
      setShowPasswordModal(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  const email = userInfo?.email || user?.email || 'Chưa cập nhật'
  const phone = userInfo?.phoneNumber || userInfo?.phone_number || user?.phoneNumber || 'Chưa cập nhật'
  const username = userInfo?.username || user?.username || 'user'
  const role = userInfo?.role || user?.role || 'USER'

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <Seo title="Hồ sơ cá nhân" noindex />

      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          {/* Avatar with upload */}
          <div className="relative group flex-shrink-0">
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="w-24 h-24 rounded-full object-cover border-2 border-amber-500 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-bold text-3xl shadow-md border-2 border-amber-400">
                {username.charAt(0).toUpperCase()}
              </div>
            )}

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer"
              title="Đổi ảnh đại diện"
            >
              {uploadingAvatar ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-base">📷</span>
                  <span className="text-[11px] mt-0.5">Đổi ảnh</span>
                </>
              )}
            </button>
          </div>

          {/* User Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--c-heading)]">
                {username}
              </h1>
              <Badge variant={role === 'ADMIN' ? 'warning' : 'primary'}>
                {role}
              </Badge>
            </div>

            <p className="text-sm text-[var(--c-muted)] flex items-center gap-2">
              <IconMail size={14} />
              <span>{email}</span>
            </p>

            {phone !== 'Chưa cập nhật' && (
              <p className="text-xs text-[var(--c-muted)]">
                📞 {phone}
              </p>
            )}

            {/* Avatar buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>📷</span> {uploadingAvatar ? 'Đang tải...' : 'Tải ảnh từ máy'}
              </button>
              <button
                type="button"
                onClick={() => setShowUrlModal(true)}
                className="px-3 py-1.5 bg-[var(--c-surface-2)] hover:bg-[var(--c-surface-3)] text-[var(--c-text)] text-xs font-semibold rounded-lg border border-[var(--c-border)] transition-colors inline-flex items-center gap-1.5"
              >
                <span>🔗</span> Nhập link ảnh
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-2.5 py-1.5 text-xs text-rose-600 hover:underline font-medium"
                >
                  Gỡ ảnh
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex sm:flex-col items-stretch gap-2 w-full sm:w-auto">
          {isAdmin && (
            <Link to={PATHS.ADMIN}>
              <Button variant="primary" className="w-full">
                Admin Dashboard →
              </Button>
            </Link>
          )}
          <Button variant="danger" onClick={logout} className="w-full">
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Account Details & Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Card */}
        <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--c-divider)] pb-3">
            <h2 className="text-lg font-bold text-[var(--c-heading)] flex items-center gap-2">
              <IconUser size={18} className="text-amber-600" />
              <span>Thông tin tài khoản</span>
            </h2>
            <Button variant="secondary" onClick={() => setShowEditModal(true)}>
              Chỉnh sửa
            </Button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-[var(--c-divider)]">
              <span className="text-[var(--c-muted)]">Tên đăng nhập:</span>
              <span className="font-semibold text-[var(--c-text)]">{username}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--c-divider)]">
              <span className="text-[var(--c-muted)]">Địa chỉ Email:</span>
              <span className="font-semibold text-[var(--c-text)]">{email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--c-divider)]">
              <span className="text-[var(--c-muted)]">Số điện thoại:</span>
              <span className="font-semibold text-[var(--c-text)]">{phone}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--c-muted)]">Vai trò (Role):</span>
              <span className="font-semibold text-[var(--c-text)]">{role}</span>
            </div>
          </div>
        </div>

        {/* Security & Password Card */}
        <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--c-divider)] pb-3">
            <h2 className="text-lg font-bold text-[var(--c-heading)] flex items-center gap-2">
              <IconLock size={18} className="text-amber-600" />
              <span>Bảo mật & Mật khẩu</span>
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <p className="text-[var(--c-muted)] text-xs leading-relaxed">
              Bạn có thể đổi mật khẩu tài khoản bất kỳ lúc nào để tăng cường tính bảo mật.
            </p>
            <div className="pt-2">
              <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>
                Đổi mật khẩu mới
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Custom Avatar URL */}
      <Modal isOpen={showUrlModal} onClose={() => setShowUrlModal(false)} title="Nhập URL ảnh đại diện" maxWidth="md">
        <form onSubmit={handleSaveCustomUrl} className="space-y-4">
          <Input
            label="Liên kết hình ảnh (URL)"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={customAvatarUrl}
            onChange={(e) => setCustomAvatarUrl(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowUrlModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Lưu ảnh
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Profile Info */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Chỉnh sửa thông tin cá nhân" maxWidth="md">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="Tên đăng nhập"
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            required
          />
          <Input
            label="Số điện thoại"
            type="tel"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="0987654321"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)} disabled={savingProfile}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" loading={savingProfile}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Change Password */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Đổi mật khẩu" maxWidth="md">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--c-text)]">Mật khẩu mới *</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                required
                minLength={8}
                className="w-full px-3.5 py-2 text-sm bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl text-[var(--c-text)] pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-muted)] hover:text-[var(--c-text)]"
                tabIndex={-1}
              >
                {showNewPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--c-text)]">Nhập lại mật khẩu mới *</label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
              minLength={8}
              className="w-full px-3.5 py-2 text-sm bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowPasswordModal(false)} disabled={savingPassword}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" loading={savingPassword}>
              Cập nhật mật khẩu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
