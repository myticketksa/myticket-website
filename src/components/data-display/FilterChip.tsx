import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `FilterChip` — node 207:1769. h38, px14, radius 19, 14px/500, gap 8.
 *
 * The rule from Figma: *"Filter chips are interactive pills; status badges are
 * read-only labels."*
 *
 * Selected fills with `--gradient-identity` and carries **no border**. The source
 * gives it a `1px solid transparent` border only so a CSS box keeps layout parity
 * with Default — Figma's inside strokes do not affect size, so Selected is the
 * same height as Default without one. Since the border here is inside the box
 * model too, transparent is exactly what reproduces it.
 *
 * `removable` is the applied-filter chip. Its × is a literal U+00D7 character in
 * the source, not an icon, so it stays as text.
 */
export interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  /** Renders the applied-filter tint chip with a remove affordance. */
  removable?: boolean
  onRemove?: () => void
  count?: ReactNode
  children: ReactNode
}

export function FilterChip({
  className,
  selected = false,
  removable = false,
  onRemove,
  count,
  children,
  ...props
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={removable ? undefined : selected}
      className={cn(
        'inline-flex h-chip items-center justify-center gap-sm rounded-chip px-[14px]',
        'border text-[14px] leading-[1.5] transition-[color,border-color,background,transform] duration-fast ease-standard',
        removable
          ? 'border-border-default bg-bg-tint-brand font-semibold text-ink-brand-strong'
          : selected
            ? 'border-transparent bg-identity-gradient font-medium text-ink-inverse'
            : 'border-border-default bg-surface-default font-medium text-ink-primary hover:border-border-focus',
        selected && !removable && 'active:scale-[0.95] motion-reduce:active:scale-100',
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className="text-[12px] opacity-60">{count}</span>
      )}
      {removable && (
        <span
          role="button"
          tabIndex={-1}
          aria-label="Remove filter"
          onClick={(event) => {
            event.stopPropagation()
            onRemove?.()
          }}
          className="text-[14px] font-extrabold leading-none"
        >
          ×
        </span>
      )}
    </button>
  )
}
