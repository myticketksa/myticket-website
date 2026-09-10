import type { HTMLAttributes, ReactNode } from 'react'
import { Countdown, PriceDisplay } from '@/components/data-display'
import { cn } from '@/lib/cn'

/**
 * Figma `StatCard` — node `207:3085`.
 *
 * Card: 1px border-default, radius 18, white, padding 18. Head row is space-between on
 * the baseline with 2px below: label 13 muted, optional Countdown. Value is PriceDisplay
 * Context=Stat (26/800). Caption 12.5 muted directly under the value.
 *
 * Auction hub KPIs reuse the shell with a numeric value slot instead of PriceDisplay.
 */
export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  /** Prefer PriceDisplay children, or pass a plain numeric string via `value`. */
  value?: ReactNode
  caption?: string
  /** Optional trailing timer in the head row (DS default drawing). */
  endsIn?: string
  urgent?: boolean
}

export function StatCard({
  label,
  value,
  caption,
  endsIn,
  urgent,
  className,
  children,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start rounded-[18px] border border-border-default bg-surface-default p-[18px]',
        className,
      )}
      {...props}
    >
      <div className="flex w-full items-baseline justify-between overflow-hidden pb-[2px]">
        <p className="text-[13px] leading-[1.5] font-medium text-ink-muted">{label}</p>
        {endsIn && (
          <Countdown urgent={urgent} className="shrink-0 text-[12px] font-bold">
            {endsIn.startsWith('Ends') ? endsIn : `Ends ${endsIn}`}
          </Countdown>
        )}
      </div>
      {children ??
        (typeof value === 'string' || typeof value === 'number' ? (
          <PriceDisplay context="stat" className="text-ink-primary">
            {value}
          </PriceDisplay>
        ) : (
          <div className="text-[32px] font-extrabold tracking-[-0.8px] text-ink-primary tabular-nums">
            {value}
          </div>
        ))}
      {caption && (
        <p className="text-[12.5px] font-medium text-ink-muted">{caption}</p>
      )}
    </div>
  )
}
