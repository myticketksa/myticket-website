import { ImagePlaceholder } from '@/components/data-display'
import { HeartGlyphIcon, StarFillIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * Figma `EventCard` — Context=Home `207:3255`, `EventCard/Catalog` `207:3276`.
 *
 * The two are **geometrically identical** — same 16 radius, same 186 media band, same
 * chips, gaps and padding — and differ only in type weight and two paint details.
 * Figma's own summary: Home is *"the heavier Home-page card (700/800 weights, orange
 * price)"* and Catalog is *"the calmer directory card (600 weights, ink 18px price)"*.
 * So `context` is the variant axis and everything structural is shared.
 *
 * | | Home | Catalog |
 * | --- | --- | --- |
 * | date overline | 800 | 600 |
 * | title | 700 | 600 |
 * | venue, attendance, "From" | 500 | 400 |
 * | rating | 700 | 500 |
 * | price | 19px/800 `--brand-identity-end` | 18px/600 `--ink-primary` |
 * | favourite | opaque `--surface-default`, radius 17, heart 15 | `--bg-page` at 94%, radius 16, heart 14 |
 *
 * Media is a **fixed 186 band, not a ratio**. Figma flags the disagreement itself: the
 * documented spec says 16:10, and 186px is not 16:10 at any card width, so the drawing
 * releases the placeholder's aspect lock and stretches it. The drawing wins.
 *
 * **Nothing on this card is an instance, and that is deliberate.** Figma lists four
 * mismatches against `OverlayBadge` (11px/600 against 12px/700, padding 4×9 against
 * 4×10, radius 12 against 10, and opaque grounds against 92% white), so both chips are
 * local. The meta row splits into two colours where `StarRating` inline is a single
 * muted string. And neither price matches `PriceDisplay` card, which is 14px/700.
 *
 * Where the written description and the drawing disagree, the drawing wins — which
 * matters in four places: the favourite carries a Phosphor heart, not a ♡ character;
 * the category chip is opaque `--surface-inverse`, not ink at 78%; and on Home both the
 * overline and the price are a weight heavier and the price a colour warmer than
 * described.
 *
 * Two smaller reconciliations: the rating figure is bound to `--surface-inverse` in the
 * source, which is the same `#191008` as `--ink-primary` but is a surface token doing a
 * text job, so `--ink-primary` is used; and the price gets `tabular-nums`, which every
 * price in the system is specified to have and none of them carries in Figma.
 *
 * The title is 17px at 1.22 line-height — `Heading/Card` exactly, except that style
 * carries −0.255px tracking and this text node carries none, so it is written out rather
 * than reusing the class.
 *
 * `·grow` before the footer keeps the price on the bottom edge, so a row of cards with
 * one- and two-line titles still lines its prices up. The drawn 377px height is that one
 * instance, not a constraint.
 *
 * **Not built, because the source never draws them:** hover (the spec says
 * `shadow/lift`, the page says a `#FFC8AE` border, and neither is a drawn state) and
 * the saved state of the favourite.
 */
export interface EventCardProps {
  /** e.g. "Thu 8 Oct · 20:00". Rendered uppercase. */
  date: string
  title: string
  venue: string
  rating: string
  /** e.g. "3,410 attending". */
  attendance: string
  /** e.g. "SAR 180". */
  price: string
  context?: 'home' | 'catalog'
  category?: string
  /** The urgency chip, e.g. "Nearly sold out". */
  flag?: string
  image?: string
  onToggleFavourite?: () => void
  className?: string
}

export function EventCard({
  date,
  title,
  venue,
  rating,
  attendance,
  price,
  context = 'home',
  category,
  flag,
  image,
  onToggleFavourite,
  className,
}: EventCardProps) {
  const isHome = context === 'home'

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-[16px] border border-border-default bg-surface-default',
        'transition-[transform,box-shadow] duration-normal ease-standard',
        'hover:-translate-y-0.5 hover:shadow-lift',
        'motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none',
        className,
      )}
    >
      <div className="relative h-[186px] w-full shrink-0 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt=""
            className="size-full object-cover transition-transform duration-slow ease-standard group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
        ) : (
          <ImagePlaceholder ratio="fill" caption="Event imagery 16:10" />
        )}

        {flag && (
          <p
            className={cn(
              'absolute top-[10px] left-[10px] rounded-[12px] px-[9px] py-xs text-[11px] font-semibold text-ink-inverse',
              // Figma paints age flags (`18+`) and schedule flags (`Today`) with `--ink-brand`;
              // urgency uses gradient-end.
              flag === '18+' || flag === 'Today'
                ? 'bg-ink-brand'
                : 'bg-brand-gradient-end',
            )}
          >
            {flag}
          </p>
        )}

        {onToggleFavourite ? (
          <button
            type="button"
            aria-label="Save event"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleFavourite()
            }}
            className={cn(
              'absolute top-[10px] right-[10px] flex size-[32px] items-center justify-center text-ink-primary',
              isHome ? 'rounded-icon-btn bg-surface-default' : 'rounded-[16px] bg-bg-page/94',
            )}
          >
            <HeartGlyphIcon size={isHome ? 15 : 14} />
          </button>
        ) : (
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-[10px] right-[10px] flex size-[32px] items-center justify-center text-ink-primary',
              isHome ? 'rounded-icon-btn bg-surface-default' : 'rounded-[16px] bg-bg-page/94',
            )}
          >
            <HeartGlyphIcon size={isHome ? 15 : 14} />
          </span>
        )}

        {category && (
          <p className="absolute bottom-[10px] left-[10px] rounded-[12px] bg-surface-inverse px-[9px] py-xs text-[11px] font-semibold text-bg-page">
            {category}
          </p>
        )}
      </div>

      <div className="flex grow flex-col gap-[7px] px-lg pt-[15px] pb-lg">
        <p
          className={cn(
            'text-[12px] tracking-[0.48px] text-ink-brand uppercase',
            isHome ? 'font-extrabold' : 'font-semibold',
          )}
        >
          {date}
        </p>
        <h3
          className={cn(
            'text-[17px] leading-[1.22] text-ink-primary',
            isHome ? 'font-bold' : 'font-semibold',
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'text-[13px] text-ink-secondary',
            isHome ? 'font-medium' : 'font-normal',
          )}
        >
          {venue}
        </p>

        <div className="flex w-full items-center gap-md">
          <StarFillIcon className="shrink-0 text-ink-primary" />
          <span
            className={cn(
              'text-[13px] text-ink-primary',
              isHome ? 'font-bold' : 'font-medium',
            )}
          >
            {rating}
          </span>
          <span
            className={cn(
              'text-[13px] text-ink-secondary',
              isHome ? 'font-medium' : 'font-normal',
            )}
          >
            {attendance}
          </span>
        </div>

        <div className="mt-auto flex w-full items-baseline justify-between border-t border-border-divider pt-md">
          <span
            className={cn(
              'text-[13px] text-ink-muted',
              isHome ? 'font-medium' : 'font-normal',
            )}
          >
            From
          </span>
          <span
            className={cn(
              'tabular-nums',
              isHome
                ? 'text-[19px] font-extrabold text-brand-identity-end'
                : 'text-[18px] font-semibold text-ink-primary',
            )}
          >
            {price}
          </span>
        </div>
      </div>
    </article>
  )
}
