import { useId, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useGetEventsQuery } from '@/app/api/eventsApi'
import { useGetExperiencesQuery } from '@/app/api/experiencesApi'
import { useGetTalentsQuery } from '@/app/api/talentsApi'
import { FilterChip, StatusBadge } from '@/components/data-display'
import { StarFillIcon } from '@/components/icons'
import {
  Breadcrumbs,
  DetailSectionTab,
  DetailSectionTabs,
} from '@/components/navigation'
import { Button, Checkbox } from '@/components/ui'
import { PageSection } from '@/layouts'
import { mapApiEventToCard } from '@/lib/api/mappers/events'
import { mapApiExperienceToCard } from '@/lib/api/mappers/experiences'
import { mapApiTalentToCard } from '@/lib/api/mappers/talents'
import {
  CatalogBody,
  FilterSidebar,
  ResultsToolbar,
  SEARCH_RESULT_IMAGES,
  slugify,
} from '@/pages/_guest'

type SearchResultKind = 'Event' | 'Talent' | 'Experience' | 'Auction'

type SearchResult = {
  kind: SearchResultKind
  title: string
  meta: string
  blurb: string
  price: string
  rating: string
  cta: string
  to: string
  image: string
  mediaRounded: string
  flag?: string
}

const TABS = [
  { label: 'All', kinds: null },
  { label: 'Events', kinds: ['Event'] as const },
  { label: 'Talents', kinds: ['Talent'] as const },
  { label: 'Experiences', kinds: ['Experience'] as const },
  { label: 'Auctions', kinds: ['Auction'] as const },
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
] as const

const RELATED = [
  'Oud sessions',
  'Comedy in Riyadh',
  'Open-air concerts',
  'Boulevard City',
  'Jeddah nightlife',
  'Family shows',
] as const

const CITY_OPTIONS = [
  { label: 'Riyadh', count: 5 },
  { label: 'Jeddah', count: 1 },
  { label: 'AlUla', count: 1 },
  { label: 'Dammam', count: 0 },
] as const

function parsePrice(price: string): number {
  const n = Number.parseFloat(price.replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY
}

const AUCTION_RESULTS: SearchResult[] = RESULTS.filter((r) => r.kind === 'Auction').map((r) => ({
  ...r,
}))

function matchesQuery(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query.toLowerCase())
}

function buildApiResults(
  query: string,
  apiEvents: Record<string, unknown>[] | undefined,
  apiTalents: Record<string, unknown>[] | undefined,
  apiExperiences: Record<string, unknown>[] | undefined,
): SearchResult[] {
  const items: SearchResult[] = []
  let imageIdx = 0
  const nextImage = () => SEARCH_RESULT_IMAGES[imageIdx++ % SEARCH_RESULT_IMAGES.length]

  if (apiEvents?.length) {
    for (const event of apiEvents) {
      const mapped = mapApiEventToCard(event)
      const meta = [mapped.date, mapped.venue].filter(Boolean).join(' · ')
      const haystack = `${mapped.title} ${meta} ${mapped.category ?? ''} ${mapped.venue}`
      if (!matchesQuery(haystack, query)) continue

      items.push({
        kind: 'Event',
        flag: mapped.flag,
        title: mapped.title,
        meta,
        blurb: mapped.attendance || mapped.category || 'Event on MyTicket.',
        price: mapped.price.toLowerCase().startsWith('from') ? mapped.price : `From ${mapped.price}`,
        rating: mapped.rating,
        cta: 'View event',
        to: `/events/${mapped.slug}`,
        image: mapped.image ?? nextImage(),
        mediaRounded: 'rounded-[12px]',
      })
    }
  }

  if (apiTalents?.length) {
    for (const talent of apiTalents) {
      const mapped = mapApiTalentToCard(talent)
      const meta =
        mapped.meta ||
        [mapped.discipline, mapped.city].filter(Boolean).join(' · ')
      const haystack = `${mapped.name} ${meta} ${mapped.discipline} ${mapped.city}`
      if (!matchesQuery(haystack, query)) continue

      const price =
        mapped.nextShow?.detail?.includes('from')
          ? mapped.nextShow.detail.split('·').pop()?.trim() ?? `Next show from ${mapped.nextShow.detail}`
          : mapped.nextShow
            ? `Next show · ${mapped.nextShow.headline}`
            : 'View upcoming shows'

      items.push({
        kind: 'Talent',
        title: mapped.name,
        meta,
        blurb:
          mapped.reviews && mapped.city
            ? `${mapped.reviews} reviews · ${mapped.verified ? 'verified' : mapped.city}`
            : mapped.meta || 'Performer on MyTicket.',
        price: price.startsWith('from') || price.startsWith('Next') ? price : `Next show ${price}`,
        rating: mapped.rating,
        cta: 'View profile',
        to: `/talents/${mapped.slug}`,
        image: mapped.image ?? nextImage(),
        mediaRounded: 'rounded-[59px]',
      })
    }
  }

  if (apiExperiences?.length) {
    for (const experience of apiExperiences) {
      const mapped = mapApiExperienceToCard(experience)
      const meta = mapped.meta || [mapped.location, mapped.place].filter(Boolean).join(' · ')
      const haystack = `${mapped.title} ${meta} ${mapped.summary ?? ''} ${mapped.location}`
      if (!matchesQuery(haystack, query)) continue

      items.push({
        kind: 'Experience',
        flag: mapped.flag,
        title: mapped.title,
        meta,
        blurb: mapped.summary || mapped.guests || 'Guided experience on MyTicket.',
        price: mapped.price ?? 'SAR —',
        rating: (mapped.rating ?? '—').split(' ')[0] ?? '—',
        cta: 'View experience',
        to: `/experiences/${mapped.slug}`,
        image: mapped.image ?? nextImage(),
        mediaRounded: 'rounded-[12px]',
      })
    }
  }

  return items
}

/** Search results — Figma `207:5205`. */
export function SearchResultsPage() {
  const baseId = useId()
  const [params] = useSearchParams()
  const query = params.get('q') || 'riyadh season'
  const [tab, setTab] = useState<(typeof TABS)[number]['label']>('All')
  const [sort, setSort] = useState('Most relevant')
  const [cities, setCities] = useState<string[]>(['Riyadh'])

  const { data: apiEvents, isError: eventsError } = useGetEventsQuery({ search: query })
  const { data: apiTalents, isError: talentsError } = useGetTalentsQuery()
  const { data: apiExperiences, isError: experiencesError } = useGetExperiencesQuery()

  const toggleCity = (label: string) => {
    setCities((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label],
    )
  }

  const results = useMemo((): SearchResult[] => {
    const hasApiData =
      (apiEvents && apiEvents.length > 0) ||
      (apiTalents && apiTalents.length > 0) ||
      (apiExperiences && apiExperiences.length > 0)
    const allErrored = eventsError && talentsError && experiencesError

    if (!hasApiData || allErrored) {
      return RESULTS.map((r) => ({ ...r }))
    }

    const apiItems = buildApiResults(query, apiEvents, apiTalents, apiExperiences)
    return [...apiItems, ...AUCTION_RESULTS]
  }, [apiEvents, apiTalents, apiExperiences, eventsError, talentsError, experiencesError, query])

  const activeTab = TABS.find((t) => t.label === tab) ?? TABS[0]
  const filtered = useMemo(() => {
    let list = !activeTab.kinds
      ? [...results]
      : results.filter((r) => (activeTab.kinds as readonly string[]).includes(r.kind))

    if (cities.length > 0) {
      list = list.filter((r) => {
        const hay = `${r.meta} ${r.title} ${r.blurb}`.toLowerCase()
        return cities.some((c) => hay.includes(c.toLowerCase()))
      })
    }

    if (sort === 'Price') {
      list = [...list].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
    } else if (sort === 'Soonest') {
      // Fixture order already approximates soonest within the set.
      list = [...list]
    }

    return list
  }, [activeTab, cities, sort, results])

  const tabCounts = useMemo(() => {
    return TABS.map((t) => ({
      ...t,
      count: t.kinds
        ? results.filter((r) => (t.kinds as readonly string[]).includes(r.kind)).length
        : results.length,
    }))
  }, [results])

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
          {results.length} matches across events, talents, experiences and auctions.
        </p>
        <div className="mt-xl flex flex-wrap gap-[8px]">
          {SUGGESTIONS.map((s) => (
            <FilterChip
              key={s}
              className="h-[32px] rounded-[16px] px-md text-[13px]"
              onClick={() => {
                window.location.href = `/search?q=${encodeURIComponent(s)}`
              }}
            >
              {s}
            </FilterChip>
          ))}
        </div>
        {/*
          Entity tabs match detail-section metrics (15px / ink-brand / muted), not DS
          `Tab` (14.5px / ink-brand-mid). Count badges are local to this frame.
        */}
        <DetailSectionTabs className="mt-[18px] gap-0 border-border-default" aria-label="Result types">
          {tabCounts.map((t) => (
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
            <FilterSidebar
              title="Refine"
              clearLabel="Reset"
              width={244}
              interactive
              onClear={() => setCities([])}
            >
              <div>
                <p className="pt-[15px] text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                  City
                </p>
                <div className="mt-[11px] flex flex-col gap-[9px]">
                  {CITY_OPTIONS.map((opt, i) => (
                    <Checkbox
                      key={opt.label}
                      id={`${baseId}-city-${i}`}
                      label={opt.label}
                      count={opt.count}
                      fullWidth
                      checked={cities.includes(opt.label)}
                      onCheckedChange={() => toggleCity(opt.label)}
                    />
                  ))}
                </div>
              </div>
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
                <div key={group.label} title="Not applied yet">
                  <p className="pt-[15px] text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    {group.label}
                  </p>
                  <div className="mt-[11px] flex flex-col gap-[9px] opacity-55">
                    {group.options.map((opt, i) => (
                      <Checkbox
                        key={opt.label}
                        id={`${baseId}-${group.label}-${i}`}
                        label={opt.label}
                        count={'count' in opt ? opt.count : undefined}
                        fullWidth
                        disabled
                      />
                    ))}
                  </div>
                </div>
              ))}
            </FilterSidebar>
          }
        >
          <ResultsToolbar
            countLabel={`${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
            activeFilter={cities.length === 1 ? cities[0] : undefined}
            onClearFilter={
              cities.length === 1 ? () => setCities([]) : undefined
            }
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

          <div className="mt-lg flex flex-col gap-[10px]">
            {filtered.map((result) => (
              <Link
                key={result.title}
                to={result.to}
                className="flex gap-0 overflow-hidden rounded-[16px] border border-border-default bg-surface-default"
              >
                <div
                  className={`m-[14px] h-[118px] w-[168px] shrink-0 overflow-hidden ${result.mediaRounded}`}
                >
                  <img src={result.image} alt="" className="size-full object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center py-[14px] pr-[14px]">
                  <div className="flex items-center gap-[8px]">
                    <StatusBadge tone="neutralOutline">{result.kind}</StatusBadge>
                    {'flag' in result && result.flag && (
                      <span className="text-[12px] font-semibold text-brand-gradient-end">
                        {result.flag}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-[6px] text-[20px] leading-[1.2] font-extrabold tracking-[-0.35px] text-ink-primary">
                    {result.title}
                  </h3>
                  <p className="mt-[4px] text-[13px] text-ink-secondary">{result.meta}</p>
                  <p className="mt-[6px] max-w-[620px] text-[13px] leading-[1.45] text-ink-secondary">
                    {result.blurb}
                  </p>
                  <div className="mt-[10px] flex items-center justify-between">
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
                    <Button size="sm" variant="secondary" tabIndex={-1}>
                      {result.cta}
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length < results.length && (
            <div className="mt-[26px] flex justify-center">
              <Button
                variant="secondary"
                className="h-[44px] rounded-[22px] px-[22px]"
                onClick={() => {
                  setTab('All')
                  setCities([])
                }}
              >
                Show all results
              </Button>
            </div>
          )}

          <div className="mt-[34px]">
            <p className="text-[14px] font-medium text-ink-secondary">
              People searching this also looked for
            </p>
            <div className="mt-md flex flex-wrap gap-[9px]">
              {RELATED.map((label) => (
                <FilterChip
                  key={label}
                  className="h-[36px] rounded-[18px] text-[13px]"
                  onClick={() => {
                    window.location.href = `/search?q=${encodeURIComponent(label)}`
                  }}
                >
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
