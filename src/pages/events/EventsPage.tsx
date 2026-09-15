import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EventCard } from '@/components/cards'
import { FadeUp, StaggerGroup } from '@/components/motion'
import { Breadcrumbs } from '@/components/navigation'
import { PageSection } from '@/layouts'
import { NumberedPagination } from '@/components/navigation'
import {
  CatalogBody,
  CatalogPageHead,
  CatalogSaveAlertActions,
  CATALOG_EVENTS,
  EVENT_CATEGORY_CHIPS,
  FilterSidebar,
  type FilterSidebarState,
  LinkedCard,
  ResultsToolbar,
  slugify,
} from '@/pages/_guest'
import { useGetEventCategoriesQuery, useGetEventsQuery } from '@/app/api/eventsApi'
import { mapCategoryLabels } from '@/lib/api/mappers/categories'
import { mapApiEventToCard } from '@/lib/api/mappers/events'
import { useEventFavorites } from '@/lib/favorites/useEventFavorites'
import { catalogLabel } from '@/lib/i18n/catalogLabels'

const SORT_KEYS = ['date', 'price', 'rating'] as const

type SortKey = (typeof SORT_KEYS)[number]

function parseRatingFloor(option: string): number | null {
  if (option === 'Any') return null
  const n = Number.parseFloat(option.replace('+', ''))
  return Number.isFinite(n) ? n : null
}

function parsePrice(price: string): number {
  const n = Number.parseFloat(price.replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY
}

function matchesWhen(date: string, when: string): boolean {
  if (when === 'Any date' || when === 'Today' || when === 'This week' || when === 'This month') {
    return true
  }
  if (when === 'Weekend') {
    return /\b(Sat|Sun)\b/i.test(date)
  }
  return true
}

/** Events directory — Figma `207:4600`. Events API with fixture fallback. */
export function EventsPage() {
  const { t } = useTranslation(['catalog', 'nav', 'common'])
  const [category, setCategory] = useState('All events')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [filters, setFilters] = useState<FilterSidebarState>({
    when: 'Any date',
    cities: [],
    rating: 'Any',
    other: [],
    maxPrice: 1500,
  })

  const { data: apiEvents, isFetching, isError } = useGetEventsQuery()
  const { data: apiCategories } = useGetEventCategoriesQuery()
  const { isFavourite, toggleFavourite, canFavourite } = useEventFavorites()

  const categoryChips = useMemo(
    () =>
      mapCategoryLabels(apiCategories, {
        allLabel: 'All events',
        fallback: EVENT_CATEGORY_CHIPS,
      }),
    [apiCategories],
  )

  const catalog = useMemo(() => {
    if (apiEvents && apiEvents.length > 0) {
      return apiEvents.map(mapApiEventToCard)
    }
    return CATALOG_EVENTS.map((event) => ({ ...event, slug: slugify(event.title) }))
  }, [apiEvents])

  const filtered = useMemo(() => {
    const ratingFloor = parseRatingFloor(filters.rating)
    const freeOnly = filters.other.includes('Free entry only')

    return catalog.filter((e) => {
      if (category !== 'All events') {
        const needle = category.toLowerCase().replace(/s$/, '')
        if (e.category && !e.category.toLowerCase().includes(needle)) return false
      }
      if (
        filters.cities.length > 0 &&
        !filters.cities.some((city) => e.venue.toLowerCase().includes(city.toLowerCase()))
      ) {
        return false
      }
      if (ratingFloor !== null && Number.parseFloat(e.rating) < ratingFloor) return false
      if (!matchesWhen(e.date, filters.when)) return false
      if (freeOnly && parsePrice(e.price) > 0) return false
      if (parsePrice(e.price) > filters.maxPrice) return false
      return true
    })
  }, [catalog, category, filters])

  const shown = useMemo(() => {
    const list = [...filtered]
    if (sortKey === 'price') {
      list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
    } else if (sortKey === 'rating') {
      list.sort((a, b) => Number.parseFloat(b.rating) - Number.parseFloat(a.rating))
    }
    return list
  }, [filtered, sortKey])

  const sortLabels: Record<SortKey, string> = {
    date: t('results.sortDateSoonest'),
    price: t('results.sortPriceLow'),
    rating: t('results.sortRating'),
  }
  const sortModeLabel = sortLabels[sortKey]
  const cycleSort = () => {
    const idx = SORT_KEYS.indexOf(sortKey)
    setSortKey(SORT_KEYS[(idx + 1) % SORT_KEYS.length]!)
  }

  const categoryDisplay = catalogLabel(t, category)
  const subtitleParts = [
    t('pages.eventsSubtitle', {
      count: shown.length,
      category: categoryDisplay.toLowerCase(),
    }),
    isError ? t('pages.apiPreview') : null,
    isFetching ? t('pages.updating') : null,
  ].filter(Boolean)

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: t('nav:main'), href: '/' },
            { label: t('nav:events'), href: '/events' },
            { label: categoryDisplay },
          ]}
        />
      </PageSection>

      <PageSection padTop={14} padBottom={0}>
        <FadeUp>
          <CatalogPageHead
            title={t('pages.eventsInSaudi', { category: categoryDisplay })}
            subtitle={subtitleParts.join(' ')}
            chips={categoryChips.map((label) => ({
              label,
              displayLabel: catalogLabel(t, label),
              selected: label === category || (label === 'All events' && category === 'All events'),
            }))}
            onChipSelect={setCategory}
            actions={
              <CatalogSaveAlertActions
                saveLabel={t('pages.saveSearch')}
                alertLabel={t('pages.alertNewCategory', {
                  category: categoryDisplay.toLowerCase(),
                })}
              />
            }
          />
        </FadeUp>
      </PageSection>

      <PageSection padTop={28} padBottom={0}>
        <CatalogBody
          filters={
            <FilterSidebar
              interactive
              onChange={setFilters}
              onClear={() =>
                setFilters({
                  when: 'Any date',
                  cities: [],
                  rating: 'Any',
                  other: [],
                  maxPrice: 1500,
                })
              }
            />
          }
        >
          <ResultsToolbar
            countLabel={t('results.countEvents', {
              count: Math.min(9, shown.length),
              total: shown.length,
            })}
            activeFilter={category === 'All events' ? undefined : categoryDisplay}
            onClearFilter={() => setCategory('All events')}
            sortLabel={t('results.sort')}
            sortValue={sortModeLabel}
            onSortClick={cycleSort}
            view={view}
            onViewChange={setView}
          />
          <StaggerGroup
            className={
              view === 'list'
                ? 'mt-lg flex flex-col gap-lg'
                : 'mt-lg grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
            }
          >
            {shown.slice(0, 9).map((event) => (
              <LinkedCard
                key={event.slug ?? event.title}
                to={`/events/${event.slug ?? slugify(event.title)}`}
              >
                <EventCard
                  {...event}
                  context="catalog"
                  favourited={'id' in event ? isFavourite(event.id) : false}
                  onToggleFavourite={
                    'id' in event && canFavourite(event.id)
                      ? () => void toggleFavourite(event.id)
                      : undefined
                  }
                />
              </LinkedCard>
            ))}
          </StaggerGroup>
          <div className="mt-[36px]">
            <NumberedPagination pages={[1, 2, 3, 4, 19]} />
          </div>
        </CatalogBody>
      </PageSection>
    </>
  )
}
