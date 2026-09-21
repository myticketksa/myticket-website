import { Link } from 'react-router-dom'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

export interface BusinessStripProps {
  heading: string
  body: string
  ctaLabel: string
  ctaTo: string
  className?: string
}

/** Bottom “Become a …” strip used on Talents / Facilities / Organizers. */
export function BusinessStrip({
  heading,
  body,
  ctaLabel,
  ctaTo,
  className,
}: BusinessStripProps) {
  return (
    <PageSection padTop={72} padBottom={96} className={className}>
      <div
        className={cn(
          'flex w-full flex-col items-stretch gap-lg rounded-[18px] border border-border-default bg-surface-default px-lg py-[22px] sm:flex-row sm:items-center sm:justify-between sm:gap-4xl sm:px-[32px] sm:py-[26px]',
        )}
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-heading-h3 text-ink-primary">{heading}</h3>
          <p className="mt-xs text-[14px] text-ink-secondary">{body}</p>
        </div>
        <Link
          to={ctaTo}
          className="flex h-[46px] w-full shrink-0 items-center justify-center rounded-[23px] border-[1.5px] border-border-default bg-surface-default px-[22px] text-[14px] font-semibold text-ink-primary sm:w-auto"
        >
          {ctaLabel}
        </Link>
      </div>
    </PageSection>
  )
}
