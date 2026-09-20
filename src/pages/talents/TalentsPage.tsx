import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useGetTalentCategoriesQuery, useGetTalentsQuery } from '@/app/api/talentsApi'
import { TalentDirectoryCard } from '@/components/cards'
import { FilterChip } from '@/components/data-display'
import { FadeUp, StaggerGroup } from '@/components/motion'
import { NumberedPagination } from '@/components/navigation'
import { Checkbox } from '@/components/ui'
import { PageSection } from '@/layouts'
import { mapCategoryLabels } from '@/lib/api/mappers/categories'
import { mapApiTalentToCard } from '@/lib/api/mappers/talents'
import { buildPageNumbers } from '@/lib/api/unwrap'
import { catalogLabel } from '@/lib/i18n/catalogLabels'
import {
  CatalogBody,
  CatalogPageHead,
  CATALOG_TALENTS,
  CITY_FACETS,
  FilterSidebar,
  LinkedCard,
  RATING_OPTIONS,
  ResultsToolbar,
  slugify,
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

const SORT_KEYS = ['soonest', 'rating'] as const

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
  return (map[chip] ?? [chip.toLowerCase().replace(/s$/, '')]).some((term) => d.includes(term))
}

/** Talents directory — API list with real pagination. */
export function TalentsPage() {
  const { t } = useTranslation(['catalog', 'common', 'nav'])
  const baseId = useId()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page') || 1) || 1)
  const [chip, setChip] = useState('All talents')
  const [when, setWhen] = useState<(typeof WHEN_OPTIONS)[number]>('Anytime')
  const [cities, setCities] = useState<string[]>([])
  const [rating, setRating] = useState('Any')
  const [sortKey, setSortKey] = useState<(typeof SORT_KEYS)[number]>('soonest')

  const { data: talentsResult, isFetching, isError } = useGetTalentsQuery({ page })
  const apiTalents = talentsResult?.items
  const pagination = talentsResult?.pagination
  const { data: apiCategories } = useGetTalentCategoriesQuery()

  const setPage = (next: number) => {
    const safe = Math.max(1, next)
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (safe <= 1) params.delete('page')
        else params.set('page', String(safe))
        return params
      },
      { replace: true },
    )
  }

  const skipPageResetRef = useRef(true)
  useEffect(() => {
    if (skipPageResetRef.current) {
      skipPageResetRef.current = false
      return
    }
    setSearchParams(
      (prev) => {
        if (!prev.get('page') || prev.get('page') === '1') return prev
        const next = new URLSearchParams(prev)
        next.delete('page')
        return next
      },
      { replace: true },
    )
  }, [chip, when, cities, rating, sortKey, setSearchParams])

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
    return catalog.filter((talent) => {
      if (!matchesChip(talent.discipline, chip)) return false
      if (
        cities.length > 0 &&
        !cities.some((c) => talentCityHaystack(talent).includes(c.toLowerCase()))
      ) {
        return false
      }
      if (floor !== null && Number.parseFloat(talent.rating) < floor) return false
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

  const lastPage = Math.max(1, pagination?.lastPage ?? 1)
  const currentPage = Math.min(page, lastPage)
  const pageNumbers = buildPageNumbers(currentPage, lastPage)
  const usingApiPages = Boolean(apiTalents && apiTalents.length > 0 && pagination)
  const resultCount = usingApiPages ? (pagination?.total ?? shown.length) : shown.length

  const sortLabels = {
    soonest: t('results.sortPlayingSoonest'),
    rating: t('results.sortTopRated'),
  } as const
  const cycleSort = () => {
    const idx = SORT_KEYS.indexOf(sortKey)
    setSortKey(SORT_KEYS[(idx + 1) % SORT_KEYS.length]!)
  }

  return (
    <>
      <PageSection padTop={14} padBottom={0}>
        <FadeUp>
          <CatalogPageHead
            title={t('nav:talents')}
            chips={talentChips.map((label) => ({
              label,
              displayLabel: catalogLabel(t, label),
              selected: label === chip,
            }))}
            onChipSelect={setChip}
          />
        </FadeUp>
      </PageSection>

      <PageSection padTop={28} padBottom={0} id="directory">
        <CatalogBody
          filterWidth={252}
          filters={
            <FilterSidebar
              title={t('filters.narrowItDown')}
              clearLabel={t('common:actions.clear')}
              width={252}
              interactive
              onClear={clearFilters}
            >
              <div className="flex w-full flex-col gap-[22px]">
                <div>
                  <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    {t('filters.when')}
                  </p>
                  <div className="mt-md flex flex-col gap-[7px]">
                    {WHEN_OPTIONS.map((label) => (
                      <FilterChip
                        key={label}
                        selected={when === label}
                        onClick={() => setWhen(label)}
                        className="h-[36px] w-full justify-start rounded-[9px] px-md text-[14px]"
                      >
                        {catalogLabel(t, label)}
                      </FilterChip>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-border-divider" />
                <div>
                  <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    {t('filters.playingIn')}
                  </p>
                  <div className="mt-md flex flex-col gap-[9px]">
                    {CITY_FACETS.slice(0, 5).map((c, i) => (
                      <Checkbox
                        key={c.label}
                        id={`${baseId}-city-${i}`}
                        label={catalogLabel(t, c.label)}
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
                    {t('filters.rating')}
                  </p>
                  <div className="mt-md flex flex-wrap gap-[7px]">
                    {RATING_OPTIONS.map((opt) => (
                      <FilterChip
                        key={opt}
                        selected={rating === opt}
                        onClick={() => setRating(opt)}
                        className="h-[32px] rounded-[16px] px-md text-[13px] font-semibold"
                      >
                        {catalogLabel(t, opt)}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              </div>
            </FilterSidebar>
          }
        >
          <ResultsToolbar
            countLabel={t('results.countTalents', {
              count: shown.length,
              total: resultCount,
            })}
            sortLabel={t('results.sort')}
            sortValue={sortLabels[sortKey]}
            onSortClick={cycleSort}
            showViewToggle={false}
          />
          {(isError || isFetching) && (
            <p className="mt-sm text-[13px] text-ink-muted">
              {[isError ? t('pages.apiPreview') : null, isFetching ? t('pages.updating') : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          <StaggerGroup className="mt-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((talent) => (
              <LinkedCard
                key={talent.slug ?? talent.name}
                to={`/talents/${talent.slug ?? slugify(talent.name)}`}
              >
                <TalentDirectoryCard {...talent} limited />
              </LinkedCard>
            ))}
          </StaggerGroup>
          {lastPage > 1 ? (
            <div className="mt-[36px]">
              <NumberedPagination
                page={currentPage}
                pages={pageNumbers}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </CatalogBody>
      </PageSection>
    </>
  )
}
