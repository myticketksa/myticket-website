import { HeartGlyphIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

/**
 * Figma `EmptyState` — node 207:2901, with variants FirstUse `207:2902`,
 * Filters `207:2909` and Gated `207:2915`.
 *
 * Figma states the governing rule outright: *"Empty states always explain what will
 * live here and give one route to fill it — never a bare 'No results'."* Every variant
 * therefore ends in a CTA, and there is no CTA-less shape to build.
 *
 * A centred column, 8px gap, 8px vertical padding and no horizontal padding, holding a
 * 14.5px/700 `--ink-primary` title, a 12.5px/500/1.5 `--ink-secondary` body and a CTA
 * slot that carries the CTA's 4px top margin as a 4px top pad. Only FirstUse draws the
 * leading medallion: a 44×44 circle on `--bg-tint-brand` with a 19px heart.
 *
 * **The medallion glyph is a vector, not a character.** Figma's description insists it
 * is "a ♡ glyph at 19px — a literal text glyph (A3c), NOT Icon/Heart". The export
 * disagrees: it ships an SVG asset named `icon/heart@19`, and downloading it shows a
 * `<g id="glyph">` wrapper around Phosphor's `Heart` at regular weight, filled
 * `#F25F2C`. The drawing wins, so this reuses `HeartGlyphIcon` — the same pinned
 * Phosphor heart the event card's favourite button already draws — at 19px. The
 * description is right about one thing: it is *not* the first-party `HeartIcon`, whose
 * 2px stroke on the 24 grid is a different shape. `#F25F2C` is the value of both
 * `--ink-brand` and `--brand-primary`; `--ink-brand` is used because this is a glyph
 * doing an ink job.
 *
 * The circle is described as "44×44 r22" but the export binds `--radius-pill`, which
 * is visually identical at this size. The token binding wins, per the rule that
 * bindings are honoured and bare literals are left alone.
 *
 * **The FirstUse and Gated CTAs are the real `Button — State-card CTA`** (`207:1687`)
 * — h36, radius 18, 16px padding, 13px/600, the two-stop `gradient/cta-compact` — so
 * they are `Button` with `variant="cardCta" size="sm"`, which was built for exactly
 * this node.
 *
 * **The Filters CTA is drawn locally and stays local.** Figma flags why: it needs a
 * secondary control at h36, and the `Button` set draws no Secondary × Size=S pair, so
 * the source made it a local frame rather than a mis-sized instance. It also disagrees
 * with `Button` `secondary` `sm` on padding — 16px here against the 15px
 * `--space-btn-pad-sm` that size uses — and it draws no hover state, where the atom
 * collapses its border and text onto brand. Both reasons point the same way, so it is
 * drawn out here. Its 36px height is a bare literal in the export, not a
 * `--size-btn-sm` binding, and is kept literal to preserve that signal.
 *
 * **Not built:** a "failed" variant. DS-DECISIONS asks for six page states, but the
 * source draws no failed state and states no copy, geometry or paint for one.
 *
 * Deliberate additions: the drawn 320px width is applied as a **max**-width, because
 * the column is a measure for centred prose rather than a frame, and a rigid 320 would
 * overflow the narrowest phone; and the medallion is `aria-hidden`, because the title
 * and body already carry its meaning.
 */
const CTA_LABELS: Record<'firstUse' | 'filters' | 'gated', string> = {
  firstUse: 'Browse events',
  filters: 'Clear all filters',
  gated: 'Sign in',
}

export interface EmptyStateProps {
  title: string
  body: string
  /**
   * `firstUse` adds the heart medallion and a gradient CTA, `gated` is the same CTA
   * with no medallion, `filters` swaps in the bordered secondary control.
   */
  variant?: 'firstUse' | 'filters' | 'gated'
  /** Defaults to the label the source draws for the variant. */
  ctaLabel?: string
  onCtaClick?: () => void
  className?: string
}

export function EmptyState({
  title,
  body,
  variant = 'firstUse',
  ctaLabel,
  onCtaClick,
  className,
}: EmptyStateProps) {
  const label = ctaLabel ?? CTA_LABELS[variant]

  return (
    <div
      className={cn(
        'flex w-full max-w-[320px] flex-col items-center justify-center gap-sm py-sm',
        className,
      )}
    >
      {variant === 'firstUse' && (
        <div
          aria-hidden
          className="flex size-[44px] shrink-0 items-center justify-center overflow-clip rounded-pill bg-bg-tint-brand"
        >
          <HeartGlyphIcon size={19} className="text-ink-brand" />
        </div>
      )}

      <p className="w-full text-center text-[14.5px] font-bold text-ink-primary">{title}</p>
      <p className="w-full text-center text-[12.5px] leading-[1.5] font-medium text-ink-secondary">
        {body}
      </p>

      <div className="flex shrink-0 items-center justify-center overflow-clip pt-xs">
        {variant === 'filters' ? (
          <button
            type="button"
            onClick={onCtaClick}
            className="flex h-[36px] shrink-0 items-center justify-center overflow-clip rounded-btn-sm border-[1.5px] border-border-default bg-surface-default px-lg text-[13px] font-semibold whitespace-nowrap text-ink-primary"
          >
            {label}
          </button>
        ) : (
          <Button variant="cardCta" size="sm" onClick={onCtaClick}>
            {label}
          </Button>
        )}
      </div>
    </div>
  )
}
