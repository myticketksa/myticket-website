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
 * Vertical rhythm is per-section on Home (60, 72, 76, 84, 88, 96). Desktop pad values
 * scale down on smaller viewports so mobile doesn’t inherit Figma’s large gaps.
 */
export interface PageSectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  /** Top padding in px at the desktop breakpoint. */
  padTop?: number
  /** Bottom padding in px at the desktop breakpoint. */
  padBottom?: number
  /** When false, children fill the full-bleed section with no gutter inset. */
  inset?: boolean
}

type SectionPadVars = CSSProperties & {
  '--ps-pt'?: string
  '--ps-pb'?: string
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
  // CSS vars + responsive utilities — raw px pads used to over-space phones.
  const paddingStyle: SectionPadVars = {
    ...style,
    ...(padTop !== undefined ? { '--ps-pt': `${padTop}px` } : null),
    ...(padBottom !== undefined ? { '--ps-pb': `${padBottom}px` } : null),
  }

  return (
    <section
      {...props}
      className={cn(
        'w-full',
        padTop !== undefined &&
          'pt-[calc(var(--ps-pt)*0.45)] md:pt-[calc(var(--ps-pt)*0.7)] lg:pt-[var(--ps-pt)]',
        padBottom !== undefined &&
          'pb-[calc(var(--ps-pb)*0.45)] md:pb-[calc(var(--ps-pb)*0.7)] lg:pb-[var(--ps-pb)]',
        className,
      )}
      style={paddingStyle}
    >
      {inset ? (
        <div className="mx-auto w-full min-w-0 max-w-[var(--container-page)] px-page-gutter">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  )
}
