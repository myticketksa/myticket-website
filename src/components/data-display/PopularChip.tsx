import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Home Hero "Popular" term chip — Figma `207:4389` (and siblings).
 *
 * Not `FilterChip` (h38 / r19 / 14px) and not `CategoryChip` (h42 / count). This is the
 * compact search-suggestion pill: h≈30 via `6px 13px` padding, radius 16, 1.5px
 * `--border-default`, 13px/600 `--ink-secondary`.
 */
export interface PopularChipProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode
}

export function PopularChip({ className, children, ...props }: PopularChipProps) {
  return (
    <a
      className={cn(
        'inline-flex items-center rounded-[16px] border-[1.5px] border-border-default',
        'bg-surface-default px-[13px] py-[6px] text-[13px] font-semibold whitespace-nowrap text-ink-secondary',
        'transition-colors duration-normal ease-standard hover:border-border-brand hover:text-ink-brand',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  )
}
