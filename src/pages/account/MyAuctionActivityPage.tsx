import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/data-display'
import { Button } from '@/components/ui'
import { AccountPageHead } from '@/layouts'
import { AUCTION_ACTIVITY } from '@/pages/_account/fixtures'
import { cn } from '@/lib/cn'

/** My auction activity — Figma `207:11538`. */
export function MyAuctionActivityPage() {
  const [tab, setTab] = useState(0)
  const selling = AUCTION_ACTIVITY.filter((item) => item.tab === 'selling')
  const bidding = AUCTION_ACTIVITY.filter((item) => item.tab === 'bidding')
  const rows = tab === 0 ? selling : bidding

  return (
    <>
      <AccountPageHead
        eyebrow="Your account"
        title="Auction activity"
        subtitle="Tickets you're selling and seats you're chasing, in one place. We'll nudge you the second anything changes."
        className="[&>div]:max-w-[1040px]"
        actions={
          <Link to="/auctions">
            <Button size="md">Browse auctions</Button>
          </Link>
        }
        tabs={[
          {
            label: 'Selling',
            count: selling.length,
            active: tab === 0,
            onSelect: () => setTab(0),
          },
          {
            label: 'Bidding',
            count: bidding.length,
            active: tab === 1,
            onSelect: () => setTab(1),
          },
        ]}
      />

      <div className="mx-auto w-full max-w-[1040px] px-page-gutter pt-3xl pb-[96px]">
        <ul className="flex flex-col gap-[12px]">
          {rows.map((item) => (
            <li
              key={item.title}
              className="flex flex-col gap-lg rounded-[18px] border border-border-default bg-surface-default px-[22px] py-[18px] xl:flex-row xl:items-center xl:gap-[18px]"
            >
              <div className="min-w-0 xl:w-[290px]">
                <div className="flex flex-wrap items-center gap-[8px]">
                  <p className="text-[15.5px] font-bold text-ink-primary">{item.title}</p>
                  <StatusBadge tone={item.statusTone}>{item.status}</StatusBadge>
                </div>
                <p className="mt-[3px] text-[13px] text-ink-muted">{item.meta}</p>
              </div>

              <div className="min-w-0 xl:w-[155px]">
                <p className="text-[12px] text-ink-muted">{item.priceLabel}</p>
                <p className="text-[17px] font-bold text-ink-primary">{item.price}</p>
                {'priceSub' in item && item.priceSub && (
                  <p className="text-[12px] text-ink-muted">{item.priceSub}</p>
                )}
              </div>

              {tab === 0 && (
                <div className="min-w-0 xl:w-[155px]">
                  <p className="text-[12px] text-ink-muted">You&apos;d receive</p>
                  <p className="text-[17px] font-bold text-state-success">{item.receive}</p>
                  <p className="text-[12px] text-ink-muted">after 10%</p>
                </div>
              )}

              <div className="min-w-0 xl:w-[174px]">
                <p className="text-[12px] text-ink-muted">Ends in</p>
                <p
                  className={cn(
                    'text-[15px] font-extrabold',
                    item.timerUrgent ? 'text-ink-brand-strong' : 'text-ink-secondary',
                  )}
                >
                  {item.timer}
                </p>
              </div>

              <div className="flex w-full flex-col gap-[6px] xl:w-[150px]">
                <Button variant="secondary" size="sm" className="h-[36px] w-full rounded-[18px]">
                  {item.primary}
                </Button>
                <button
                  type="button"
                  className="inline-flex h-[32px] items-center justify-center text-[12.5px] font-semibold text-border-danger hover:opacity-80"
                >
                  {item.secondary}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
