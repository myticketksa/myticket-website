import type { HTMLAttributes, ReactNode } from 'react'
import { MoneyAmount } from './MoneyAmount'
import { cn } from '@/lib/cn'

/**
 * Figma `PriceDisplay` — node 207:1827. One variant per drawn instance.
 *
 * From Figma: *"Format: SAR 1,240.00, tabular. The platform fee is always its own
 * line — never folded into a price. Wallet balances always show the withdrawable /
 * spend-only split."*
 *
 * Amounts render with the official Saudi Riyal mark via `MoneyAmount`.
 * Prefer `value` for figures; string `children` that look like money are also parsed.
 */
const CONTEXT = {
  card: 'text-[14px] font-bold',
  row: 'text-[14px] font-normal',
  total: 'text-[14px] font-bold',
  amount: 'text-[22px] font-semibold',
  stat: 'text-[26px] font-extrabold tracking-[-0.52px]',
  mobile: 'text-[12px] font-bold',
} as const

export interface PriceDisplayProps extends HTMLAttributes<HTMLSpanElement> {
  context?: keyof typeof CONTEXT
  /** Preferred: numeric or legacy money string — rendered with the SAR mark. */
  value?: number | string | null
  children?: ReactNode
}

export function PriceDisplay({
  className,
  context = 'card',
  value,
  children,
  ...props
}: PriceDisplayProps) {
  const content =
    value !== undefined ? (
      <MoneyAmount value={value} />
    ) : typeof children === 'string' || typeof children === 'number' ? (
      <MoneyAmount value={children} />
    ) : (
      children
    )

  return (
    <span
      className={cn('tabular-nums text-ink-primary', CONTEXT[context], className)}
      {...props}
    >
      {content}
    </span>
  )
}
