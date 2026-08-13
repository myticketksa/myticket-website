import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `Avatar` — node 207:1800. Initials on `--gradient-identity`, white text.
 *
 * Three sizes are drawn: 28×28 with 11.5px/700, 32×32 with 13px/700, and 52×52 with
 * 17px/800. Shape is a separate axis — Circle is `--radius-pill`, Squircle is
 * `--radius-control` (14).
 *
 * At 28px, radius 14 *is* height/2, so `sm` + squircle renders identically to
 * `sm` + circle. The pairs actually drawn are 28/Circle, 32/16 and 52/Squircle.
 *
 * **The 32px size was found in the header, not in this component.** The atom's own
 * description states there is no 32px avatar, and the signed-in `SiteHeader`
 * (`207:2974`) draws one anyway at radius 16 with 13px/700 initials. Building the header
 * is what surfaced it. Radius 16 is height/2, so `md` is a circle by geometry and the
 * squircle pairing is meaningless at that size too.
 *
 * Still deliberately absent: **no photo variant**, because the source has none.
 */
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initials: string
  size?: 'sm' | 'md' | 'lg'
  shape?: 'circle' | 'squircle'
}

const SIZE = {
  sm: 'size-avatar-sm text-[11.5px] font-bold',
  md: 'size-[32px] text-[13px] font-bold',
  lg: 'size-avatar-lg text-[17px] font-extrabold',
} as const

export function Avatar({
  className,
  initials,
  size = 'sm',
  shape = 'circle',
  ...props
}: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center bg-identity-gradient text-ink-inverse',
        SIZE[size],
        shape === 'circle' ? 'rounded-pill' : 'rounded-control',
        className,
      )}
      {...props}
    >
      {initials}
    </span>
  )
}
