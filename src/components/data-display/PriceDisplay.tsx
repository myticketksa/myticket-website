import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `PriceDisplay` — node 207:1827. One variant per drawn instance.
 *
 * From Figma: *"Format: SAR 1,240.00, tabular. The platform fee is always its own
 * line — never folded into a price. Wallet balances always show the withdrawable /
 * spend-only split."*
 *
 * `card` and `total` are both 14/700 — the source draws them identically and they
 * differ only by tabular figures, which Figma's API cannot express. **Every price
 * in the system is tabular in the source and none of them is tabular in Figma**,
 * so `tabular-nums` is applied to all six here. That is a restoration of the
 * source's intent, not an addition.
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
  children: ReactNode
}

export function PriceDisplay({
  className,
  context = 'card',
  children,
  ...props
}: PriceDisplayProps) {
  return (
    <span
      className={cn('tabular-nums text-ink-primary', CONTEXT[context], className)}
      {...props}
    >
      {children}
    </span>
  )
}
