import { Link } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  SearchIcon,
} from '@/components/icons'
import { FeaturedHeroCard } from '@/components/cards'
import { PopularChip } from '@/components/data-display'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
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
export function HomeHero() {
  return (
    <PageSection
      padTop={60}
      padBottom={0}
      className="relative overflow-hidden bg-bg-page"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 1100px 620px at 8% -10%, rgba(242,95,44,0.22), transparent 62%), radial-gradient(ellipse 900px 560px at 96% 4%, rgba(242,95,44,0.14), transparent 60%)',
      }}
    >
      <div className="flex flex-col gap-[52px] lg:flex-row lg:items-start">
        <div className="flex w-full max-w-[675px] flex-col pt-xl">
          <div
            className="inline-flex w-fit items-center gap-[9px] rounded-[22px] bg-identity-gradient py-[7px] pr-[15px] pl-[11px] text-[13px] font-bold text-ink-inverse shadow-[0px_8px_22px_-10px_rgba(242,95,44,0.75)]"
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
            className="mt-3xl flex w-full flex-col gap-[10px] rounded-[20px] border border-border-default bg-surface-default p-sm shadow-[0px_22px_48px_-24px_rgba(242,95,44,0.55),0px_2px_4px_0px_rgba(25,16,8,0.04)] sm:flex-row sm:items-center"
          >
            <label className="flex min-w-0 flex-1 items-center gap-md px-lg py-[10px]">
              <SearchIcon size={19} className="shrink-0 text-brand-primary" />
              <input
                name="q"
                placeholder="Search events, experiences, talents and vendors"
                className="min-w-0 flex-1 bg-transparent text-[16px] font-medium text-ink-primary outline-none placeholder:text-ink-muted"
              />
            </label>
            <span className="hidden h-[28px] w-px bg-border-default sm:block" />
            <button
              type="button"
              className="flex h-[58px] shrink-0 items-center gap-sm px-[14px] text-[15px] font-semibold text-ink-secondary"
            >
              All Saudi Arabia
              <ChevronDownIcon size={12} />
            </button>
            <button
              type="submit"
              className="flex h-[58px] shrink-0 items-center justify-center rounded-[14px] bg-identity-gradient px-[30px] text-[15px] font-bold text-ink-inverse shadow-[0px_8px_20px_-8px_rgba(242,95,44,0.75)]"
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
          <div className="flex items-center justify-between">
            <p className="text-label-overline text-brand-gradient-end">Featured this week</p>
            <div className="flex items-center gap-sm">
              <Link
                to="/events"
                className="flex items-center gap-[5px] text-[13px] font-bold text-brand-gradient-end"
              >
                See all featured
                <ArrowRightIcon size={13} />
              </Link>
              <Button variant="icon" size="sm" aria-label="Previous featured">
                <ArrowLeftIcon size={14} />
              </Button>
              <Button variant="icon" size="sm" aria-label="Next featured">
                <ArrowRightIcon size={14} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-lg overflow-hidden rounded-[22px] sm:grid-cols-2">
            {HOME_FEATURED.map((card, i) => (
              <FeaturedHeroCard
                key={card.title}
                {...card}
                image={HOME_HERO_IMAGES[i]}
                className="w-full"
              />
            ))}
          </div>

          <div className="flex gap-[7px]" aria-hidden>
            <span className="h-[6px] w-[28px] rounded-[3px] bg-brand-gradient" />
            <span className="h-[6px] w-[12px] rounded-[3px] bg-neutral-scrollbar" />
            <span className="h-[6px] w-[12px] rounded-[3px] bg-neutral-scrollbar" />
          </div>
        </div>
      </div>
    </PageSection>
  )
}
