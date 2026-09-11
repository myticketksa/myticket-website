import logoSrc from '@/assets/myticket-logo.png'
import { cn } from '@/lib/cn'

/**
 * Figma `Logo` — node 207:3096. The MyTicket bilingual lockup.
 *
 * *"Aspect 1.833:1 — always resize proportionally. Nav default 73x40."* The export is a
 * 2606×1422 raster, which is 1.8326:1, so the stated ratio checks out. Height is the
 * only dimension exposed and width follows from `aspect-[73/40]`, which makes
 * disproportionate scaling impossible by construction rather than by convention.
 *
 * Source: Figma file `yffYsbbooJbCZMYbAWSMfH` → exported PNG committed as
 * `src/assets/myticket-logo.png` (also mirrored under `public/brand/logo.png`).
 * Favicon / app icons use the orange “my” ticket mark from the same lockup.
 */
export interface LogoProps {
  /** Rendered height in px. The nav draws 40. */
  height?: number
  /** Accessible name. Pass an empty string when a nearby link already names it. */
  alt?: string
  className?: string
}

export function Logo({ height = 40, alt = 'MyTicket', className }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt={alt}
      style={{ height }}
      className={cn('aspect-[73/40] w-auto shrink-0 object-contain', className)}
    />
  )
}
