import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/data-display'
import { EmptyState } from '@/components/feedback'
import { Button } from '@/components/ui'
import { AccountPageHead, AccountSplit } from '@/layouts'
import { DefaultAccountAside } from '@/pages/_account/AccountAside'
import { type TicketStatus } from '@/pages/_account/fixtures'
import { useGetOrdersQuery } from '@/app/api/ordersApi'
import { mapOrderToMyTicket } from '@/lib/api/mappers/orders'

function statusTone(status: TicketStatus | string) {
  const value = String(status).toUpperCase()
  if (value.includes('AWAIT') || value.includes('UPCOMING') || value.includes('LISTED')) {
    return 'brandTint' as const
  }
  return 'inactive' as const
}

function matchesTab(status: string, tab: number) {
  if (tab === 0) return status === 'UPCOMING' || status === 'AWAITING SEAT'
  if (tab === 1) return status === 'PAST'
  if (tab === 2) return status === 'TRANSFERRED'
  if (tab === 3) return status === 'LISTED'
  return true
}

/**
 * My tickets — Figma `207:9469`. Live `GET /tickets/orders` into the existing card layout.
 */
export function MyTicketsPage() {
  const { t } = useTranslation(['account', 'common'])
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const { data: orders, isError, isFetching, isLoading } = useGetOrdersQuery()

  const tickets = useMemo(() => {
    if (orders && orders.length > 0) return orders.map(mapOrderToMyTicket)
    return []
  }, [orders])

  const tabCounts = useMemo(
    () => [
      tickets.filter((t) => t.status === 'UPCOMING' || t.status === 'AWAITING SEAT').length,
      tickets.filter((t) => t.status === 'PAST').length,
      tickets.filter((t) => t.status === 'TRANSFERRED').length,
      tickets.filter((t) => t.status === 'LISTED').length,
    ],
    [tickets],
  )

  const tabs = [
    { label: 'Upcoming', count: tabCounts[0] },
    { label: 'Past', count: tabCounts[1] },
    { label: 'Transferred', count: tabCounts[2] },
    { label: 'Listed for resale', count: tabCounts[3] },
  ] as const

  const visible = tickets.filter((ticket) => matchesTab(ticket.status, tab))

  return (
    <>
      <AccountPageHead
        eyebrow={t('account:eyebrow')}
        title={t('account:tickets.title')}
        subtitle={`${t('account:tickets.subtitle')}${
          isError ? ' Could not refresh tickets right now.' : ''
        }${isFetching && !isError ? ' Updating…' : ''}`}
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
        tabs={tabs.map((item, index) => ({
          ...item,
          active: index === tab,
          onSelect: () => setTab(index),
        }))}
      />

      <AccountSplit aside={<DefaultAccountAside />}>
        <div className="flex flex-col gap-[14px]">
          {!isLoading && tickets.length === 0 && (
            <div className="flex justify-center py-3xl">
              <EmptyState
                variant="firstUse"
                title={t('account:tickets.emptyTitle')}
                body={t('account:tickets.emptyBody')}
                ctaLabel={t('account:tickets.emptyCta')}
                onCtaClick={() => navigate('/events')}
              />
            </div>
          )}

          {!isLoading && tickets.length > 0 && visible.length === 0 && (
            <div className="flex justify-center py-3xl">
              <EmptyState
                variant="filters"
                title={t('account:tickets.tabEmptyTitle')}
                body={t('account:tickets.tabEmptyBody')}
                ctaLabel={t('common:empty.clearFilters')}
                onCtaClick={() => setTab(0)}
              />
            </div>
          )}

          {visible.map((ticket) => (
            <article
              key={ticket.id}
              className="flex flex-col overflow-hidden rounded-[20px] border border-border-default bg-surface-default sm:flex-row"
            >
              <div className="relative h-[160px] w-full shrink-0 sm:h-auto sm:w-[148px] sm:self-stretch md:w-[196px]">
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
              <div className="flex min-w-0 flex-1 flex-col px-lg py-[18px] sm:px-[22px] sm:py-[20px]">
                <div className="flex flex-wrap items-center gap-[9px]">
                  <StatusBadge tone={statusTone(ticket.status)}>{ticket.status}</StatusBadge>
                  <span className="text-[12px] text-ink-muted">Order {ticket.orderId}</span>
                </div>
                <Link
                  to={`/my-tickets/${ticket.id}`}
                  className="mt-[10px] text-[20px] leading-[1.08] font-extrabold tracking-[-0.81px] text-ink-primary hover:text-ink-brand sm:text-[24px] lg:text-[27px]"
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
