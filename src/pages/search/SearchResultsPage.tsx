import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FilterChip, StatusBadge } from '@/components/data-display'
import { StarFillIcon } from '@/components/icons'
import {
  Breadcrumbs,
  DetailSectionTab,
  DetailSectionTabs,
} from '@/components/navigation'
import { Button, Checkbox } from '@/components/ui'
import { PageSection } from '@/layouts'
import {
  CatalogBody,
  FilterSidebar,
  ResultsToolbar,
  SEARCH_RESULT_IMAGES,
  slugify,
} from '@/pages/_guest'

const TABS = [
  { label: 'All', count: 7 },
  { label: 'Events', count: 2 },
  { label: 'Talents', count: 1 },
  { label: 'Experiences', count: 1 },
  { label: 'Auctions', count: 1 },
  { label: 'Vendors & organizers', count: 2 },
] as const

const SUGGESTIONS = [
  'Riyadh Season Opening Night',
  'Soundstorm Festival',
  'Boulevard',
] as const

const RESULTS = [
  {
    kind: 'Event',
    flag: 'Selling fast',
    title: 'Winter Nights: Live at King Abdullah Park',
    meta: 'Thu 8 Oct · King Abdullah Park, Riyadh',
    blurb: 'Outdoor production with four acts and family seating on the eastern lawn.',
    price: 'From SAR 180',
    rating: '4.8',
    cta: 'View event',
    to: `/events/${slugify('Winter Nights: Live at King Abdullah Park')}`,
    image: SEARCH_RESULT_IMAGES[0],
    mediaRounded: 'rounded-[12px]',
  },
  {
    kind: 'Talent',
    title: 'Layal Qasim',
    meta: 'Singer · Arabic pop · Riyadh',
    blurb: 'Headline act for Winter Nights with 128 reviews and verified status.',
    price: 'Next show from SAR 180',
    rating: '4.9',
    cta: 'View profile',
    to: `/talents/${slugify('Layal Qasim')}`,
    image: SEARCH_RESULT_IMAGES[1],
    mediaRounded: 'rounded-[59px]',
  },
  {
    kind: 'Event',
    title: 'Soundstorm Festival — Day 1',
    meta: 'Thu 22 Oct · Banban, Riyadh',
    blurb: 'Three-day electronic festival with early-bird and GA passes.',
    price: 'From SAR 450',
    rating: '4.9',
    cta: 'View event',
    to: `/events/${slugify('Soundstorm Festival — Day 1')}`,
    image: SEARCH_RESULT_IMAGES[2],
    mediaRounded: 'rounded-[12px]',
  },
  {
    kind: 'Auction',
    flag: 'Ends soon',
    title: 'Al-Hilal vs Al-Nassr — Saudi Pro League',
    meta: 'Fri 9 Oct · Kingdom Arena',
    blurb: 'Verified resale listing with seats together in the west stand.',
    price: 'Bid SAR 410',
    rating: '14 bids',
    cta: 'Place bid',
    to: `/auctions/${slugify('Al-Hilal vs Al-Nassr')}`,
    image: SEARCH_RESULT_IMAGES[3],
    mediaRounded: 'rounded-[12px]',
  },
  {
    kind: 'Experience',
    title: 'Edge of the World hike and picnic',
    meta: 'Riyadh Region · Half day',
    blurb: 'Guided escarpment hike with sunset picnic and 4x4 transfer.',
    price: 'SAR 250',
    rating: '4.9',
    cta: 'View experience',
    to: `/experiences/${slugify('Edge of the World hike and picnic')}`,
    image: SEARCH_RESULT_IMAGES[4],
    mediaRounded: 'rounded-[12px]',
  },
  {
    kind: 'Organizer',
    title: 'Riyadh Season',
    meta: 'Entertainment season · 84 events',
    blurb: 'The Kingdom’s flagship entertainment calendar across Boulevard and beyond.',
    price: '1.2M followers',
    rating: '4.8',
    cta: 'View organizer',
    to: `/organizers/${slugify('Riyadh Season')}`,
    image: SEARCH_RESULT_IMAGES[5],
    mediaRounded: 'rounded-[12px]',
  },
  {
    kind: 'Vendor',
    title: 'Nova Stage Systems',
    meta: 'Staging · Rigging · Lighting',
    blurb: 'Kingdom-wide production vendor for arenas, festivals and private majlis.',
    price: 'From SAR 9,000',
    rating: '4.9',
    cta: 'View vendor',
    to: `/vendors/${slugify('Nova Stage Systems')}`,
    image: SEARCH_RESULT_IMAGES[6],
    mediaRounded: 'rounded-[12px]',
  },
] as const

const RELATED = [
  'Oud sessions',
  'Comedy in Riyadh',
  'Open-air concerts',
  'Boulevard City',
  'Jeddah nightlife',
  'Family shows',
] as const

/** Search results — Figma `207:5205`. */
export function SearchResultsPage() {
  const [params] = useSearchParams()
  const query = params.get('q') || 'riyadh season'
  const [tab, setTab] = useState('All')
  const [sort, setSort] = useState('Most relevant')

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Search', href: '/search' },
            { label: query },
          ]}
        />
      </PageSection>

      <PageSection padTop={14} padBottom={0}>
        <h1 className="text-heading-h2 text-ink-primary">Results for “{query}”</h1>
        <p className="mt-[6px] text-[15px] text-ink-secondary">
          7 matches across events, talents, experiences and the marketplace.
        </p>
        <div className="mt-xl flex flex-wrap gap-[8px]">
          {SUGGESTIONS.map((s) => (
            <FilterChip key={s} className="h-[32px] rounded-[16px] px-md text-[13px]">
              {s}
            </FilterChip>
          ))}
        </div>
        {/*
          Entity tabs match detail-section metrics (15px / ink-brand / muted), not DS
          `Tab` (14.5px / ink-brand-mid). Count badges are local to this frame.
        */}
        <DetailSectionTabs className="mt-[18px] gap-0 border-border-default" aria-label="Result types">
          {TABS.map((t) => (
            <DetailSectionTab
              key={t.label}
              active={tab === t.label}
              onClick={() => setTab(t.label)}
              className="flex h-[46px] items-center gap-[7px] px-[15px] pb-0"
            >
              {t.label}
              <span className="rounded-[10px] bg-bg-skeleton px-[7px] py-[2px] text-[12px] font-extrabold text-ink-secondary">
                {t.count}
              </span>
            </DetailSectionTab>
          ))}
        </DetailSectionTabs>
      </PageSection>

      <PageSection padTop={24} padBottom={96}>
        <CatalogBody
          filterWidth={244}
          filters={
            <FilterSidebar title="Refine" clearLabel="Reset" width={244}>
              {(
                [
                  {
                    label: 'When',
                    options: [
                      { label: 'Today', count: 1 },
                      { label: 'This week', count: 3 },
                      { label: 'This month', count: 5 },
                      { label: 'Any time' },
                    ],
                  },
                  {
                    label: 'City',
                    options: [
                      { label: 'Riyadh', count: 5 },
                      { label: 'Jeddah', count: 1 },
                      { label: 'AlUla', count: 1 },
                      { label: 'Dammam', count: 0 },
                    ],
                  },
                  {
                    label: 'Ticket price',
                    options: [
                      { label: 'Free', count: 1 },
                      { label: 'Under SAR 200', count: 2 },
                      { label: 'SAR 200–500', count: 3 },
                      { label: 'SAR 500+', count: 1 },
                    ],
                  },
                  {
                    label: 'Good for',
                    options: [
                      { label: 'Families', count: 2 },
                      { label: 'Date night', count: 2 },
                      { label: 'Groups', count: 4 },
                      { label: 'First-timers', count: 3 },
                    ],
                  },
                ] as const
              ).map((group) => (
                <div key={group.label}>
                  <p className="pt-[15px] text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    {group.label}
                  </p>
                  <div className="mt-[11px] flex flex-col gap-[9px]">
                    {group.options.map((opt, i) => (
                      <Checkbox
                        key={opt.label}
                        id={`search-${group.label}-${i}`}
                        label={opt.label}
                        count={'count' in opt ? opt.count : undefined}
                        fullWidth
                        defaultChecked={opt.label === 'Riyadh'}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </FilterSidebar>
          }
        >
          <ResultsToolbar
            countLabel="7 results"
            activeFilter="Riyadh"
            showViewToggle={false}
            trailing={
              <div className="flex items-center gap-[8px]">
                <span className="text-[13px] text-ink-muted">Sort</span>
                {['Most relevant', 'Soonest', 'Price'].map((s) => (
                  <FilterChip
                    key={s}
                    selected={sort === s}
                    onClick={() => setSort(s)}
                    className="h-[32px] rounded-[16px] px-md text-[13px]"
                  >
                    {s}
                  </FilterChip>
                ))}
              </div>
            }
          />

          <div className="mt-lg flex flex-col gap-[12px]">
            {RESULTS.map((result) => (
              <Link
                key={result.title}
                to={result.to}
                className="flex gap-0 overflow-hidden rounded-[18px] border border-border-default bg-surface-default"
              >
                <div
                  className={`m-lg h-[118px] w-[168px] shrink-0 overflow-hidden ${result.mediaRounded}`}
                >
                  <img src={result.image} alt="" className="size-full object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col py-lg pr-lg">
                  <div className="flex items-center gap-[8px]">
                    <StatusBadge tone="neutralOutline">{result.kind}</StatusBadge>
                    {'flag' in result && result.flag && (
                      <span className="text-[12px] font-semibold text-brand-gradient-end">
                        {result.flag}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-[7px] text-[22px] leading-[1.2] font-extrabold tracking-[-0.4px] text-ink-primary">
                    {result.title}
                  </h3>
                  <p className="mt-[5px] text-[14px] text-ink-secondary">{result.meta}</p>
                  <p className="mt-[9px] max-w-[620px] text-[14px] text-ink-secondary">
                    {result.blurb}
                  </p>
                  <div className="mt-[12px] flex items-center justify-between">
                    <div className="flex items-center gap-[14px] text-[13px]">
                      <span className="font-semibold text-ink-primary">{result.price}</span>
                      {result.kind !== 'Auction' ? (
                        <span className="flex items-center gap-[5px] text-ink-primary">
                          <StarFillIcon size={13} />
                          {result.rating}
                        </span>
                      ) : (
                        <span className="text-ink-muted">{result.rating}</span>
                      )}
                    </div>
                    <Button size="sm" variant="secondary">
                      {result.cta}
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-[26px] flex justify-center">
            <Button variant="secondary" className="h-[44px] rounded-[22px] px-[22px]">
              Show more results
            </Button>
          </div>

          <div className="mt-[34px]">
            <p className="text-[14px] font-medium text-ink-secondary">
              People searching this also looked for
            </p>
            <div className="mt-md flex flex-wrap gap-[9px]">
              {RELATED.map((label) => (
                <FilterChip key={label} className="h-[36px] rounded-[18px] text-[13px]">
                  {label}
                </FilterChip>
              ))}
            </div>
          </div>
        </CatalogBody>
      </PageSection>
    </>
  )
}
