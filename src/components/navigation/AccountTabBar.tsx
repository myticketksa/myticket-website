import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { easeStandard, motionTokens } from '@/lib/motion'

/**
 * Account tab bar — 46 tall (44 row + 2px underline), distinct from DS `Tab`/`Tabs`
 * (`207:2841`, 31 tall). Verified on My Tickets `207:9485`.
 *
 * Active underline slides between items via shared `layoutId`.
 */
export interface AccountTabBarItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: ReactNode
  count?: ReactNode
  active?: boolean
}

export function AccountTabBarItem({
  label,
  count,
  active = false,
  className,
  ...props
}: AccountTabBarItemProps) {
  const reduce = useReducedMotion()

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        'inline-flex flex-col items-stretch transition-colors duration-micro ease-micro',
        className,
      )}
      {...props}
    >
      <span className="flex h-[44px] items-center justify-center gap-[8px] px-lg">
        <span
          className={cn(
            'text-[15px] leading-[normal] font-semibold whitespace-nowrap',
            active ? 'text-ink-brand' : 'text-ink-muted hover:text-ink-secondary',
          )}
        >
          {label}
        </span>
        {count !== undefined && count !== null && (
          <span className="inline-flex min-w-[22px] items-center justify-center rounded-[10px] bg-border-divider px-[7px] py-[2px] text-[12px] leading-[normal] font-semibold text-ink-muted">
            {count}
          </span>
        )}
      </span>
      <span aria-hidden="true" className="relative h-[2px] w-full">
        {active ? (
          <motion.span
            layoutId="account-tab-underline"
            className="absolute inset-0 bg-brand-gradient"
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

export interface AccountTabBarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function AccountTabBar({ children, className, ...props }: AccountTabBarProps) {
  return (
    <LayoutGroup id="account-tabs">
      <div
        role="tablist"
        className={cn(
          'flex h-[46px] items-end gap-[6px] overflow-x-auto border-b border-border-default',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </LayoutGroup>
  )
}
