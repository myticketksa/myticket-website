import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `DeadlineBanner` — node 207:2895.
 *
 * The `Toast` shell reused on a warm ground: `flex`, centre-aligned, 12px gap, 16
 * radius, 14×18 padding, a 1px `--border-default` border, and `--bg-tint-brand`
 * instead of a tone paint. A leading glyph, a `flex-1` body column, a trailing timer.
 * As on the toast, the 16 radius and the 14×18 padding are bare literals in the
 * export rather than token bindings, so they stay literals.
 *
 * Measurements: the ⏳ at 16px in `--ink-primary` at Regular weight, the title at
 * 14px/700 in `--ink-brand-strong`, the subtitle at 12.5px/500 in `--ink-secondary`,
 * and the timer at 15px/800 in `--ink-brand-strong`. Everything sits at the browser's
 * `normal` line height.
 *
 * **The ⏳ is a real emoji character**, at Manrope Regular, and it is built as drawn.
 * Figma flags it against its own "no emoji" rule in DS-DECISIONS 11.8 and keeps it
 * anyway, so this is one of the rare places where the description and the drawing
 * agree that a glyph is text.
 *
 * **The timer is a local text node, and that is an unresolved conflict with the
 * `Countdown` atom.** `Countdown` (`207:1840`) is 12px/700 and its rule is that under
 * an hour is `--ink-brand-mid` and over an hour is `--ink-muted`. This banner draws
 * "02:12:40" — an over-one-hour value — at 15px/800 in `--ink-brand-strong`, so it
 * contradicts the atom on size, weight *and* colour, and it disagrees in the direction
 * of *more* urgency rather than less. Figma records the conflict and explicitly leaves
 * it unresolved for the client. The drawing wins here, the atom is left untouched, and
 * the timer is therefore drawn locally rather than instanced. Nothing about that is a
 * decision this component is entitled to make on the client's behalf, so it is written
 * down rather than reconciled.
 *
 * **Not built:** any tone or urgency axis. One paint recipe is drawn and no second
 * state exists, so a "past deadline" or "expiring" shape would be fabrication. The
 * countdown itself is not ticked here either — the banner takes a preformatted string,
 * exactly as `Countdown` does.
 *
 * Deliberate additions: the drawn 380px width is applied as a **max**-width, matching
 * the toast it shares a shell with, since a banner that cannot narrow overflows a
 * phone; the timer gets `tabular-nums` so a live value does not reflow the row every
 * second, and `role="timer"` with a polite live region, both carried over from
 * `Countdown` for consistency with the atom rather than invented here; and the ⏳ is
 * `aria-hidden`, because the title and timer already say what it means.
 */
export interface DeadlineBannerProps {
  title: ReactNode
  subtitle: ReactNode
  /** Preformatted, e.g. "02:12:40". Not ticked here — pass a fresh string. */
  timer: string
  className?: string
}

export function DeadlineBanner({ title, subtitle, timer, className }: DeadlineBannerProps) {
  return (
    <div
      className={cn(
        'flex w-full max-w-[380px] items-center gap-md rounded-[16px] border border-border-default bg-bg-tint-brand px-[18px] py-[14px]',
        className,
      )}
    >
      <p aria-hidden className="shrink-0 text-[16px] font-normal whitespace-nowrap text-ink-primary">
        ⏳
      </p>

      <div className="flex min-w-0 flex-1 flex-col items-start overflow-clip">
        <p className="w-full text-[14px] font-bold text-ink-brand-strong">{title}</p>
        <p className="w-full text-[12.5px] font-medium text-ink-secondary">{subtitle}</p>
      </div>

      <span
        role="timer"
        aria-live="polite"
        className="shrink-0 text-[15px] font-extrabold tabular-nums whitespace-nowrap text-ink-brand-strong"
      >
        {timer}
      </span>
    </div>
  )
}
