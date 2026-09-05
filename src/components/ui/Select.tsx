import { useId, type SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string | number
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options?: SelectOption[]
}

export function Select({ label, error, options, children, className = '', ...rest }: SelectProps) {
  const id = useId()

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-[var(--c-text)]">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full px-3.5 py-2 text-sm bg-[var(--c-surface)] border ${
          error ? 'border-rose-500' : 'border-[var(--c-border)]'
        } rounded-xl text-[var(--c-text)] focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors cursor-pointer ${className}`.trim()}
        {...rest}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[var(--c-surface)] text-[var(--c-text)]">
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
    </div>
  )
}
