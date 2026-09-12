import { cva, type VariantProps } from 'class-variance-authority'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { MagnifyingGlassIcon } from '@/components/icons'
import { fieldShell } from './TextInput'

/**
 * Figma `SearchField` — node 207:1708. Three sizes, all on a 1.5px border.
 *
 * `pill` sits on a transparent ground rather than white, which is why the fill
 * is only set on the other two.
 */
const search = cva(
  'flex items-center border-[1.5px] border-border-default transition-[border-color,max-width,box-shadow] duration-normal ease-standard focus-within:border-border-focus',
  {
    variants: {
      size: {
        field:
          'h-search w-full max-w-[240px] gap-control-gap rounded-search bg-surface-default px-lg focus-within:max-w-[280px]',
        pill: 'h-chip gap-sm rounded-chip px-[14px]',
        icon: 'size-icon-btn justify-center rounded-icon-btn bg-surface-default',
      },
    },
    defaultVariants: { size: 'field' },
  },
)

/** Glyph size per variant: 15 in field, 13 in both pill and icon. */
const GLYPH = { field: 15, pill: 13, icon: 13 } as const

/** Text size per variant: Body/Small in field, Body/Caption in pill. */
const TEXT = { field: 'text-[14px]', pill: 'text-[13px]', icon: '' } as const

export interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof search> {
  /** Required on the icon-only variant, which has no visible label. */
  'aria-label'?: string
}

export function SearchField({
  className,
  size = 'field',
  placeholder = 'Search events, artists…',
  ...props
}: SearchFieldProps) {
  const variant = size ?? 'field'

  if (variant === 'icon') {
    return (
      <button
        type="button"
        aria-label={props['aria-label'] ?? 'Search'}
        className={cn(search({ size: variant }), 'text-ink-brand', className)}
      >
        <MagnifyingGlassIcon size={GLYPH.icon} />
      </button>
    )
  }

  return (
    <div className={cn(search({ size: variant }), className)}>
      <MagnifyingGlassIcon size={GLYPH[variant]} className="shrink-0 text-ink-brand" />
      <input
        type="search"
        placeholder={placeholder}
        className={cn(
          fieldShell,
          TEXT[variant],
          'h-full min-w-0 flex-1 border-0 bg-transparent px-0 leading-[1.5] focus:border-0',
        )}
        {...props}
      />
    </div>
  )
}
