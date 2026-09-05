import { useId, type TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Textarea({ label, error, helperText, className = '', ...rest }: TextareaProps) {
  const id = useId()

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-[var(--c-text)]">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full px-3.5 py-2 text-sm bg-[var(--c-surface)] border ${
          error ? 'border-rose-500' : 'border-[var(--c-border)]'
        } rounded-xl text-[var(--c-text)] placeholder-[var(--c-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors resize-y min-h-[90px] ${className}`.trim()}
        {...rest}
      />
      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[var(--c-muted)]">{helperText}</p>
      ) : null}
    </div>
  )
}
