import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Full-bleed section with the page content band centred inside.
 *
 * Layout architecture: pages are conceptually 1440 wide with 60px gutters, giving a
 * 1320 content band. The section itself is full-bleed so it can carry its own background;
 * the inner shell is capped at `--container-page` (1440) with `--spacing-page-gutter` (60)
 * horizontal padding, which yields 1320 at the design width.
 *
 * Vertical rhythm is per-section on Home (60, 72, 76, 84, 88, 96), so top and bottom
 * padding are caller-supplied rather than assumed.
 */
export interface PageSectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  /** Top padding in px. */
  padTop?: number
  /** Bottom padding in px. */
  padBottom?: number
  /** When false, children fill the full-bleed section with no gutter inset. */
  inset?: boolean
}

export function PageSection({
  children,
  className,
  padTop,
  padBottom,
  inset = true,
  style,
  ...props
}: PageSectionProps) {
  const paddingStyle: CSSProperties = {
    ...style,
    ...(padTop !== undefined ? { paddingTop: padTop } : null),
    ...(padBottom !== undefined ? { paddingBottom: padBottom } : null),
  }

  return (
    <section className={cn('w-full', className)} style={paddingStyle} {...props}>
      {inset ? (
        <div className="mx-auto w-full max-w-[var(--container-page)] px-page-gutter">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  )
}
