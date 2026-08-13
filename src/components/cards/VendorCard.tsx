import { ImagePlaceholder } from '@/components/data-display'
import { HeartGlyphIcon, StarFillIcon, VerifiedIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

/**
 * Figma `VendorCard` — node `207:3302`, with two sub-variants: Context=Row `207:3303`
 * (the Home "Vendor marketplace" strip) and Context=Directory `207:3317` (the vertical
 * card the Vendors page draws). They are not two arrangements of one layout — one is a
 * horizontal 64px-logo row and the other is a media-topped tile with a price row and two
 * CTAs — so `context` is the variant axis and the two bodies are written out separately.
 *
 * **Row** — radius 20, `18px` padding all round, a `15px` gap between the logo and the
 * body. The logo is a 64px square at radius 16 holding the placeholder. Name 16px/700
 * with the verified mark at 16, services 13px/500, then a meta row at a uniform `12px`
 * gap carrying the star, the rating in 700 and the coverage note in 500. `·sp` nodes of
 * 2 and 7px become margins. The row has no `overflow` clip of its own — only the logo
 * does — and that is left as drawn.
 *
 * **Directory** — radius 16, a flat `--bg-skeleton` media band 168 tall with no
 * placeholder and no caption, two overlay pills inset 12, then a body padded
 * 16 / 16 / 18 / 16: name 18px/600, services 14px/400, meta 13px/400, a price row over a
 * 1px `--border-divider` rule, and a `View profile` + save pair 40 tall.
 *
 * **Neither overlay pill is `OverlayBadge`.** Both are radius 13 against the badge's 10,
 * `5px` vertical padding against 4, and translucent grounds — `--bg-page` at 94% and
 * `--ink-primary` at 72% — where `OverlayBadge` is opaque. They are the same two pills
 * `TalentCard/Directory` draws, except inset 12 rather than 16, so the inset stays a
 * literal here rather than becoming `top-md`.
 *
 * **The two CTAs are near misses on `Button`, and they are handled differently on
 * purpose.** `View profile` is 40 tall at radius 20 where Button M is 42 at 21, so it is a
 * `Button` with those two values overridden — the same call `TalentCard/Directory` makes
 * for the identical geometry, so the 40/20 card CTA has one implementation across the
 * folder rather than two. The save button is 44×40 with a **1px** border, where Button's
 * icon variant is square with 1.5px; that is not a height override but a different shape,
 * so it stays local.
 *
 * Taking `Button` for `View profile` means it inherits the primary hover (the gradient
 * collapsing to a flat brand fill) that the source does not draw. That is the trade for
 * having one gradient CTA rather than a copy, and it is the same trade already recorded on
 * `TalentCard/Directory`. The 40 height and 20 radius still have no tokens; whether the
 * button scale should gain a size between S (36/18) and M (42/21) is a design decision.
 *
 * Every glyph was confirmed by downloading its asset. The three stars and the heart are
 * Phosphor — `<g id="glyph">` in each — with the row star and the heart filled `#191008`
 * (`--ink-primary`, inherited from their containers) and the pill star filled `#FFF7F3`
 * (`--bg-page`, likewise inherited). The verified mark is the two-tone brand burst,
 * `Icon/Verified` `207:1627`, which the project already ships as `VerifiedIcon`.
 *
 * The `View profile` gradient is `--gradient-brand`: `--brand-gradient-start` →
 * `--brand-gradient-end` through a midpoint at 52%. Figma binds that midpoint to
 * `--ink-brand` rather than `--brand-gradient-mid`; the two are the same `#f25f2c`, and
 * the ramp is the brand ramp, so `bg-brand-gradient` is used. The reported 164deg angle
 * and the 13.4% / 86.6% stop offsets are the bounding-box transform artefact that
 * `theme.css` documents, not a distinct gradient.
 *
 * **The export binds no spacing tokens on this card at all** — every gap, pad and inset
 * comes back as a bare pixel value, so every one of them stays a literal here even where
 * a token has the identical value (`gap-[8px]` and not `gap-sm`, `px-[16px]` and not
 * `px-lg`).
 *
 * Two deliberate additions, both called out rather than slipped in: `tabular-nums` on
 * the price, which every price in the system is specified to have and none of them
 * carries in Figma; and an `aria-label` on the save button, which is drawn as a bare
 * heart with no accessible text.
 *
 * The `·grow` before the price row becomes `mt-auto` on that row plus `grow` on the
 * body, so a row of cards keeps its price rules and CTAs aligned. Figma marks the body
 * `shrink-0`, which would make the `·grow` inert at the drawn size; the spacer is there
 * to be honoured, so the body grows. The 14px `·sp` that follows the `·grow` is carried
 * as `mb-[14px]` on the meta line, which `mt-auto` then expands past.
 *
 * The drawn 428 and 333px widths are that one instance and belong to the grid.
 *
 * **Not built, because the source never draws them:** hover, pressed and focus
 * treatments; the saved state of the heart; and a rating pill on the Row variant, which
 * puts its rating inline instead.
 */
export interface VendorCardProps {
  name: string
  /** e.g. "Staging · Rigging · Lighting" on Row, "Catering · VIP hosting" on Directory. */
  services: string
  rating: string
  context?: 'row' | 'directory'
  /** Row only — the note beside the rating, e.g. "Kingdom-wide". */
  coverage?: string
  /** Directory only — e.g. "Riyadh · Qassim · 302 reviews". */
  meta?: string
  /** Directory only — e.g. "SAR 9,000". Drawn after a "From" label. */
  price?: string
  /** Row draws the two-tone brand burst beside the name; Directory draws a VERIFIED pill. */
  verified?: boolean
  /**
   * Row fills the 64px logo square; Directory fills the 168px band, which Figma leaves
   * as flat `--bg-skeleton` with no placeholder.
   */
  image?: string
  onViewProfile?: () => void
  onSave?: () => void
  className?: string
}

export function VendorCard({
  name,
  services,
  rating,
  context = 'row',
  coverage,
  meta,
  price,
  verified = true,
  image,
  onViewProfile,
  onSave,
  className,
}: VendorCardProps) {
  if (context === 'directory') {
    return (
      <article
        className={cn(
          'flex flex-col overflow-hidden rounded-[16px] border border-border-default bg-surface-default',
          className,
        )}
      >
        <div className="relative h-[168px] w-full shrink-0 overflow-hidden bg-bg-skeleton">
          {image && <img src={image} alt="" className="size-full object-cover" />}

          {verified && (
            <p className="absolute top-[12px] left-[12px] rounded-[13px] bg-bg-page/94 px-[10px] py-[5px] text-[11px] font-bold tracking-[0.44px] text-ink-brand uppercase">
              Verified
            </p>
          )}

          <span className="absolute top-[12px] right-[12px] flex items-start gap-[6px] rounded-[13px] bg-ink-primary/72 px-[10px] py-[5px] text-bg-page">
            <StarFillIcon size={12} className="shrink-0" />
            <span className="text-[12px] font-semibold">{rating}</span>
          </span>
        </div>

        <div className="flex grow flex-col px-[16px] pt-[16px] pb-[18px]">
          <h3 className="text-[18px] font-semibold text-ink-primary">{name}</h3>
          <p className="mt-[6px] text-[14px] font-normal text-ink-secondary">{services}</p>
          {meta && (
            <p className="mt-[6px] mb-[14px] text-[13px] font-normal text-ink-muted">{meta}</p>
          )}

          {price && (
            <div className="mt-auto flex w-full items-baseline justify-between border-t border-border-divider pt-[14px]">
              <span className="text-[13px] font-normal text-ink-muted">From</span>
              <span className="text-[17px] font-semibold text-ink-primary tabular-nums">
                {price}
              </span>
            </div>
          )}

          <div className="mt-[12px] flex w-full gap-[8px]">
            <Button className="h-[40px] flex-1 rounded-[20px]" onClick={onViewProfile}>
              View profile
            </Button>
            <button
              type="button"
              aria-label="Save vendor"
              onClick={onSave}
              className="flex h-[40px] w-[44px] shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-border-default bg-surface-default text-ink-primary"
            >
              <HeartGlyphIcon />
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        'flex items-center gap-[15px] rounded-[20px] border border-border-default bg-surface-default p-[18px]',
        className,
      )}
    >
      <div className="size-[64px] shrink-0 overflow-hidden rounded-[16px]">
        {image ? (
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          // The instance Figma places here is the 16:10 placeholder squashed into a
          // square, caption and all, clipped to one line by the logo's own overflow.
          // `whitespace-nowrap` inherits down to the caption and reproduces that clip.
          <ImagePlaceholder
            ratio="fill"
            caption="Event imagery 16:10"
            className="whitespace-nowrap"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-[6px]">
          <h3 className="text-[16px] font-bold text-ink-primary">{name}</h3>
          {verified && <VerifiedIcon size={16} className="shrink-0" />}
        </div>

        <p className="mt-[2px] text-[13px] font-medium text-ink-secondary">{services}</p>

        <div className="mt-[7px] flex items-start gap-[12px] text-ink-primary">
          <StarFillIcon className="shrink-0" />
          <span className="text-[13px] font-bold">{rating}</span>
          {coverage && (
            <span className="text-[13px] font-medium text-ink-secondary">{coverage}</span>
          )}
        </div>
      </div>
    </article>
  )
}
