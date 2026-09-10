import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  SearchIcon,
} from '@/components/icons'
import { FeaturedHeroCard } from '@/components/cards'
import { PopularChip } from '@/components/data-display'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'
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

const FEATURED_SLIDES = [
  HOME_FEATURED.slice(0, 2),
  [HOME_FEATURED[1]!, HOME_FEATURED[0]!],
  HOME_FEATURED.slice(0, 2),
] as const

const REGION_OPTIONS = [
  'All Saudi Arabia',
  'Riyadh',
  'Jeddah',
  'Dammam',
] as const

export function HomeHero() {
  const [slide, setSlide] = useState(0)
  const [region, setRegion] = useState<(typeof REGION_OPTIONS)[number]>('All Saudi Arabia')
  const cards = FEATURED_SLIDES[slide] ?? FEATURED_SLIDES[0]
  const slideCount = FEATURED_SLIDES.length

  const goPrev = () => setSlide((s) => (s - 1 + slideCount) % slideCount)
  const goNext = () => setSlide((s) => (s + 1) % slideCount)

  const searchPlaceholder =
    region === 'All Saudi Arabia'
      ? 'Search events, experiences, talents and vendors'
      : `Search in ${region}`

  return (
    <PageSection
      padTop={60}
      padBottom={0}
      className="relative overflow-hidden bg-bg-page"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 1100px 620px at 8% -10%, color-mix(in srgb, var(--color-brand-primary) 22%, transparent), transparent 62%), radial-gradient(ellipse 900px 560px at 96% 4%, color-mix(in srgb, var(--color-brand-primary) 14%, transparent), transparent 60%)',
      }}
    >
      <div className="flex flex-col gap-[52px] lg:flex-row lg:items-start">
        <div className="flex w-full max-w-[675px] flex-col pt-xl">
          <div
            className="inline-flex w-fit items-center gap-[9px] rounded-[22px] bg-identity-gradient py-[7px] pr-[15px] pl-[11px] text-[13px] font-bold text-ink-inverse shadow-[0px_8px_22px_-10px_color-mix(in_srgb,var(--color-brand-primary)_75%,transparent)]"
          >
            <span className="size-[7px] rounded-pill bg-ink-inverse" aria-hidden />
            1,284 events live across the Kingdom right now
          </div>

          <h1 className="text-display-hero-xl mt-[26px] text-ink-primary">
            <span className="block">Everything happening</span>
            <span className="block">in Saudi Arabia,</span>
            <span
              className="block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, var(--color-brand-gradient-start) 0%, var(--color-ink-brand) 46%, var(--color-ink-brand-strong) 100%)',
              }}
            >
              in one place.
            </span>
          </h1>

          <p className="mt-2xl max-w-[480px] text-[18px] leading-[1.55] font-medium text-ink-secondary">
            Concerts, matches, festivals, conferences and the people who make them happen.
            Find it, book it, and hold your ticket here.
          </p>

          <form
            action="/search"
            className="mt-3xl flex w-full flex-col gap-[10px] rounded-[20px] border border-border-default bg-surface-default p-sm shadow-[0px_22px_48px_-24px_color-mix(in_srgb,var(--color-brand-primary)_55%,transparent),0px_2px_4px_0px_color-mix(in_srgb,var(--color-ink-primary)_4%,transparent)] sm:flex-row sm:items-center"
          >
            <label className="flex min-w-0 flex-1 items-center gap-md px-lg py-[10px]">
              <SearchIcon size={19} className="shrink-0 text-brand-primary" />
              <input
                name="q"
                placeholder={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-[16px] font-medium text-ink-primary outline-none placeholder:text-ink-muted"
              />
            </label>
            <span className="hidden h-[28px] w-px bg-border-default sm:block" />
            <label className="relative flex h-[58px] shrink-0 items-center gap-sm px-[14px]">
              <span className="sr-only">Region</span>
              <select
                name="region"
                value={region}
                onChange={(e) =>
                  setRegion(e.target.value as (typeof REGION_OPTIONS)[number])
                }
                className="appearance-none bg-transparent pr-lg text-[15px] font-semibold text-ink-secondary outline-none cursor-pointer"
              >
                {REGION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                size={12}
                className="pointer-events-none absolute right-[14px] text-ink-primary"
              />
            </label>
            <button
              type="submit"
              className="flex h-[58px] shrink-0 items-center justify-center rounded-[14px] bg-identity-gradient px-[30px] text-[15px] font-bold text-ink-inverse shadow-[0px_8px_20px_-8px_color-mix(in_srgb,var(--color-brand-primary)_75%,transparent)]"
            >
              Search
            </button>
          </form>

          <div className="mt-[18px] flex flex-wrap items-center gap-sm">
            <span className="text-[13px] font-semibold text-ink-muted">Popular</span>
            {HOME_POPULAR.map((term) => (
              <PopularChip key={term} href={`/search?q=${encodeURIComponent(term)}`}>
                {term}
              </PopularChip>
            ))}
          </div>
        </div>

        <div className="flex w-full max-w-[593px] flex-col gap-[14px]">
          <div className="flex h-[36px] items-center justify-between">
            <p className="text-label-overline text-brand-gradient-end">Featured this week</p>
            {/* Figma `207:4402` — flat 8px gap: link text, 13px arrow, then 36×36 prev/next. */}
            <div className="flex items-center gap-sm">
              <Link
                to="/events"
                className="flex items-center gap-sm text-[13px] font-bold text-brand-gradient-end"
              >
                See all featured
                <ArrowRightIcon size={13} className="shrink-0" />
              </Link>
              <button
                type="button"
                aria-label="Previous featured"
                onClick={goPrev}
                className="flex size-[36px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] border-[1.5px] border-border-default bg-surface-default text-ink-primary transition-colors duration-normal ease-standard hover:border-border-brand"
              >
                <ArrowLeftIcon size={14} />
              </button>
              <button
                type="button"
                aria-label="Next featured"
                onClick={goNext}
                className="flex size-[36px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] border-[1.5px] border-border-default bg-surface-default text-ink-primary transition-colors duration-normal ease-standard hover:border-border-brand"
              >
                <ArrowRightIcon size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-lg overflow-hidden rounded-[22px] sm:flex-row">
            {cards.map((card, i) => {
              const imageIndex = HOME_FEATURED.findIndex((f) => f.title === card.title)
              return (
                <Link
                  key={`${slide}-${card.title}`}
                  to={`/events/${slugify(card.title)}`}
                  className="min-w-0 flex-1"
                >
                  <FeaturedHeroCard
                    {...card}
                    image={HOME_HERO_IMAGES[imageIndex >= 0 ? imageIndex : i]}
                    className="w-full"
                  />
                </Link>
              )
            })}
          </div>

          <div className="flex gap-[7px]" role="tablist" aria-label="Featured slides">
            {FEATURED_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === slide}
                aria-label={`Featured slide ${i + 1}`}
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
        </div>
      </div>
    </PageSection>
  )
}
