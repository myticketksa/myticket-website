import type { ReactNode } from 'react'
import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '@/components/icons'
import { Logo } from '@/components/navigation'
import { Countdown } from '@/components/data-display'
import { cn } from '@/lib/cn'

/**
 * Purchase flow header — 1440×72, not `SiteHeader`.
 *
 * Back pair, optional logo or event title, three numbered steps, hold timer.
 * Seat Selection shows the event title; Checkout shows the logo.
 *
 * Figma (`207:7446` / `207:8228`) paints only the current step in brand; prior
 * and upcoming steps share the muted divider style (no green “done” chip).
 */
export interface PurchaseHeaderProps {
  backLabel?: string
  backHref?: string
  steps?: { label: string; state: 'current' | 'upcoming' }[]
  holdLabel?: string
  holdTime?: string
  /** When set, replaces the logo slot (Seat Selection). */
  event?: { title: string; meta: string }
  showLogo?: boolean
  className?: string
}

const DEFAULT_STEPS = [
  { label: 'Seats', state: 'upcoming' as const },
  { label: 'Payment', state: 'current' as const },
  { label: 'Tickets', state: 'upcoming' as const },
]

export function PurchaseHeader({
  backLabel = 'Back to event',
  backHref = '/',
  steps = DEFAULT_STEPS,
  holdLabel = 'Seats held',
  holdTime,
  event,
  showLogo = true,
  className,
}: PurchaseHeaderProps) {
  return (
    <header
      className={cn(
        'flex h-[72px] w-full items-center border-b border-border-default bg-bg-page',
        className,
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-[var(--container-page)] items-center gap-[28px] px-page-gutter">
        <Link
          to={backHref}
          className="flex shrink-0 items-center gap-[5px] text-[14px] font-semibold text-ink-secondary"
        >
          <ArrowLeftIcon size={14} />
          {backLabel}
        </Link>

        {event ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-semibold text-ink-primary">
              {event.title}
            </p>
            <p className="truncate text-[13px] text-ink-secondary">{event.meta}</p>
          </div>
        ) : showLogo ? (
          <div className="shrink-0">
            <Logo height={34} />
          </div>
        ) : null}

        <ol
          className={cn(
            'flex shrink-0 items-center gap-[28px]',
            !event && 'min-w-0 flex-1 justify-center',
          )}
        >
          {steps.map((step, index) => (
            <li key={step.label} className="flex items-center gap-[9px]">
              <span
                className={cn(
                  'flex size-[22px] items-center justify-center rounded-[11px] text-[12px] font-bold',
                  step.state === 'current' && 'bg-brand-gradient text-ink-inverse',
                  step.state === 'upcoming' && 'bg-border-divider text-ink-muted',
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  'text-[14px] font-semibold',
                  step.state === 'current' && 'text-ink-brand',
                  step.state === 'upcoming' && 'text-ink-muted',
                )}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>

        {holdTime && (
          <div className="ml-auto flex shrink-0 items-center gap-[10px] rounded-[20px] border border-border-default bg-surface-default px-[14px] py-[7px]">
            <span className="text-[13px] text-ink-secondary">{holdLabel}</span>
            <Countdown urgent className="text-[14px] font-bold text-brand-gradient-end">
              {holdTime}
            </Countdown>
          </div>
        )}
      </div>
    </header>
  )
}

/**
 * Pattern D — PurchaseLayout. Verified on Checkout `207:8228`.
 *
 * Purchase header, then page-owned body (main + aside). **No SiteFooter.**
 * Order Confirmation sits outside this pattern and uses MainLayout.
 */
export interface PurchaseLayoutProps {
  header?: ReactNode
}

const EVENT_SLUG = 'winter-nights-live-at-king-abdullah-park'

export function PurchaseLayout({ header }: PurchaseLayoutProps) {
  const { pathname } = useLocation()
  const { slug = EVENT_SLUG } = useParams()
  const isSeats = pathname.includes('/seats')
  const isCheckout = pathname === '/checkout'

  const chrome = header ?? (
    <PurchaseHeader
      backLabel={isCheckout ? 'Back to seats' : 'Back to event'}
      backHref={isCheckout ? `/events/${slug}/seats` : `/events/${slug}`}
      steps={[
        { label: 'Seats', state: isSeats ? 'current' : 'upcoming' },
        { label: 'Payment', state: isCheckout ? 'current' : 'upcoming' },
        { label: 'Tickets', state: 'upcoming' },
      ]}
      holdTime={isSeats ? '09:41' : '08:12'}
      event={
        isSeats
          ? {
              title: 'Winter Nights: Live at King Abdullah Park',
              meta: 'Thu 8 Oct 2026 · 20:00 · King Abdullah Park, Riyadh',
            }
          : undefined
      }
      showLogo={!isSeats}
    />
  )

  return (
    <div className="flex min-h-dvh flex-col bg-bg-page">
      {chrome}
      <div
        className={cn(
          'mx-auto w-full max-w-[var(--container-page)] flex-1 px-page-gutter',
          isSeats ? 'pb-[60px] pt-[24px]' : 'pb-[70px] pt-[30px]',
        )}
      >
        <Outlet />
      </div>
    </div>
  )
}
