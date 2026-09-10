import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Countdown,
  FilterChip,
  PriceDisplay,
  StatusBadge,
  type StatusTone,
} from '@/components/data-display'
import { ArrowRightIcon, ChevronDownIcon, InfoIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/navigation'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'
import {
  AUCTION_EVENT_COVER,
  CATALOG_AUCTIONS,
  slugify,
} from '@/pages/_guest'

type ListingFilter = 'all' | 'together' | 'buyNow' | 'mine'

type SeatListing = {
  id: string
  seat: string
  meta: string
  badge: string
  badgeTone: StatusTone
  highestBid: string
  bids: number
  buyNow: string | null
  endsIn: string
  urgent?: boolean
  minBid: string
  yours?: boolean
  kind: 'bid' | 'own'
  caption?: string
  seatsTogether?: boolean
}

const FILTERS: { id: ListingFilter; label: string }[] = [
  { id: 'all', label: 'All 5 listings' },
  { id: 'together', label: 'Seats together' },
  { id: 'buyNow', label: 'Has buy now' },
  { id: 'mine', label: 'Mine' },
]

/** Seat lots under Winter Nights — Figma `207:11616` listing stack. */
const WINTER_NIGHTS_LISTINGS: SeatListing[] = [
  {
    id: 'floor-a-h',
    seat: 'Floor A · Row H · 2 seats together',
    meta: 'Gold · sold by R•••a · face value SAR 560',
    badge: 'Ending soon',
    badgeTone: 'urgentSolid',
    highestBid: 'SAR 620',
    bids: 12,
    buyNow: 'SAR 720',
    endsIn: '00:41:22',
    urgent: true,
    minBid: 'SAR 630',
    kind: 'bid',
    seatsTogether: true,
  },
  {
    id: 'floor-b-c',
    seat: 'Floor B · Row C · Seat 14',
    meta: 'Gold · sold by M•••d · face value SAR 280',
    badge: "You're highest",
    badgeTone: 'successTint',
    highestBid: 'SAR 300',
    bids: 7,
    buyNow: 'SAR 340',
    endsIn: '03:18:09',
    minBid: 'SAR 310',
    yours: true,
    kind: 'bid',
  },
  {
    id: 'terrace-own',
    seat: 'Terrace · Free standing',
    meta: 'Silver · sold by you · face value SAR 220',
    badge: 'Your listing',
    badgeTone: 'brandTint',
    highestBid: 'SAR 240',
    bids: 0,
    buyNow: 'SAR 280',
    endsIn: '09:52:40',
    minBid: 'SAR 250',
    yours: true,
    kind: 'own',
    caption: 'No bids yet — free to cancel',
  },
  {
    id: 'floor-a-j',
    seat: 'Floor A · Row J · Seat 3',
    meta: 'Gold · sold by A•••f · face value SAR 280',
    badge: 'Outbid you',
    badgeTone: 'dangerTint',
    highestBid: 'SAR 310',
    bids: 9,
    buyNow: null,
    endsIn: '11:04:51',
    minBid: 'SAR 320',
    kind: 'bid',
    caption: 'No buy-now price',
  },
  {
    id: 'terrace-under',
    seat: 'Terrace · Free standing',
    meta: 'Silver · sold by N•••h · face value SAR 220',
    badge: 'Under face +10%',
    badgeTone: 'neutralOutline',
    highestBid: 'SAR 236',
    bids: 3,
    buyNow: 'SAR 260',
    endsIn: '1d 02:11',
    minBid: 'SAR 246',
    kind: 'bid',
  },
]

function breadcrumbLabel(title: string) {
  return title.includes(':') ? title.split(':')[0]!.trim() : title
}

function ListingRow({ listing }: { listing: SeatListing }) {
  return (
    <article
      className={cn(
        'flex items-center gap-[18px] rounded-[18px] border-[1.5px] bg-surface-default px-[22px] py-[18px]',
        listing.yours ? 'border-ink-brand' : 'border-border-default',
      )}
    >
      <div className="flex w-[336px] shrink-0 flex-col gap-[3px]">
        <div className="flex items-center gap-sm">
          <p className="min-w-0 text-[15.5px] font-bold text-ink-primary">{listing.seat}</p>
          <StatusBadge
            tone={listing.badgeTone}
            className={cn(
              'shrink-0 px-[9px] py-[3px] text-[11.5px]',
              listing.badgeTone === 'neutralOutline' && 'border-transparent',
            )}
          >
            {listing.badge}
          </StatusBadge>
        </div>
        <p className="text-[13px] text-ink-muted">{listing.meta}</p>
      </div>

      <div className="flex w-[216px] shrink-0 flex-col leading-normal">
        <p className="text-[12px] text-ink-muted">Highest bid</p>
        <PriceDisplay context="amount" className="text-[19px] font-bold">
          {listing.highestBid}
        </PriceDisplay>
        <p className="text-[12px] text-ink-muted">{listing.bids} bids</p>
      </div>

      <div className="flex w-[216px] shrink-0 flex-col leading-normal">
        <p className="text-[12px] text-ink-muted">Buy now</p>
        <PriceDisplay context="row" className="text-[16px] font-bold text-ink-secondary">
          {listing.buyNow ?? '—'}
        </PriceDisplay>
      </div>

      <div className="flex w-[216px] shrink-0 flex-col leading-normal">
        <p className="text-[12px] text-ink-muted">Ends in</p>
        <Countdown
          urgent={listing.urgent}
          className={cn(
            'text-[16px] font-extrabold',
            listing.urgent ? 'text-brand-gradient-end' : 'text-ink-secondary',
          )}
        >
          {listing.endsIn}
        </Countdown>
      </div>

      <div
        className={cn(
          'flex w-[220px] shrink-0 flex-col items-stretch',
          listing.kind === 'own' ? 'gap-sm' : 'gap-lg',
        )}
      >
        {listing.kind === 'own' ? (
          <>
            <Button
              variant="destructive"
              className="h-[40px] w-full rounded-[20px] font-bold"
              disabled
              title="Cancel from My auction activity"
            >
              Cancel listing
            </Button>
            {listing.caption && (
              <p className="text-center text-[12px] text-ink-muted">{listing.caption}</p>
            )}
          </>
        ) : (
          <>
            <Button
              className="h-[40px] w-full rounded-[20px] text-[13.5px] font-bold"
              disabled
              title="Bidding opens when you sign in"
            >
              Bid · min {listing.minBid}
            </Button>
            {listing.buyNow ? (
              <Button
                variant="secondary"
                size="sm"
                disabled
                title="Buy now opens when you sign in"
                className="h-[36px] w-full rounded-[18px] border bg-bg-page text-[13px] disabled:cursor-default disabled:opacity-100"
              >
                Buy now · {listing.buyNow}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                disabled
                className="h-[36px] w-full rounded-[18px] border bg-bg-page text-[13px] disabled:cursor-default disabled:opacity-100"
              >
                No buy-now price
              </Button>
            )}
          </>
        )}
      </div>
    </article>
  )
}

/** Auction event detail — Figma `207:11616` (summary card + listing rows). */
export function AuctionEventPage() {
  const { slug } = useParams()
  const [filter, setFilter] = useState<ListingFilter>('all')
  const [sortMode, setSortMode] = useState<'ending' | 'price-low' | 'price-high' | 'bids'>(
    'ending',
  )

  const event =
    CATALOG_AUCTIONS.find((a) => slugify(a.title) === slug) ?? CATALOG_AUCTIONS[0]

  const isWinterNights = event.title.startsWith('Winter Nights')
  const cover = isWinterNights ? AUCTION_EVENT_COVER : (event.image ?? AUCTION_EVENT_COVER)
  const crumb = breadcrumbLabel(event.title)

  const listings = useMemo(() => {
    const source = isWinterNights
      ? WINTER_NIGHTS_LISTINGS
      : WINTER_NIGHTS_LISTINGS.map((row, i) => ({
          ...row,
          id: `${slugify(event.title)}-${i}`,
          // Keep the drawn lot shapes; retarget copy lightly for non-Winter events.
          meta: row.meta.replace(/Gold|Silver/, event.category === 'SPORTS' ? 'Stand' : 'Tier'),
        }))

    const filtered = source.filter((row) => {
      if (filter === 'together') return Boolean(row.seatsTogether)
      if (filter === 'buyNow') return row.buyNow != null
      if (filter === 'mine') return Boolean(row.yours)
      return true
    })

    const parseSar = (value: string) => Number.parseFloat(value.replace(/[^\d.]/g, '')) || 0
    const endsSeconds = (endsIn: string) => {
      if (endsIn.includes('d')) {
        const days = Number.parseInt(endsIn, 10) || 0
        return days * 86400
      }
      const [h = '0', m = '0', s = '0'] = endsIn.split(':')
      return Number(h) * 3600 + Number(m) * 60 + Number(s)
    }

    return [...filtered].sort((a, b) => {
      if (sortMode === 'price-low') return parseSar(a.highestBid) - parseSar(b.highestBid)
      if (sortMode === 'price-high') return parseSar(b.highestBid) - parseSar(a.highestBid)
      if (sortMode === 'bids') return b.bids - a.bids
      return endsSeconds(a.endsIn) - endsSeconds(b.endsIn)
    })
  }, [event.category, event.title, filter, isWinterNights, sortMode])

  const sortLabels = {
    ending: 'Ending soonest',
    'price-low': 'Price — low to high',
    'price-high': 'Price — high to low',
    bids: 'Most bids',
  } as const

  const cycleSort = () => {
    const keys = Object.keys(sortLabels) as (keyof typeof sortLabels)[]
    const idx = keys.indexOf(sortMode)
    setSortMode(keys[(idx + 1) % keys.length]!)
  }

  const filterLabels = FILTERS.map((f) =>
    f.id === 'all' ? { ...f, label: `All ${WINTER_NIGHTS_LISTINGS.length} listings` } : f,
  )

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Auction', href: '/auctions' },
            { label: crumb },
          ]}
        />
      </PageSection>

      <PageSection padTop={18} padBottom={0}>
        <div className="flex items-center gap-3xl rounded-[22px] border border-border-default bg-surface-default p-[22px]">
          <div className="h-[131px] w-[210px] shrink-0 overflow-hidden rounded-[14px]">
            <img src={cover} alt="" className="size-full object-cover" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <div className="flex items-center gap-[10px]">
              <StatusBadge tone="terminal">Sold out</StatusBadge>
              <StatusBadge tone="brandTint">312 on the waitlist</StatusBadge>
            </div>
            <div className="h-[6px] w-px" aria-hidden />
            <h1 className="text-[34px] leading-[1.05] font-extrabold tracking-[-1.02px] text-ink-primary">
              {event.title}
            </h1>
            <div className="h-[6px] w-px" aria-hidden />
            <div className="flex items-center gap-[5px] text-[15px] text-ink-secondary">
              <p>
                {isWinterNights
                  ? 'Thu 8 Oct 2026 · 20:00 · King Abdullah Park, Riyadh'
                  : event.meta}{' '}
                ·{' '}
                <Link
                  to={
                    isWinterNights
                      ? '/events/winter-nights-live-at-king-abdullah-park'
                      : `/events/${slugify(event.title)}`
                  }
                  className="inline-flex items-center gap-[5px] text-ink-secondary hover:text-ink-brand"
                >
                  View the event
                  <ArrowRightIcon size={15} />
                </Link>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end border-l border-border-divider pl-3xl">
            <p className="text-[13px] text-ink-muted">
              {WINTER_NIGHTS_LISTINGS.length} listings · from
            </p>
            <div className="h-[2px] w-px" aria-hidden />
            <PriceDisplay
              context="stat"
              className="text-[30px] tracking-[-0.6px] text-ink-primary"
            >
              SAR 236
            </PriceDisplay>
            <p className="text-[12.5px] text-ink-muted">face value SAR 220–560</p>
          </div>
        </div>

        <div className="flex items-center gap-[10px] px-xs pt-lg text-[13px]">
          <InfoIcon size={14} className="shrink-0 text-ink-brand" weight="fill" />
          <p className="min-w-0 flex-1 text-ink-secondary">
            Every listing is a real ticket resold by its owner and transferred through
            MyTicket. Your money is held until the ticket is in your account. MyTicket
            takes 10% from the seller — buyers pay only the platform fee.
          </p>
        </div>
      </PageSection>

      <PageSection padTop={22} padBottom={96}>
        <div className="flex items-center justify-between gap-lg">
          <div className="flex flex-wrap items-center gap-[10px]">
            {filterLabels.map((item) => (
              <FilterChip
                key={item.id}
                selected={filter === item.id}
                onClick={() => setFilter(item.id)}
                className="h-[36px] rounded-[18px] px-[15px] text-[13.5px] font-semibold"
              >
                {item.label}
              </FilterChip>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-sm">
            <span className="text-[13.5px] text-ink-secondary">Sort</span>
            <button
              type="button"
              onClick={cycleSort}
              className="flex h-[36px] items-center gap-sm rounded-[10px] border border-border-default bg-surface-default px-[10px] text-[13.5px] text-ink-primary hover:border-border-brand"
            >
              {sortLabels[sortMode]}
              <ChevronDownIcon size={12} />
            </button>
          </div>
        </div>

        <div className="mt-[14px] flex flex-col gap-md">
          {listings.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </div>

        <div className="flex items-center gap-md px-xs pt-[18px]">
          <span className="size-[10px] shrink-0 rounded-[5px] bg-ink-brand" aria-hidden />
          <p className="min-w-0 flex-1 text-[13px] text-ink-secondary">
            Orange-bordered rows are yours — your bid on Floor B · Row C leads, and your
            Terrace listing has no bids yet so it can still be cancelled from{' '}
            <Link
              to="/my-auction-activity"
              className="font-semibold text-ink-brand hover:underline"
            >
              your auction activity
            </Link>
            .
          </p>
        </div>
      </PageSection>
    </>
  )
}
