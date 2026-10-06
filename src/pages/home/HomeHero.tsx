import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AdRecord } from '@/components/ads'
import { asAdText, partitionAds } from '@/components/ads'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  SearchIcon,
} from '@/components/icons'
import { FadeUp } from '@/components/motion'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

/**
 * Home Hero — copy + search + image-ad slider (replaces Featured this week).
 *
 * Ad layout:
 * - Side column (`xl+`) and phones: one full-width card per slide (never skinny twins).
 * - Tablet stacked band (`sm`–`lg`): two side-by-side cards when width allows.
 */

const REGION_OPTIONS = [
  { value: 'All Saudi Arabia', key: 'all' as const },
  { value: 'Riyadh', key: 'riyadh' as const },
  { value: 'Jeddah', key: 'jeddah' as const },
  { value: 'Dammam', key: 'dammam' as const },
]

const AUTO_MS = 5000

/** Pair ads only while the media block is full-bleed under the copy (640–1279). */
function usePairHeroAds() {
  const [pair, setPair] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 640px) and (max-width: 1279px)').matches
      : false,
  )

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 640px) and (max-width: 1279px)')
    const onChange = () => setPair(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return pair
}

function HeroAdCard({
  ad,
  className,
  paired,
}: {
  ad: AdRecord
  className?: string
  /** Two-up tablet layout. */
  paired?: boolean
}) {
  const title = asAdText(ad.title)
  const description = asAdText(ad.description)
  const image = asAdText(ad.image)

  return (
    <article
      className={cn(
        'group relative flex w-full shrink-0 flex-col items-start justify-end overflow-hidden rounded-[20px] border border-border-default bg-bg-skeleton p-[14px] sm:rounded-[22px] sm:p-[16px]',
        // Wide media frame, height-capped — portrait creatives crop via object-cover.
        paired
          ? 'h-[280px] min-w-0 flex-1 sm:h-[320px]'
          : 'h-[240px] sm:h-[300px] xl:h-[380px]',
        className,
      )}
    >
      {image ? (
        <img
          src={image}
          alt={title || ''}
          className="absolute inset-0 size-full object-cover object-center transition-transform duration-slow ease-standard group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(25,16,8,0.08)_0%,rgba(25,16,8,0)_28%,rgba(25,16,8,0.55)_68%,rgba(25,16,8,0.92)_100%)]" />
      {(title || description) && (
        <div className="relative z-[1] flex w-full min-w-0 flex-col">
          {title ? (
            <p className="line-clamp-2 text-[16px] leading-[1.2] font-bold text-balance text-ink-inverse sm:text-[18px]">
              {title}
            </p>
          ) : null}
          {description ? (
            <p className="mt-[4px] line-clamp-2 text-[12px] font-medium text-ink-inverse/90 sm:text-[13px]">
              {description}
            </p>
          ) : null}
        </div>
      )}
    </article>
  )
}

export function HomeHero({ apiAds }: { apiAds?: AdRecord[] }) {
  const { t } = useTranslation(['catalog', 'common'])
  const [slide, setSlide] = useState(0)
  const [region, setRegion] = useState(REGION_OPTIONS[0]!.value)
  const [paused, setPaused] = useState(false)
  const pairAds = usePairHeroAds()

  const imageAds = useMemo(() => partitionAds(apiAds).images, [apiAds])
  const single = imageAds.length === 1
  const usePairs = !single && pairAds

  /** One card per slide by default; tablet full-bleed uses current+next pairs. */
  const slides = useMemo(() => {
    if (imageAds.length < 2) return [] as AdRecord[][]
    if (!usePairs) return imageAds.map((ad) => [ad])
    return imageAds.map((_, i) => [
      imageAds[i]!,
      imageAds[(i + 1) % imageAds.length]!,
    ])
  }, [imageAds, usePairs])

  const slideCount = single ? 1 : slides.length
  const current = slides[slide] ?? slides[0]

  useEffect(() => {
    setSlide(0)
  }, [imageAds.length, usePairs])

  useEffect(() => {
    if (slideCount < 2 || paused) return
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % slideCount)
    }, AUTO_MS)
    return () => window.clearInterval(id)
  }, [slideCount, paused])

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
      className="relative overflow-hidden bg-bg-page pt-3xl sm:pt-[48px] xl:pt-[60px]"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 1100px 620px at 8% -10%, color-mix(in srgb, var(--color-brand-primary) 22%, transparent), transparent 62%), radial-gradient(ellipse 900px 560px at 96% 4%, color-mix(in srgb, var(--color-brand-primary) 14%, transparent), transparent 60%)',
      }}
    >
      <div className="flex flex-col gap-3xl xl:flex-row xl:items-start xl:gap-[52px]">
        <div className="flex w-full min-w-0 flex-1 flex-col xl:max-w-[675px] xl:pt-xl">
          <FadeUp inView={false} delay={0.1} distance={12}>
            <h1 className="max-w-[560px] text-[32px] leading-[1.1] font-bold tracking-[-0.04em] text-balance text-ink-primary sm:text-[42px] sm:leading-[1.08] xl:text-display-hero-xl">
              {t('home.heroTitle')}
            </h1>

            <p className="mt-lg max-w-[480px] text-[16px] leading-[1.55] font-medium text-pretty text-ink-secondary sm:mt-2xl sm:text-[18px]">
              {t('home.heroLede')}
            </p>
          </FadeUp>

          <FadeUp inView={false} delay={0.2} distance={8}>
            <form
              action="/search"
              className="mt-2xl flex w-full flex-col overflow-hidden rounded-[20px] border border-border-default bg-surface-default shadow-[0px_22px_48px_-24px_color-mix(in_srgb,var(--color-brand-primary)_55%,transparent),0px_2px_4px_0px_color-mix(in_srgb,var(--color-ink-primary)_4%,transparent)] lg:mt-3xl lg:flex-row lg:items-center lg:gap-[10px] lg:p-sm"
            >
              <label className="flex min-h-[52px] min-w-0 flex-1 items-center gap-md border-b border-border-default px-lg py-[12px] lg:min-h-0 lg:border-b-0 lg:py-[10px]">
                <SearchIcon size={19} className="shrink-0 text-brand-primary" />
                <input
                  name="q"
                  placeholder={searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-[16px] font-medium text-ink-primary outline-none placeholder:truncate placeholder:text-ink-muted"
                />
              </label>
              <span className="hidden h-[28px] w-px shrink-0 bg-border-default lg:block" />
              <div className="flex items-stretch gap-sm p-sm lg:contents lg:p-0">
                <label className="relative flex min-h-[48px] min-w-0 flex-1 items-center gap-sm rounded-[14px] bg-bg-page px-[14px] lg:h-[58px] lg:max-w-[11.5rem] lg:flex-none lg:rounded-none lg:bg-transparent">
                  <span className="sr-only">{t('home.region')}</span>
                  <select
                    name="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full min-w-0 appearance-none truncate bg-transparent pe-lg text-[14px] font-semibold text-ink-secondary outline-none cursor-pointer lg:text-[15px]"
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
                  className="flex h-[48px] shrink-0 items-center justify-center rounded-[14px] bg-identity-gradient px-[22px] text-[15px] font-bold text-ink-inverse shadow-[0px_8px_20px_-8px_color-mix(in_srgb,var(--color-brand-primary)_75%,transparent)] lg:h-[58px] lg:px-[30px]"
                >
                  {t('common:actions.search')}
                </button>
              </div>
            </form>
          </FadeUp>
        </div>

        {imageAds.length > 0 ? (
          <FadeUp
            inView={false}
            delay={0.3}
            distance={16}
            className="flex w-full min-w-0 flex-col gap-[14px] xl:w-[min(100%,520px)] xl:max-w-[520px] xl:shrink-0"
          >
            <div className="flex flex-col gap-md sm:h-[36px] sm:flex-row sm:items-center sm:justify-between sm:gap-sm">
              <p className="text-label-overline text-brand-gradient-end">
                {t('home.adsImagesHeading')}
              </p>
              {!single ? (
                <div className="flex items-center justify-end gap-sm">
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
              ) : null}
            </div>

            <div
              className="w-full"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={() => setPaused(false)}
            >
              {single && imageAds[0] ? (
                <HeroAdCard ad={imageAds[0]} />
              ) : current ? (
                <div
                  className={cn(
                    'flex gap-md',
                    usePairs ? 'flex-row' : 'flex-col',
                  )}
                >
                  {current.map((ad, i) => (
                    <HeroAdCard
                      key={`${slide}-${String(ad.id ?? ad.image)}-${i}`}
                      ad={ad}
                      paired={usePairs}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {!single && slideCount > 1 ? (
              <div className="flex gap-[7px]" role="tablist" aria-label={t('home.featuredSlides')}>
                {slides.map((_, i) => (
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
            ) : null}
          </FadeUp>
        ) : null}
      </div>
    </PageSection>
  )
}
