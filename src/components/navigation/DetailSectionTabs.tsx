import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Event / entity detail section tabs — Figma event detail `207:4797` (and siblings).
 *
 * Distinct from DS `Tab` (`Tabs.tsx`): labels are 15px/600, active uses `--ink-brand`
 * with a 2px `--brand-primary` underline flush to a 1px rail, inactive is `--ink-muted`
 * with no underline reserve (padding matches via `pb-md`). Gap between items is 26px;
 * the rail is `border-b border-border-default` on the list.
 */
export interface DetailSectionTabProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  active?: boolean
}

export function DetailSectionTab({
  children,
  active = false,
  className,
  ...props
}: DetailSectionTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        'pb-md text-[15px] font-semibold whitespace-nowrap',
        active
          ? 'border-b-2 border-brand-primary text-ink-brand'
          : 'text-ink-muted',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export interface DetailSectionTabsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function DetailSectionTabs({
  children,
  className,
  ...props
}: DetailSectionTabsProps) {
  return (
    <div
      role="tablist"
      className={cn('flex gap-[26px] border-b border-border-default', className)}
      {...props}
    >
      {children}
    </div>
  )
}
