import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * Home-page section header — not the DS `SectionHeader` (`207:2818`).
 *
 * Home draws `Heading/H2 Home` at 44px with a 10px gap under the overline and an 8px
 * gap under the heading (the DS atom is 34px with those gaps inverted). Overline colour
 * also drifts between `--ink-brand` and `--brand-gradient-end` per section, so it is a
 * prop rather than a fixed token.
 */
export interface HomeSectionHeaderProps {
  overline: ReactNode
  heading: ReactNode
  lede?: ReactNode
  /** Defaults to `--brand-gradient-end` (Events / most rails). Pass `brand` for Talents. */
  overlineTone?: 'mid' | 'brand'
  /**
   * Lede max-width. Figma auctions use 560; talents use 520. Pass `null` for
   * unconstrained (categories / experiences heading group). Default 520.
   */
  ledeMaxWidth?: number | null
  link?: { label: ReactNode; to: string }
  /** Replaces the text link — Events puts its time-tab shell here. */
  trailing?: ReactNode
  className?: string
}

export function HomeSectionHeader({
  overline,
  heading,
  lede,
  overlineTone = 'mid',
  ledeMaxWidth = 520,
  link,
  trailing,
  className,
}: HomeSectionHeaderProps) {
  return (
    <div className={cn('flex flex-col items-start gap-lg sm:flex-row sm:items-end sm:justify-between sm:gap-4xl', className)}>
      <div className="flex min-w-0 flex-1 flex-col">
        <p
          className={cn(
            'text-label-overline uppercase',
            overlineTone === 'brand' ? 'text-ink-brand' : 'text-brand-gradient-end',
          )}
        >
          {overline}
        </p>
        <h2 className="mt-[10px] text-[28px] leading-[1.15] font-bold tracking-[-0.03em] text-ink-primary sm:text-[36px] lg:text-heading-h2-home">
          {heading}
        </h2>
        {lede && (
          <p
            className="mt-sm text-[16px] font-medium text-ink-secondary"
            style={ledeMaxWidth == null ? undefined : { maxWidth: ledeMaxWidth }}
          >
            {lede}
          </p>
        )}
      </div>

      {trailing && <div className="w-full min-w-0 sm:w-auto sm:shrink-0">{trailing}</div>}

      {!trailing && link && (
        <Link
          to={link.to}
          className="flex shrink-0 items-center gap-[5px] text-[14px] font-bold text-brand-gradient-end transition-colors duration-fast ease-standard hover:text-ink-brand group/link"
        >
          {link.label}
          <ArrowRightIcon
            size={14}
            className="shrink-0 transition-transform duration-fast ease-standard group-hover/link:translate-x-0.5 motion-reduce:group-hover/link:translate-x-0"
          />
        </Link>
      )}
    </div>
  )
}
