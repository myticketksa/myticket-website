import { cn } from '@/lib/cn'

/**
 * Figma `Countdown` — node 207:1840. 12px/700, tabular, 24h clock.
 *
 * The colour rule: **under an hour is `--ink-brand-mid`, over an hour is
 * `--ink-muted`.** Only the under-1h case is actually drawn (the stat-card timer
 * "Ends 00:41:22"); the over-1h geometry is carried over rather than invented,
 * which Figma flags.
 *
 * A conflict Figma flags but does not resolve: the deadline banner draws
 * "02:12:40" — an over-1h value — at 15px/800 in `#c4330b`, contradicting the rule
 * on both colour and size. That instance belongs to `DeadlineBanner` and is not
 * built here; it has to be reconciled when that component lands.
 *
 * Announced politely via a live region, per the accessibility note.
 */
export interface CountdownProps {
  /** Preformatted, e.g. "00:41:22" or "1d 04:22". */
  children: string
  /** Whether less than an hour remains. Drives the colour rule. */
  urgent?: boolean
  className?: string
}

export function Countdown({ children, urgent = false, className }: CountdownProps) {
  return (
    <span
      role="timer"
      aria-live="polite"
      className={cn(
        'text-[12px] font-bold tabular-nums',
        urgent ? 'text-ink-brand-mid' : 'text-ink-muted',
        className,
      )}
    >
      {children}
    </span>
  )
}
