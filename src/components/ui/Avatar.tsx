import React, { useState, useEffect } from 'react'

export interface AvatarProps {
  src?: string | null
  alt?: string
  gender?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom'
  shape?: 'circle' | 'rounded' | 'rounded-xl' | 'rounded-3xl' | 'square'
  className?: string
  fallbackClassName?: string
  ringClassName?: string
  title?: string
}

const SIZE_MAP: Record<string, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm font-semibold',
  lg: 'w-12 h-12 text-base font-bold',
  xl: 'w-20 h-20 text-3xl font-bold',
  '2xl': 'w-28 h-28 text-4xl font-extrabold',
  custom: '',
}

const SHAPE_MAP: Record<string, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-2xl',
  'rounded-xl': 'rounded-xl',
  'rounded-3xl': 'rounded-3xl',
  square: 'rounded-lg',
}

export function Avatar({
  src,
  alt = 'Avatar',
  gender = 'male',
  size = 'md',
  shape = 'circle',
  className = '',
  fallbackClassName = '',
  ringClassName = '',
  title,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  // Reset imgError when src changes so new images load properly
  useEffect(() => {
    setImgError(false)
  }, [src])

  const isFemale = gender?.toLowerCase() === 'female'
  const trimmedName = alt.trim()
  const firstLetter = trimmedName.split(' ').pop()?.charAt(0) || trimmedName.charAt(0) || '?'

  const baseSize = SIZE_MAP[size] || SIZE_MAP.md
  const baseShape = SHAPE_MAP[shape] || SHAPE_MAP.circle

  const defaultFallbackGradient = isFemale
    ? 'bg-gradient-to-tr from-rose-400 via-pink-500 to-rose-600 text-white'
    : 'bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-700 text-white'

  const hasValidImage = Boolean(src && src.trim().length > 0 && !imgError)

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden select-none flex-shrink-0 ${baseSize} ${baseShape} ${ringClassName} ${className}`}
      title={title || alt}
    >
      {hasValidImage ? (
        <img
          src={src!}
          alt={alt}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover ${baseShape}`}
          loading="lazy"
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center ${baseShape} ${
            fallbackClassName || defaultFallbackGradient
          }`}
        >
          {firstLetter}
        </div>
      )}
    </div>
  )
}

export default Avatar
