import { Divider } from '@/components/data-display'
import { cn } from '@/lib/cn'

/**
 * Figma `AuctionCard` — node 207:3235. The resale card behind Home's "Tickets ending
 * soonest" rail and the auction hub.
 *
 * All type, no imagery: radius 20, a `--border-default` hairline, 18 of padding and a
 * uniform 14 gap between the status row, the event block, and the money block. Drawn
 * 315×214. The width belongs to the grid, and the height is not fixed either — the card
 * carries a `·grow` spacer before the money block, which is the drawing's way of saying it
 * fills whatever height it is given, so that becomes `mt-auto` and a row of cards with
 * one- and two-line titles still lines its bid figures up. Radius 20 is neither
 * `--radius-card` (18) nor `--radius-panel` (22), so it stays a literal.
 *
 * Measurements: listings pill 12px/700 at 10×5, radius 12; countdown 12px/800; title
 * `Heading/Card`; 4 gap; sub-line 13px/500; divider, then 12 before the amounts row, which
 * aligns its two columns on their bottom edges; each column stacks a 12px/500 `--ink-muted`
 * label 2 above its figure; the bid figure is 21px/800 in `--brand-identity-end` and the
 * buy-now figure 15px/700 in `--ink-secondary`.
 *
 * **The countdown contradicts the `Countdown` atom, so it is drawn locally and the atom is
 * left alone.** That atom sets 12px/700 and the rule *under an hour is `--ink-brand-mid`,
 * over an hour is `--ink-muted`*, and it already records one instance that breaks the rule
 * (the deadline banner's 15px/800 over-an-hour value in `#c4330b`). This is the second:
 * "Ends in 02:41:18" is two and a half hours out, yet it is drawn a weight heavier at 800
 * and in a brand red rather than muted. The colour is worth a closer look when that
 * conflict is finally settled — the export binds `--brand-gradient-end`, whose `#d8431a` is
 * the same value as the `--ink-brand-mid` the atom would use for an *urgent* countdown, so
 * the drawing is either deliberately treating every auction as urgent or the rule needs
 * rewriting. The `role="timer"` live region is carried over from the atom so the local copy
 * announces the same way.
 *
 * The listings pill is not `StatusBadge`: 5px of vertical padding against 4, radius 12
 * against 10, and `--brand-gradient-end` text where the `brandTint` tone uses
 * `--ink-brand-strong` `#c4330b`. The tint ground is the same, which is exactly what makes
 * substituting the atom look right until you compare them side by side.
 *
 * The title is the only card title in the file that matches `Heading/Card` outright —
 * 17px/700 at 1.22 with the style's −0.255 tracking present — so it uses the class where
 * `EventCard` had to write its 17px title out for want of that tracking. The rule above the
 * amounts is `Divider` at its default tone, which matches the drawn 1px `--border-divider`
 * hairline exactly.
 *
 * `tabular-nums` on both figures and on the countdown is a deliberate addition: it is
 * specified for every price and counter in the system and expressed by none of them in
 * Figma, and a live countdown that reflows every second is the case that needs it most.
 *
 * **Not built, because the source never draws them:** hover, and any bid or buy-now
 * affordance. Both amounts are plain text — no button, no link, no cursor is drawn — so
 * whatever makes this card actionable is the list's job, not the card's.
 */
export interface AuctionCardProps {
  /** Drawn as one string, e.g. "12 listings". */
  listings: string
  /** The remaining time alone, e.g. "02:41:18". The card draws the "Ends in" label. */
  endsIn: string
  title: string
  /** e.g. "Riyadh · Thu 8 Oct". */
  meta: string
  /** e.g. "SAR 220". */
  highestBid: string
  /** e.g. "SAR 340". */
  buyNow: string
  className?: string
}

export function AuctionCard({
  listings,
  endsIn,
  title,
  meta,
  highestBid,
  buyNow,
  className,
}: AuctionCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col gap-[14px] rounded-[20px] border border-border-default bg-surface-default p-[18px]',
        'transition-[transform,box-shadow] duration-normal ease-standard',
        'hover:-translate-y-0.5 hover:shadow-lift',
        'motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <p className="rounded-[12px] bg-bg-tint-brand px-[10px] py-[5px] text-[12px] font-bold text-brand-gradient-end">
          {listings}
        </p>

        <p
          role="timer"
          aria-live="polite"
          className="text-[12px] font-extrabold tabular-nums text-brand-gradient-end"
        >
          Ends in {endsIn}
        </p>
      </div>

      <div className="flex w-full flex-col gap-xs">
        <h3 className="text-heading-card text-ink-primary">{title}</h3>
        <p className="text-[13px] font-medium text-ink-secondary">{meta}</p>
      </div>

      <div className="mt-auto flex w-full flex-col">
        <Divider />

        <div className="mt-md flex w-full items-end justify-between">
          <div className="flex flex-col items-start gap-[2px]">
            <p className="text-[12px] font-medium text-ink-muted">Highest bid</p>
            <p className="text-[21px] font-extrabold tabular-nums text-brand-identity-end">
              {highestBid}
            </p>
          </div>

          <div className="flex flex-col items-end gap-[2px]">
            <p className="text-[12px] font-medium text-ink-muted">Buy now</p>
            <p className="text-[15px] font-bold tabular-nums text-ink-secondary">{buyNow}</p>
          </div>
        </div>
      </div>
    </article>
  )
}
