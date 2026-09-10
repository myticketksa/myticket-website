import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Account tab bar — 46 tall (44 row + 2px underline), distinct from DS `Tab`/`Tabs`
 * (`207:2841`, 31 tall). Verified on My Tickets `207:9485`.
 *
 * Active label uses `--ink-brand` with a brand-gradient underline; inactive uses
 * `--ink-muted` with an unpainted underline slot so height stays locked. Optional
 * count chips sit after the label on a `--border-divider` pill.
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
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn('inline-flex flex-col items-stretch', className)}
      {...props}
    >
      <span className="flex h-[44px] items-center justify-center gap-[8px] px-lg">
        <span
          className={cn(
            'text-[15px] leading-[normal] font-semibold whitespace-nowrap',
            active ? 'text-ink-brand' : 'text-ink-muted',
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
      <span
        aria-hidden="true"
        className={cn('h-[2px] w-full', active && 'bg-brand-gradient')}
      />
    </button>
  )
}

export interface AccountTabBarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function AccountTabBar({ children, className, ...props }: AccountTabBarProps) {
  return (
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
  )
}
