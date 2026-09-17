import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/data-display'
import { EmptyState } from '@/components/feedback'
import { Button } from '@/components/ui'
import { AccountPageHead, AccountSplit } from '@/layouts'
import { DefaultAccountAside } from '@/pages/_account/AccountAside'
import { type TicketStatus } from '@/pages/_account/fixtures'
import { useGetGiftTicketsQuery } from '@/app/api/accountApis'
import { useGetOrdersQuery } from '@/app/api/ordersApi'
import { mapGiftTicketToMyTicket } from '@/lib/api/mappers/gifts'
import { mapOrderToMyTicket } from '@/lib/api/mappers/orders'

function statusTone(status: TicketStatus | string) {
  const value = String(status).toUpperCase()
  if (value.includes('AWAIT') || value.includes('UPCOMING')) {
    return 'brandTint' as const
  }
  return 'inactive' as const
}

function matchesTab(status: string, tab: number) {
  if (tab === 0) return status === 'UPCOMING' || status === 'AWAITING SEAT'
  if (tab === 1) return status === 'PAST'
  if (tab === 2) return status === 'TRANSFERRED'
  return true
}

function ticketHref(ticket: {
  id: string
  orderId?: string
  source?: string
  giftTicketId?: string
  claimable?: boolean
}) {
  if (ticket.source === 'gift' && ticket.giftTicketId) {
    if (ticket.claimable) return `/gift/claim/${ticket.giftTicketId}`
    if (ticket.orderId && /^\d+$/.test(ticket.orderId)) {
      return `/my-tickets/${ticket.orderId}`
    }
    return `/gift/claim/${ticket.giftTicketId}`
  }
  return `/my-tickets/${ticket.id}`
}

/**
 * My tickets — Figma `207:9469`. Live `GET /tickets/orders` + `GET /gift-tickets`
 * into the existing card layout (Transferred tab includes gifts).
 */
export function MyTicketsPage() {
  const { t } = useTranslation(['account', 'common'])
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const { data: orders, isError, isFetching, isLoading } = useGetOrdersQuery()
  const { data: gifts, isFetching: giftsFetching } = useGetGiftTicketsQuery()

  const tickets = useMemo(() => {
    const fromOrders = orders && orders.length > 0 ? orders.map(mapOrderToMyTicket) : []
    const fromGifts =
      gifts && gifts.length > 0 ? gifts.map(mapGiftTicketToMyTicket) : []
    return [...fromOrders, ...fromGifts]
  }, [orders, gifts])

  const tabCounts = useMemo(
    () => [
      tickets.filter((item) => item.status === 'UPCOMING' || item.status === 'AWAITING SEAT')
        .length,
      tickets.filter((item) => item.status === 'PAST').length,
      tickets.filter((item) => item.status === 'TRANSFERRED').length,
    ],
    [tickets],
  )

  const tabs = [
    { label: t('account:tickets.tabUpcoming'), count: tabCounts[0] },
    { label: t('account:tickets.tabPast'), count: tabCounts[1] },
    { label: t('account:tickets.tabTransferred'), count: tabCounts[2] },
  ] as const

  const visible = tickets.filter((ticket) => matchesTab(ticket.status, tab))

  const subtitle = [
    t('account:tickets.subtitle'),
    isError ? t('account:tickets.refreshError') : null,
    (isFetching || giftsFetching) && !isError ? t('account:tickets.updating') : null,
  ]
    .filter(Boolean)
    .join(' ')

  function statusLabel(status: string) {
    const key = `account:tickets.status.${status}` as const
    const translated = t(key)
    return translated === key ? status : translated
  }

  function factLabel(label: string) {
    const normalized = label.trim().toLowerCase()
    if (normalized === 'tier') return t('account:tickets.facts.tier')
    if (normalized === 'row') return t('account:tickets.facts.row')
    if (normalized === 'seats') return t('account:tickets.facts.seats')
    if (normalized === 'gate') return t('account:tickets.facts.gate')
    return label
  }

  function noteLabel(note: string) {
    if (note === 'Payment pending') return t('account:tickets.paymentPending')
    return note
  }

  return (
    <>
      <AccountPageHead
        eyebrow={t('account:eyebrow')}
        title={t('account:tickets.title')}
        subtitle={subtitle}
        actions={
          <Button variant="secondary" size="md">
            {t('account:tickets.addToWallet')}
          </Button>
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

          {visible.map((ticket) => {
            const href = ticketHref(ticket)
            const claimable = 'claimable' in ticket && Boolean(ticket.claimable)
            return (
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
                    <span className="absolute top-[12px] start-[12px] rounded-[12px] bg-surface-inverse px-[10px] py-[5px] text-[11px] font-bold tracking-[0.06em] text-bg-page uppercase">
                      {ticket.countdown}
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col px-lg py-[18px] sm:px-[22px] sm:py-[20px]">
                  <div className="flex flex-wrap items-center gap-[9px]">
                    <StatusBadge tone={statusTone(ticket.status)}>
                      {statusLabel(ticket.status)}
                    </StatusBadge>
                    {ticket.note === 'Payment pending' ? (
                      <StatusBadge tone="brandTint">{noteLabel(ticket.note)}</StatusBadge>
                    ) : null}
                    <span className="text-[12px] text-ink-muted">
                      {t('account:tickets.orderLabel', { id: ticket.orderId })}
                    </span>
                  </div>
                  <Link
                    to={href}
                    className="mt-[10px] text-[20px] leading-[1.08] font-extrabold tracking-[-0.81px] text-ink-primary hover:text-ink-brand sm:text-[24px] lg:text-[27px]"
                  >
                    {ticket.title}
                  </Link>
                  <p className="mt-[5px] text-[14px] text-ink-secondary">{ticket.meta}</p>
                  <div className="mt-lg grid grid-cols-2 gap-lg border-y border-border-divider py-[14px] sm:grid-cols-4">
                    {ticket.facts.map((fact) => (
                      <div key={fact.label} className="min-w-0">
                        <p className="text-[11px] font-bold tracking-[0.07em] text-ink-muted uppercase">
                          {factLabel(fact.label)}
                        </p>
                        <p className="mt-[3px] text-[15px] font-semibold text-ink-primary">
                          {fact.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-lg flex flex-wrap items-center gap-[9px]">
                    {claimable ? (
                      <Link to={href}>
                        <Button size="sm">{t('account:claim.cta')}</Button>
                      </Link>
                    ) : null}
                    {ticket.actions.includes('qr') &&
                      (ticket.paid ? (
                        <Link to={href}>
                          <Button size="sm">{t('account:tickets.showQr')}</Button>
                        </Link>
                      ) : (
                        <Button size="sm" disabled>
                          {t('account:tickets.showQr')}
                        </Button>
                      ))}
                    {ticket.actions.includes('transfer') &&
                      (ticket.paid ? (
                        <Link to={`/my-tickets/${ticket.id}/gift`}>
                          <Button variant="secondary" size="sm" className="bg-bg-page">
                            {t('account:tickets.transferGuest')}
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="secondary" size="sm" className="bg-bg-page" disabled>
                          {t('account:tickets.transferGuest')}
                        </Button>
                      ))}
                    {ticket.actions.includes('resell') &&
                      (ticket.paid ? (
                        <Link to={`/my-tickets/${ticket.id}/resell`}>
                          <Button variant="secondary" size="sm" className="bg-bg-page">
                            {t('account:tickets.listAuction')}
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="secondary" size="sm" className="bg-bg-page" disabled>
                          {t('account:tickets.listAuction')}
                        </Button>
                      ))}
                    {ticket.actions.includes('refund') &&
                      (ticket.paid ? (
                        <Link to={`/my-tickets/${ticket.id}/refund`}>
                          <Button variant="secondary" size="sm" className="bg-bg-page">
                            {t('account:tickets.requestRefund')}
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="secondary" size="sm" className="bg-bg-page" disabled>
                          {t('account:tickets.requestRefund')}
                        </Button>
                      ))}
                    {ticket.note && ticket.note !== 'Payment pending' ? (
                      <span className="text-[12px] text-ink-muted">{noteLabel(ticket.note)}</span>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </AccountSplit>
    </>
  )
}
