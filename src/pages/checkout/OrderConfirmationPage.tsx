import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import checkIcon from '@/assets/checkout/check-26.svg'
import { DownloadIcon, ShareIcon } from '@/components/icons'
import { Divider, PriceDisplay } from '@/components/data-display'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'
import { useGetOrderDetailsQuery } from '@/app/api/ordersApi'
import { useAppSelector } from '@/app/hooks'
import { selectAuthUser } from '@/features/auth/authSlice'

const TICKETS = [
  {
    id: 'MT-84193-1',
    seat: 'Floor A · Row H · Seat 12',
    gate: 'Scan at Gate 3',
  },
  {
    id: 'MT-84193-2',
    seat: 'Floor A · Row H · Seat 13',
    gate: 'Scan at Gate 3',
  },
] as const

const NEXT_STEPS = [
  'Your tickets live in My tickets — offline QR codes work even without signal.',
  'Share a ticket with a friend and they get their own QR the moment they accept.',
  "We'll remind you an hour before doors with the gate and bag-policy notes.",
] as const

function formatMoney(value: unknown, fallback: string) {
  if (value == null || value === '' || value === '—') return fallback
  const raw = String(value)
  if (/sar/i.test(raw)) return raw
  const num = Number(value)
  if (!Number.isFinite(num)) return raw
  return `SAR ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function readSessionHold() {
  try {
    return JSON.parse(sessionStorage.getItem('myticket.mockHold') || 'null') as {
      seats?: { id?: string; label: string; category?: string; price: number }[]
      subtotal?: number
      serviceFee?: number
      vat?: number
      total?: number
    } | null
  } catch {
    return null
  }
}

/** Dense QR-like matrix — Figma `207:8498` draws a seeded ~105px module grid (no lib in deps). */
function TicketQr({ seed }: { seed: number }) {
  const size = 41
  const cells = Array.from({ length: size * size }, (_, index) => {
    const x = index % size
    const y = Math.floor(index / size)

    const inFinder = (ox: number, oy: number) => {
      const dx = x - ox
      const dy = y - oy
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null
      if (dx === 0 || dy === 0 || dx === 6 || dy === 6) return true
      if (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) return true
      return false
    }

    const finder =
      inFinder(0, 0) ??
      inFinder(size - 7, 0) ??
      inFinder(0, size - 7)
    if (finder !== null) return finder

    // Timing patterns
    if (y === 6 && x >= 8 && x <= size - 9) return x % 2 === 0
    if (x === 6 && y >= 8 && y <= size - 9) return y % 2 === 0

    // Alignment pattern near bottom-right of data area
    const ax = size - 9
    const ay = size - 9
    if (x >= ax - 2 && x <= ax + 2 && y >= ay - 2 && y <= ay + 2) {
      const dx = Math.abs(x - ax)
      const dy = Math.abs(y - ay)
      if (dx === 2 || dy === 2) return true
      if (dx === 0 && dy === 0) return true
      return false
    }

    // Quiet-ish separator around finders stays mostly off
    if (
      (x === 7 && y < 8) ||
      (y === 7 && x < 8) ||
      (x === size - 8 && y < 8) ||
      (y === 7 && x > size - 9) ||
      (y === size - 8 && x < 8) ||
      (x === 7 && y > size - 9)
    ) {
      return false
    }

    const n = (x * 17 + y * 13 + seed * 31 + x * y * 3) % 7
    return n > 2
  })

  return (
    <div
      className="grid size-[105px] gap-px bg-surface-default p-[2px]"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {cells.map((on, index) => (
        <span
          key={index}
          className={cn('size-full', on ? 'bg-surface-inverse' : 'bg-surface-default')}
        />
      ))}
    </div>
  )
}

function resolveOrderId(searchParams: URLSearchParams) {
  const fromQuery = searchParams.get('orderId')
  if (fromQuery) return fromQuery
  if (typeof sessionStorage === 'undefined') return ''
  return (
    sessionStorage.getItem('myticket.lastOrderId') ??
    sessionStorage.getItem('myticket.pendingOrderId') ??
    ''
  )
}

function mapOrderTickets(
  order: Record<string, unknown>,
  holdSeats?: { id?: string; label: string; category?: string }[],
) {
  const items = order.tickets ?? order.items ?? order.lines
  if (Array.isArray(items) && items.length > 0) {
    return (items as Record<string, unknown>[]).map((ticket, index) => ({
      id: String(ticket.id ?? ticket.ticket_number ?? `MT-${index + 1}`),
      seat: String(
        ticket.seat ?? ticket.seats ?? ticket.tier ?? holdSeats?.[index]?.label ?? '—',
      ),
      gate: String(ticket.gate ?? ticket.entry ?? 'Scan at gate'),
    }))
  }
  if (holdSeats && holdSeats.length > 0) {
    return holdSeats.map((seat, index) => ({
      id: String(seat.id ?? `MT-HOLD-${index + 1}`),
      seat: seat.label,
      gate: 'Scan at gate',
    }))
  }
  return [...TICKETS]
}

/**
 * Order Confirmation — Figma `207:8462`. Uses `MainLayout` (SiteHeader + SiteFooter).
 */
export function OrderConfirmationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = useAppSelector(selectAuthUser)
  const orderId = resolveOrderId(searchParams)
  const { data: order, isFetching, isError } = useGetOrderDetailsQuery(orderId, {
    skip: !orderId,
  })
  const hold = useMemo(() => readSessionHold(), [])

  const view = useMemo(() => {
    const hasOrder = Boolean(order && Object.keys(order).length > 0)
    const tickets = hasOrder
      ? mapOrderTickets(order!, hold?.seats)
      : mapOrderTickets({}, hold?.seats)

    const fallbackSubtotal = hold?.subtotal ?? 485
    const fallbackFee = hold?.serviceFee ?? 28
    const fallbackVat = hold?.vat ?? 75
    const fallbackTotal = hold?.total ?? fallbackSubtotal + fallbackFee + fallbackVat

    if (!hasOrder) {
      return {
        email: user?.email ?? 'sara@email.com',
        ticketCount: tickets.length,
        reference: orderId || 'MT-2026-84193',
        placedAt: new Date().toLocaleString(),
        eventTitle: 'Winter Nights: Live at King Abdullah Park',
        eventMeta: 'Thu 8 Oct 2026 · 20:00 · King Abdullah Park, Riyadh',
        tierLabel: hold?.seats?.[0]?.category?.toUpperCase() ?? 'GOLD · SEATED',
        holder: user?.name ?? 'Sara Alghamdi',
        tickets,
        subtotal: formatMoney(fallbackSubtotal, 'SAR 485.00'),
        serviceFee: formatMoney(fallbackFee, 'SAR 28.00'),
        vat: formatMoney(fallbackVat, 'SAR 75.00'),
        total: formatMoney(fallbackTotal, 'SAR 588.00'),
        walletPaid: 'SAR 0.00',
        cardPaid: formatMoney(fallbackTotal, 'SAR 588.00'),
        cashback: 'SAR 0.00',
        apiNote: isError
          ? 'Showing your local checkout summary while order details are unreachable.'
          : isFetching
            ? 'Loading order details…'
            : orderId
              ? null
              : 'Showing a preview — complete checkout to get a live order reference.',
      }
    }

    return {
      email: String(order!.email ?? order!.customer_email ?? user?.email ?? 'sara@email.com'),
      ticketCount: Number(order!.quantity ?? tickets.length) || tickets.length,
      reference: String(order!.reference ?? order!.order_number ?? order!.id ?? orderId),
      placedAt: String(order!.created_at ?? order!.placed_at ?? new Date().toLocaleString()),
      eventTitle: String(order!.event_title ?? order!.title ?? order!.name ?? 'Your event'),
      eventMeta: String(order!.event_meta ?? order!.meta ?? order!.venue ?? '—'),
      tierLabel: String(
        order!.tier_label ?? order!.tier ?? hold?.seats?.[0]?.category ?? 'TICKET',
      ),
      holder: String(order!.holder ?? order!.customer_name ?? user?.name ?? 'Ticket holder'),
      tickets,
      subtotal: formatMoney(
        order!.subtotal ?? order!.items_total ?? hold?.subtotal,
        'SAR 485.00',
      ),
      serviceFee: formatMoney(
        order!.service_fee ?? order!.fees ?? hold?.serviceFee,
        'SAR 28.00',
      ),
      vat: formatMoney(order!.vat ?? order!.tax ?? hold?.vat, 'SAR 75.00'),
      total: formatMoney(order!.total ?? order!.amount ?? hold?.total, 'SAR 588.00'),
      walletPaid: formatMoney(order!.wallet_paid ?? order!.wallet_amount, 'SAR 0.00'),
      cardPaid: formatMoney(order!.card_paid ?? order!.card_amount ?? order!.total, '—'),
      cashback: formatMoney(order!.cashback ?? order!.cashback_earned, 'SAR 0.00'),
      apiNote: null as string | null,
    }
  }, [hold, isError, isFetching, order, orderId, user?.email, user?.name])

  return (
    <PageSection padTop={52} padBottom={96}>
      <div className="mx-auto flex max-w-[1040px] flex-col items-center text-center">
        <div className="flex size-[64px] items-center justify-center rounded-[32px] bg-state-success-tint">
          <img src={checkIcon} alt="" className="size-[26px]" />
        </div>
        <h1 className="mt-[18px] text-[50px] leading-[1.02] font-extrabold tracking-[-1.75px] text-ink-primary">
          You&apos;re going.
        </h1>
        <p className="mt-[10px] max-w-[640px] text-[17px] leading-[1.5] text-ink-secondary">
          Payment went through and your {view.ticketCount} tickets are ready. We&apos;ve emailed them
          to {view.email} too.
        </p>
        {view.apiNote ? (
          <p className="mt-[8px] max-w-[560px] text-[13px] text-ink-muted">{view.apiNote}</p>
        ) : null}
        <p className="mt-[10px] text-[13.5px] font-bold">
          <span className="text-ink-muted">Order reference</span>{' '}
          <span className="text-ink-primary">{view.reference}</span>{' '}
          <span className="text-ink-muted">· {view.placedAt}</span>
        </p>
      </div>

      <div className="mx-auto mt-[40px] flex max-w-[1040px] flex-col gap-[32px] lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-lg">
          {view.tickets.map((ticket, index) => (
            <article
              key={ticket.id}
              className="flex overflow-hidden rounded-[20px] border border-border-default bg-surface-default"
            >
              <div className="min-w-0 flex-1 px-[26px] py-[22px]">
                <p className="text-[12px] font-bold tracking-[0.96px] text-brand-gradient-end">
                  {view.tierLabel}
                </p>
                <h2 className="mt-[6px] text-[24px] leading-[1.1] font-extrabold tracking-[-0.6px] text-ink-primary">
                  {view.eventTitle}
                </h2>
                <p className="mt-[6px] text-[14px] text-ink-secondary">{view.eventMeta}</p>
                <div className="mt-lg grid gap-[26px] sm:grid-cols-3">
                  <div>
                    <p className="text-[11.5px] font-bold tracking-[0.69px] text-ink-muted">
                      SEAT
                    </p>
                    <p className="mt-[2px] text-[15px] font-bold text-ink-primary">{ticket.seat}</p>
                  </div>
                  <div>
                    <p className="text-[11.5px] font-bold tracking-[0.69px] text-ink-muted">
                      HOLDER
                    </p>
                    <p className="mt-[2px] text-[15px] font-bold text-ink-primary">{view.holder}</p>
                  </div>
                  <div>
                    <p className="text-[11.5px] font-bold tracking-[0.69px] text-ink-muted">
                      TICKET NO.
                    </p>
                    <p className="mt-[2px] text-[15px] font-bold text-ink-primary">{ticket.id}</p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-center justify-center gap-sm border-l-[1.5px] border-dashed border-border-default bg-bg-page px-[22px] py-[18px]">
                <div className="rounded-[10px] border border-border-default bg-surface-default p-sm">
                  <TicketQr seed={index + 1} />
                </div>
                <p className="text-[12px] font-semibold text-ink-secondary">{ticket.gate}</p>
              </div>
            </article>
          ))}

          <section className="rounded-[18px] border border-border-default bg-surface-default p-[22px]">
            <h3 className="text-[17px] font-semibold text-ink-primary">What happens next</h3>
            <ol className="mt-lg flex flex-col gap-[14px]">
              {NEXT_STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-[12px]">
                  <span className="flex size-[28px] shrink-0 items-center justify-center rounded-pill bg-bg-tint-brand text-[13px] font-bold text-ink-brand">
                    {index + 1}
                  </span>
                  <p className="pt-[3px] text-[14px] leading-[1.5] text-ink-primary">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-md lg:w-[340px]">
          <div className="rounded-[20px] border border-border-default bg-surface-default p-[24px]">
            <h3 className="text-[15px] font-semibold text-ink-primary">What you paid</h3>
            <div className="mt-md flex flex-col gap-sm text-[14px]">
              <div className="flex justify-between gap-md">
                <span className="text-ink-secondary">
                  {view.ticketCount} × {view.tierLabel}
                </span>
                <PriceDisplay context="row">{view.subtotal}</PriceDisplay>
              </div>
              <div className="flex justify-between gap-md">
                <span className="text-ink-secondary">Service fee</span>
                <PriceDisplay context="row">{view.serviceFee}</PriceDisplay>
              </div>
              <div className="flex justify-between gap-md">
                <span className="text-ink-secondary">VAT 15%</span>
                <PriceDisplay context="row">{view.vat}</PriceDisplay>
              </div>
            </div>
            <Divider tone="divider" className="my-md" />
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-semibold text-ink-primary">Total</span>
              <PriceDisplay context="amount">{view.total}</PriceDisplay>
            </div>
            <div className="mt-md flex flex-col gap-[6px] text-[13px] text-ink-secondary">
              <div className="flex justify-between">
                <span>Wallet balance</span>
                <span>{view.walletPaid}</span>
              </div>
              <div className="flex justify-between">
                <span>Visa ···· 4417</span>
                <span>{view.cardPaid}</span>
              </div>
            </div>
            <div className="mt-md flex items-center justify-between rounded-[14px] bg-bg-tint-brand px-lg py-[14px] text-[13px] font-semibold text-ink-brand-strong">
              <span>Cashback earned</span>
              <span>+ {view.cashback}</span>
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            className="h-[50px] w-full rounded-[25px] text-[15px] font-bold"
            onClick={() => navigate('/my-tickets')}
          >
            Go to my tickets
          </Button>

          <div className="grid grid-cols-2 gap-sm">
            <Button type="button" variant="secondary" size="sm" icon={<DownloadIcon size={14} />}>
              Download all
            </Button>
            <Button type="button" variant="secondary" size="sm">
              Add to phone wallet
            </Button>
            <Button type="button" variant="secondary" size="sm" icon={<ShareIcon size={14} />}>
              Share the night
            </Button>
            <Link
              to="/events"
              className={cn(
                'inline-flex h-btn-sm items-center justify-center rounded-btn-sm',
                'border-[1.5px] border-border-default bg-surface-default px-btn-pad-sm',
                'text-[13px] font-semibold text-ink-primary',
                'hover:border-border-brand hover:text-ink-brand',
              )}
            >
              Keep browsing
            </Link>
          </div>

          <p className="text-[12px] leading-[1.55] text-ink-muted">
            Full refund until 72 hours before doors. After that, list unused tickets on the{' '}
            <Link to="/auctions" className="font-semibold text-ink-brand">
              resale auction
            </Link>
            .
          </p>
        </aside>
      </div>
    </PageSection>
  )
}
