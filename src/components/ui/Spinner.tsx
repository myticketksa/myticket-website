import { cn } from '@/lib/cn'

export interface SpinnerProps {
  /** Rendered square size in px. Drawn at 14 inside a loading Button. */
  size?: number
  className?: string
  /** Announced to assistive tech. Pass null on a spinner inside a labelled control. */
  label?: string | null
}

/**
 * Figma `Spinner` — geometry from the loading Button at node 207:1646.
 *
 * Two paths: a full ring named Track and a quarter segment named Arc. Figma
 * exports both at full opacity, but the naming carries the intent — the track
 * is the dim base and the arc is the travelling highlight, so the track is
 * dropped to 30%. That opacity is the one value here not taken from Figma.
 */
export function Spinner({ size = 14, className, label = 'Loading' }: SpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      role={label ? 'status' : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      className={cn('shrink-0 animate-spin', className)}
    >
      <path
        d="M14 7C14 10.866 10.866 14 7 14C3.13401 14 0 10.866 0 7C0 3.13401 3.13401 0 7 0C10.866 0 14 3.13401 14 7ZM2 7C2 9.76142 4.23858 12 7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7Z"
        fill="currentColor"
        opacity={0.3}
      />
      <path
        d="M2.05025 2.05025C3.36301 0.737498 5.14348 2.58224e-08 7 0C8.85652 -2.58224e-08 10.637 0.737498 11.9497 2.05025L10.5355 3.46447C9.59785 2.52678 8.32608 2 7 2C5.67392 2 4.40215 2.52678 3.46447 3.46447L2.05025 2.05025Z"
        fill="currentColor"
      />
    </svg>
  )
}
