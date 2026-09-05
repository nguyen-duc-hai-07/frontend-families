export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  }

  return (
    <span
      className={`inline-block border-current border-t-transparent rounded-full animate-spin ${sizeMap[size]} ${className}`.trim()}
      aria-hidden="true"
    />
  )
}
