import { useEffect, useState, type ReactNode } from 'react'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '@/components/icons'
import { Logo } from '@/components/navigation'
import { PageFade } from '@/components/motion'
import { Countdown } from '@/components/data-display'
import { cn } from '@/lib/cn'
import {
  clearHoldSession,
  formatHoldCountdown,
  holdRemainingMs,
  readHoldSession,
} from '@/lib/purchase/holdSession'

/**
 * Purchase flow header — 1440×72, not `SiteHeader`.
 *
 * Back pair, optional logo or event title, three numbered steps, hold timer.
 * Seat Selection shows the event title; Checkout shows the logo.
 *
 * Steps are links so guests can move between Seats and Payment. Tickets only
 * unlocks after a paid order exists.
 */
export interface PurchaseHeaderProps {
  backLabel?: string
  backHref?: string
  steps?: {
    label: string
    state: 'current' | 'upcoming' | 'done'
    to?: string
    disabled?: boolean
  }[]
  holdLabel?: string
  holdTime?: string
  holdUrgent?: boolean
  /** When set, replaces the logo slot (Seat Selection). */
  event?: { title: string; meta: string }
  showLogo?: boolean
  className?: string
}

export function PurchaseHeader({
  backLabel = 'Back to event',
  backHref = '/',
  steps = [],
  holdLabel = 'Seats held',
  holdTime,
  holdUrgent,
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
          className="flex shrink-0 items-center gap-[5px] text-[14px] font-semibold text-ink-secondary transition-colors duration-micro ease-micro hover:text-ink-brand"
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
          {steps.map((step, index) => {
            const content = (
              <>
                <span
                  className={cn(
                    'flex size-[22px] items-center justify-center rounded-[11px] text-[12px] font-bold',
                    step.state === 'current' && 'bg-identity-gradient text-ink-inverse',
                    step.state === 'done' && 'bg-brand-primary text-ink-inverse',
                    step.state === 'upcoming' && 'bg-border-divider text-ink-muted',
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    'text-[14px] font-semibold',
                    step.state === 'current' && 'text-ink-brand',
                    step.state === 'done' && 'text-ink-primary',
                    step.state === 'upcoming' && 'text-ink-muted',
                  )}
                >
                  {step.label}
                </span>
              </>
            )

            if (step.to && !step.disabled) {
              return (
                <li key={step.label}>
                  <Link
                    to={step.to}
                    aria-current={step.state === 'current' ? 'step' : undefined}
                    className="flex items-center gap-[9px] transition-opacity duration-micro ease-micro hover:opacity-80"
                  >
                    {content}
                  </Link>
                </li>
              )
            }

            return (
              <li
                key={step.label}
                aria-current={step.state === 'current' ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-[9px]',
                  step.disabled && 'cursor-not-allowed opacity-55',
                )}
                title={step.disabled ? 'Complete payment to open tickets' : undefined}
              >
                {content}
              </li>
            )
          })}
        </ol>

        {holdTime && (
          <div className="ml-auto flex shrink-0 items-center gap-[10px] rounded-[20px] border border-border-default bg-surface-default px-[14px] py-[7px]">
            <span className="text-[13px] text-ink-secondary">{holdLabel}</span>
            <Countdown
              urgent={holdUrgent ?? true}
              className="text-[14px] font-bold text-brand-gradient-end"
            >
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

function useHoldCountdown(enabled: boolean) {
  const [remainingMs, setRemainingMs] = useState(() =>
    enabled ? holdRemainingMs(readHoldSession()) : 0,
  )
  const navigate = useNavigate()

  useEffect(() => {
    if (!enabled) {
      setRemainingMs(0)
      return
    }

    let expiredHandled = false
    const tick = () => {
      const session = readHoldSession()
      if (!session?.heldAt) {
        setRemainingMs(0)
        return
      }
      const next = holdRemainingMs(session)
      setRemainingMs(next)
      if (next <= 0 && !expiredHandled) {
        expiredHandled = true
        const seatsPath = session.slug ? `/events/${session.slug}/seats` : '/'
        clearHoldSession()
        navigate(seatsPath, { replace: true })
      }
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [enabled, navigate])

  return remainingMs
}

export function PurchaseLayout({ header }: PurchaseLayoutProps) {
  const { pathname } = useLocation()
  const { slug = EVENT_SLUG } = useParams()
  const hold = readHoldSession()
  const eventSlug = hold?.slug || slug || EVENT_SLUG
  const isSeats = pathname.includes('/seats')
  const isCheckout = pathname === '/checkout'
  const lastOrderId =
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('myticket.lastOrderId')
      : null
  const remainingMs = useHoldCountdown(isSeats || isCheckout)
  const showTimer = remainingMs > 0

  const seatsHref = `/events/${eventSlug}/seats`
  const chrome = header ?? (
    <PurchaseHeader
      backLabel={isCheckout ? 'Back to seats' : 'Back to event'}
      backHref={isCheckout ? seatsHref : `/events/${eventSlug}`}
      steps={[
        {
          label: 'Seats',
          state: isSeats ? 'current' : isCheckout ? 'done' : 'upcoming',
          to: seatsHref,
        },
        {
          label: 'Payment',
          state: isCheckout ? 'current' : 'upcoming',
          to: hold || isCheckout ? '/checkout' : undefined,
          disabled: !hold && !isCheckout,
        },
        {
          label: 'Tickets',
          state: 'upcoming',
          to: lastOrderId ? `/order-confirmation?orderId=${lastOrderId}` : undefined,
          disabled: !lastOrderId,
        },
      ]}
      holdTime={showTimer ? formatHoldCountdown(remainingMs) : undefined}
      holdUrgent={remainingMs > 0 && remainingMs < 60_000}
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
        <PageFade>
          <Outlet />
        </PageFade>
      </div>
    </div>
  )
}
