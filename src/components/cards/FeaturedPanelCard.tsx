import { ImagePlaceholder } from '@/components/data-display'
import { StarFillIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * Figma `FeaturedPanelCard` — node 207:3220. The curated "Featured events" panel card.
 *
 * Drawn 396 wide with a **fixed 220 media band**, radius 20, and a body inset 18 on three
 * sides with 20 at the bottom. The width belongs to the grid so it is not fixed; the media
 * height is part of the card and is.
 *
 * Measurements down the body: overline 12px/800 at 0.6 tracking; 7 gap; title 26px/700 at
 * 1.05 line-height and −0.78 tracking; 8 gap; venue 14px/500; 16 gap; meta row with the
 * price at 16px/800 and the rating pair at 13px/500, the 13px star 5 from its text.
 *
 * **The border is the one real surprise.** Every other card in the file draws
 * `--border-default` `#f3ded2`; this one draws `rgba(25, 16, 8, 0.07)` — `--ink-primary` at
 * 7%, an unbound literal. Figma's description explains why the card is unusual (*"white on
 * the pastel gradient panel"*) without mentioning the border, and a warm-grey hairline
 * behaves differently over a tinted panel than the pink `--border-default` does. The
 * drawing wins, so the translucent ink border is kept and the divergence recorded here.
 * The panel it sits on belongs to the page section, not to this card.
 *
 * Radius 20 is neither `--radius-card` (18) nor `--radius-panel` (22), so it is a literal.
 *
 * The media is a genuine `ImagePlaceholder` instance — the 168.57° reported angle and the
 * `#e8ddd6 → #d8ccc4` stops are `--gradient-placeholder`, and the caption is the atom's own
 * 12px/600 `--ink-muted`. As on the event card the instance is stretched to a fixed pixel
 * height with its 16:10 aspect lock released, which is what `ratio="fill"` reproduces.
 *
 * Two type notes. The overline is 12px/800 like `Label/Overline` but tracks 0.6 where that
 * style tracks 1.2, so it is written out rather than reusing the class. And the price is a
 * single text node reading "From SAR 450" — this card does not split the label from the
 * figure the way `EventCard` does, so it takes one prop; it is also not `PriceDisplay`,
 * whose card context is 14px/700 against this 16px/800.
 *
 * The star's export is filled `#8E8078`, so it takes `--ink-muted` from the row rather than
 * setting its own colour, exactly as the other cards let it inherit.
 *
 * Three deliberate additions: `tabular-nums` on the price, which every price in the system
 * is specified to have and none carries in Figma; the CSS uppercase on the overline, where
 * Figma typed the string in capitals; and the optional `image`, which swaps out the
 * placeholder the way it does on the other cards — a placeholder exists to be replaced.
 *
 * **Not built, because the source never draws them:** hover, a favourite control, any
 * overlay pill on the media, and a CTA. This card is a quiet block of information.
 */
export interface FeaturedPanelCardProps {
  /** e.g. "Thu 22 Oct — 3 days". Rendered uppercase. */
  date: string
  title: string
  venue: string
  /** Drawn as one string including the label, e.g. "From SAR 450". */
  price: string
  /** The text beside the star, e.g. "4.9 · 180k going". */
  meta: string
  image?: string
  className?: string
}

export function FeaturedPanelCard({
  date,
  title,
  venue,
  price,
  meta,
  image,
  className,
}: FeaturedPanelCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-[20px] border border-ink-primary/7 bg-surface-default',
        className,
      )}
    >
      <div className="h-[220px] w-full shrink-0 overflow-hidden">
        {image ? (
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          <ImagePlaceholder ratio="fill" caption="Event imagery 16:10" />
        )}
      </div>

      <div className="flex flex-col px-[18px] pt-[18px] pb-xl">
        <p className="text-[12px] font-extrabold tracking-[0.6px] text-brand-gradient-end uppercase">
          {date}
        </p>

        <h3 className="mt-[7px] text-[26px] leading-[1.05] font-bold tracking-[-0.78px] text-ink-primary">
          {title}
        </h3>

        <p className="mt-sm text-[14px] font-medium text-ink-secondary">{venue}</p>

        <div className="mt-lg flex w-full items-center justify-between">
          <p className="text-[16px] font-extrabold tabular-nums text-ink-primary">{price}</p>

          <span className="flex items-center gap-[5px] text-ink-muted">
            <StarFillIcon className="shrink-0" />
            <span className="text-[13px] font-medium">{meta}</span>
          </span>
        </div>
      </div>
    </article>
  )
}
