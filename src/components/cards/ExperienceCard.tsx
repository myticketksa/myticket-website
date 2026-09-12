import { AttributeTag, ImagePlaceholder } from '@/components/data-display'
import { StarFillIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * Figma `ExperienceCard` — node `207:3166`, with two sub-variants: Context=Catalog
 * `207:3167` (the design-system documentation card) and Context=Home `207:3177` (the
 * card the MyTicket Home page actually draws). They share a shell and a media band and
 * agree on nothing else, so `context` is the variant axis.
 *
 * The Experiences directory (`207:6795`) draws Catalog cards with an optional rating
 * row and a bordered price footer beyond the DS documentation card (title / location /
 * tags). Those slots are opt-in via `rating` / `guests` / `price` so Home and Probe
 * keep the lean Catalog drawing when they omit them.
 *
 * | | Catalog | Home |
 * | --- | --- | --- |
 * | radius | 16 | 20 |
 * | body padding | 14 / 16 / 16 / 16 | 15 / 16 / 17 / 16 |
 * | title | 16px/700, line-height 1.25, no tracking | `Heading/Card` — 17px/700, 1.22, −0.255 |
 * | location line | 13px/400 `--ink-secondary` | 13px/600 `--brand-gradient-end` |
 * | below it | AttributeTag row; optional rating + price | summary, then a rating row |
 * | media overlays | none at all | a category chip, bottom-left |
 *
 * **Media is a fixed 200px band, and the description says it should not be.** Figma's
 * own note for the Catalog variant reads *"Media height is 16:10 of the 320 display
 * width. The source states a RATIO, not pixels"* — but the export draws `h-[200px]` on
 * both variants, and the Home card is 315 wide, where 200px is not 16:10. The drawing
 * wins, exactly as it does for the 186px band on `EventCard`.
 *
 * The category chip is **not** `OverlayBadge`: radius 12 against 10, 5px vertical
 * padding against 4, and 11px/700 against `Label/Badge` at 12px/700. Three mismatches,
 * so it is drawn locally. Its ground is bound to `--ink-primary`, an ink token doing a
 * surface job, and it is kept as bound rather than swapped for `--surface-inverse`
 * (which is the same `#191008`) because the export is what it is.
 *
 * The tag row **is** `AttributeTag`, which matches the instance exactly — 11.5px/600,
 * `3px 9px` padding, radius 9, `--bg-page` on a 1px `--border-default`,
 * `--ink-secondary` text. Figma draws exactly two labels and states that no third is to
 * be invented, so `tags` is a caller-supplied list with no default.
 *
 * The star was confirmed by downloading the asset: Phosphor at fill weight, 13px, filled
 * `#191008`, which is `--ink-primary` and also the colour of the rating figure beside
 * it — so it inherits the row's colour rather than setting its own. Catalog directory
 * cards mute the whole rating string to `--ink-muted` instead.
 *
 * **The two variants bind their padding differently and that is reproduced verbatim.**
 * Catalog's body writes `var(--space-lg)` and `var(--space-sm)`; Home writes bare `16px`
 * literals for the same measurement. Bound values become `px-lg`/`mb-sm`, bare ones stay
 * `px-[16px]`, because a literal that happens to equal a token is still a literal.
 *
 * The Home title is `Heading/Card` down to the −0.255px tracking, so it uses the
 * `text-heading-card` class.
 *
 * Home's `·sp` nodes of 3, 9 and 11px become margins, and the `·grow` before the rating
 * row becomes `mt-auto` on that row plus `grow` on the body, so a row of cards with
 * summaries of different lengths still lines its ratings up. The 11px `·sp` sits between
 * the summary and the `·grow`, so it is carried as `mb-[11px]` on the summary — a
 * minimum gap that `mt-auto` then expands.
 *
 * Catalog directory price footer: `border-t` on `--border-divider`, `pt-[12px]`,
 * "Per person" at 13/400 muted, price at 18/600 primary — from `207:6852`.
 *
 * The drawn 372px height and the 315/320px widths are that one instance. Height follows
 * the content and width belongs to the grid, so neither is fixed here.
 *
 * **Not built, because the source never draws them:** hover, pressed and selected
 * states; a favourite button (this card has none, unlike `EventCard`); and a tag row
 * on Home.
 */
export interface ExperienceCardProps {
  title: string
  /**
   * The line under the title. Catalog draws it as a muted descriptor
   * ("Heritage site · AlUla"); Home draws the same slot as a brand-coloured region
   * ("Riyadh Region").
   */
  location: string
  context?: 'catalog' | 'home'
  /**
   * Catalog only. Figma draws exactly two ("Guided tours", "Family") and is explicit
   * that no third label is to be invented, so there is no default.
   */
  tags?: string[]
  /** Home only — the chip over the bottom-left of the media, e.g. "Nature". */
  category?: string
  /** Home only — the multi-line summary under the region line. */
  summary?: string
  /**
   * Home: e.g. "4.9". Catalog directory: full muted string fragment, e.g. "4.9 (214)".
   */
  rating?: string
  /** Home only. Rendered in parentheses, so pass "1,204 reviews". */
  reviews?: string
  /** Catalog directory only — e.g. "Max 12 guests", joined after rating with " · ". */
  guests?: string
  /** Catalog directory only — e.g. "SAR 320". */
  price?: string
  /** Catalog directory only. Defaults to "Per person". */
  priceLabel?: string
  /**
   * Catalog directory only — category · duration eyebrow, e.g. "Food & desert · 4 hrs".
   * Rendered uppercase at 12px / brand.
   */
  eyebrow?: string
  /** Catalog directory only — cover flag, e.g. "Bestseller". */
  flag?: string
  image?: string
  className?: string
}

export function ExperienceCard({
  title,
  location,
  context = 'catalog',
  tags,
  category,
  summary,
  rating,
  reviews,
  guests,
  price,
  priceLabel = 'Per person',
  eyebrow,
  flag,
  image,
  className,
}: ExperienceCardProps) {
  const isHome = context === 'home'
  const catalogRatingLine = rating
    ? guests
      ? `${rating} · ${guests}`
      : rating
    : null

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden border border-border-default bg-surface-default',
        'transition-[transform,box-shadow] duration-normal ease-standard',
        'hover:-translate-y-0.5 hover:shadow-lift',
        'motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none',
        isHome ? 'rounded-[20px]' : 'rounded-[18px]',
        className,
      )}
    >
      <div
        className={cn(
          'h-[200px] w-full shrink-0 overflow-hidden',
          (isHome || flag) && 'relative',
        )}
      >
        {image ? (
          <img
            src={image}
            alt=""
            className="size-full object-cover transition-transform duration-slow ease-standard group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
        ) : (
          <ImagePlaceholder ratio="fill" caption="Event imagery 16:10" />
        )}

        {isHome && category && (
          <p className="absolute bottom-[10px] left-[10px] rounded-[12px] bg-ink-primary px-[10px] py-[5px] text-[11px] font-bold text-ink-inverse">
            {category}
          </p>
        )}

        {!isHome && flag && (
          <p className="absolute top-[12px] left-[12px] rounded-[13px] bg-bg-page px-[10px] py-[5px] text-[11px] font-bold text-ink-brand">
            {flag}
          </p>
        )}
      </div>

      {isHome ? (
        <div className="flex grow flex-col px-[16px] pt-[15px] pb-[17px]">
          <h3 className="text-heading-card text-ink-primary">{title}</h3>
          <p className="mt-[3px] text-[13px] font-semibold text-brand-gradient-end">
            {location}
          </p>

          {summary && (
            <p className="mt-[9px] mb-[11px] text-[13px] leading-[1.5] font-medium text-ink-secondary">
              {summary}
            </p>
          )}

          {rating && (
            <div className="mt-auto flex items-start gap-[4px] text-ink-primary">
              <StarFillIcon className="shrink-0" />
              <span className="text-[13px] font-bold">{rating}</span>
              {reviews && (
                <span className="text-[13px] font-medium text-ink-muted">({reviews})</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex grow flex-col gap-[5px] p-lg">
          {eyebrow && (
            <p className="text-[12px] font-semibold tracking-[0.48px] text-ink-brand uppercase">
              {eyebrow}
            </p>
          )}
          <h3 className="text-[17px] leading-[1.25] font-semibold text-ink-primary">{title}</h3>
          <p className="text-[14px] font-normal text-ink-secondary">{location}</p>

          {tags && tags.length > 0 && (
            <div className="flex w-full flex-wrap gap-[6px]">
              {tags.map((tag) => (
                <AttributeTag key={tag}>{tag}</AttributeTag>
              ))}
            </div>
          )}

          {catalogRatingLine && (
            <div className="flex items-center gap-[5px]">
              <StarFillIcon className="shrink-0 text-ink-primary" />
              <span className="text-[13px] font-normal text-ink-muted">
                {catalogRatingLine}
              </span>
            </div>
          )}

          {price && (
            <div className="mt-auto flex w-full items-baseline justify-between border-t border-border-divider pt-[12px]">
              <span className="text-[13px] font-normal text-ink-muted">{priceLabel}</span>
              <span className="text-[18px] font-semibold text-ink-primary">{price}</span>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
