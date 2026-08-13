import { Check, Circle, Heart, Star } from '@phosphor-icons/react'
import type { IconProps as PhosphorIconProps } from '@phosphor-icons/react'

/**
 * The glyphs the page cards draw, with their weight pinned.
 *
 * The design file has **two icon sources**. The custom set (`207:1595`) is what the
 * design-system documentation uses; the real page cards draw from Phosphor
 * (`207:3385`). All three glyphs below were confirmed by downloading the exported SVGs
 * from the TalentCard and EventCard nodes and matching geometry:
 *
 * - `icon/star-fill@13` and `icon/circle-fill@8` are Phosphor at **fill** weight. The
 *   circle is r=3.25 in an 8px box — Phosphor's 104/256 radius, not a full-bleed r=4 —
 *   so drawing it by hand would come out slightly too large.
 * - `icon/heart@15` is Phosphor at **regular** weight, which is a filled outline path
 *   rather than a stroke. It is *not* the custom `HeartIcon`, whose 2px stroke on the
 *   24 grid is a different shape. Figma's own note calls this a literal ♡ character;
 *   the drawing says otherwise, and the drawing wins.
 * - The check on the organizer directory card is Phosphor at **regular** weight too, and
 *   notably *not* `VerifiedIcon` — the two-tone brand burst that the talent and vendor
 *   cards draw in the same "verified" slot. Two different marks for the same idea is
 *   what the source contains.
 *
 * Kept apart from `phosphor.ts` because that module re-exports outline glyphs for
 * places the custom set has no equivalent. These three have an equivalent and the
 * source still chose Phosphor, so the weight is pinned here rather than left to each
 * call site.
 */
type CardGlyphProps = Omit<PhosphorIconProps, 'weight'>

/** Drawn at 13px in card rating rows, 12px in the talent directory rating pill. */
export function StarFillIcon({ size = 13, ...props }: CardGlyphProps) {
  return <Star size={size} weight="fill" {...props} />
}

/** Drawn at 8px as the OverlayBadge success dot. */
export function CircleFillIcon({ size = 8, ...props }: CardGlyphProps) {
  return <Circle size={size} weight="fill" {...props} />
}

/** Drawn at 15px inside the event card's 32px favourite button. */
export function HeartGlyphIcon({ size = 15, ...props }: CardGlyphProps) {
  return <Heart size={size} weight="regular" {...props} />
}

/** Drawn at 13px beside the organizer directory card's name. */
export function CheckGlyphIcon({ size = 13, ...props }: CardGlyphProps) {
  return <Check size={size} weight="regular" {...props} />
}
