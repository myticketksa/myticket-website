import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * Figma `SectionHeader` — node 207:2818. *"The most repeated pattern in the source
 * (15 uses)."*
 *
 * A `flex-end` / `space-between` row with a 40px gap, so the link settles onto the
 * heading's baseline once the text column has widened.
 *
 * The text column is three named styles stacked, which is unusual for this file —
 * most components use raw text nodes:
 *
 * - overline → `Label/Overline` (12px/800, 1.2 tracking, caps) in `--ink-brand-mid`
 * - heading → `Heading/H2 Section` (34px/800, 1.1, −1.02 tracking)
 * - lede → `Body/Default` (15px/500, 1.55) in `--ink-secondary`
 *
 * Gaps are 8 between overline and heading, and 10 between heading and lede. The 720
 * width is a **max**-width on the whole column, not a fixed frame, per Figma's own note.
 *
 * **The "see more" link is plain text.** 14px/700, `--ink-brand-mid`, no border, no
 * background, no padding, with the arrow inside the string. Figma records the previous
 * build getting this wrong three ways at once — a bordered pill, the wrong orange, and
 * SemiBold — so it is worth restating: there is no pill here.
 *
 * The description calls the overline 12/700 while the attached text style and the
 * drawing both say 800. The drawing wins.
 *
 * **Not built:** the hero variant (58px/1.02 heading in a 780 wrapper), which Figma
 * places outside this set's scope.
 */
export interface SectionHeaderProps {
  heading: ReactNode
  overline?: ReactNode
  /** Optional by design — Figma omits it in four of the fifteen uses. */
  lede?: ReactNode
  link?: {
    label: ReactNode
    href: string
  }
  /** Override H2 Section (34) — e.g. `text-heading-h2-feature` on event detail. */
  headingClassName?: string
  className?: string
}

export function SectionHeader({
  heading,
  overline,
  lede,
  link,
  headingClassName,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-4xl', className)}>
      <div className="flex max-w-[720px] flex-col gap-sm">
        {overline && <p className="text-label-overline text-ink-brand-mid">{overline}</p>}

        <div className="flex flex-col gap-row-gap">
          <h2
            className={cn(
              'text-heading-h2-section text-ink-primary',
              headingClassName,
            )}
          >
            {heading}
          </h2>
          {lede && <p className="text-body-default text-ink-secondary">{lede}</p>}
        </div>
      </div>

      {link && (
        <Link
          to={link.href}
          className="flex shrink-0 items-center gap-[5px] text-[14px] font-bold text-ink-brand-mid"
        >
          {link.label}
          <ArrowRightIcon size={14} className="shrink-0" />
        </Link>
      )}
    </div>
  )
}
