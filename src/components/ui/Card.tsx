import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl p-6 shadow-sm ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...rest }: CardProps) {
  return (
    <div className={`border-b border-[var(--c-divider)] pb-4 mb-4 ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}

export function CardTitle({ className = '', children, ...rest }: CardProps) {
  return (
    <h3 className={`text-xl font-bold text-[var(--c-heading)] ${className}`.trim()} {...rest}>
      {children}
    </h3>
  )
}

export function CardBody({ className = '', children, ...rest }: CardProps) {
  return (
    <div className={`space-y-4 ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...rest }: CardProps) {
  return (
    <div className={`border-t border-[var(--c-divider)] pt-4 mt-4 flex items-center justify-between ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}
