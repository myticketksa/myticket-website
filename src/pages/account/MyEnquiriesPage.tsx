import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FilterChip, StatusBadge } from '@/components/data-display'
import { Button } from '@/components/ui'
import { AccountPageHead } from '@/layouts'
import { ENQUIRIES } from '@/pages/_account/fixtures'

const FILTERS = ['All', 'Open', 'Quoted', 'Confirmed', 'Closed'] as const

/** My enquiries — Figma `207:6603`. */
export function MyEnquiriesPage() {
  const [filter, setFilter] = useState(0)
  const [selected, setSelected] = useState(0)
  const active = ENQUIRIES[selected] ?? ENQUIRIES[0]

  const visible =
    filter === 0
      ? ENQUIRIES
      : ENQUIRIES.filter((item) => item.status === FILTERS[filter])

  return (
    <>
      <AccountPageHead
        eyebrow="Your account"
        title="My enquiries"
        subtitle="Quotes you've requested from vendors and talents. MyTicket doesn't take payment for this work — you settle directly."
        actions={
          <Link to="/vendors">
            <Button size="md">New enquiry</Button>
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-[var(--container-page)] px-page-gutter pt-xl pb-[96px]">
        <div className="flex flex-wrap gap-[8px]">
          {FILTERS.map((label, index) => (
            <FilterChip
              key={label}
              selected={filter === index}
              onClick={() => setFilter(index)}
              className="h-[40px] rounded-[20px] px-[18px] text-[14px] font-bold"
            >
              {label}
            </FilterChip>
          ))}
        </div>

        <div className="mt-3xl flex flex-col gap-[26px] lg:flex-row lg:items-start">
          <ul className="flex w-full shrink-0 flex-col gap-[12px] lg:w-[400px]">
            {visible.map((item) => {
              const isActive = ENQUIRIES.indexOf(item) === selected
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(ENQUIRIES.indexOf(item))}
                    className={`flex w-full gap-md rounded-[20px] border p-[18px] text-left transition-colors ${
                      isActive
                        ? 'border-[1.5px] border-brand-primary bg-bg-tint-brand'
                        : 'border-border-default bg-surface-default hover:border-border-brand'
                    }`}
                  >
                    <div className="flex size-[46px] shrink-0 items-center justify-center rounded-[14px] bg-brand-gradient text-[14px] font-bold text-ink-inverse">
                      {item.party
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-[8px]">
                        <p className="truncate text-[15px] font-bold text-ink-primary">
                          {item.party}
                        </p>
                        {item.unread && (
                          <span className="size-[8px] shrink-0 rounded-full bg-brand-identity-end" />
                        )}
                      </div>
                      <p className="mt-[3px] truncate text-[13px] font-medium text-ink-secondary">
                        {item.subject}
                      </p>
                      <div className="mt-[8px] flex flex-wrap items-center gap-[8px]">
                        <StatusBadge
                          tone={
                            item.status === 'Quoted'
                              ? 'brandTint'
                              : item.status === 'Open'
                                ? 'infoTint'
                                : 'neutralOutline'
                          }
                        >
                          {item.status}
                        </StatusBadge>
                        <span className="text-[12px] text-ink-muted">{item.updated}</span>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
            {visible.length === 0 && (
              <li className="rounded-[20px] border border-border-default bg-surface-default p-xl text-[14px] text-ink-secondary">
                No enquiries in this filter.
              </li>
            )}
          </ul>

          <div className="min-w-0 flex-1 rounded-[20px] border border-border-default bg-surface-default">
            <div className="flex flex-wrap items-start justify-between gap-md border-b border-border-default px-xl py-xl">
              <div>
                <p className="text-[18px] font-extrabold text-ink-primary">{active.party}</p>
                <p className="mt-[4px] text-[14px] text-ink-secondary">{active.subject}</p>
              </div>
              <StatusBadge tone="brandTint">{active.status}</StatusBadge>
            </div>
            <div className="px-xl py-xl">
              <p className="text-[12px] font-bold tracking-[0.06em] text-ink-muted uppercase">
                Latest
              </p>
              <p className="mt-md text-[15px] leading-[1.55] text-ink-secondary">{active.preview}</p>
              <div className="mt-xl flex flex-wrap gap-sm">
                <Button size="md">Reply</Button>
                <Button variant="secondary" size="md">
                  View quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
