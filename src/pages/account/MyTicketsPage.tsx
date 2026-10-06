import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/feedback'
import { StatusBadge, type StatusTone } from '@/components/data-display'
import { AccountPageHead, AccountSplit } from '@/layouts'
import { DefaultAccountAside } from '@/pages/_account/AccountAside'
import {
  listApplyRequests,
  listHireTalentRequests,
  type UserRequestCard,
} from '@/pages/_account/mapApplication'
import { ReservationStub } from '@/pages/_account/ReservationStub'
import { useGetMyApplicationQuery } from '@/app/api/accountApis'
import { useGetMyTalentRequestsQuery } from '@/app/api/talentsApi'
import { useGetOrdersQuery } from '@/app/api/ordersApi'
import { mapOrderToMyTicket } from '@/lib/api/mappers/orders'
import { useLocale } from '@/i18n/locale'

function matchesTicketTab(status: string, tab: number): boolean {
  if (tab === 0) return status === 'UPCOMING' || status === 'AWAITING SEAT'
  if (tab === 1) return status === 'PAST'
  return false
}

function requestStatusTone(status: string): StatusTone {
  if (status === 'accepted') return 'successTint'
  if (status === 'rejected') return 'dangerTint'
  return 'brandTint'
}

function requestTitle(
  request: UserRequestCard,
  t: (key: string, opts?: Record<string, unknown>) => string,
  roleLabel: (role: 'vendor' | 'talent') => string,
): string {
  if (request.kind === 'hire_talent') {
    return request.title
      ? t('account:tickets.hireTalentNamed', { name: request.title })
      : t('account:tickets.hireTalent')
  }
  if (request.kind === 'talent_apply') {
    return t('account:tickets.requestApplication', {
      role: roleLabel('talent'),
    })
  }
  return t('account:tickets.requestApplication', {
    role: roleLabel('vendor'),
  })
}

/**
 * My reservation — upcoming / past bookings, plus Requests for talent apply,
 * vendor apply, and hire-a-talent only.
 */
export function MyTicketsPage() {
  const { t } = useTranslation(['account', 'common'])
  const { roleLabel } = useLocale()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const { data: orders, isLoading } = useGetOrdersQuery()
  const { data: applicationData } = useGetMyApplicationQuery()
  const { data: hireRequests } = useGetMyTalentRequestsQuery()

  const tickets = useMemo(() => {
    return orders && orders.length > 0 ? orders.map(mapOrderToMyTicket) : []
  }, [orders])

  const userRequests = useMemo(() => {
    return [
      ...listApplyRequests(applicationData),
      ...listHireTalentRequests(hireRequests),
    ]
  }, [applicationData, hireRequests])

  const upcomingCount = tickets.filter(
    (item) => item.status === 'UPCOMING' || item.status === 'AWAITING SEAT',
  ).length
  const pastCount = tickets.filter((item) => item.status === 'PAST').length
  const requestsCount = userRequests.length

  const tabs = [
    { label: t('account:tickets.tabUpcoming'), count: upcomingCount },
    { label: t('account:tickets.tabPast'), count: pastCount },
    { label: t('account:tickets.tabRequests'), count: requestsCount },
  ] as const

  const visible =
    tab === 2 ? [] : tickets.filter((ticket) => matchesTicketTab(ticket.status, tab))

  const showRequests = tab === 2
  const requestsEmpty = showRequests && userRequests.length === 0

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
          {!isLoading && tickets.length === 0 && !showRequests && (
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

          {!isLoading &&
            !showRequests &&
            tickets.length > 0 &&
            visible.length === 0 && (
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

          {requestsEmpty && (
            <div className="flex justify-center py-3xl">
              <EmptyState
                variant="filters"
                title={t('account:tickets.requestsEmptyTitle')}
                body={t('account:tickets.requestsEmptyBody')}
                ctaLabel={t('account:tickets.requestsEmptyCta')}
                onCtaClick={() => navigate('/talents')}
              />
            </div>
          )}

          {showRequests && userRequests.length > 0 && (
            <ul className="flex flex-col gap-md">
              {userRequests.map((request) => (
                <li
                  key={request.id}
                  className="flex flex-col gap-sm rounded-[18px] border border-border-default bg-surface-default px-lg py-md"
                >
                  <div className="flex flex-wrap items-center gap-sm">
                    <p className="text-[15px] font-bold text-ink-primary">
                      {requestTitle(request, t, roleLabel)}
                    </p>
                    <StatusBadge tone={requestStatusTone(request.status)}>
                      {t(`account:applications.status.${request.status}`)}
                    </StatusBadge>
                  </div>
                  <p className="text-[13px] text-ink-secondary">
                    {request.submittedAt
                      ? `${request.submittedAt} · #${request.reference}`
                      : `#${request.reference}`}
                  </p>
                  {request.note ? (
                    <p className="text-[13px] leading-[1.5] text-ink-secondary">
                      {request.note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {!showRequests && (
            <div className="grid grid-cols-1 justify-items-center gap-lg sm:grid-cols-2">
              {visible.map((ticket) => (
                <ReservationStub
                  key={ticket.id}
                  to={`/my-tickets/${ticket.id}`}
                  title={ticket.title}
                  venue={ticket.city}
                  cover={ticket.cover}
                  bookedAt={ticket.orderDate}
                  startsAt={ticket.startTime}
                  stamp={
                    ticket.status === 'PAST'
                      ? t('account:tickets.tabPast')
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </AccountSplit>
    </>
  )
}
