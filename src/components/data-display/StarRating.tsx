import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `StarRating` — node 207:1817.
 *
 * **The star is a literal U+2605 text glyph, not `Icon/Star`.** The source
 * renders it as text everywhere, so it stays text here — using the icon
 * component would change the shape.
 *
 * `strip` is five stars at 15px with 2px letter-spacing in `--ink-brand`. There
 * is no partial or empty star treatment; the source always draws five filled.
 *
 * `inline` is 12.5px in `--ink-muted` with a 6px gap, as drawn on cards
 * ("★ 4.8 · 1.2k going"). Weight is undeclared at both sites, so both use 400,
 * the initial value the source actually renders.
 *
 * A conflict Figma flags but does not resolve: the stated rule is *"Stars are
 * brand/500, one decimal always"*, yet no drawn inline instance paints the star
 * brand — the whole string is muted. The drawing is followed here; the rule is
 * recorded. Pass `brandStar` to get the rule's version instead.
 *
 * The 30px/800 score display is not here; it belongs to `RatingSummary`.
 */
export interface StarRatingProps {
  form?: 'strip' | 'inline'
  /** The text after the star on the inline form. */
  children?: ReactNode
  /** Accessible rating value, e.g. 4.8. */
  value?: number
  /** Paints just the star in brand, per the stated-but-undrawn rule. */
  brandStar?: boolean
  className?: string
}

export function StarRating({
  form = 'strip',
  children,
  value,
  brandStar = false,
  className,
}: StarRatingProps) {
  if (form === 'strip') {
    return (
      <span
        role="img"
        aria-label={value ? `Rated ${value} out of 5` : 'Rated 5 out of 5'}
        className={cn('text-[15px] tracking-[2px] text-ink-brand', className)}
      >
        ★★★★★
      </span>
    )
  }

  return (
    <span
      className={cn('inline-flex items-center gap-[6px] text-[12.5px] font-normal text-ink-muted', className)}
    >
      <span aria-hidden="true" className={brandStar ? 'text-ink-brand' : undefined}>
        ★
      </span>
      {children}
    </span>
  )
}
