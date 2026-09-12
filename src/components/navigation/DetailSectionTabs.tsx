import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { easeStandard, motionTokens } from '@/lib/motion'

/**
 * Event / entity detail section tabs — Figma event detail `207:4797` (and siblings).
 *
 * Distinct from DS `Tab` (`Tabs.tsx`): labels are 15px/600, active uses `--ink-brand`
 * with a 2px `--brand-primary` underline flush to a 1px rail, inactive is `--ink-muted`.
 * Active underline slides via shared `layoutId`.
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
  const reduce = useReducedMotion()

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        'relative pb-md text-[15px] font-semibold whitespace-nowrap transition-colors duration-micro ease-micro',
        active ? 'text-ink-brand' : 'text-ink-muted hover:text-ink-secondary',
        className,
      )}
      {...props}
    >
      {children}
      {active ? (
        <motion.span
          layoutId="detail-section-tab-underline"
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[2px] bg-brand-primary"
          transition={
            reduce
              ? { duration: 0 }
              : { type: 'tween', duration: motionTokens.standard.duration, ease: easeStandard }
          }
        />
      ) : null}
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
    <LayoutGroup id="detail-section-tabs">
      <div
        role="tablist"
        className={cn('flex gap-[26px] border-b border-border-default', className)}
        {...props}
      >
        {children}
      </div>
    </LayoutGroup>
  )
}
