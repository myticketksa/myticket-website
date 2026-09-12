import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { easeStandard, motionTokens } from '@/lib/motion'

/**
 * Figma `Tabs` — component set 207:2841, with variants State=Active `207:2842` and
 * State=Default `207:2847`. Figma calls it *"Tab ITEM"* in its own description, so the
 * component is one tab and not the bar, and the export is named `Tab` accordingly.
 *
 * The underline slides between active tabs via a shared `layoutId` inside `TabList`'s
 * `LayoutGroup` (guest motion language).
 */
export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: ReactNode
  /** The count suffix, e.g. `8`. Drawn at 12px and 70% opacity in the tab's own colour. */
  count?: ReactNode
  /** Paints the label `--ink-brand-mid` and the underline `--border-focus`. */
  active?: boolean
}

export function Tab({ label, count, active = false, className, ...props }: TabProps) {
  const reduce = useReducedMotion()

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        'inline-flex flex-col items-start gap-control-gap',
        'transition-colors duration-micro ease-micro',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'flex items-baseline gap-xs overflow-clip text-[14.5px] leading-[normal] font-semibold whitespace-nowrap',
          active ? 'text-ink-brand-mid' : 'text-ink-secondary hover:text-ink-primary',
        )}
      >
        {label}
        {count !== undefined && <span className="text-[12px] opacity-70">{count}</span>}
      </span>

      <span aria-hidden="true" className="relative h-[2px] w-full">
        {active ? (
          <motion.span
            layoutId="ds-tab-underline"
            className="absolute inset-0 bg-border-focus"
            transition={
              reduce
                ? { duration: 0 }
                : { type: 'tween', duration: motionTokens.standard.duration, ease: easeStandard }
            }
          />
        ) : null}
      </span>
    </button>
  )
}

/**
 * The `role="tablist"` parent that `Tab` requires, carrying no paint of its own.
 * Wraps children in `LayoutGroup` so the active underline can slide between tabs.
 */
export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function TabList({ children, className, ...props }: TabListProps) {
  return (
    <LayoutGroup id="ds-tabs">
      <div role="tablist" className={className} {...props}>
        {children}
      </div>
    </LayoutGroup>
  )
}
