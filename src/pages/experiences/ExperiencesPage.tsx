import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetExperienceCategoriesQuery, useGetExperiencesQuery } from '@/app/api/experiencesApi'
import { ExperienceCard } from '@/components/cards'
import { FilterChip } from '@/components/data-display'
import { ChevronDownIcon, MinusIcon, PlusIcon } from '@/components/icons'
import { FadeUp, StaggerGroup } from '@/components/motion'
import { Breadcrumbs } from '@/components/navigation'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { mapCategoryLabels } from '@/lib/api/mappers/categories'
import { mapApiExperienceToCard } from '@/lib/api/mappers/experiences'
import { catalogLabel } from '@/lib/i18n/catalogLabels'
import {
  CATALOG_EXPERIENCES,
  CatalogPageHead,
  CITY_FACETS,
  LinkedCard,
  PromoBand,
  slugify,
} from '@/pages/_guest'
import { cn } from '@/lib/cn'

const CATEGORIES = [
  'All experiences',
  'Food & desert',
  'Culture',
  'Heritage',
  'Outdoors',
  'Workshops',
  'Music',
] as const

/** Experiences directory — Figma `207:6795`. Experiences API with fixture fallback. */
export function ExperiencesPage() {
  const { t } = useTranslation(['catalog', 'nav', 'common'])
  const whereOptions = useMemo(
    () => ['Anywhere in Saudi Arabia', ...CITY_FACETS.slice(0, 5).map((c) => c.label)] as const,
    [],
  )
  const [category, setCategory] = useState('All experiences')
  const [guests, setGuests] = useState(2)
  const [where, setWhere] = useState<string>('Anywhere in Saudi Arabia')

  const { data: apiExperiences, isFetching, isError } = useGetExperiencesQuery()
  const { data: apiCategories } = useGetExperienceCategoriesQuery()

  const categoryChips = useMemo(
    () =>
      mapCategoryLabels(apiCategories, {
        allLabel: 'All experiences',
        fallback: CATEGORIES,
      }),
    [apiCategories],
  )

  const catalog = useMemo(() => {
    if (apiExperiences && apiExperiences.length > 0) {
      return apiExperiences.map(mapApiExperienceToCard)
    }
    return CATALOG_EXPERIENCES.map((exp) => ({ ...exp, slug: slugify(exp.title) }))
  }, [apiExperiences])

  const filtered = useMemo(() => {
    return catalog.filter((exp) => {
      if (category !== 'All experiences') {
        const needle = category.toLowerCase().split(' ')[0]!
        if (!exp.meta.toLowerCase().includes(needle)) return false
      }
      if (where !== 'Anywhere in Saudi Arabia') {
        const hay = `${exp.location} ${exp.place}`.toLowerCase()
        if (!hay.includes(where.toLowerCase())) return false
      }
      return true
    })
  }, [catalog, category, where])

  const shown = filtered
  const subtitleParts = [
    t('pages.experiencesSubtitle'),
    isError ? t('pages.apiPreview') : null,
    isFetching ? t('pages.updating') : null,
  ].filter(Boolean)

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: t('nav:main'), href: '/' },
            { label: t('nav:experiences') },
          ]}
        />
      </PageSection>

      <PageSection padTop={14} padBottom={0}>
        <FadeUp>
          <CatalogPageHead
            title={t('pages.experiencesTitle')}
            subtitle={subtitleParts.join(' ')}
          />
        </FadeUp>

        <div className="mt-3xl flex h-auto w-full flex-col gap-md rounded-[18px] border border-border-default bg-surface-default p-md sm:h-[72px] sm:flex-row sm:items-center sm:gap-0 sm:p-0 sm:px-[14px]">
          <label className="relative min-w-0 flex-1 px-sm">
            <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
              {t('filters.where')}
            </p>
            <div className="mt-[3px] flex items-center gap-sm">
              <select
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                className={cn(
                  'w-full appearance-none bg-transparent text-[15px] font-semibold text-ink-primary outline-none',
                  'cursor-pointer pr-lg',
                )}
                aria-label={t('filters.where')}
              >
                {whereOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {catalogLabel(t, opt)}
                  </option>
                ))}
              </select>
              <ChevronDownIcon size={12} className="pointer-events-none absolute right-sm bottom-[6px] text-ink-primary" />
            </div>
          </label>
          <div className="mx-[2px] hidden h-[34px] w-px bg-border-divider sm:block" />
          <div
            className="min-w-0 flex-1 cursor-not-allowed border-t border-border-divider px-sm pt-md opacity-55 sm:border-t-0 sm:pt-0"
            title="Date picker not available yet"
          >
            <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
              {t('filters.when')}
            </p>
            <p className="mt-[3px] text-[15px] font-semibold text-ink-disabled">dd/mm/yyyy</p>
          </div>
          <div className="mx-[2px] hidden h-[34px] w-px bg-border-divider sm:block" />
          <div className="w-full shrink-0 border-t border-border-divider px-sm pt-md sm:w-[200px] sm:border-t-0 sm:pt-0">
            <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
              {t('filters.guests')}
            </p>
            <div className="mt-[3px] flex items-center gap-[12px]">
              <button
                type="button"
                aria-label={t('filters.fewerGuests')}
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                className="flex size-[26px] items-center justify-center rounded-full border border-border-default"
              >
                <MinusIcon size={14} />
              </button>
              <span className="text-[15px] font-semibold tabular-nums">{guests}</span>
              <button
                type="button"
                aria-label={t('filters.moreGuests')}
                onClick={() => setGuests((g) => g + 1)}
                className="flex size-[26px] items-center justify-center rounded-full border border-border-default"
              >
                <PlusIcon size={14} />
              </button>
            </div>
          </div>
          <Button
            className="mt-sm h-[48px] w-full shrink-0 rounded-[24px] sm:mt-0 sm:w-[104px]"
            onClick={() => {
              /* Where + category already filter the grid below. */
            }}
          >
            {t('common:actions.search')}
          </Button>
        </div>

        <div className="mt-xl flex flex-wrap gap-[9px]">
          {categoryChips.map((label) => (
            <FilterChip
              key={label}
              selected={label === category}
              onClick={() => setCategory(label)}
            >
              {catalogLabel(t, label)}
            </FilterChip>
          ))}
        </div>
      </PageSection>

      <PageSection padTop={18} padBottom={0}>
        <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shown.slice(0, 8).map((exp) => (
            <LinkedCard
              key={exp.slug ?? exp.title}
              to={`/experiences/${exp.slug ?? slugify(exp.title)}`}
            >
              <ExperienceCard
                context="catalog"
                title={exp.title}
                location={exp.location}
                eyebrow={exp.meta}
                rating={exp.rating}
                guests={exp.guests}
                price={exp.price}
                flag={exp.flag}
                image={exp.image}
              />
            </LinkedCard>
          ))}
        </StaggerGroup>
      </PageSection>

      <PageSection padTop={88} padBottom={96}>
        <PromoBand
          tone="inverse"
          heading={t('pages.hostExperienceHeading')}
          body={t('pages.hostExperienceBody')}
          ctaLabel={t('pages.hostExperienceCta')}
          ctaTo="/submit-experience"
        />
      </PageSection>
    </>
  )
}
