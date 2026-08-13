import { ImagePlaceholder } from '@/components/data-display'
import { CheckGlyphIcon, StarFillIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * Figma `OrganizerCard` — node `207:3347`, with two sub-variants: Context=Tile
 * `207:3348` (the Home "Organizers to follow" tile) and Context=Directory `207:3362`
 * (the card the Organizers page draws). One is a narrow centred tile with a circular
 * mark, the other a wide cover-and-overlap card with two CTAs, so `context` is the
 * variant axis and the two layouts are written out separately.
 *
 * **Tile** — radius 20, `18px` padding all round, everything centred. A 66px circular
 * mark at radius 33 holding the placeholder, then the name at 15px/700 with line-height
 * 1.25 and −0.225px tracking, then a meta row at a `4px` gap, then a full-width Follow
 * 36 tall. `·sp` nodes of 12 and 4px become margins.
 *
 * **Directory** — radius 18, a flat `--bg-skeleton` cover 116 tall, a 56px logo mark at
 * radius 28 on a 3px `--surface-default` ring positioned absolutely at 87/19 so it
 * overhangs the cover, and a body padded `20px` on the sides and bottom with **no top
 * padding**: Figma opens it with a 40px `·sp` instead, which is what clears the
 * overhanging mark, so it is carried as a margin on the name row rather than quietly
 * converted to `pt-[40px]`. Then the name at 18px/600 with the check, the category at
 * 14px/400, a stats row at an `18px` gap, and the CTA pair 38 tall.
 *
 * The tile's meta row is a **single sentence split across three nodes** — "84 events ·",
 * the star, then "4.8" — so the interpunct is drawn as part of the first string and is
 * reproduced there. All three sit at 13px/500 in `--ink-secondary`, and the star was
 * confirmed filled `#6B5F58`, which is that same `--ink-secondary`, so it inherits.
 *
 * The Directory stats are the opposite treatment of the same figures: the numbers step
 * up to 600 in `--ink-primary` while their labels stay 400 in `--ink-muted`, and that
 * card's star is filled `#8E8078` — `--ink-muted` — so it inherits there too. Both stars
 * are Phosphor at fill weight and 13px.
 *
 * **The check beside the Directory name is Phosphor `Check` at regular weight, not the
 * two-tone verified burst.** The asset carries `<g id="glyph">` and its outline is 16/256
 * of the box wide, which is Phosphor's regular stroke exactly; it is filled `#F25F2C`,
 * so `--ink-brand`. `VerifiedIcon` — which `VendorCard` and `TalentCard` both draw beside
 * a name — would have been the obvious guess and is the wrong shape.
 *
 * **Neither Directory CTA is `Button`.** Both are 38 tall at radius 19, which matches no
 * button size in the system (L is 48/24, M is 42/21, S is 36/18), and `View profile`
 * carries a **1px** border where Button's secondary style is 1.5px. The Tile's Follow is
 * the near miss: 36 tall at radius 18 with a 1.5px `--border-default` border is Button
 * secondary S down to the pixel, but it is drawn at **700** where that size is 600. All
 * three are therefore local, which also means none of them carries a hover treatment,
 * since the source draws none.
 *
 * The Directory Follow gradient is `--gradient-identity`: two stops,
 * `--brand-gradient-start` → `--brand-identity-end`, no midpoint. That is the ramp the
 * Toggle track and a selected FilterChip use, and it is deliberately **not** the brand
 * ramp — a different end red and no plateau at `brand/primary`. The reported 160deg angle
 * and the 13.4% / 86.6% stop offsets are the bounding-box transform artefact that
 * `theme.css` documents.
 *
 * **The export binds no spacing tokens on this card at all** — every gap, pad and inset
 * comes back as a bare pixel value, so all of them stay literals here even where a token
 * matches (`gap-[8px]` and not `gap-sm`, `px-[20px]` and not `px-xl`). Radius 18 on the
 * Directory shell is the same: it equals `--radius-card`, and the export writes it as a
 * literal, so a literal it stays.
 *
 * Two divergences from the export, both deliberate. Figma gives the tile's two meta
 * strings fixed widths of 66 and 19px, which are simply the measured widths of the drawn
 * text; they are dropped so the row hugs whatever it is given. And the asset constant for
 * the Directory star is named `...StarFill14` while the node it fills is `icon/star-fill@13`
 * in a 13px box — the box is what is implemented.
 *
 * The Tile's `·grow` becomes `mt-auto` on the Follow button plus a growing column, so a
 * row of tiles with one- and two-line names keeps its buttons aligned; the 12px `·sp`
 * ahead of it rides along as `mb-[12px]` on the meta row, a minimum gap that `mt-auto`
 * expands past. **The Directory variant draws no `·grow`,** so its CTAs are not pinned to
 * the bottom edge and a row of them with different name lengths will not align. That is
 * as drawn and is left alone.
 *
 * The drawn 204px tile height and the 207 and 428px widths are that one instance.
 *
 * **Not built, because the source never draws them:** hover, pressed and focus
 * treatments; the followed state of either Follow button; and a check on the Tile, which
 * draws none.
 */
export interface OrganizerCardProps {
  name: string
  /** The event count on its own, e.g. "84". Both variants draw the word "events" themselves. */
  events: string
  rating: string
  context?: 'tile' | 'directory'
  /** Directory only — e.g. "Entertainment season · Riyadh". */
  category?: string
  /** Directory only — the follower count on its own, e.g. "1.2M". */
  followers?: string
  /** Directory only — draws the brand check beside the name. */
  verified?: boolean
  /**
   * The Tile's 66px circular mark and the Directory's 56px logo mark. Figma leaves the
   * Directory mark as flat `--bg-skeleton` with no placeholder, so it renders only when
   * a source is supplied.
   */
  avatar?: string
  /** Directory only — the 116px cover band, likewise drawn as flat `--bg-skeleton`. */
  cover?: string
  onFollow?: () => void
  onViewProfile?: () => void
  className?: string
}

export function OrganizerCard({
  name,
  events,
  rating,
  context = 'tile',
  category,
  followers,
  verified = true,
  avatar,
  cover,
  onFollow,
  onViewProfile,
  className,
}: OrganizerCardProps) {
  if (context === 'directory') {
    return (
      <article
        className={cn(
          'relative flex flex-col overflow-hidden rounded-[18px] border border-border-default bg-surface-default',
          className,
        )}
      >
        <div className="h-[116px] w-full shrink-0 overflow-hidden bg-bg-skeleton">
          {cover && <img src={cover} alt="" className="size-full object-cover" />}
        </div>

        <div className="flex flex-col px-[20px] pb-[20px]">
          <div className="mt-[40px] flex items-center gap-[8px]">
            <h3 className="text-[18px] font-semibold text-ink-primary">{name}</h3>
            {verified && <CheckGlyphIcon className="shrink-0 text-ink-brand" />}
          </div>

          {category && (
            <p className="mt-[4px] text-[14px] font-normal text-ink-secondary">{category}</p>
          )}

          <div className="mt-[14px] flex items-start gap-[18px] text-[13px] font-normal text-ink-muted">
            <p>
              <span className="font-semibold text-ink-primary">{events}</span> events
            </p>
            {followers && (
              <p>
                <span className="font-semibold text-ink-primary">{followers}</span> followers
              </p>
            )}
            <span className="flex items-center gap-[5px]">
              <StarFillIcon className="shrink-0" />
              <span>{rating}</span>
            </span>
          </div>

          <div className="mt-[16px] flex w-full gap-[10px]">
            <button
              type="button"
              onClick={onFollow}
              className="flex h-[38px] flex-1 items-center justify-center overflow-hidden rounded-[19px] bg-identity-gradient text-[14px] font-semibold text-ink-inverse"
            >
              Follow
            </button>
            <button
              type="button"
              onClick={onViewProfile}
              className="flex h-[38px] flex-1 items-center justify-center overflow-hidden rounded-[19px] border border-border-default bg-surface-default text-[14px] font-semibold text-ink-primary"
            >
              View profile
            </button>
          </div>
        </div>

        {/* Last child, so it paints over the body it overhangs. */}
        <div className="absolute top-[87px] left-[19px] size-[56px] overflow-hidden rounded-[28px] border-[3px] border-surface-default bg-bg-skeleton">
          {avatar && <img src={avatar} alt="" className="size-full object-cover" />}
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        'flex flex-col items-center rounded-[20px] border border-border-default bg-surface-default p-[18px]',
        className,
      )}
    >
      <div className="size-[66px] shrink-0 overflow-hidden rounded-[33px]">
        {avatar ? (
          <img src={avatar} alt="" className="size-full object-cover" />
        ) : (
          // The instance Figma places here is the 16:10 placeholder squashed into a
          // circle, caption and all, clipped to one line by the mark's own overflow.
          // `whitespace-nowrap` inherits down to the caption and reproduces that clip.
          <ImagePlaceholder
            ratio="fill"
            caption="Event imagery 16:10"
            className="whitespace-nowrap"
          />
        )}
      </div>

      <h3 className="mt-[12px] w-full text-center text-[15px] leading-[1.25] font-bold tracking-[-0.225px] text-ink-primary">
        {name}
      </h3>

      <div className="mt-[4px] mb-[12px] flex items-center gap-[4px] text-[13px] font-medium text-ink-secondary">
        <span>{events} events ·</span>
        <StarFillIcon className="shrink-0" />
        <span>{rating}</span>
      </div>

      <button
        type="button"
        onClick={onFollow}
        className="mt-auto flex h-[36px] w-full items-center justify-center overflow-hidden rounded-[18px] border-[1.5px] border-border-default bg-surface-default text-[13px] font-bold text-ink-primary"
      >
        Follow
      </button>
    </article>
  )
}
