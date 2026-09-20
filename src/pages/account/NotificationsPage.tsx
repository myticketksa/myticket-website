import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowDownIcon,
  CloseIcon,
  HeartIcon,
  MailIcon,
  StarIcon,
  TicketIcon,
} from '@/components/icons'
import { FilterChip } from '@/components/data-display'
import { EmptyState } from '@/components/feedback'
import { Button } from '@/components/ui'
import { AccountPageHead, PageSection } from '@/layouts'
import { type NotificationFixture } from '@/pages/_account/fixtures'
import { cn } from '@/lib/cn'
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/app/api/accountApis'

function titleCaseType(raw: string): string {
  const value = raw.trim()
  if (!value) return 'Other'
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function NotificationIcon({ icon }: { icon: NotificationFixture['icon'] }) {
  const common = 'text-ink-brand'
  if (icon === 'star')
    return (
      <div className="flex size-[44px] items-center justify-center rounded-[14px] bg-brand-gradient text-ink-inverse">
        <StarIcon size={17} />
      </div>
    )
  if (icon === 'mail')
    return (
      <div className="flex size-[44px] items-center justify-center rounded-[14px] bg-bg-tint-brand">
        <MailIcon size={17} className={common} />
      </div>
    )
  if (icon === 'ticket')
    return (
      <div className="flex size-[44px] items-center justify-center rounded-[14px] bg-bg-tint-brand">
        <TicketIcon size={17} className={common} />
      </div>
    )
  if (icon === 'price')
    return (
      <div className="flex size-[44px] items-center justify-center rounded-[14px] bg-bg-tint-brand">
        <ArrowDownIcon size={17} className={common} />
      </div>
    )
  return (
    <div className="flex size-[44px] items-center justify-center rounded-[14px] bg-bg-tint-brand">
      <HeartIcon size={17} className={common} />
    </div>
  )
}

function mapNotificationIcon(raw: unknown): NotificationFixture['icon'] {
  const value = String(raw ?? '').toLowerCase()
  if (value.includes('star') || value.includes('wait')) return 'star'
  if (value.includes('mail') || value.includes('email') || value.includes('announce')) return 'mail'
  if (value.includes('ticket') || value.includes('order')) return 'ticket'
  if (value.includes('price')) return 'price'
  return 'heart'
}

function mapNotificationGroup(raw: unknown): NotificationFixture['group'] {
  const value = String(raw ?? '').toUpperCase()
  if (value.includes('TODAY')) return 'TODAY'
  if (value.includes('YESTERDAY')) return 'YESTERDAY'
  return 'EARLIER'
}

function notificationId(record: Record<string, unknown>): string | number | undefined {
  const raw = record.id ?? record.notification_id
  if (typeof raw === 'string' || typeof raw === 'number') return raw
  return undefined
}

type MappedNotification = NotificationFixture & {
  id?: string | number
  typeKey: string
}

function mapNotification(record: Record<string, unknown>): MappedNotification {
  const typeRaw = String(record.type ?? record.category ?? 'OTHER').trim() || 'OTHER'
  const typeKey = typeRaw.toUpperCase()
  return {
    id: notificationId(record),
    title: String(record.title ?? record.subject ?? 'Notification'),
    body: String(record.body ?? record.message ?? record.content ?? ''),
    time: String(record.time ?? record.created_at ?? record.sent_at ?? ''),
    unread: (() => {
      if (typeof record.is_read === 'boolean') return !record.is_read
      if (typeof record.isRead === 'boolean') return !record.isRead
      if (typeof record.read === 'boolean') return !record.read
      return Boolean(record.unread ?? record.is_unread ?? !record.read_at)
    })(),
    group: mapNotificationGroup(record.group ?? record.period),
    category: 'all',
    typeKey,
    tag: record.tag ? String(record.tag) : undefined,
    cta: record.cta ? String(record.cta) : record.action ? String(record.action) : undefined,
    icon: mapNotificationIcon(record.icon ?? record.type ?? record.category),
  }
}

/** Notifications — chips from API `type` values (title-cased). */
export function NotificationsPage() {
  const { t } = useTranslation(['account', 'common'])
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const { data: notifications, isLoading } = useGetNotificationsQuery()
  const [markAllRead, markAllState] = useMarkAllNotificationsReadMutation()
  const [markRead] = useMarkNotificationReadMutation()

  const allItems = useMemo(() => {
    if (notifications && notifications.length > 0) {
      return notifications.map(mapNotification)
    }
    return []
  }, [notifications])

  const items = useMemo(
    () => (filter === 'all' ? allItems : allItems.filter((item) => item.typeKey === filter)),
    [allItems, filter],
  )

  const unreadCount = allItems.filter((item) => item.unread).length

  const filters = useMemo(() => {
    const typeKeys = [...new Set(allItems.map((item) => item.typeKey))].sort()
    return [
      {
        id: 'all',
        label: t('account:notifications.filters.all'),
        count: unreadCount || undefined,
      },
      ...typeKeys.map((typeKey) => ({
        id: typeKey,
        label: titleCaseType(typeKey),
        count: allItems.filter((n) => n.typeKey === typeKey && n.unread).length || undefined,
      })),
    ]
  }, [allItems, unreadCount, t])

  const groups = ['TODAY', 'YESTERDAY', 'EARLIER'] as const

  return (
    <>
      <AccountPageHead
        eyebrow={t('account:eyebrow')}
        title={t('account:notifications.title')}
        subtitle={t('account:notifications.inboxSubtitle', {
          unread: unreadCount,
          total: allItems.length,
        })}
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              disabled={markAllState.isLoading || unreadCount === 0}
              onClick={() => void markAllRead()}
            >
              {t('account:notifications.markAllRead')}
            </Button>
            <Link to="/settings">
              <Button variant="secondary" size="md">
                {t('account:notifications.preferences')}
              </Button>
            </Link>
          </>
        }
      />

      <PageSection padTop={32} padBottom={96}>
        <div className="flex flex-wrap gap-sm">
          {filters.map((item) => (
            <FilterChip
              key={item.id}
              selected={filter === item.id}
              count={item.count}
              onClick={() => setFilter(item.id)}
              className="h-[40px] rounded-[20px] px-[18px] font-bold"
            >
              {item.label}
            </FilterChip>
          ))}
        </div>

        <div className="mt-[26px] flex flex-col gap-[30px]">
          {!isLoading && allItems.length === 0 && (
            <div className="flex justify-center py-3xl">
              <EmptyState
                variant="firstUse"
                title={t('account:notifications.noneTitle')}
                body={t('account:notifications.noneBody')}
                ctaLabel={t('common:actions.browseEvents')}
                onCtaClick={() => navigate('/events')}
              />
            </div>
          )}
          {!isLoading && allItems.length > 0 && items.length === 0 && (
            <div className="flex justify-center py-3xl">
              <EmptyState
                variant="filters"
                title={t('account:notifications.filterEmptyTitle')}
                body={t('account:notifications.filterEmptyBody')}
                ctaLabel={t('common:empty.clearFilters')}
                onCtaClick={() => setFilter('all')}
              />
            </div>
          )}
          {groups.map((group) => {
            const groupItems = items.filter((item) => item.group === group)
            if (groupItems.length === 0) return null
            return (
              <section key={group}>
                <p className="text-[12px] font-extrabold tracking-[1.2px] text-ink-muted uppercase">
                  {t(`account:notifications.groups.${group}`)}
                </p>
                <ul className="mt-md flex flex-col gap-[10px]">
                  {groupItems.map((item) => (
                    <li
                      key={`${item.title}-${item.id ?? item.time}`}
                      className={cn(
                        'flex flex-col gap-lg rounded-[20px] border px-xl py-[18px] sm:flex-row sm:items-start',
                        item.unread
                          ? 'border-border-brand-soft bg-surface-default'
                          : 'border-border-default bg-bg-page',
                      )}
                    >
                      <NotificationIcon icon={item.icon} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-[9px]">
                          <p className="text-[16px] font-bold tracking-[-0.24px] text-ink-primary">
                            {item.title}
                          </p>
                          {item.unread && (
                            <span className="size-[8px] rounded-pill bg-brand-identity-end" />
                          )}
                          {item.tag && (
                            <span className="rounded-[12px] bg-brand-identity-end px-[10px] py-xs text-[11px] font-bold text-ink-inverse">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <p className="mt-xs text-[14px] leading-[1.55] font-medium text-ink-secondary">
                          {item.body}
                        </p>
                        <p className="mt-xs text-[12px] font-semibold text-ink-muted">{item.time}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-[10px]">
                        {item.cta && (
                          <Button
                            size="md"
                            variant={item.tag ? 'primary' : 'secondary'}
                            className="h-[40px] rounded-[20px] px-xl text-[13px] font-bold"
                          >
                            {item.cta}
                          </Button>
                        )}
                        <button
                          type="button"
                          aria-label={t('notifications.dismissAria')}
                          className="flex size-[34px] items-center justify-center text-ink-muted hover:text-ink-primary"
                          onClick={() => {
                            if (typeof item.id === 'string' || typeof item.id === 'number') {
                              markRead(item.id)
                            }
                          }}
                        >
                          <CloseIcon size={17} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </PageSection>
    </>
  )
}
