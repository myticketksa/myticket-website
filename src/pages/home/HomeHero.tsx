import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ApiRecord } from '@/app/api/eventsApi'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  SearchIcon,
} from '@/components/icons'
import { FeaturedHeroCard } from '@/components/cards'
import { PopularChip } from '@/components/data-display'
import { FadeUp } from '@/components/motion'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'
import { mapApiEventToCard } from '@/lib/api/mappers/events'
import { useEventFavorites } from '@/lib/favorites/useEventFavorites'
import { slugify } from '@/pages/_guest'
import { HOME_FEATURED, HOME_POPULAR } from './home-data'
import { HOME_HERO_IMAGES } from './home-media'

/**
 * Home Hero — Figma `207:4364`.
 *
 * Pad-top 60 inside the section (header sits above via MainLayout). Intro column 675,
 * carousel 593, gap 52. H1 is Display/Hero XL; the third line uses a three-stop ramp that
 * ends on `--ink-brand-strong` rather than `--brand-gradient-end`, so it is written out
 * rather than folded into `text-brand-gradient`.
 *
 * The search bar is **not** `SearchPill` — it is a composite 74-tall control with a field,
 * region selector and identity-gradient button. Popular terms use `PopularChip` (h30, r16),
 * not `FilterChip` / `CategoryChip`.
 */

const REGION_OPTIONS = [
  { value: 'All Saudi Arabia', key: 'all' as const },
  { value: 'Riyadh', key: 'riyadh' as const },
  { value: 'Jeddah', key: 'jeddah' as const },
  { value: 'Dammam', key: 'dammam' as const },
]

export function HomeHero({ apiEvents }: { apiEvents?: ApiRecord[] }) {
  const { t } = useTranslation(['catalog', 'common'])
  const [slide, setSlide] = useState(0)
  const [region, setRegion] = useState(REGION_OPTIONS[0]!.value)
  const { isFavourite, toggleFavourite, canFavourite } = useEventFavorites()

  const featuredSource = useMemo(() => {
    if (apiEvents && apiEvents.length > 0) {
      return apiEvents.slice(0, 2).map((event) => {
        const mapped = mapApiEventToCard(event)
        return {
          date: mapped.date,
          title: mapped.title,
          venue: mapped.venue,
          rating: mapped.rating,
          price: mapped.price,
          category: mapped.category ?? 'Events',
          flag: mapped.flag,
          slug: mapped.slug,
          image: mapped.image,
          id: mapped.id,
        }
      })
    }
    return HOME_FEATURED.map((f) => ({ ...f, slug: slugify(f.title), image: undefined as string | undefined }))
  }, [apiEvents])

  const featuredSlides = useMemo(() => {
    if (featuredSource.length < 2) return [featuredSource]
    return [
      featuredSource.slice(0, 2),
      [featuredSource[1]!, featuredSource[0]!],
      featuredSource.slice(0, 2),
    ] as const
  }, [featuredSource])

  const cards = featuredSlides[slide] ?? featuredSlides[0] ?? featuredSource.slice(0, 2)
  const slideCount = featuredSlides.length

  const goPrev = () => setSlide((s) => (s - 1 + slideCount) % slideCount)
  const goNext = () => setSlide((s) => (s + 1) % slideCount)

  const regionOpt = REGION_OPTIONS.find((r) => r.value === region)
  const regionLabel = regionOpt ? t(`home.regions.${regionOpt.key}`) : region

  const searchPlaceholder =
    region === 'All Saudi Arabia'
      ? t('home.searchPlaceholderAll')
      : t('home.searchInRegion', { region: regionLabel })

  return (
    <PageSection
      padBottom={0}
      className="relative overflow-hidden bg-bg-page pt-3xl sm:pt-[48px] lg:pt-[60px]"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 1100px 620px at 8% -10%, color-mix(in srgb, var(--color-brand-primary) 22%, transparent), transparent 62%), radial-gradient(ellipse 900px 560px at 96% 4%, color-mix(in srgb, var(--color-brand-primary) 14%, transparent), transparent 60%)',
      }}
    >
      <div className="flex flex-col gap-3xl lg:flex-row lg:items-start lg:gap-[52px]">
        {/* 1. Copy + search — primary mobile stack */}
        <div className="flex w-full max-w-[675px] flex-col lg:pt-xl">
          <FadeUp inView={false} delay={0.05} distance={8}>
            <div className="flex w-full max-w-full items-start gap-[10px] rounded-[16px] bg-identity-gradient px-[14px] py-[10px] text-[12px] leading-[1.4] font-bold text-ink-inverse shadow-[0px_8px_22px_-10px_color-mix(in_srgb,var(--color-brand-primary)_75%,transparent)] sm:inline-flex sm:w-auto sm:items-center sm:rounded-[22px] sm:py-[7px] sm:pe-[15px] sm:ps-[11px] sm:text-[13px] sm:leading-none">
              <span
                className="mt-[5px] size-[7px] shrink-0 rounded-pill bg-ink-inverse sm:mt-0"
                aria-hidden
              />
              <span className="min-w-0 text-pretty">{t('home.liveCount')}</span>
            </div>
          </FadeUp>

          <FadeUp inView={false} delay={0.1} distance={12}>
            <h1 className="mt-xl max-w-[560px] text-[32px] leading-[1.1] font-bold tracking-[-0.04em] text-balance text-ink-primary sm:mt-[26px] sm:text-[42px] sm:leading-[1.08] lg:text-display-hero-xl">
              {t('home.heroTitle')}
            </h1>

            <p className="mt-lg max-w-[480px] text-[16px] leading-[1.55] font-medium text-pretty text-ink-secondary sm:mt-2xl sm:text-[18px]">
              {t('home.heroLede')}
            </p>
          </FadeUp>

          <FadeUp inView={false} delay={0.2} distance={8}>
            <form
              action="/search"
              className="mt-2xl flex w-full flex-col overflow-hidden rounded-[20px] border border-border-default bg-surface-default shadow-[0px_22px_48px_-24px_color-mix(in_srgb,var(--color-brand-primary)_55%,transparent),0px_2px_4px_0px_color-mix(in_srgb,var(--color-ink-primary)_4%,transparent)] sm:mt-3xl sm:flex-row sm:items-center sm:gap-[10px] sm:p-sm"
            >
              <label className="flex min-h-[52px] min-w-0 flex-1 items-center gap-md border-b border-border-default px-lg py-[12px] sm:min-h-0 sm:border-b-0 sm:py-[10px]">
                <SearchIcon size={19} className="shrink-0 text-brand-primary" />
                <input
                  name="q"
                  placeholder={searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-[16px] font-medium text-ink-primary outline-none placeholder:truncate placeholder:text-ink-muted"
                />
              </label>
              <span className="hidden h-[28px] w-px shrink-0 bg-border-default sm:block" />
              <div className="flex items-stretch gap-sm p-sm sm:contents sm:p-0">
                <label className="relative flex min-h-[48px] min-w-0 flex-1 items-center gap-sm rounded-[14px] bg-bg-page px-[14px] sm:h-[58px] sm:flex-none sm:rounded-none sm:bg-transparent">
                  <span className="sr-only">{t('home.region')}</span>
                  <select
                    name="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full min-w-0 appearance-none bg-transparent pe-lg text-[14px] font-semibold text-ink-secondary outline-none cursor-pointer sm:text-[15px]"
                  >
                    {REGION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(`home.regions.${opt.key}`)}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    size={12}
                    className="pointer-events-none absolute end-[14px] text-ink-primary"
                  />
                </label>
                <button
                  type="submit"
                  className="flex h-[48px] shrink-0 items-center justify-center rounded-[14px] bg-identity-gradient px-[22px] text-[15px] font-bold text-ink-inverse shadow-[0px_8px_20px_-8px_color-mix(in_srgb,var(--color-brand-primary)_75%,transparent)] sm:h-[58px] sm:px-[30px]"
                >
                  {t('common:actions.search')}
                </button>
              </div>
            </form>
          </FadeUp>

          <FadeUp inView={false} delay={0.25} distance={0}>
            <div className="mt-lg flex flex-col gap-sm sm:mt-[18px] sm:flex-row sm:flex-wrap sm:items-center">
              <span className="text-[13px] font-semibold text-ink-muted">{t('home.popular')}</span>
              <div className="flex flex-wrap items-center gap-sm">
                {HOME_POPULAR.map((term) => (
                  <PopularChip key={term} href={`/search?q=${encodeURIComponent(term)}`}>
                    {term}
                  </PopularChip>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>

        {/* 2. Featured carousel — after copy on mobile */}
        <FadeUp
          inView={false}
          delay={0.3}
          distance={16}
          className="flex w-full max-w-[593px] flex-col gap-[14px]"
        >
          <div className="flex flex-col gap-md sm:h-[36px] sm:flex-row sm:items-center sm:justify-between sm:gap-sm">
            <p className="text-label-overline text-brand-gradient-end">{t('home.featured')}</p>
            <div className="flex items-center justify-between gap-sm sm:justify-end">
              <Link
                to="/events"
                className="group/link inline-flex min-h-[44px] items-center gap-sm text-[13px] font-bold text-brand-gradient-end transition-colors duration-fast ease-standard hover:text-ink-brand sm:min-h-0"
              >
                {t('home.seeAllFeatured')}
                <ArrowRightIcon
                  size={13}
                  className="shrink-0 transition-transform duration-fast ease-standard group-hover/link:translate-x-0.5 motion-reduce:group-hover/link:translate-x-0"
                />
              </Link>
              <div className="flex items-center gap-sm">
                <button
                  type="button"
                  aria-label={t('home.prevFeatured')}
                  onClick={goPrev}
                  className="flex size-[44px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] border-[1.5px] border-border-default bg-surface-default text-ink-primary transition-colors duration-normal ease-standard hover:border-border-brand sm:size-[36px]"
                >
                  <ArrowLeftIcon size={14} />
                </button>
                <button
                  type="button"
                  aria-label={t('home.nextFeatured')}
                  onClick={goNext}
                  className="flex size-[44px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] border-[1.5px] border-border-default bg-surface-default text-ink-primary transition-colors duration-normal ease-standard hover:border-border-brand sm:size-[36px]"
                >
                  <ArrowRightIcon size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-lg overflow-hidden rounded-[22px] sm:flex-row">
            {cards.map((card, i) => {
              const imageIndex = HOME_FEATURED.findIndex((f) => f.title === card.title)
              return (
                <Link
                  key={`${slide}-${card.title}`}
                  to={`/events/${'slug' in card && card.slug ? card.slug : slugify(card.title)}`}
                  className={cn('min-w-0 flex-1', i > 0 && 'hidden sm:block')}
                >
                  <FeaturedHeroCard
                    date={card.date}
                    title={card.title}
                    venue={card.venue}
                    rating={card.rating}
                    price={card.price}
                    category={card.category}
                    flag={'flag' in card ? card.flag : undefined}
                    image={
                      'image' in card && card.image
                        ? card.image
                        : HOME_HERO_IMAGES[imageIndex >= 0 ? imageIndex : i]
                    }
                    className="w-full"
                    favourited={'id' in card ? isFavourite(card.id) : false}
                    onToggleFavourite={
                      'id' in card && canFavourite(card.id)
                        ? () => void toggleFavourite(card.id)
                        : undefined
                    }
                  />
                </Link>
              )
            })}
          </div>

          <div className="flex gap-[7px]" role="tablist" aria-label={t('home.featuredSlides')}>
            {featuredSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === slide}
                aria-label={t('home.featuredSlide', { n: i + 1 })}
                onClick={() => setSlide(i)}
                className={cn(
                  'h-[6px] rounded-[3px] transition-[width,background] duration-normal ease-standard',
                  i === slide
                    ? 'w-[28px] bg-brand-gradient'
                    : 'w-[12px] bg-neutral-scrollbar',
                )}
              />
            ))}
          </div>
        </FadeUp>
      </div>
    </PageSection>
  )
}
