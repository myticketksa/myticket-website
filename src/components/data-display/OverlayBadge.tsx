import type { HTMLAttributes, ReactNode } from 'react'
import { CircleFillIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * Figma `OverlayBadge` — node 207:1783. Sits over card imagery.
 *
 * 12px/700, padding 4×10, radius 10, no border, on `--surface-default` at 92%
 * paint opacity — so the artwork shows through very slightly.
 *
 * The `top: 10 / left: 10` offset belongs to the card, not to this atom, so it
 * is not baked in here.
 *
 * The Success tone's leading dot is an 8px filled circle with a 5px gap, drawn as a
 * vector — unlike `StatusBadge`'s `● Available`, which uses a text glyph. Downloading
 * the export identified it as Phosphor `Circle` at fill weight (r=3.25 in an 8px box),
 * so `CircleFillIcon` reproduces it exactly where a hand-drawn `r=4` would be a touch
 * too large.
 */
export interface OverlayBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'ink' | 'success'
  children: ReactNode
}

export function OverlayBadge({
  className,
  tone = 'ink',
  children,
  ...props
}: OverlayBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-badge px-[10px] py-xs text-label-badge',
        'bg-surface-default/92',
        tone === 'success' ? 'gap-[5px] text-state-success' : 'text-ink-primary',
        className,
      )}
      {...props}
    >
      {tone === 'success' && <CircleFillIcon className="shrink-0" />}
      {children}
    </span>
  )
}
