import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import { useLiveRemaining } from '@/lib/countdown/useLiveRemaining'

type ListingFilter = 'all' | 'together' | 'buyNow' | 'mine'

type SeatListing = {
  id: string
  seat: string
  meta: string
  badgeKey:
    | 'badgeEndingSoon'
    | 'badgeHighest'
    | 'badgeYourListing'
    | 'badgeOutbid'
    | 'badgeUnderFace'
  badgeTone: StatusTone
  highestBid: string
  bids: number
  buyNow: string | null
  endsIn: string
  urgent?: boolean
  minBid: string
  yours?: boolean
  kind: 'bid' | 'own'
  captionKey?: 'captionNoBids' | 'captionNoBuyNow'
  seatsTogether?: boolean
}

const FILTER_IDS: ListingFilter[] = ['all', 'together', 'buyNow', 'mine']

/** Seat lots under Winter Nights — Figma `207:11616` listing stack. */
const WINTER_NIGHTS_LISTINGS: SeatListing[] = [
  {
    id: 'floor-a-h',
    seat: 'Floor A · Row H · 2 seats together',
    meta: 'Gold · sold by R•••a · face value SAR 560',
    badgeKey: 'badgeEndingSoon',
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
    badgeKey: 'badgeHighest',
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
    badgeKey: 'badgeYourListing',
    badgeTone: 'brandTint',
    highestBid: 'SAR 240',
    bids: 0,
    buyNow: 'SAR 280',
    endsIn: '09:52:40',
    minBid: 'SAR 250',
    yours: true,
    kind: 'own',
    captionKey: 'captionNoBids',
  },
  {
    id: 'floor-a-j',
    seat: 'Floor A · Row J · Seat 3',
    meta: 'Gold · sold by A•••f · face value SAR 280',
    badgeKey: 'badgeOutbid',
    badgeTone: 'dangerTint',
    highestBid: 'SAR 310',
    bids: 9,
    buyNow: null,
    endsIn: '11:04:51',
    minBid: 'SAR 320',
    kind: 'bid',
    captionKey: 'captionNoBuyNow',
  },
  {
    id: 'terrace-under',
    seat: 'Terrace · Free standing',
    meta: 'Silver · sold by N•••h · face value SAR 220',
    badgeKey: 'badgeUnderFace',
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
  const { t } = useTranslation('catalog')
  const remaining = useLiveRemaining(listing.endsIn)
  return (
    <article
      className={cn(
        'flex flex-col gap-[18px] rounded-[18px] border-[1.5px] bg-surface-default px-lg py-[18px] sm:px-[22px] lg:flex-row lg:items-center',
        listing.yours ? 'border-ink-brand' : 'border-border-default',
      )}
    >
      <div className="flex w-full min-w-0 flex-col gap-[3px] lg:w-[336px] lg:shrink-0">
        <div className="flex flex-wrap items-center gap-sm">
          <p className="min-w-0 text-[15.5px] font-bold text-ink-primary">{listing.seat}</p>
          <StatusBadge
            tone={listing.badgeTone}
            className={cn(
              'shrink-0 px-[9px] py-[3px] text-[11.5px]',
              listing.badgeTone === 'neutralOutline' && 'border-transparent',
            )}
          >
            {t(`pages.${listing.badgeKey}`)}
          </StatusBadge>
        </div>
        <p className="text-[13px] text-ink-muted">{listing.meta}</p>
      </div>

      <div className="grid w-full grid-cols-2 gap-lg sm:grid-cols-3 lg:contents">
        <div className="flex w-full flex-col leading-normal lg:w-[216px] lg:shrink-0">
          <p className="text-[12px] text-ink-muted">{t('pages.highestBid')}</p>
          <PriceDisplay context="amount" className="text-[19px] font-bold">
            {listing.highestBid}
          </PriceDisplay>
          <p className="text-[12px] text-ink-muted">{t('pages.bids', { count: listing.bids })}</p>
        </div>

        <div className="flex w-full flex-col leading-normal lg:w-[216px] lg:shrink-0">
          <p className="text-[12px] text-ink-muted">{t('pages.buyNow')}</p>
          <PriceDisplay context="row" className="text-[16px] font-bold text-ink-secondary">
            {listing.buyNow ?? '—'}
          </PriceDisplay>
        </div>

        <div className="flex w-full flex-col leading-normal lg:w-[216px] lg:shrink-0">
          <p className="text-[12px] text-ink-muted">{t('pages.endsIn').trimEnd()}</p>
          <Countdown
            urgent={listing.urgent}
            className={cn(
              'text-[16px] font-extrabold',
              listing.urgent ? 'text-brand-gradient-end' : 'text-ink-secondary',
            )}
          >
            {remaining}
          </Countdown>
        </div>
      </div>

      <div
        className={cn(
          'flex w-full shrink-0 flex-col items-stretch lg:w-[220px]',
          listing.kind === 'own' ? 'gap-sm' : 'gap-lg',
        )}
      >
        {listing.kind === 'own' ? (
          <>
            <Button
              variant="destructive"
              className="h-[40px] w-full rounded-[20px] font-bold"
              disabled
              title={t('pages.cancelFromActivity')}
            >
              {t('pages.cancelListing')}
            </Button>
            {listing.captionKey && (
              <p className="text-center text-[12px] text-ink-muted">
                {t(`pages.${listing.captionKey}`)}
              </p>
            )}
          </>
        ) : (
          <>
            <Button
              className="h-[40px] w-full rounded-[20px] text-[13.5px] font-bold"
              disabled
              title={t('pages.biddingSignIn')}
            >
              {t('pages.bidMin', { amount: listing.minBid })}
            </Button>
            {listing.buyNow ? (
              <Button
                variant="secondary"
                size="sm"
                disabled
                title={t('pages.buyNowSignIn')}
                className="h-[36px] w-full rounded-[18px] border bg-bg-page text-[13px] disabled:cursor-default disabled:opacity-100"
              >
                {t('pages.buyNowPrice', { amount: listing.buyNow })}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                disabled
                className="h-[36px] w-full rounded-[18px] border bg-bg-page text-[13px] disabled:cursor-default disabled:opacity-100"
              >
                {t('pages.noBuyNow')}
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
  const { t } = useTranslation('catalog')
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
    ending: t('pages.sortEnding'),
    'price-low': t('pages.sortPriceLow'),
    'price-high': t('pages.sortPriceHigh'),
    bids: t('pages.sortMostBids'),
  } as const

  const cycleSort = () => {
    const keys = Object.keys(sortLabels) as (keyof typeof sortLabels)[]
    const idx = keys.indexOf(sortMode)
    setSortMode(keys[(idx + 1) % keys.length]!)
  }

  const filterLabel = (id: ListingFilter) => {
    if (id === 'all') return t('pages.allListings', { count: WINTER_NIGHTS_LISTINGS.length })
    if (id === 'together') return t('pages.seatsTogether')
    if (id === 'buyNow') return t('pages.hasBuyNow')
    return t('pages.mine')
  }

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: t('pages.crumbHome'), href: '/' },
            { label: t('pages.crumbAuction'), href: '/auctions' },
            { label: crumb },
          ]}
        />
      </PageSection>

      <PageSection padTop={18} padBottom={0}>
        <div className="flex flex-col items-stretch gap-3xl rounded-[22px] border border-border-default bg-surface-default p-lg sm:p-[22px] md:flex-row md:items-center">
          <div className="h-[180px] w-full shrink-0 overflow-hidden rounded-[14px] md:h-[131px] md:w-[210px]">
            <img src={cover} alt="" className="size-full object-cover" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <div className="flex flex-wrap items-center gap-[10px]">
              <StatusBadge tone="terminal">{t('pages.soldOut')}</StatusBadge>
              <StatusBadge tone="brandTint">
                {t('pages.waitlistCount', { count: 312 })}
              </StatusBadge>
            </div>
            <div className="h-[6px] w-px" aria-hidden />
            <h1 className="text-[26px] leading-[1.05] font-extrabold tracking-[-1.02px] text-ink-primary sm:text-[34px]">
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
                  {t('pages.viewTheEvent')}
                  <ArrowRightIcon size={15} className="rtl:rotate-180" />
                </Link>
              </p>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col items-start border-t border-border-divider pt-lg md:w-auto md:items-end md:border-t-0 md:border-s md:pt-0 md:ps-3xl">
            <p className="text-[13px] text-ink-muted">
              {t('pages.listingsFrom', { count: WINTER_NIGHTS_LISTINGS.length })}
            </p>
            <div className="h-[2px] w-px" aria-hidden />
            <PriceDisplay
              context="stat"
              className="text-[30px] tracking-[-0.6px] text-ink-primary"
            >
              SAR 236
            </PriceDisplay>
            <p className="text-[12.5px] text-ink-muted">
              {t('pages.faceValueRange', { range: 'SAR 220–560' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-[10px] px-xs pt-lg text-[13px]">
          <InfoIcon size={14} className="shrink-0 text-ink-brand" weight="fill" />
          <p className="min-w-0 flex-1 text-ink-secondary">{t('pages.escrowNote')}</p>
        </div>
      </PageSection>

      <PageSection padTop={22} padBottom={96}>
        <div className="flex flex-col items-stretch gap-lg sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-[10px]">
            {FILTER_IDS.map((id) => (
              <FilterChip
                key={id}
                selected={filter === id}
                onClick={() => setFilter(id)}
                className="h-[36px] rounded-[18px] px-[15px] text-[13.5px] font-semibold"
              >
                {filterLabel(id)}
              </FilterChip>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-sm">
            <span className="text-[13.5px] text-ink-secondary">{t('filters.sort')}</span>
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
            {t('pages.yoursNoteBefore')}{' '}
            <Link
              to="/my-auction-activity"
              className="font-semibold text-ink-brand hover:underline"
            >
              {t('pages.yoursNoteLink')}
            </Link>
            .
          </p>
        </div>
      </PageSection>
    </>
  )
}
