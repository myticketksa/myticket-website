import { Divider, ImagePlaceholder } from '@/components/data-display'
import { StarFillIcon, VerifiedIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

/**
 * Figma `TalentCard` Context=Home — node 207:3115.
 *
 * Radius 20 (not the 16 the Catalog variant uses), 1px `--border-default`, media a
 * fixed 208 tall. Drawn 250 wide, but width is the grid's to decide, so it is not
 * fixed here.
 *
 * The top-left pill is **not** `OverlayBadge`: radius 12 against 10, `5px` vertical
 * padding against 4, 11px against 12, and an opaque white fill rather than 92%. Close
 * enough to look like a mistake, different enough that substituting the atom would be
 * visibly wrong, so it is drawn locally.
 *
 * The star is Phosphor at fill weight and takes the row's own colour — `--ink-primary`
 * here, `--ink-muted` on the Catalog variant, `--bg-page` on Directory's dark pill —
 * so it inherits rather than setting a colour.
 *
 * `APPEARING NEXT` is 11px/700 with 0.66 tracking. That is a fourth uppercase
 * micro-label, distinct from `Label/Overline`, `Label/Table` and `Label/Group`, and it
 * is a raw text node rather than a named style, so it stays a literal.
 */
export interface TalentCardProps {
  name: string
  /** e.g. "Singer · Arabic pop". */
  discipline: string
  rating: string
  /** Review count, rendered in parentheses. */
  reviews: string
  city: string
  /** The pill over the media, e.g. "Next · Thu 8 Oct". Omitted when absent. */
  nextLabel?: string
  /** Headline under the APPEARING NEXT rule. */
  nextEvent?: string
  verified?: boolean
  /** Public guest browse: avatar/media, name, discipline, rating only. */
  limited?: boolean
  image?: string
  className?: string
}

export function TalentCard({
  name,
  discipline,
  rating,
  reviews,
  city,
  nextLabel,
  nextEvent,
  verified = true,
  limited = false,
  image,
  className,
}: TalentCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-[20px] border border-border-default bg-surface-default',
        className,
      )}
    >
      <div className="relative h-[208px] w-full overflow-hidden">
        {image ? (
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          <ImagePlaceholder ratio="fill" caption="Event imagery 16:10" />
        )}

        {!limited && nextLabel && (
          <p className="absolute top-[10px] left-[10px] rounded-[12px] bg-surface-default px-[10px] py-[5px] text-[11px] font-bold text-ink-primary">
            {nextLabel}
          </p>
        )}
      </div>

      <div className="flex flex-col px-lg pt-[15px] pb-[17px]">
        <div className="flex items-center gap-[6px]">
          <h3 className="text-[16px] font-bold text-ink-primary">{name}</h3>
          {verified && <VerifiedIcon size={16} className="shrink-0" />}
        </div>

        <p className="mt-[3px] text-[13px] font-medium text-ink-secondary">{discipline}</p>

        <div className="mt-[10px] flex w-full items-start justify-between">
          <span className="flex items-start gap-xs text-ink-primary">
            <StarFillIcon className="mt-[1px] shrink-0" />
            <span className="text-[13px] font-bold">{rating}</span>
            {!limited && (
              <span className="text-[13px] font-medium text-ink-muted">({reviews})</span>
            )}
          </span>
          {!limited && (
            <span className="text-[13px] font-medium text-ink-secondary">{city}</span>
          )}
        </div>

        {!limited && nextEvent && (
          <>
            <Divider className="my-[11px]" />
            <p className="text-[11px] font-bold tracking-[0.66px] text-brand-gradient-end uppercase">
              Appearing next
            </p>
            <p className="mt-[3px] text-[13px] font-semibold text-ink-primary">{nextEvent}</p>
          </>
        )}
      </div>
    </article>
  )
}

/**
 * Figma `TalentCard/Directory` — node 207:3139. Its own component, not a variant.
 *
 * This is the card the live Talents page uses, and Figma flags it as the resolution
 * of a conflict it had left open: the DS-doc Catalog variant (1:1 media, status badge,
 * 16px name) and the real page disagreed, and Directory is the real page. The Catalog
 * variant is documentation-only and is deliberately not built.
 *
 * Media is a **flat `--bg-skeleton`**, not the placeholder gradient — the only card
 * whose empty media has no caption.
 *
 * Radius is 16, and Home's is 20. Neither is `--radius-card` (18), so both are
 * literals: the token exists but no talent card uses it.
 *
 * Both overlay pills are local, not `OverlayBadge`: radius 13, `5px` vertical padding,
 * 11–12px type, and translucent fills of `--bg-page` at 94% and `--ink-primary` at 72%.
 *
 * The `·grow` node before the CTA row is a flex spacer, so the buttons sit on the
 * bottom edge and a row of cards with different text lengths keeps its CTAs aligned.
 *
 * **Two divergences, both recorded rather than silently smoothed.** The CTAs are drawn
 * h40/radius20, which matches no button size in the system (M is 42/21, the state-card
 * CTA is 36/18), so `Button` is overridden to 40. And Follow is drawn with a 1px
 * border where the DS secondary button is 1.5px; `Button` keeps 1.5px, since forking
 * the button over a half pixel costs more than it buys.
 */
export interface TalentDirectoryCardProps {
  name: string
  discipline: string
  /** e.g. "24.6k followers · 3 shows". */
  meta: string
  rating: string
  nextShow?: {
    /** e.g. "Thu 8 Oct · Riyadh Season Opening Night". */
    headline: string
    /** e.g. "Boulevard Arena · from SAR 180". */
    detail: string
  }
  verified?: boolean
  image?: string
  onGetTickets?: () => void
  onFollow?: () => void
  /** Public guest browse: name, discipline, rating only — no hire CTAs. */
  limited?: boolean
  className?: string
}

export function TalentDirectoryCard({
  name,
  discipline,
  meta,
  rating,
  nextShow,
  verified = true,
  image,
  onGetTickets,
  onFollow,
  limited = false,
  className,
}: TalentDirectoryCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-[16px] border border-border-default bg-surface-default',
        className,
      )}
    >
      <div className="relative h-[214px] w-full overflow-hidden bg-bg-skeleton">
        {image && <img src={image} alt="" className="size-full object-cover" />}

        {verified && (
          <p className="absolute top-md left-md rounded-[13px] bg-bg-page/94 px-[10px] py-[5px] text-[11px] font-bold tracking-[0.44px] text-ink-brand uppercase">
            Verified
          </p>
        )}

        <span className="absolute top-md right-md flex items-center gap-[6px] rounded-[13px] bg-ink-primary/72 px-[10px] py-[5px] text-bg-page">
          <StarFillIcon size={12} className="shrink-0" />
          <span className="text-[12px] font-semibold">{rating}</span>
        </span>
      </div>

      <div className="flex grow flex-col px-lg pt-lg pb-[18px]">
        <h3 className="text-[18px] font-semibold text-ink-primary">{name}</h3>
        <p className="mt-[6px] text-[14px] text-ink-secondary">{discipline}</p>
        {!limited && meta ? (
          <p className="mt-[6px] text-[13px] text-ink-muted">{meta}</p>
        ) : null}

        {!limited && nextShow && (
          <div className="mt-[10px] rounded-[12px] border border-border-divider bg-bg-page px-md py-[11px]">
            <p className="text-[11px] font-bold tracking-[0.66px] text-ink-muted uppercase">
              Next show
            </p>
            <p className="mt-xs text-[14px] font-semibold text-ink-primary">{nextShow.headline}</p>
            <p className="mt-[2px] text-[13px] text-ink-secondary">{nextShow.detail}</p>
          </div>
        )}

        {!limited && (
          <div className="mt-auto flex w-full gap-sm pt-md">
            <Button className="h-[40px] flex-1 rounded-[20px]" onClick={onGetTickets}>
              Get tickets
            </Button>
            <Button
              variant="secondary"
              className="h-[40px] rounded-[20px] px-[14px]"
              onClick={onFollow}
            >
              Follow
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}
