import { useId, useMemo, useState } from 'react'
import { useGetTalentCategoriesQuery, useGetTalentsQuery } from '@/app/api/talentsApi'
import { TalentCard, TalentDirectoryCard } from '@/components/cards'
import { FilterChip } from '@/components/data-display'
import { FadeUp, StaggerGroup } from '@/components/motion'
import { Checkbox } from '@/components/ui'
import { PageSection } from '@/layouts'
import { mapCategoryLabels } from '@/lib/api/mappers/categories'
import { mapApiTalentToCard } from '@/lib/api/mappers/talents'
import {
  BusinessStrip,
  CatalogBody,
  CatalogPageHead,
  CatalogPager,
  CATALOG_TALENTS,
  CITY_FACETS,
  FilterSidebar,
  LinkedCard,
  PromoBand,
  RATING_OPTIONS,
  ResultsToolbar,
  slugify,
  TALENT_WEEK_IMAGES,
} from '@/pages/_guest'

const TALENT_CHIPS = [
  'All talents',
  'Singers',
  'Bands',
  'DJs',
  'Musicians',
  'Speakers',
  'Comedians',
  'Hosts',
  'Dance troupes',
] as const

const WHEN_OPTIONS = ['Anytime', 'This week', 'This month', 'Next 3 months'] as const

const SORT_MODES = [
  { key: 'soonest', label: 'Playing soonest' },
  { key: 'rating', label: 'Top rated' },
] as const

function parseRatingFloor(option: string): number | null {
  if (option === 'Any') return null
  const n = Number.parseFloat(option.replace('+', ''))
  return Number.isFinite(n) ? n : null
}

function talentCityHaystack(talent: {
  meta: string
  discipline: string
  nextShow?: { detail?: string }
  city?: string
}): string {
  return `${talent.meta} ${talent.nextShow?.detail ?? ''} ${talent.discipline} ${talent.city ?? ''}`.toLowerCase()
}

function matchesChip(discipline: string, chip: string): boolean {
  if (chip === 'All talents') return true
  const d = discipline.toLowerCase()
  const map: Record<string, string[]> = {
    Singers: ['singer'],
    Bands: ['band', 'ensemble', 'folk'],
    DJs: ['dj'],
    Musicians: ['oud', 'musician', 'classical', 'fusion'],
    Speakers: ['speaker'],
    Comedians: ['comedy', 'comedian'],
    Hosts: ['host'],
    'Dance troupes': ['dance'],
  }
  return (map[chip] ?? [chip.toLowerCase().replace(/s$/, '')]).some((t) => d.includes(t))
}

/** Talents directory — Figma `207:5539`. Talents API with fixture fallback. */
export function TalentsPage() {
  const baseId = useId()
  const [chip, setChip] = useState('All talents')
  const [when, setWhen] = useState<(typeof WHEN_OPTIONS)[number]>('Anytime')
  const [cities, setCities] = useState<string[]>([])
  const [rating, setRating] = useState('Any')
  const [sortKey, setSortKey] = useState<(typeof SORT_MODES)[number]['key']>('soonest')

  const { data: apiTalents, isFetching, isError } = useGetTalentsQuery()
  const { data: apiCategories } = useGetTalentCategoriesQuery()

  const talentChips = useMemo(
    () =>
      mapCategoryLabels(apiCategories, {
        allLabel: 'All talents',
        fallback: TALENT_CHIPS,
      }),
    [apiCategories],
  )

  const catalog = useMemo(() => {
    if (apiTalents && apiTalents.length > 0) {
      return apiTalents.map(mapApiTalentToCard)
    }
    return CATALOG_TALENTS.map((talent) => ({
      ...talent,
      slug: slugify(talent.name),
      reviews: '',
      city: '',
    }))
  }, [apiTalents])

  const toggleCity = (label: string) => {
    setCities((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label],
    )
  }

  const clearFilters = () => {
    setWhen('Anytime')
    setCities([])
    setRating('Any')
  }

  const filtered = useMemo(() => {
    const floor = parseRatingFloor(rating)
    return catalog.filter((t) => {
      if (!matchesChip(t.discipline, chip)) return false
      if (
        cities.length > 0 &&
        !cities.some((c) => talentCityHaystack(t).includes(c.toLowerCase()))
      ) {
        return false
      }
      if (floor !== null && Number.parseFloat(t.rating) < floor) return false
      return true
    })
  }, [catalog, chip, cities, rating])

  const shown = useMemo(() => {
    const list = [...filtered]
    if (sortKey === 'rating') {
      list.sort((a, b) => Number.parseFloat(b.rating) - Number.parseFloat(a.rating))
    }
    return list
  }, [filtered, sortKey])

  const sortMode = SORT_MODES.find((m) => m.key === sortKey) ?? SORT_MODES[0]
  const cycleSort = () => {
    const idx = SORT_MODES.findIndex((m) => m.key === sortKey)
    setSortKey(SORT_MODES[(idx + 1) % SORT_MODES.length]!.key)
  }

  return (
    <>
      <PageSection padTop={14} padBottom={0}>
        <FadeUp>
          <CatalogPageHead
            eyebrow="Who's performing"
            title="Follow the artists, catch every show"
            subtitle={`Public profiles show name, craft and rating — then find their tickets on events.${
              isError ? ' Showing local preview while the API is unreachable.' : ''
            }${isFetching ? ' Updating…' : ''}`}
            chips={talentChips.map((label) => ({
              label,
              selected: label === chip,
            }))}
            onChipSelect={setChip}
          />
        </FadeUp>
      </PageSection>

      <PageSection padTop={30} padBottom={0}>
        <FadeUp className="mb-[18px] flex items-end justify-between gap-4xl">
          <div>
            <h2 className="text-heading-h2 text-ink-primary">On stage this season</h2>
            <p className="mt-sm text-body-default text-ink-secondary">
              Limited public profiles — follow shows from the events calendar.
            </p>
          </div>
          <a
            href="#directory"
            className="flex items-center gap-[5px] text-[14px] font-bold text-ink-brand-mid"
          >
            All talents →
          </a>
        </FadeUp>
        <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {catalog.slice(0, 4).map((talent, i) => (
            <LinkedCard
              key={talent.slug ?? talent.name}
              to={`/talents/${talent.slug ?? slugify(talent.name)}`}
            >
              <TalentCard
                name={talent.name}
                discipline={talent.discipline}
                rating={talent.rating}
                reviews={talent.reviews ?? ''}
                city={talent.city ?? ''}
                nextLabel={'nextLabel' in talent ? talent.nextLabel : undefined}
                nextEvent={'nextEvent' in talent ? talent.nextEvent : undefined}
                verified={talent.verified}
                image={talent.image ?? TALENT_WEEK_IMAGES[i]}
                limited
              />
            </LinkedCard>
          ))}
        </StaggerGroup>
      </PageSection>

      <PageSection padTop={44} padBottom={0} id="directory">
        <CatalogBody
          filterWidth={252}
          filters={
            <FilterSidebar
              title="Narrow it down"
              clearLabel="Clear"
              width={252}
              interactive
              onClear={clearFilters}
            >
              <div className="flex w-full flex-col gap-[22px]">
                <div>
                  <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    When
                  </p>
                  <div className="mt-md flex flex-col gap-[7px]">
                    {WHEN_OPTIONS.map((label) => (
                      <FilterChip
                        key={label}
                        selected={when === label}
                        onClick={() => setWhen(label)}
                        className="h-[36px] w-full justify-start rounded-[9px] px-md text-[14px]"
                      >
                        {label}
                      </FilterChip>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-border-divider" />
                <div>
                  <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    Playing in
                  </p>
                  <div className="mt-md flex flex-col gap-[9px]">
                    {CITY_FACETS.slice(0, 5).map((c, i) => (
                      <Checkbox
                        key={c.label}
                        id={`${baseId}-city-${i}`}
                        label={c.label}
                        count={c.count}
                        fullWidth
                        checked={cities.includes(c.label)}
                        onCheckedChange={() => toggleCity(c.label)}
                      />
                    ))}
                  </div>
                </div>
                <div className="h-px bg-border-divider" />
                <div>
                  <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    Rating
                  </p>
                  <div className="mt-md flex flex-wrap gap-[7px]">
                    {RATING_OPTIONS.map((opt) => (
                      <FilterChip
                        key={opt}
                        selected={rating === opt}
                        onClick={() => setRating(opt)}
                        className="h-[32px] rounded-[16px] px-md text-[13px] font-semibold"
                      >
                        {opt}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              </div>
            </FilterSidebar>
          }
        >
          <ResultsToolbar
            countLabel={`${Math.min(9, shown.length)} of ${shown.length} talents`}
            sortValue={sortMode.label}
            onSortClick={cycleSort}
            showViewToggle={false}
          />
          <StaggerGroup className="mt-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {shown.slice(0, 9).map((talent) => (
              <LinkedCard
                key={talent.slug ?? talent.name}
                to={`/talents/${talent.slug ?? slugify(talent.name)}`}
              >
                <TalentDirectoryCard {...talent} limited />
              </LinkedCard>
            ))}
          </StaggerGroup>
          <div className="mt-[36px]">
            <CatalogPager pages={[1, 2, 3, 4, 46]} />
          </div>
        </CatalogBody>
      </PageSection>

      <PageSection padTop={80} padBottom={0}>
        <PromoBand
          tone="inverse"
          heading="Never miss a date"
          body="Create an account to save events and get told when tickets drop for artists you care about."
          ctaLabel="Create your account →"
          ctaTo="/register"
        />
      </PageSection>

      <BusinessStrip
        heading="Are you a performer?"
        body="Submit a talent request from your guest account. Our team reviews it and follows up outside the platform — there is no separate talent login."
        ctaLabel="Submit as talent"
        ctaTo="/apply/talent"
      />
    </>
  )
}
