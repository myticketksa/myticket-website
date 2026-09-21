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
  formatHumanDateTime,
  notificationDayGroup,
} from '@/lib/api/locale'
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/app/api/accountApis'
import { isUnreadNotification } from '@/lib/notifications/unread'

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

/** Known API notification `type` values — chip labels live in i18n. */
const KNOWN_NOTIFICATION_TYPES = [
  'MESSAGE',
  'TICKET',
  'TALENT_EVENT',
  'ORGANIZATION_REQUEST',
  'PROMOCODE',
  'ORGANIZE_EVENT',
  'ANNOUNCEMENT',
] as const

function normalizeNotificationType(raw: unknown): string {
  return String(raw ?? 'OTHER')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_') || 'OTHER'
}

function notificationTypeLabel(
  typeKey: string,
  t: (key: string) => string,
): string {
  const key = `account:notifications.filters.${typeKey}`
  const translated = t(key)
  if (translated !== key) return translated
  return titleCaseType(typeKey)
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
  const value = normalizeNotificationType(raw)
  if (value === 'MESSAGE' || value.includes('CHAT') || value.includes('MAIL')) return 'mail'
  if (value === 'TICKET' || value.includes('GIFT') || value.includes('ORDER')) return 'ticket'
  if (value === 'TALENT_EVENT' || value === 'ORGANIZE_EVENT' || value.includes('EVENT')) {
    return 'star'
  }
  if (value === 'PROMOCODE' || value.includes('PROMO') || value.includes('PRICE')) return 'price'
  if (value === 'ORGANIZATION_REQUEST' || value.includes('REQUEST')) return 'heart'
  if (value.includes('ANNOUNCE')) return 'mail'
  return 'heart'
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
  const typeKey = normalizeNotificationType(record.type ?? record.category)
  const createdAt = record.created_at ?? record.sent_at ?? record.time ?? record.createdAt
  return {
    id: notificationId(record),
    title: String(record.title ?? record.subject ?? 'Notification'),
    body: String(record.body ?? record.message ?? record.content ?? ''),
    time: formatHumanDateTime(createdAt) || String(createdAt ?? ''),
    unread: isUnreadNotification(record),
    group: notificationDayGroup(createdAt),
    category: 'all',
    typeKey,
    tag: record.tag ? String(record.tag) : undefined,
    cta: record.cta ? String(record.cta) : record.action ? String(record.action) : undefined,
    icon: mapNotificationIcon(typeKey),
  }
}

/** Notifications — chips from API `type` with title-cased known labels. */
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
    const present = new Set(allItems.map((item) => item.typeKey))
    const orderedKnown = KNOWN_NOTIFICATION_TYPES.filter((type) => present.has(type))
    const extras = [...present]
      .filter((type) => !(KNOWN_NOTIFICATION_TYPES as readonly string[]).includes(type))
      .sort()
    const typeKeys = [...orderedKnown, ...extras]

    return [
      {
        id: 'all',
        label: t('account:notifications.filters.all'),
        count: unreadCount || undefined,
      },
      ...typeKeys.map((typeKey) => ({
        id: typeKey,
        label: notificationTypeLabel(typeKey, t),
        count: allItems.filter((n) => n.typeKey === typeKey && n.unread).length || undefined,
      })),
    ]
  }, [allItems, unreadCount, t])

  const groups = ['TODAY', 'YESTERDAY', 'EARLIER'] as const

  function markItemRead(item: MappedNotification) {
    if (!item.unread) return
    if (typeof item.id === 'string' || typeof item.id === 'number') {
      void markRead(item.id)
    }
  }

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
        <div className="-mx-page-gutter overflow-x-auto px-page-gutter [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex w-max min-w-full flex-nowrap gap-sm sm:w-auto sm:flex-wrap">
            {filters.map((item) => (
              <FilterChip
                key={item.id}
                selected={filter === item.id}
                count={item.count}
                onClick={() => setFilter(item.id)}
                className="h-[44px] shrink-0 rounded-[22px] px-[18px] font-bold sm:h-[40px] sm:rounded-[20px]"
              >
                {item.label}
              </FilterChip>
            ))}
          </div>
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
                        'cursor-pointer transition-colors hover:border-border-brand',
                      )}
                      onClick={() => markItemRead(item)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          markItemRead(item)
                        }
                      }}
                      role="button"
                      tabIndex={0}
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
                        <p className="mt-xs text-[12px] font-semibold text-ink-muted">
                          {item.time}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-[10px]">
                        {item.cta && (
                          <Button
                            size="md"
                            variant={item.tag ? 'primary' : 'secondary'}
                            className="h-[40px] rounded-[20px] px-xl text-[13px] font-bold"
                            onClick={(event) => {
                              event.stopPropagation()
                              markItemRead(item)
                            }}
                          >
                            {item.cta}
                          </Button>
                        )}
                        <button
                          type="button"
                          aria-label={t('notifications.dismissAria')}
                          className="flex size-[34px] items-center justify-center text-ink-muted hover:text-ink-primary"
                          onClick={(event) => {
                            event.stopPropagation()
                            markItemRead(item)
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
