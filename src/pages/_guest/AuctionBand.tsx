import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@/components/icons'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

export interface PromoBandProps {
  heading: string
  body: string
  ctaLabel: string
  ctaTo: string
  /** Inverse dark band (Events auction) vs warm surface band (Talents/Vendors). */
  tone?: 'inverse' | 'surface'
  className?: string
}

export function PromoBand({
  heading,
  body,
  ctaLabel,
  ctaTo,
  tone = 'inverse',
  className,
}: PromoBandProps) {
  const inverse = tone === 'inverse'

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-4xl overflow-hidden rounded-[22px] px-[44px] py-4xl',
        inverse
          ? 'bg-surface-inverse'
          : 'border border-border-default bg-surface-default',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-sm">
        <h2
          className={cn(
            'text-heading-h2-section',
            inverse ? 'text-bg-page' : 'text-ink-primary',
          )}
        >
          {heading}
        </h2>
        <p
          className={cn(
            'max-w-[560px] text-[16px] leading-[1.5]',
            inverse ? 'text-bg-page/72' : 'text-ink-secondary',
          )}
        >
          {body}
        </p>
      </div>
      <Link
        to={ctaTo}
        className={cn(
          'flex h-btn-lg shrink-0 items-center gap-[6px] rounded-btn-lg px-3xl text-[15px] font-semibold',
          inverse
            ? 'bg-bg-page text-ink-primary'
            : 'bg-brand-gradient text-ink-inverse',
        )}
      >
        {ctaLabel}
        <ArrowRightIcon size={15} />
      </Link>
    </div>
  )
}

/** Events listing AuctionBand — Figma `207:4788`. */
export function AuctionBand() {
  return (
    <PageSection padTop={88} padBottom={96}>
      <PromoBand
        heading="Missed a sold-out show?"
        body="Fans resell their tickets through the MyTicket auction — verified transfers, money held safely until the ticket is in your name."
        ctaLabel="Browse the auction"
        ctaTo="/auctions"
        tone="inverse"
      />
    </PageSection>
  )
}
