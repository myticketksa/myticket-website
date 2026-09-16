import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useGetEventsQuery } from '@/app/api/eventsApi'
import { useCancelOrderMutation, useGetOrdersQuery } from '@/app/api/ordersApi'
import { StatusBadge } from '@/components/data-display'
import { Button } from '@/components/ui'
import { AccountSplit, TicketActionHeader } from '@/layouts'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import { mapApiEventToCard } from '@/lib/api/mappers/events'
import { extractOrderId } from '@/lib/api/formPayload'
import { apiErrorMessage } from '@/lib/api/unwrap'
import { MY_TICKETS, type TicketFixture } from '@/pages/_account/fixtures'
import { CATALOG_EVENTS } from '@/pages/_guest/fixtures'
import { slugify } from '@/pages/_guest/slugify'
import { cn } from '@/lib/cn'

/** Figma `207:9444` — three short event recommendations under the app promo. */
const OTHERS_BOOKED_FIXTURE = [
  {
    title: 'Soundstorm Festival',
    meta: 'Thu 22 Oct · from SAR 450',
    image: CATALOG_EVENTS[1].image,
    href: `/events/${slugify(CATALOG_EVENTS[1].title)}`,
  },
  {
    title: 'Symphony of the Sands',
    meta: 'Fri 16 Oct · from SAR 380',
    image: CATALOG_EVENTS[4].image,
    href: `/events/${slugify(CATALOG_EVENTS[4].title)}`,
  },
  {
    title: 'Nada Sharif — Warehouse Set',
    meta: 'Sat 24 Oct · from SAR 160',
    image: CATALOG_EVENTS[6].image,
    href: `/events/${slugify(CATALOG_EVENTS[6].title)}`,
  },
] as const

function mapOrderToTicket(
  order: Record<string, unknown>,
  labels: { when: string; seats: string },
): TicketFixture {
  const id = String(order.id ?? order.order_id ?? '')
  const title = String(
    order.title ?? order.event_title ?? order.name ?? `Order ${id || '—'}`,
  )
  return {
    id: id || title,
    orderId: String(order.reference ?? order.order_number ?? id),
    title,
    meta: String(order.meta ?? order.venue ?? order.status ?? ''),
    status: String(order.status ?? 'UPCOMING') as TicketFixture['status'],
    cover: String(order.cover ?? order.image ?? MY_TICKETS[0]?.cover ?? ''),
    countdown: order.countdown ? String(order.countdown) : undefined,
    facts: Array.isArray(order.facts)
      ? (order.facts as { label: string; value: string }[])
      : [
          { label: labels.when, value: String(order.starts_at ?? order.date ?? '—') },
          { label: labels.seats, value: String(order.seats ?? order.quantity ?? '—') },
        ],
    actions: (order.actions as TicketFixture['actions']) ?? ['qr'],
    note: order.note ? String(order.note) : undefined,
  }
}

function resolveOrder(
  orders: Record<string, unknown>[] | undefined,
  id: string,
): Record<string, unknown> | undefined {
  if (!orders?.length) return undefined
  return (
    orders.find(
      (order) =>
        String(order.id ?? '') === id ||
        String(order.order_id ?? '') === id ||
        String(order.reference ?? '') === id ||
        String(order.order_number ?? '') === id,
    ) ?? orders[0]
  )
}

function resolveTicket(
  orders: Record<string, unknown>[] | undefined,
  id: string,
  labels: { when: string; seats: string },
): TicketFixture {
  const match = resolveOrder(orders, id)
  if (match) return mapOrderToTicket(match, labels)
  return MY_TICKETS.find((item) => item.id === id) ?? MY_TICKETS[0]
}

function isCancellable(order: Record<string, unknown> | undefined) {
  if (!order) return false
  const status = String(order.status ?? '').toLowerCase()
  return (
    status.includes('pending') ||
    status.includes('unpaid') ||
    status.includes('await') ||
    status.includes('draft') ||
    status.includes('created')
  )
}

/** Decorative QR stand-in — Figma draws a dense matrix; a seeded grid keeps the stub readable. */
function TicketQr({ seed }: { seed: number }) {
  const cells = Array.from({ length: 21 * 21 }, (_, index) => {
    const x = index % 21
    const y = Math.floor(index / 21)
    const finder =
      (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
    const on = finder
      ? x === 0 ||
        y === 0 ||
        x === 6 ||
        y === 6 ||
        (x > 13 && (x === 14 || x === 20 || y === 0 || y === 6)) ||
        (y > 13 && (y === 14 || y === 20 || x === 0 || x === 6)) ||
        (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
        (x >= 16 && x <= 18 && y >= 2 && y <= 4) ||
        (x >= 2 && x <= 4 && y >= 16 && y <= 18)
      : ((x * 17 + y * 13 + seed * 7) % 5) > 1
    return on
  })

  return (
    <div className="grid size-[126px] grid-cols-[repeat(21,minmax(0,1fr))] gap-px bg-surface-default">
      {cells.map((on, index) => (
        <span
          key={index}
          className={cn('size-full', on ? 'bg-surface-inverse' : 'bg-surface-default')}
        />
      ))}
    </div>
  )
}

/**
 * Ticket detail — Figma `207:9024`.
 * FunnelLayout (Logo · TICKET · Back) — no SiteHeader.
 */
export function TicketPage() {
  const { t } = useTranslation('account')
  const { id = 'winter-nights' } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: orders } = useGetOrdersQuery()
  const { data: eventsResult } = useGetEventsQuery()
  const apiEvents = eventsResult?.items
  const [cancelOrder, cancelState] = useCancelOrderMutation()

  const factLabels = useMemo(
    () => ({ when: t('ticket.factWhen'), seats: t('ticket.factSeats') }),
    [t],
  )

  const order = useMemo(() => resolveOrder(orders, id), [orders, id])
  const ticket = useMemo(
    () => resolveTicket(orders, id, factLabels),
    [orders, id, factLabels],
  )
  const canCancel = isCancellable(order)

  const rules = useMemo(
    () =>
      [
        { title: t('ticket.rules.arriveTitle'), body: t('ticket.rules.arriveBody') },
        { title: t('ticket.rules.cashlessTitle'), body: t('ticket.rules.cashlessBody') },
        { title: t('ticket.rules.qrTitle'), body: t('ticket.rules.qrBody') },
        { title: t('ticket.rules.camerasTitle'), body: t('ticket.rules.camerasBody') },
      ] as const,
    [t],
  )

  async function handleCancel() {
    const orderId = extractOrderId(order)
    if (!orderId) {
      dispatch(toastPushed('error', t('ticket.cancelUnavailable')))
      return
    }
    try {
      await cancelOrder(orderId).unwrap()
      dispatch(toastPushed('success', t('ticket.cancelSuccess')))
      navigate('/my-tickets')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('ticket.cancelError'))))
    }
  }

  const othersBooked = useMemo(() => {
    if (apiEvents && apiEvents.length > 0) {
      return apiEvents.slice(0, 3).map((event, index) => {
        const mapped = mapApiEventToCard(event)
        const fixture = OTHERS_BOOKED_FIXTURE[index] ?? OTHERS_BOOKED_FIXTURE[0]
        const priceLabel = mapped.price.toLowerCase().startsWith('from')
          ? mapped.price
          : `from ${mapped.price}`
        return {
          title: mapped.title,
          meta: [mapped.date, priceLabel].filter(Boolean).join(' · ') || fixture.meta,
          image: mapped.image ?? fixture.image,
          href: `/events/${mapped.slug}`,
        }
      })
    }
    return OTHERS_BOOKED_FIXTURE.map((item) => ({ ...item }))
  }, [apiEvents])

  return (
    <>
      <TicketActionHeader
        label={t('ticket.label')}
        backHref="/my-tickets"
        backLabel={t('ticket.backToTickets')}
      />
      <AccountSplit
        className="!gap-xl pt-[44px] lg:!gap-[40px]"
        aside={
          <div className="flex flex-col gap-[14px]">
            <div className="rounded-[20px] border border-border-default bg-surface-default p-[20px]">
              <p className="text-[17px] font-semibold text-ink-primary">{t('ticket.orderInfo')}</p>
              <dl className="mt-[14px] flex flex-col gap-[9px] text-[14px]">
                {[
                  [t('ticket.orderReference'), ticket.orderId],
                  [t('ticket.purchased'), '27 July 2026'],
                  [t('ticket.pricePaid'), 'SAR 1,183'],
                  [t('ticket.platformFee'), 'SAR 49'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-md">
                    <dt className="text-ink-secondary">{label}</dt>
                    <dd className="text-end font-semibold text-ink-primary">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-[14px] flex items-center gap-[11px] border-t border-border-divider pt-[14px]">
                <span className="flex h-[28px] items-center rounded-[7px] bg-brand-gradient-start px-[10px] text-[12px] font-bold text-ink-body">
                  tabby
                </span>
                <p className="text-[13px] text-ink-secondary">
                  {t('ticket.tabbySchedule', { amount: '295.75', date: '8 Oct' })}
                </p>
              </div>
              <Button variant="secondary" size="md" className="mt-lg w-full">
                {t('ticket.downloadInvoice')}
              </Button>
            </div>

            <div className="rounded-[20px] border border-border-default bg-bg-tint-brand p-[20px]">
              <p className="text-[17px] font-semibold text-ink-primary">{t('ticket.refundPolicy')}</p>
              <p className="mt-md text-[14px] leading-[1.55] text-ink-secondary">
                {t('ticket.refundPolicyBefore', { date: '5 October 2026' })}{' '}
                {t('ticket.transferGuest').toLowerCase()}.
              </p>
            </div>

            <div className="rounded-[20px] bg-surface-inverse p-[22px]">
              <p className="text-[18px] font-extrabold tracking-[-0.36px] text-bg-page">
                {t('ticket.appPromoTitle')}
              </p>
              <p className="mt-sm text-[14px] leading-[1.55] text-bg-page/80">
                {t('ticket.appPromoBody')}
              </p>
              <div className="mt-lg flex gap-sm">
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1 border-0 bg-surface-default text-ink-primary"
                >
                  iOS
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1 border-[1.5px] border-bg-page/28 bg-transparent text-bg-page hover:border-bg-page hover:text-bg-page"
                >
                  Android
                </Button>
              </div>
            </div>

            <div className="rounded-[20px] border border-border-default bg-surface-default p-[20px]">
              <p className="text-[15px] font-semibold text-ink-primary">{t('ticket.othersBooked')}</p>
              <ul className="mt-[12px] flex flex-col gap-[12px]">
                {othersBooked.map((item) => (
                  <li key={item.title}>
                    <Link
                      to={item.href}
                      className="flex items-center gap-[12px] rounded-[12px] outline-offset-2 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ink-brand"
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="size-[54px] shrink-0 rounded-[10px] object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block text-[14px] leading-[1.25] font-semibold text-ink-primary">
                          {item.title}
                        </span>
                        <span className="mt-[2px] block text-[12px] text-ink-secondary">
                          {item.meta}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        }
      >
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-md">
            <p className="text-[17px] font-semibold text-ink-primary">
              {t('ticket.ticketCount', { count: 2 })}
            </p>
            <div className="flex flex-wrap gap-sm">
              <Button variant="secondary" size="md" className="h-[38px] rounded-[19px]">
                {t('ticket.addToAppleWallet')}
              </Button>
              <Button variant="secondary" size="md" className="h-[38px] rounded-[19px]">
                {t('ticket.downloadPdf')}
              </Button>
            </div>
          </div>

          <div className="mt-lg flex flex-col gap-lg">
            {[0, 1].map((seatIndex) => (
              <article
                key={seatIndex}
                className="relative flex flex-col overflow-hidden rounded-[20px] border border-border-default bg-surface-default sm:flex-row"
              >
                <div className="min-w-0 flex-1 px-lg py-[18px] sm:px-[24px] sm:py-[22px]">
                  <div className="flex flex-wrap items-center gap-[10px]">
                    <StatusBadge tone="brandTint">{t('ticket.badgeGoldFloor')}</StatusBadge>
                    <StatusBadge tone="successTint">{t('ticket.badgeValid')}</StatusBadge>
                    <span className="text-[12px] text-ink-muted">
                      {t('ticket.ticketId', { id: `${ticket.orderId}-${seatIndex + 1}` })}
                    </span>
                  </div>
                  <h1 className="mt-[14px] text-[24px] leading-[1.06] font-extrabold tracking-[-0.9px] text-ink-primary sm:text-[30px]">
                    {ticket.title}
                  </h1>
                  <p className="mt-[6px] text-[14px] text-ink-secondary">{ticket.meta}</p>
                  <div className="mt-[20px] grid grid-cols-2 gap-[12px] sm:grid-cols-5 sm:gap-[18px]">
                    {[
                      [t('ticket.fieldHolder'), 'Sara Alghamdi'],
                      [t('ticket.fieldGate'), 'Gate 3'],
                      [t('ticket.fieldBlock'), 'Floor A'],
                      [t('ticket.fieldRow'), 'C'],
                      [t('ticket.fieldSeat'), String(11 + seatIndex)],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <p className="text-[11px] font-bold tracking-[0.77px] text-ink-muted uppercase">
                          {label}
                        </p>
                        <p className="mt-[4px] text-[15px] font-semibold text-ink-primary">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-[22px] flex flex-wrap gap-[10px] border-t border-dashed border-border-default pt-[18px]">
                    <Link to={`/my-tickets/${ticket.id}/gift`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-[36px] rounded-[18px] bg-bg-page px-[14px]"
                      >
                        {t('ticket.transferGuest')}
                      </Button>
                    </Link>
                    {canCancel && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-[36px] rounded-[18px] bg-bg-page px-[14px] text-state-danger"
                        loading={cancelState.isLoading}
                        onClick={() => void handleCancel()}
                      >
                        {t('ticket.cancelOrder')}
                      </Button>
                    )}
                    <Link to={`/my-tickets/${ticket.id}/refund`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-[36px] rounded-[18px] bg-bg-page px-[14px]"
                      >
                        {t('ticket.requestRefund')}
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="relative flex w-full shrink-0 flex-col items-center justify-center gap-[12px] border-t-2 border-dashed border-border-default bg-bg-page p-[22px] sm:w-[200px] sm:border-t-0 sm:border-s-2 md:w-[232px]">
                  <div className="rounded-[12px] border border-border-default bg-surface-default p-[10px]">
                    <TicketQr seed={seatIndex + 1} />
                  </div>
                  <div className="text-center text-[12px] leading-[1.45]">
                    <p className="font-semibold text-ink-secondary">
                      {t('ticket.scanAtGate', { gate: '3' })}
                    </p>
                    <p className="text-ink-muted">{t('ticket.worksOffline')}</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="absolute top-[-11px] start-[-13px] size-[22px] rounded-[11px] border border-border-default bg-bg-page"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-[-11px] start-[-13px] size-[22px] rounded-[11px] border border-border-default bg-bg-page"
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-[22px] rounded-[20px] border border-border-default bg-surface-default p-[22px]">
            <p className="text-[17px] font-semibold text-ink-primary">{t('ticket.entryRules')}</p>
            <div className="mt-[14px] grid gap-[12px] sm:grid-cols-2">
              {rules.map((rule) => (
                <div
                  key={rule.title}
                  className="flex gap-[11px] rounded-[14px] border border-border-default bg-bg-page px-lg py-[14px]"
                >
                  <span className="mt-[7px] size-[7px] shrink-0 rounded-[4px] bg-ink-brand" />
                  <div>
                    <p className="text-[14px] font-semibold text-ink-primary">{rule.title}</p>
                    <p className="mt-[2px] text-[13px] leading-[1.45] text-ink-secondary">
                      {rule.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-[12px] text-[12px] text-ink-muted">
              {t('ticket.rulesSetBy', { name: 'Riyadh Season' })}
            </p>
          </div>

          <Link
            to="/events"
            className="mx-auto mt-[40px] text-[14px] font-semibold text-ink-secondary hover:text-ink-brand"
          >
            ← {t('ticket.backToBrowsing')}
          </Link>
        </div>
      </AccountSplit>
    </>
  )
}
