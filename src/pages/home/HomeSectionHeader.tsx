import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * Home-page section header — heading only by default; optional browse link.
 */
export interface HomeSectionHeaderProps {
  heading: ReactNode
  /** @deprecated Home sections no longer show overlines. */
  overline?: ReactNode
  lede?: ReactNode
  overlineTone?: 'mid' | 'brand'
  ledeMaxWidth?: number | null
  link?: { label: ReactNode; to: string }
  trailing?: ReactNode
  className?: string
}

export function HomeSectionHeader({
  heading,
  link,
  trailing,
  className,
}: HomeSectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-lg sm:flex-row sm:items-end sm:justify-between sm:gap-4xl',
        className,
      )}
    >
      <h2 className="min-w-0 text-[28px] leading-[1.15] font-bold tracking-[-0.03em] text-ink-primary sm:text-[36px] lg:text-heading-h2-home">
        {heading}
      </h2>

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
