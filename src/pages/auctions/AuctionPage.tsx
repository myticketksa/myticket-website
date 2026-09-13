import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { StatCard } from '@/components/cards'
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
import { LiveRemaining } from '@/lib/countdown/LiveRemaining'
import { catalogLabel } from '@/lib/i18n/catalogLabels'

const FILTERS = ['Ending soon', 'Under face value', 'Seats together', 'My watchlist'] as const

const KPIS = [
  { labelKey: 'pages.kpiLiveListings', value: '214', noteKey: 'pages.kpiLiveNote' },
  { labelKey: 'pages.kpiEndingHour', value: '9', noteKey: 'pages.kpiEndingNote' },
  { labelKey: 'pages.kpiAvgSaving', value: '18%', noteKey: 'pages.kpiAvgNote' },
  { labelKey: 'pages.kpiTransfers', value: '12.4k', noteKey: 'pages.kpiTransfersNote' },
] as const

const STEPS = [
  { titleKey: 'pages.stepFindTitle', bodyKey: 'pages.stepFindBody' },
  { titleKey: 'pages.stepBidTitle', bodyKey: 'pages.stepBidBody' },
  { titleKey: 'pages.stepWinTitle', bodyKey: 'pages.stepWinBody' },
  { titleKey: 'pages.stepGoTitle', bodyKey: 'pages.stepGoBody' },
] as const

/** Auction hub — Figma `207:10792`. */
export function AuctionPage() {
  const { t } = useTranslation(['catalog', 'nav'])
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Ending soon')

  const listings = useMemo(() => {
    if (filter === 'Seats together') {
      return CATALOG_AUCTIONS.filter((l) => /seats|together|–|-/i.test(l.seatInfo))
    }
    if (filter === 'My watchlist') {
      return CATALOG_AUCTIONS.slice(0, 3)
    }
    if (filter === 'Under face value') {
      return CATALOG_AUCTIONS.filter((l) => {
        const bid = Number(l.highestBid.replace(/[^\d]/g, ''))
        const face = Number(l.faceValue.replace(/[^\d]/g, ''))
        return bid > 0 && face > 0 && bid < face
      })
    }
    return CATALOG_AUCTIONS
  }, [filter])

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: t('nav:main'), href: '/' },
            { label: t('nav:auctions'), href: '/auctions' },
          ]}
        />
      </PageSection>

      <PageSection padTop={14} padBottom={0}>
        <CatalogPageHead
          eyebrow={t('pages.auctionEyebrow')}
          title={t('pages.auctionTitle')}
          subtitle={t('pages.auctionSubtitle')}
          actions={
            <Button size="lg" className="shrink-0" disabled title={t('pages.listFromTickets')}>
              {t('pages.listTicketSale')}
            </Button>
          }
        />
      </PageSection>

      <PageSection padTop={26} padBottom={0}>
        <div className="grid grid-cols-2 gap-lg lg:grid-cols-4">
          {KPIS.map((kpi) => (
            <StatCard key={kpi.labelKey} label={t(kpi.labelKey)} caption={t(kpi.noteKey)}>
              <p className="text-[24px] font-extrabold tracking-[-0.8px] text-ink-primary tabular-nums sm:text-[32px]">
                {kpi.value}
              </p>
            </StatCard>
          ))}
        </div>
      </PageSection>

      <PageSection padTop={30} padBottom={96}>
        <div className="flex flex-col items-start gap-[32px] lg:flex-row">
          <div className="min-w-0 w-full flex-1">
            <div className="flex flex-wrap items-center justify-between gap-lg">
              <div className="flex flex-wrap gap-[7px]">
                {FILTERS.map((label) => (
                  <FilterChip
                    key={label}
                    selected={filter === label}
                    onClick={() => setFilter(label)}
                    className="h-[36px] rounded-[18px]"
                  >
                    {catalogLabel(t, label)}
                  </FilterChip>
                ))}
              </div>
              <ResultsToolbar
                countLabel={t('results.countAuctions', { count: listings.length })}
                showViewToggle={false}
                sortValue={t('results.sortEndingSoon')}
                sortLabel={t('results.sort')}
                className="w-auto shrink-0"
              />
            </div>

            <div className="mt-lg flex flex-col gap-[14px]">
              {listings.map((listing) => (
                <Link
                  key={listing.title}
                  to={`/auctions/${slugify(listing.title)}`}
                  className="overflow-hidden rounded-[18px] border border-border-default bg-surface-default"
                >
                  <div className="flex flex-col gap-0 p-lg sm:flex-row">
                    <div className="relative h-[160px] w-full shrink-0 overflow-hidden rounded-[12px] sm:h-[116px] sm:w-[148px]">
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
                        {catalogLabel(t, listing.category)}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col px-0 pt-md sm:px-[18px] sm:pt-0">
                      <div className="flex flex-wrap items-center gap-[8px]">
                        <p className="text-[12px] font-extrabold tabular-nums text-brand-gradient-end">
                          <LiveRemaining initial={listing.endsIn} prefix={t('pages.endsIn')} />
                        </p>
                        {listing.tag && (
                          <StatusBadge tone="brandTint">{catalogLabel(t, listing.tag)}</StatusBadge>
                        )}
                      </div>
                      <h3 className="mt-[5px] text-[18px] font-semibold text-ink-primary">
                        {listing.title}
                      </h3>
                      <p className="mt-[5px] text-[14px] text-ink-secondary">{listing.meta}</p>
                      <p className="mt-[5px] text-[13px] text-ink-muted">{listing.seatInfo}</p>
                      <div className="mt-auto flex flex-wrap items-center gap-[14px] pt-md text-[13px] text-ink-secondary">
                        <span className="flex items-center gap-[6px]">
                          <span className="flex size-5 items-center justify-center rounded-full bg-identity-gradient text-[10px] font-bold text-ink-inverse">
                            {listing.seller.slice(0, 1)}
                          </span>
                          {listing.seller}
                        </span>
                        <span>{t('pages.bids', { count: listing.bids })}</span>
                        <span>{t('pages.watching', { count: listing.watching })}</span>
                      </div>
                    </div>
                    <div className="flex w-full shrink-0 flex-col border-t border-border-divider pt-md sm:w-[232px] sm:border-t-0 sm:border-l sm:pt-0 sm:pl-[18px]">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[13px] text-ink-muted">{t('pages.highestBid')}</span>
                        <span className="text-[22px] font-extrabold tabular-nums text-brand-identity-end">
                          {listing.highestBid}
                        </span>
                      </div>
                      <div className="mt-sm flex items-baseline justify-between">
                        <span className="text-[13px] text-ink-muted">{t('pages.buyNow')}</span>
                        <span className="text-[15px] font-bold tabular-nums text-ink-primary">
                          {listing.buyNow}
                        </span>
                      </div>
                      <p className="mt-sm text-[12px] text-ink-muted">
                        {t('pages.faceValue', { value: listing.faceValue })}
                      </p>
                      <div className="mt-auto flex flex-col gap-sm pt-md">
                        <Button className="pointer-events-none h-[40px] rounded-[20px]">
                          {t('pages.placeBid')}
                        </Button>
                        <Button
                          variant="secondary"
                          className="pointer-events-none h-[40px] rounded-[20px]"
                        >
                          {t('pages.buyNow')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-[14px] lg:w-[396px]">
            <div className="rounded-[18px] border border-border-default bg-surface-default p-xl">
              <h2 className="text-[18px] font-semibold text-ink-primary">
                {t('pages.howAuctionWorks')}
              </h2>
              <p className="mt-xs text-[14px] leading-[1.45] text-ink-secondary">
                {t('pages.howAuctionLede')}
              </p>
              <div className="mt-lg flex flex-col gap-[14px]">
                {STEPS.map((step, i) => (
                  <div key={step.titleKey} className="flex gap-md">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-identity-gradient text-[12px] font-bold text-ink-inverse">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-ink-primary">{t(step.titleKey)}</p>
                      <p className="mt-[2px] text-[13px] leading-[1.45] text-ink-secondary">
                        {t(step.bodyKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-border-default bg-surface-inverse p-[22px] text-bg-page">
              <h2 className="text-heading-h3 text-bg-page">{t('pages.cantMakeShow')}</h2>
              <p className="mt-sm text-[14px] leading-[1.5] text-bg-page/72">
                {t('pages.cantMakeBody')}
              </p>
              <Button
                className="mt-lg h-[46px] w-full rounded-[23px] bg-bg-page text-ink-primary hover:bg-bg-page"
                disabled
                title={t('pages.listFromTickets')}
              >
                {t('pages.listTicket')}
              </Button>
            </div>

            <div className="rounded-[18px] border border-border-default bg-surface-default p-xl">
              <h2 className="text-[16px] font-semibold text-ink-primary">{t('pages.watchlist')}</h2>
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
                      <LiveRemaining initial={item.endsIn} />
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
