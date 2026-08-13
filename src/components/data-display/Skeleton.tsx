import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Figma `Skeleton` — node 207:1809. *"Skeletons mirror final layout.
 * Loading-more appends below existing content."*
 *
 * `media` is height 84, radius 12, carrying the shimmer gradient whose `#fbf4ef`
 * highlight is a literal rather than a token. `line` is height 13, radius 7, flat
 * `--bg-skeleton`.
 *
 * Both fill their container. Figma draws lines at 70% and 45% width, but notes
 * those proportions belong to the call site — the drawn 280px is display-only.
 *
 * Animation is not specified in the source. Travelling the highlight is a
 * deliberate addition, since a static shimmer band reads as a rendering bug; it
 * stops under `prefers-reduced-motion`.
 */
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'media' | 'line'
}

export function Skeleton({ className, variant = 'media', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'w-full',
        variant === 'media'
          ? 'h-[84px] rounded-input bg-shimmer'
          : 'h-[13px] rounded-[7px] bg-bg-skeleton',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The row gap belongs to the loading card, not to the atom. It is bound to
 * `--space-row-gap` (10px) in the source, so it uses the token rather than a literal.
 */
export function SkeletonStack({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex flex-col gap-row-gap', className)}
      {...props}
    />
  )
}
