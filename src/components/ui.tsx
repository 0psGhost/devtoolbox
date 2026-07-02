import { type ReactNode } from 'react'
import { Copy, Check } from 'lucide-react'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'

interface CopyButtonProps {
  text: string
  className?: string
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const { copy, copied } = useCopyToClipboard()

  return (
    <button
      onClick={() => copy(text)}
      disabled={!text}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors
        bg-surface-raised hover:bg-surface-overlay text-text-secondary hover:text-text-primary
        disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      title="Copy to clipboard"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

interface TextAreaProps {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  label?: string
  actions?: ReactNode
  rows?: number
  error?: string
}

export function TextArea({
  value,
  onChange,
  placeholder,
  readOnly,
  label,
  actions,
  rows = 12,
  error,
}: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-h-0">
      {(label || actions) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs font-medium text-text-secondary">{label}</span>}
          {actions}
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={rows}
        spellCheck={false}
        className={`flex-1 w-full resize-none rounded-lg border bg-surface-raised px-3 py-2.5
          font-mono text-sm text-text-primary placeholder:text-text-muted
          focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors
          ${error ? 'border-error' : 'border-border'}
          ${readOnly ? 'cursor-default' : ''}`}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}

interface ToolLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
}

export function ToolLayout({ children, title, description, actions }: ToolLayoutProps) {
  return (
    <div className="flex flex-col h-full gap-4">
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-text-primary">{title}</h2>}
            {description && <p className="text-sm text-text-secondary mt-0.5">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  )
}

interface SplitPanelProps {
  left: ReactNode
  right: ReactNode
}

export function SplitPanel({ left, right }: SplitPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
      <div className="flex flex-col min-h-0">{left}</div>
      <div className="flex flex-col min-h-0">{right}</div>
    </div>
  )
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  label?: string
}

export function Select({ value, onChange, options, label }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-text-secondary">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm
          text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface ButtonProps {
  onClick: () => void
  children: ReactNode
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({ onClick, children, variant = 'secondary', disabled }: ButtonProps) {
  const base = 'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  const styles =
    variant === 'primary'
      ? 'bg-accent text-white hover:bg-accent-hover'
      : 'bg-surface-raised hover:bg-surface-overlay text-text-secondary hover:text-text-primary border border-border'

  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  )
}
