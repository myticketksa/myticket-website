import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `AttributeTag` — node 207:1791. A passive descriptor on the experience card.
 *
 * 11.5px/600, padding `3px 9px`, radius 9, `--bg-page` on a 1px `--border-default`,
 * text `--ink-secondary`.
 *
 * Figma calls it *"deliberately distinct"* from `FilterChip` (interactive, h38) and
 * `StatusBadge` (status, 12px/700) — it is neither clickable nor a state, so it is a
 * `span` with no interaction affordance at all. Single variant; the source draws only
 * "Guided tours" and "Family".
 *
 * Radius 9 and the 3/9 padding have no tokens — Figma lists them under
 * `unboundProperties`, so they are literals here.
 */
export interface AttributeTagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

export function AttributeTag({ className, children, ...props }: AttributeTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-[9px] border border-border-default',
        'bg-bg-page px-[9px] py-[3px] text-[11.5px] font-semibold text-ink-secondary',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
