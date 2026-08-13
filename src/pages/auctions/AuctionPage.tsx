import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FilterChip, StatusBadge } from '@/components/data-display'
import { Breadcrumbs } from '@/components/navigation'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import {
  CATALOG_AUCTIONS,
  CatalogPageHead,
  ResultsToolbar,
  slugify,
} from '@/pages/_guest'

const FILTERS = ['Ending soon', 'Under face value', 'Seats together', 'My watchlist'] as const

const KPIS = [
  { label: 'Live listings', value: '214', note: 'Across 48 events' },
  { label: 'Ending within an hour', value: '9', note: 'Bid before the clock hits zero' },
  { label: 'Average saving', value: '18%', note: 'Vs face value this week' },
  { label: 'Transfers completed', value: '12.4k', note: 'Verified, money held in escrow' },
] as const

const STEPS = [
  {
    title: 'Find a listing',
    body: 'Browse resale tickets for sold-out or hard-to-get nights.',
  },
  {
    title: 'Place a bid or buy now',
    body: 'Money is held safely until the ticket is transferred to you.',
  },
  {
    title: 'Win and receive',
    body: 'The ticket moves into your MyTicket wallet — no screenshots.',
  },
  {
    title: 'Go to the show',
    body: 'Scan your QR at the gate like any primary ticket.',
  },
] as const

/** Auction hub — Figma `207:10792`. */
export function AuctionPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Ending soon')

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Auctions', href: '/auctions' },
          ]}
        />
      </PageSection>

      <PageSection padTop={14} padBottom={0}>
        <CatalogPageHead
          eyebrow="Resale marketplace"
          title="Ticket auction"
          subtitle="Verified fan-to-fan transfers for sold-out nights. Bid, buy now, or list a ticket you can no longer use."
          actions={
            <Button size="lg" className="shrink-0">
              List a ticket for sale
            </Button>
          }
        />
      </PageSection>

      <PageSection padTop={26} padBottom={0}>
        <div className="grid grid-cols-2 gap-lg lg:grid-cols-4">
          {KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-[16px] border border-border-default bg-surface-default p-[18px]"
            >
              <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                {kpi.label}
              </p>
              <p className="mt-sm text-[32px] font-extrabold tracking-[-0.8px] text-ink-primary tabular-nums">
                {kpi.value}
              </p>
              <p className="mt-[3px] text-[13px] text-ink-secondary">{kpi.note}</p>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection padTop={30} padBottom={96}>
        <div className="flex items-start gap-[32px]">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-lg">
              <div className="flex flex-wrap gap-[7px]">
                {FILTERS.map((label) => (
                  <FilterChip
                    key={label}
                    selected={filter === label}
                    onClick={() => setFilter(label)}
                    className="h-[36px] rounded-[18px]"
                  >
                    {label}
                  </FilterChip>
                ))}
              </div>
              <ResultsToolbar
                countLabel={`${CATALOG_AUCTIONS.length} live listings`}
                showViewToggle={false}
                sortValue="Ending soon"
                className="w-auto shrink-0"
              />
            </div>

            <div className="mt-lg flex flex-col gap-[14px]">
              {CATALOG_AUCTIONS.map((listing) => (
                <Link
                  key={listing.title}
                  to={`/auctions/${slugify(listing.title)}`}
                  className="overflow-hidden rounded-[18px] border border-border-default bg-surface-default"
                >
                  <div className="flex gap-0 p-lg">
                    <div className="relative h-[116px] w-[148px] shrink-0 overflow-hidden rounded-[12px]">
                      <img
                        src={listing.image}
                        alt=""
                        className="size-full object-cover"
                      />
                      {/*
                        Dark category pill as drawn — not OverlayBadge (light ground).
                        Figma: surface-inverse / 10px / tracking 0.5 / inset 8.
                      */}
                      <span className="absolute top-[8px] left-[8px] rounded-[10px] bg-surface-inverse px-[8px] py-[4px] text-[10px] font-bold tracking-[0.5px] text-bg-page uppercase">
                        {listing.category}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col px-[18px]">
                      <div className="flex items-center gap-[8px]">
                        <p className="text-[12px] font-extrabold tabular-nums text-brand-gradient-end">
                          Ends in {listing.endsIn}
                        </p>
                        {listing.tag && (
                          <StatusBadge tone="brandTint">{listing.tag}</StatusBadge>
                        )}
                      </div>
                      <h3 className="mt-[5px] text-[18px] font-semibold text-ink-primary">
                        {listing.title}
                      </h3>
                      <p className="mt-[5px] text-[14px] text-ink-secondary">{listing.meta}</p>
                      <p className="mt-[5px] text-[13px] text-ink-muted">{listing.seatInfo}</p>
                      <div className="mt-auto flex items-center gap-[14px] pt-md text-[13px] text-ink-secondary">
                        <span className="flex items-center gap-[6px]">
                          <span className="flex size-5 items-center justify-center rounded-full bg-identity-gradient text-[10px] font-bold text-ink-inverse">
                            {listing.seller.slice(0, 1)}
                          </span>
                          {listing.seller}
                        </span>
                        <span>{listing.bids} bids</span>
                        <span>{listing.watching} watching</span>
                      </div>
                    </div>
                    <div className="flex w-[232px] shrink-0 flex-col border-l border-border-divider pl-[18px]">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[13px] text-ink-muted">Highest bid</span>
                        <span className="text-[22px] font-extrabold tabular-nums text-brand-identity-end">
                          {listing.highestBid}
                        </span>
                      </div>
                      <div className="mt-sm flex items-baseline justify-between">
                        <span className="text-[13px] text-ink-muted">Buy now</span>
                        <span className="text-[15px] font-bold tabular-nums text-ink-primary">
                          {listing.buyNow}
                        </span>
                      </div>
                      <p className="mt-sm text-[12px] text-ink-muted">
                        Face value {listing.faceValue}
                      </p>
                      <div className="mt-auto flex flex-col gap-sm pt-md">
                        <Button className="h-[40px] rounded-[20px]">Place a bid</Button>
                        <Button variant="secondary" className="h-[40px] rounded-[20px]">
                          Buy now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <aside className="flex w-[396px] shrink-0 flex-col gap-[14px]">
            <div className="rounded-[18px] border border-border-default bg-surface-default p-xl">
              <h2 className="text-[18px] font-semibold text-ink-primary">
                How the auction works
              </h2>
              <p className="mt-xs text-[14px] leading-[1.45] text-ink-secondary">
                Escrow-held payments and verified transfers — not screenshots.
              </p>
              <div className="mt-lg flex flex-col gap-[14px]">
                {STEPS.map((step, i) => (
                  <div key={step.title} className="flex gap-md">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-identity-gradient text-[12px] font-bold text-ink-inverse">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-ink-primary">{step.title}</p>
                      <p className="mt-[2px] text-[13px] leading-[1.45] text-ink-secondary">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-border-default bg-surface-inverse p-[22px] text-bg-page">
              <h2 className="text-heading-h3 text-bg-page">Can’t make the show?</h2>
              <p className="mt-sm text-[14px] leading-[1.5] text-bg-page/72">
                List your ticket on the auction. Money is held until the buyer receives a
                verified transfer.
              </p>
              <Button className="mt-lg h-[46px] w-full rounded-[23px] bg-bg-page text-ink-primary hover:bg-bg-page">
                List a ticket
              </Button>
            </div>

            <div className="rounded-[18px] border border-border-default bg-surface-default p-xl">
              <h2 className="text-[16px] font-semibold text-ink-primary">Watchlist</h2>
              <div className="mt-md flex flex-col gap-[11px]">
                {CATALOG_AUCTIONS.slice(0, 3).map((item) => (
                  <Link
                    key={item.title}
                    to={`/auctions/${slugify(item.title)}`}
                    className="flex items-center gap-md"
                  >
                    <div className="size-11 shrink-0 overflow-hidden rounded-[10px]">
                      <img src={item.image} alt="" className="size-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink-primary">
                        {item.title}
                      </p>
                      <p className="text-[12px] text-ink-muted">{item.highestBid}</p>
                    </div>
                    <span className="text-[12px] font-extrabold tabular-nums text-brand-gradient-end">
                      {item.endsIn.slice(0, 5)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </PageSection>
    </>
  )
}
