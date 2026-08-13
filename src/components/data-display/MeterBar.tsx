import { cn } from '@/lib/cn'

/**
 * Figma `MeterBar` — node 207:1815. Track height 6, radius 3, `--bg-skeleton`.
 * Fill is `--gradient-identity` rotated to 90deg — a left-to-right ramp rather
 * than the 120deg diagonal used elsewhere.
 *
 * The three widths the source draws (78%, 15%, 5%) are data, not variants, so the
 * fill is driven by `value`. The drawn 200px track is display-only; the track
 * fills its container.
 */
export interface MeterBarProps {
  /** 0 to 1. */
  value: number
  className?: string
  label?: string
}

export function MeterBar({ value, className, label }: MeterBarProps) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100)

  return (
    <div
      role="meter"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-[6px] w-full overflow-hidden rounded-[3px] bg-bg-skeleton', className)}
    >
      <div
        className="h-full rounded-[3px] bg-[linear-gradient(90deg,var(--color-brand-gradient-start),var(--color-brand-identity-end))]"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
