import { cn } from '@/lib/cn'

/**
 * Figma `CountBadge` — node 207:1795. `--brand-identity-end` on white.
 *
 * `web` is min-width 16, height 16, radius 8, 9.5px/800 — it **hugs** with a
 * minimum, so it widens for two or more digits.
 * `mobile` is a fixed 14×14, radius 7, 8.5px/800 — fixed, so it will **not** grow.
 * That asymmetry is what the source declares, not an oversight to smooth over.
 *
 * The absolute offsets (web top/right -4, mobile -3) belong to the host icon
 * button, not to this atom.
 *
 * None of the sizes, radii or font sizes has a token; all are literals in the
 * source, so they are literals here.
 */
export interface CountBadgeProps {
  count: number
  platform?: 'web' | 'mobile'
  className?: string
}

export function CountBadge({ count, platform = 'web', className }: CountBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center bg-brand-identity-end font-extrabold text-ink-inverse',
        platform === 'web'
          ? 'h-[16px] min-w-[16px] rounded-[8px] px-[3px] text-[9.5px]'
          : 'size-[14px] rounded-[7px] text-[8.5px]',
        className,
      )}
    >
      {count}
    </span>
  )
}
