import { HeartGlyphIcon, StarFillIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * Figma `FeaturedHeroCard` — node 207:3194. The "Featured this week" carousel card.
 *
 * Drawn 288×494 with an 18px inset, radius 22, a full-bleed gradient ground, a vertical
 * scrim over it, pills pinned to the top and the content flushed to the bottom. The
 * width is the carousel's to decide so it is not fixed here, but the **494 height is**:
 * the card has no content-driven height at all — the root is `justify-end` over a media
 * ground, so without a height it would collapse to the four lines of text.
 *
 * Radius 22 is `--radius-panel`'s value, not `--radius-card`'s 18. The export writes a
 * bare 22 rather than binding the panel token, and a hero card is not a panel, so it
 * stays a literal.
 *
 * Measurements, top to bottom: top row absolutely inset 16 on three sides (not the 18 the
 * body uses) and 34 tall; pills 11px/700 with 11×5 padding at radius 13, 6 apart; overline
 * 12px/700 at 0.72 tracking; 7 gap; title 28px/700 at 1.03 line-height and −0.7 tracking;
 * 6 gap; venue row 13px/500 with a 4 gap around the 13px star; 14 gap; price row with
 * "From" at 14px/500 and the figure at 19px/800, 5 apart on a shared baseline; CTA 38 tall,
 * radius 19, 18 of horizontal padding, 13px/700.
 *
 * **The ground gradient matches none of the system's four ramps and is the one thing here
 * that needs a decision from the design side.** It reports as
 * `#ff9147 → var(--ink-brand) → var(--ink-link-hover)`, so its last stop is `#b8320f` where
 * `--gradient-brand` ends on `--brand-gradient-end` `#d8431a`. Since the stops do not match
 * an existing token it is written out as a literal rather than folded into
 * `bg-brand-gradient`, which would silently change the colour. The reported angle is
 * 135.28°, which is the documented 135 within rounding, so the angle is normalised and the
 * stop offsets (13.397 / 50 / 86.603 — the same box-transform artefact as the angle drift)
 * are kept exactly as exported.
 *
 * The Tickets CTA is the opposite case: Figma reports it at 141.59°, but its two stops are
 * `--brand-gradient-start → --brand-identity-end`, which is `--gradient-identity` exactly,
 * so it takes `bg-identity-gradient` and the per-instance angle is dropped.
 *
 * The overline uses `--color-ink-warm-on-dark` (`#ffb48a`) — unbound in Figma, tokenised
 * here so hero date lines stay consistent across cards.
 *
 * **Nothing here is an instance.** The two pills are 11px/700 at 11×5 and radius 13 on
 * opaque grounds, where `OverlayBadge` is 12px/700 at 4×10, radius 10, on white at 92%,
 * so they are drawn locally exactly as the other page cards draw theirs. The CTA misses
 * `Button` on every axis at once — 38 tall against size M's 42, radius 19 against 21,
 * 13px/700 against 14px/600, and the identity ramp where `primary` carries the three-stop
 * brand ramp — so it is a plain button rather than a five-property override.
 *
 * The favourite is the icon-button role at exactly its two tokens, 34 box and 17 radius,
 * unlike the event card's 32px box which had to be written literal. The heart and star are
 * Phosphor (the exports carry Phosphor's `<g id="glyph">`) at regular and fill weight,
 * matching the wrapped glyphs.
 *
 * Three deliberate additions, all called out rather than assumed. The `image` prop exists
 * because Figma's own description says *"Image fill goes on the component root when assets
 * land"* — the gradient is a fallback, so it stays underneath. The overline is uppercased in
 * CSS where Figma simply typed the string in capitals, as on `EventCard`. And the price
 * figure is `tabular-nums`, which every price in the system is specified to have and none
 * of them carries in Figma.
 *
 * **Not built, because the source never draws them:** hover, the saved state of the
 * favourite, and any carousel affordance — the card is drawn as a single still frame.
 */
export interface FeaturedHeroCardProps {
  /** e.g. "Thu 8 Oct · 20:00". Rendered uppercase. */
  date: string
  title: string
  /** Venue name alone. The card draws the separator that follows it. */
  venue: string
  rating: string
  /** e.g. "SAR 180". The "From" label is drawn by the card. */
  price: string
  category?: string
  /** The urgency pill, e.g. "Nearly sold out". */
  flag?: string
  /** Replaces the gradient ground. The gradient stays behind it as the fallback. */
  image?: string
  onToggleFavourite?: () => void
  onTickets?: () => void
  className?: string
}

export function FeaturedHeroCard({
  date,
  title,
  venue,
  rating,
  price,
  category,
  flag,
  image,
  onToggleFavourite,
  onTickets,
  className,
}: FeaturedHeroCardProps) {
  return (
    <article
      className={cn(
        'group relative flex h-[494px] flex-col items-start justify-end overflow-hidden rounded-[22px] p-[18px]',
        'bg-[linear-gradient(135deg,var(--color-brand-gradient-start)_13.397%,var(--color-ink-brand)_50%,var(--color-ink-link-hover)_86.603%)]',
        'transition-[transform,box-shadow] duration-normal ease-standard',
        'hover:-translate-y-0.5 hover:shadow-lift',
        'motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none',
        className,
      )}
    >
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-slow ease-standard group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
        />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(25,16,8,0.1)_0%,rgba(25,16,8,0)_30%,rgba(25,16,8,0.62)_70%,rgba(25,16,8,0.95)_100%)]" />

      <div className="absolute top-lg right-lg left-lg flex h-[34px] items-start justify-between">
        <div className="flex items-start gap-[6px]">
          {category && (
            <p className="rounded-[13px] bg-surface-default px-[11px] py-[5px] text-[11px] font-bold text-ink-primary">
              {category}
            </p>
          )}
          {flag && (
            <p className="rounded-[13px] bg-brand-gradient-end px-[11px] py-[5px] text-[11px] font-bold text-ink-inverse">
              {flag}
            </p>
          )}
        </div>

        {onToggleFavourite ? (
          <button
            type="button"
            aria-label="Save event"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleFavourite()
            }}
            className="flex size-icon-btn shrink-0 items-center justify-center rounded-icon-btn bg-surface-default text-ink-primary"
          >
            <HeartGlyphIcon size={15} />
          </button>
        ) : (
          <span
            aria-hidden
            className="pointer-events-none flex size-icon-btn shrink-0 items-center justify-center rounded-icon-btn bg-surface-default text-ink-primary"
          >
            <HeartGlyphIcon size={15} />
          </span>
        )}
      </div>

      <div className="relative flex w-full flex-col items-start">
        <p className="text-[12px] font-bold tracking-[0.72px] text-ink-warm-on-dark uppercase">
          {date}
        </p>

        <h3 className="mt-[7px] text-[28px] leading-[1.03] font-bold tracking-[-0.7px] text-ink-inverse">
          {title}
        </h3>

        <div className="mt-[6px] flex items-center gap-xs text-ink-inverse">
          <p className="text-[13px] font-medium">{venue} ·</p>
          <StarFillIcon className="shrink-0" />
          <span className="text-[13px] font-medium">{rating}</span>
        </div>

        <div className="mt-[14px] flex w-full items-center justify-between">
          <p className="flex items-baseline gap-[5px] text-ink-inverse">
            <span className="text-[14px] font-medium">From</span>
            <span className="text-[19px] font-extrabold tabular-nums">{price}</span>
          </p>

          {onTickets ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onTickets()
              }}
              className="flex h-[38px] shrink-0 items-center justify-center rounded-[19px] bg-identity-gradient px-[18px] text-[13px] font-bold text-ink-inverse"
            >
              Tickets
            </button>
          ) : (
            <span className="pointer-events-none flex h-[38px] shrink-0 items-center justify-center rounded-[19px] bg-identity-gradient px-[18px] text-[13px] font-bold text-ink-inverse">
              Tickets
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
