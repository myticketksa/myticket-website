import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/feedback'
import { AccountPageHead, AccountSplit } from '@/layouts'
import { DefaultAccountAside } from '@/pages/_account/AccountAside'
import { ReservationStub } from '@/pages/_account/ReservationStub'
import { useGetGiftTicketsQuery } from '@/app/api/accountApis'
import { useGetOrdersQuery } from '@/app/api/ordersApi'
import { mapGiftTicketToMyTicket } from '@/lib/api/mappers/gifts'
import { mapOrderToMyTicket } from '@/lib/api/mappers/orders'

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
 * My tickets — compact cover cards in a 2-column grid.
 * Live `GET /tickets/orders` + `GET /gift-tickets`.
 */
export function MyTicketsPage() {
  const { t } = useTranslation(['account', 'common'])
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const { data: orders, isLoading } = useGetOrdersQuery()
  const { data: gifts } = useGetGiftTicketsQuery()

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

  return (
    <>
      <AccountPageHead
        eyebrow={t('account:eyebrow')}
        title={t('account:tickets.title')}
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

          {/* Centred grid of ticket stubs, as the original laid them out. */}
          <div className="grid grid-cols-1 justify-items-center gap-lg sm:grid-cols-2">
            {visible.map((ticket) => (
              <ReservationStub
                key={ticket.id}
                to={ticketHref(ticket)}
                title={ticket.title}
                venue={ticket.city}
                cover={ticket.cover}
                bookedAt={ticket.orderDate}
                startsAt={ticket.startTime}
                stamp={
                  ticket.status === "PAST"
                    ? t("account:tickets.tabPast")
                    : ticket.status === "TRANSFERRED"
                      ? t("account:tickets.transferred")
                      : undefined
                }
              />
            ))}
          </div>
        </div>
      </AccountSplit>
    </>
  )
}
