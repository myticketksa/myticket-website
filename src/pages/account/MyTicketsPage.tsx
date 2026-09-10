import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/data-display'
import { Button } from '@/components/ui'
import { AccountPageHead, AccountSplit } from '@/layouts'
import { DefaultAccountAside } from '@/pages/_account/AccountAside'
import { MY_TICKETS, type TicketStatus } from '@/pages/_account/fixtures'
import { useGetOrdersQuery } from '@/app/api/ordersApi'

const TABS = [
  { label: 'Upcoming', count: 3 },
  { label: 'Past', count: 2 },
  { label: 'Transferred', count: 1 },
  { label: 'Listed for resale', count: 1 },
] as const

function statusTone(status: TicketStatus | string) {
  const value = String(status).toUpperCase()
  if (value.includes('AWAIT') || value.includes('UPCOMING') || value.includes('LISTED')) {
    return 'brandTint' as const
  }
  return 'inactive' as const
}

function mapOrderToTicket(order: Record<string, unknown>) {
  const id = String(order.id ?? order.order_id ?? '')
  const title = String(
    order.title ?? order.event_title ?? order.name ?? `Order ${id || '—'}`,
  )
  return {
    id: id || title,
    orderId: String(order.reference ?? order.order_number ?? id),
    title,
    meta: String(order.meta ?? order.venue ?? order.status ?? ''),
    status: String(order.status ?? 'UPCOMING') as TicketStatus,
    cover: String(order.cover ?? order.image ?? MY_TICKETS[0]?.cover ?? ''),
    countdown: order.countdown ? String(order.countdown) : undefined,
    facts: Array.isArray(order.facts)
      ? (order.facts as { label: string; value: string }[])
      : [
          { label: 'When', value: String(order.starts_at ?? order.date ?? '—') },
          { label: 'Seats', value: String(order.seats ?? order.quantity ?? '—') },
        ],
    actions: (order.actions as string[]) ?? ['qr'],
    note: order.note ? String(order.note) : undefined,
  }
}

/**
 * My tickets — Figma `207:9469`. Orders API with fixture fallback.
 */
export function MyTicketsPage() {
  const [tab, setTab] = useState(0)
  const { data: orders, isError, isFetching } = useGetOrdersQuery()

  const tickets = useMemo(() => {
    if (orders && orders.length > 0) return orders.map(mapOrderToTicket)
    return MY_TICKETS
  }, [orders])

  return (
    <>
      <AccountPageHead
        eyebrow="Your account"
        title="My tickets"
        subtitle={`Everything you've booked, in one place. Your QR codes work offline in the app.${
          isError ? ' Showing local preview while the API is unreachable.' : ''
        }${isFetching ? ' Updating…' : ''}`}
        actions={
          <>
            <Button variant="secondary" size="md">
              Add all to Apple Wallet
            </Button>
            <Link to="/auctions">
              <Button size="md">Sell a ticket</Button>
            </Link>
          </>
        }
        tabs={TABS.map((item, index) => ({
          ...item,
          active: index === tab,
          onSelect: () => setTab(index),
        }))}
      />

      <AccountSplit aside={<DefaultAccountAside />}>
        <div className="flex flex-col gap-[14px]">
          {tickets.map((ticket) => (
            <article
              key={ticket.id}
              className="flex overflow-hidden rounded-[20px] border border-border-default bg-surface-default"
            >
              <div className="relative w-[148px] shrink-0 self-stretch sm:w-[196px]">
                {ticket.cover ? (
                  <img
                    src={ticket.cover}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-bg-tint-brand" />
                )}
                {ticket.countdown && (
                  <span className="absolute top-[12px] left-[12px] rounded-[12px] bg-surface-inverse px-[10px] py-[5px] text-[11px] font-bold tracking-[0.06em] text-bg-page uppercase">
                    {ticket.countdown}
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col px-[22px] py-[20px]">
                <div className="flex flex-wrap items-center gap-[9px]">
                  <StatusBadge tone={statusTone(ticket.status)}>{ticket.status}</StatusBadge>
                  <span className="text-[12px] text-ink-muted">Order {ticket.orderId}</span>
                </div>
                <Link
                  to={`/my-tickets/${ticket.id}`}
                  className="mt-[10px] text-[24px] leading-[1.08] font-extrabold tracking-[-0.81px] text-ink-primary hover:text-ink-brand sm:text-[27px]"
                >
                  {ticket.title}
                </Link>
                <p className="mt-[5px] text-[14px] text-ink-secondary">{ticket.meta}</p>
                <div className="mt-lg grid grid-cols-2 gap-lg border-y border-border-divider py-[14px] sm:grid-cols-4">
                  {ticket.facts.map((fact) => (
                    <div key={fact.label} className="min-w-0">
                      <p className="text-[11px] font-bold tracking-[0.07em] text-ink-muted uppercase">
                        {fact.label}
                      </p>
                      <p className="mt-[3px] text-[15px] font-semibold text-ink-primary">
                        {fact.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-lg flex flex-wrap items-center gap-[9px]">
                  {ticket.actions.includes('qr') && (
                    <Link to={`/my-tickets/${ticket.id}`}>
                      <Button size="sm">Show QR</Button>
                    </Link>
                  )}
                  {ticket.actions.includes('transfer') && (
                    <Link to={`/my-tickets/${ticket.id}/gift`}>
                      <Button variant="secondary" size="sm" className="bg-bg-page">
                        Transfer to a guest
                      </Button>
                    </Link>
                  )}
                  {ticket.actions.includes('resell') && (
                    <Link to={`/my-tickets/${ticket.id}/resell`}>
                      <Button variant="secondary" size="sm" className="bg-bg-page">
                        List on the auction
                      </Button>
                    </Link>
                  )}
                  {ticket.actions.includes('refund') && (
                    <Link to={`/my-tickets/${ticket.id}/refund`}>
                      <Button variant="secondary" size="sm" className="bg-bg-page">
                        Request a refund
                      </Button>
                    </Link>
                  )}
                  {ticket.note && (
                    <span className="text-[12px] text-ink-muted">{ticket.note}</span>
                  )}
                </div>
              </div>
            </article>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-lg rounded-[20px] border border-border-default bg-surface-default px-xl py-xl">
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-semibold text-ink-primary">Can&apos;t make a night?</p>
              <p className="mt-[3px] text-[14px] text-ink-secondary">
                Transfer the ticket to a friend for free, or list it on the auction — MyTicket
                handles the money and takes 10% from the sale.
              </p>
            </div>
            <Link to="/help">
              <Button variant="secondary" size="md" className="bg-bg-page">
                How resale works
              </Button>
            </Link>
          </div>
        </div>
      </AccountSplit>
    </>
  )
}
