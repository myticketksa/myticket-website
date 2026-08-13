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

const FILTERS: { id: string; label: string; count?: number }[] = [
  { id: 'all', label: 'All', count: 3 },
  { id: 'tickets', label: 'Tickets & orders', count: 1 },
  { id: 'waitlists', label: 'Waitlists', count: 1 },
  { id: 'prices', label: 'Prices & auction' },
  { id: 'following', label: 'Following' },
  { id: 'enquiries', label: 'Enquiries', count: 1 },
]

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

/** Notifications — Figma `207:8824`. Full-bleed list with filter chips. */
export function NotificationsPage() {
  const [filter, setFilter] = useState('all')

  const items = useMemo(
    () =>
      filter === 'all'
        ? NOTIFICATIONS
        : NOTIFICATIONS.filter((item) => item.category === filter),
    [filter],
  )

  const groups = ['TODAY', 'YESTERDAY', 'EARLIER'] as const

  return (
    <>
      <AccountPageHead
        eyebrow="Your account"
        title="Notifications"
        subtitle="3 unread · 9 in the last seven days"
        actions={
          <>
            <Button variant="secondary" size="md">
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
          {FILTERS.map((item) => (
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
                      key={item.title}
                      className={cn(
                        'flex flex-col gap-lg rounded-[20px] border px-xl py-[18px] sm:flex-row sm:items-start',
                        item.unread
                          ? 'border-[#ffc8ae] bg-surface-default'
                          : 'border-border-default bg-[#fffbf8]',
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
