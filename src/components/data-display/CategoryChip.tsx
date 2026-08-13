import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `CategoryChip` — node 207:3097. The Home "Browse by category" row and the
 * Events taxonomy.
 *
 * h42, radius 21, padding `0 16`, gap 8, 1.5px `--border-default` on
 * `--surface-default`. Name is 14px/600 `--ink-primary`; the count is 12px/600 at 55%
 * opacity.
 *
 * Filed next to `FilterChip` because the two are near-twins and differ in four
 * measurements — h42 against h38, radius 21 against 19, padding 16 against 14, weight
 * 600 against 500, and count opacity 55% against 60%. Close enough that reaching for
 * the wrong one is easy, so they sit side by side.
 *
 * Its h42/radius-21 shell matches `Button` size M exactly, but the padding does not
 * (16 against 18) and this is a navigation target rather than an action, so it is not
 * built on `Button`.
 *
 * No hover, selected or active state is drawn. Since it is a navigation target, the
 * border moving to `--border-brand` on hover is a deliberate addition.
 */
export interface CategoryChipProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Rendered at 55% opacity after the name. */
  count?: ReactNode
  children: ReactNode
}

export function CategoryChip({ className, count, children, ...props }: CategoryChipProps) {
  return (
    <a
      className={cn(
        'inline-flex h-btn-md items-center gap-sm rounded-btn-md border-[1.5px] border-border-default',
        'bg-surface-default px-lg font-semibold whitespace-nowrap text-ink-primary',
        'transition-colors duration-normal ease-standard hover:border-border-brand',
        className,
      )}
      {...props}
    >
      <span className="text-[14px]">{children}</span>
      {count !== undefined && <span className="text-[12px] opacity-55">{count}</span>}
    </a>
  )
}
