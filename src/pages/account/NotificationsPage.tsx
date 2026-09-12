import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownIcon,
  CloseIcon,
  HeartIcon,
  MailIcon,
  StarIcon,
  TicketIcon,
} from '@/components/icons'
import { FilterChip } from '@/components/data-display'
import { Button } from '@/components/ui'
import { AccountPageHead, PageSection } from '@/layouts'
import { NOTIFICATIONS, type NotificationFixture } from '@/pages/_account/fixtures'
import { cn } from '@/lib/cn'
import {
  useGetNotificationCategoriesQuery,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/app/api/accountApis'

const FILTER_DEFS = [
  { id: 'all', label: 'All' },
  { id: 'tickets', label: 'Tickets & orders' },
  { id: 'waitlists', label: 'Waitlists' },
  { id: 'prices', label: 'Prices & auction' },
  { id: 'following', label: 'Following' },
] as const

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
  if (value.includes('mail') || value.includes('email')) return 'mail'
  if (value.includes('ticket') || value.includes('order')) return 'ticket'
  if (value.includes('price')) return 'price'
  return 'heart'
}

function mapNotificationCategory(raw: unknown): NotificationFixture['category'] {
  const value = String(raw ?? 'all').toLowerCase()
  if (value.includes('ticket') || value.includes('order')) return 'tickets'
  if (value.includes('wait')) return 'waitlists'
  if (value.includes('price') || value.includes('auction')) return 'prices'
  if (value.includes('follow')) return 'following'
  return 'all'
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

function mapNotification(record: Record<string, unknown>, index: number): NotificationFixture & {
  id?: string | number
  categoryKey?: string
} {
  const fallback = NOTIFICATIONS[index % NOTIFICATIONS.length]
  const categoryId = record.category_id ?? record.categoryId
  return {
    id: notificationId(record),
    title: String(record.title ?? record.subject ?? fallback.title),
    body: String(record.body ?? record.message ?? record.content ?? fallback.body),
    time: String(record.time ?? record.created_at ?? record.sent_at ?? fallback.time),
    unread: Boolean(record.unread ?? record.is_unread ?? !record.read_at),
    group: mapNotificationGroup(record.group ?? record.period),
    category: mapNotificationCategory(record.category ?? record.type),
    categoryKey:
      categoryId != null
        ? String(categoryId)
        : mapNotificationCategory(record.category ?? record.type),
    tag: record.tag ? String(record.tag) : fallback.tag,
    cta: record.cta ? String(record.cta) : record.action ? String(record.action) : fallback.cta,
    icon: mapNotificationIcon(record.icon ?? record.category ?? record.type),
  }
}

/** Notifications — Figma `207:8824`. Full-bleed list with filter chips. */
export function NotificationsPage() {
  const [filter, setFilter] = useState('all')
  const { data: notifications } = useGetNotificationsQuery()
  const { data: categories } = useGetNotificationCategoriesQuery()
  const [markAllRead, markAllState] = useMarkAllNotificationsReadMutation()
  const [markRead] = useMarkNotificationReadMutation()

  const allItems = useMemo(() => {
    if (notifications && notifications.length > 0) {
      return notifications.map(mapNotification)
    }
    return NOTIFICATIONS.map((item) => ({ ...item, categoryKey: item.category }))
  }, [notifications])

  const items = useMemo(
    () =>
      filter === 'all'
        ? allItems
        : allItems.filter((item) => ('categoryKey' in item ? item.categoryKey : item.category) === filter),
    [allItems, filter],
  )

  const unreadCount = allItems.filter((item) => item.unread).length
  const filters = useMemo(() => {
    if (categories && categories.length > 0) {
      return [
        { id: 'all', label: 'All', count: unreadCount || undefined },
        ...categories.map((category) => {
          const id = String(category.id ?? category.slug ?? category.name_en)
          const label = String(
            category.name_en ?? category.name ?? category.label ?? 'Category',
          )
          const count = Number(category.notifications_count ?? 0) || undefined
          return { id, label, count }
        }),
      ]
    }
    return FILTER_DEFS.map((item) => ({
      ...item,
      count:
        item.id === 'all'
          ? unreadCount || undefined
          : allItems.filter((n) => n.category === item.id && n.unread).length || undefined,
    }))
  }, [allItems, categories, unreadCount])

  const groups = ['TODAY', 'YESTERDAY', 'EARLIER'] as const

  return (
    <>
      <AccountPageHead
        eyebrow="Your account"
        title="Notifications"
        subtitle={`${unreadCount} unread · ${allItems.length} in your inbox`}
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              disabled={markAllState.isLoading || unreadCount === 0}
              onClick={() => void markAllRead()}
            >
              Mark all as read
            </Button>
            <Link to="/settings">
              <Button variant="secondary" size="md">
                Preferences
              </Button>
            </Link>
          </>
        }
      />

      <PageSection padTop={0} padBottom={96}>
        <div className="flex flex-wrap gap-sm">
          {filters.map((item) => (
            <FilterChip
              key={item.id}
              selected={filter === item.id}
              count={'count' in item ? item.count : undefined}
              onClick={() => setFilter(item.id)}
              className="h-[40px] rounded-[20px] px-[18px] font-bold"
            >
              {item.label}
            </FilterChip>
          ))}
        </div>

        <div className="mt-[26px] flex flex-col gap-[30px]">
          {groups.map((group) => {
            const groupItems = items.filter((item) => item.group === group)
            if (groupItems.length === 0) return null
            return (
              <section key={group}>
                <p className="text-[12px] font-extrabold tracking-[1.2px] text-ink-muted uppercase">
                  {group}
                </p>
                <ul className="mt-md flex flex-col gap-[10px]">
                  {groupItems.map((item) => (
                    <li
                      key={`${item.title}-${'id' in item ? item.id : item.time}`}
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
                          aria-label="Dismiss"
                          className="flex size-[34px] items-center justify-center text-ink-muted hover:text-ink-primary"
                          onClick={() => {
                            const id = 'id' in item ? item.id : undefined
                            if (typeof id === 'string' || typeof id === 'number') markRead(id)
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

        <p className="mt-xl text-[13px] text-ink-muted">
          Prefer fewer pings?{' '}
          <Link to="/settings" className="font-semibold text-ink-brand">
            Adjust notification settings
          </Link>
        </p>
      </PageSection>
    </>
  )
}
