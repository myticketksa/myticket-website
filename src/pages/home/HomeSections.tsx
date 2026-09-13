import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ApiRecord as EventApiRecord } from '@/app/api/eventsApi'
import type { ApiRecord as ExperienceApiRecord } from '@/app/api/experiencesApi'
import type { ApiRecord as TalentApiRecord } from '@/app/api/talentsApi'
import {
  AuctionCard,
  EventCard,
  ExperienceCard,
  FeaturedPanelCard,
  TalentCard,
} from '@/components/cards'
import { CategoryChip } from '@/components/data-display'
import { ArrowRightIcon } from '@/components/icons'
import { FadeUp, StaggerGroup } from '@/components/motion'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { mapCategoryLabel } from '@/lib/api/mappers/categories'
import { mapApiEventToCard } from '@/lib/api/mappers/events'
import { mapApiExperienceToCard } from '@/lib/api/mappers/experiences'
import { mapApiTalentToCard } from '@/lib/api/mappers/talents'
import { useEventFavorites } from '@/lib/favorites/useEventFavorites'
import { catalogLabel } from '@/lib/i18n/catalogLabels'
import { slugify } from '@/pages/_guest'
import ctaBand from '@/assets/home/cta-band.jpg'
import driftBlob from '@/assets/home/drift-blob.svg'
import {
  HOME_AUCTIONS,
  HOME_CATEGORIES,
  HOME_EVENTS,
  HOME_EVENT_TABS,
  HOME_EXPERIENCES,
  HOME_FEATURED_PANELS,
  HOME_TALENTS,
  type HomeEventWindow,
} from './home-data'
import {
  HOME_EVENT_IMAGES,
  HOME_EXPERIENCE_IMAGES,
  HOME_FEATURED_PANEL_IMAGES,
  HOME_TALENT_IMAGES,
} from './home-media'
import { HomeSectionHeader } from './HomeSectionHeader'
import { HomeTimeTabs } from './HomeTimeTabs'

/** Limited public talent strip — avatar, name, discipline, rating only. */
export function HomeTalents({ apiTalents }: { apiTalents?: TalentApiRecord[] }) {
  const { t } = useTranslation('catalog')
  const talents = useMemo(() => {
    if (apiTalents && apiTalents.length > 0) {
      return apiTalents.map(mapApiTalentToCard).slice(0, HOME_TALENTS.length)
    }
    return HOME_TALENTS.map((talent) => ({ ...talent, slug: slugify(talent.name) }))
  }, [apiTalents])

  return (
    <PageSection padTop={84} padBottom={0}>
      <FadeUp>
        <HomeSectionHeader
          overline={t('home.talentsOverline')}
          overlineTone="brand"
          heading={t('home.talentsHeading')}
          lede={t('home.talentsLede')}
          link={{ label: t('home.browseAllTalents'), to: '/talents' }}
        />
      </FadeUp>
      <StaggerGroup className="mt-[26px] grid grid-cols-2 gap-[12px] sm:gap-[18px] md:grid-cols-3 lg:grid-cols-5">
        {talents.map((talent, i) => (
          <Link
            key={talent.slug}
            to={`/talents/${talent.slug}`}
            className="min-w-0"
          >
            <TalentCard
              name={talent.name}
              discipline={talent.discipline}
              rating={talent.rating}
              reviews={'reviews' in talent ? talent.reviews : ''}
              city={'city' in talent ? talent.city : ''}
              verified={talent.verified}
              image={'image' in talent && talent.image ? talent.image : HOME_TALENT_IMAGES[i]}
              limited
            />
          </Link>
        ))}
      </StaggerGroup>
    </PageSection>
  )
}

/**
 * Figma `207:4434` — pad-top 72, CategoryChip row.
 * Chips overflow the 1320 band and clip at the page shell edge — no scrollbar
 * (Figma `207:4446` is a static clipped row; "Full taxonomy" is the overflow exit).
 */
export function HomeCategories({ apiCategories }: { apiCategories?: EventApiRecord[] }) {
  const { t } = useTranslation('catalog')
  const categories = useMemo(() => {
    if (apiCategories && apiCategories.length > 0) {
      return apiCategories.slice(0, HOME_CATEGORIES.length).map((row, index) => ({
        label: mapCategoryLabel(row, HOME_CATEGORIES[index]?.label ?? 'Category'),
        count: Number(row.count ?? row.events_count ?? HOME_CATEGORIES[index]?.count ?? 0) || undefined,
      }))
    }
    return HOME_CATEGORIES
  }, [apiCategories])

  return (
    <PageSection padTop={72} padBottom={0}>
      <FadeUp>
        <HomeSectionHeader
          overline={t('home.whatsOn')}
          heading={t('home.browseCategory')}
          lede={t('home.browseCategoryLede')}
          ledeMaxWidth={null}
          link={{ label: t('home.fullTaxonomy'), to: '/events' }}
        />
      </FadeUp>
      <FadeUp className="mt-[22px] -me-page-gutter overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-hidden">
        <div className="flex w-max gap-[9px] pr-page-gutter sm:w-auto">
          {categories.map((cat) => (
            <CategoryChip
              key={cat.label}
              href={`/events?category=${encodeURIComponent(cat.label)}`}
              count={cat.count}
              className="shrink-0"
            >
              {catalogLabel(t, cat.label)}
            </CategoryChip>
          ))}
        </div>
      </FadeUp>
    </PageSection>
  )
}

function matchesEventWindow(
  window: HomeEventWindow,
  tab: (typeof HOME_EVENT_TABS)[number],
) {
  if (tab === 'All') return true
  if (tab === 'Today') return window === 'today'
  if (tab === 'This weekend') return window === 'weekend'
  if (tab === 'This week') return window === 'week' || window === 'weekend' || window === 'today'
  if (tab === 'This month') return true
  return true
}

/** Figma `207:4459` — pad-top 60, time tabs + 2×4 EventCard Home. */
export function HomeEvents({ apiEvents }: { apiEvents?: EventApiRecord[] }) {
  const { t } = useTranslation('catalog')
  const [tab, setTab] = useState<(typeof HOME_EVENT_TABS)[number]>('All')
  const { isFavourite, toggleFavourite, canFavourite } = useEventFavorites()

  const events = useMemo(() => {
    if (apiEvents && apiEvents.length > 0) {
      return apiEvents.map(mapApiEventToCard).slice(0, HOME_EVENTS.length)
    }
    return HOME_EVENTS.map((e) => ({ ...e, slug: slugify(e.title) }))
  }, [apiEvents])

  const filtered = useMemo(() => {
    if (apiEvents && apiEvents.length > 0) return events
    return events.filter((event) =>
      'window' in event ? matchesEventWindow(event.window, tab) : true,
    )
  }, [apiEvents, events, tab])

  return (
    <PageSection padTop={60} padBottom={0}>
      <FadeUp>
        <HomeSectionHeader
          overline={t('home.onSaleNow')}
          heading={t('home.eventsHeading')}
          lede={t('home.eventsCountMoment', { count: filtered.length })}
          trailing={<HomeTimeTabs value={tab} onChange={setTab} />}
        />
      </FadeUp>
      <StaggerGroup className="mt-[22px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((event, i) => (
          <Link
            key={event.slug}
            to={`/events/${event.slug}`}
            className="min-w-0"
          >
            <EventCard
              context="home"
              date={event.date}
              title={event.title}
              venue={event.venue}
              rating={event.rating}
              attendance={event.attendance}
              price={event.price}
              category={'category' in event ? event.category : undefined}
              flag={'flag' in event ? event.flag : undefined}
              image={'image' in event && event.image ? event.image : HOME_EVENT_IMAGES[i]}
              favourited={'id' in event ? isFavourite(event.id) : false}
              onToggleFavourite={
                'id' in event && canFavourite(event.id)
                  ? () => void toggleFavourite(event.id)
                  : undefined
              }
            />
          </Link>
        ))}
      </StaggerGroup>
    </PageSection>
  )
}

/**
 * Figma `207:4490` — pad-top 76. Pastel panel (radius 28) with a local 46px heading —
 * not `HomeSectionHeader` / `SectionHeader` — plus 3× FeaturedPanelCard.
 */
export function HomeFeatured({
  apiAds,
  apiEvents,
}: {
  apiAds?: EventApiRecord[]
  apiEvents?: EventApiRecord[]
}) {
  const { t } = useTranslation('catalog')
  const panels = useMemo(() => {
    const fromAds = (apiAds ?? []).slice(0, 3).map((ad, i) => {
      const fallback = HOME_FEATURED_PANELS[i]!
      const title = String(ad.title ?? ad.name ?? fallback.title)
      return {
        date: String(ad.date ?? ad.meta ?? fallback.date),
        title,
        venue: String(ad.venue ?? ad.location ?? ad.subtitle ?? fallback.venue),
        price: String(ad.price ?? ad.price_label ?? fallback.price),
        meta: String(ad.rating_label ?? ad.meta ?? fallback.meta),
        image: String(ad.image ?? ad.cover ?? ad.banner ?? '') || HOME_FEATURED_PANEL_IMAGES[i],
        href: `/events/${slugify(title)}`,
      }
    })
    if (fromAds.length >= 3) return fromAds

    const fromEvents = (apiEvents ?? []).slice(0, 3).map((event, i) => {
      const fallback = HOME_FEATURED_PANELS[i]!
      const mapped = mapApiEventToCard(event)
      return {
        date: mapped.date || fallback.date,
        title: mapped.title,
        venue: mapped.venue || fallback.venue,
        price: mapped.price.startsWith('From') ? mapped.price : `From ${mapped.price}`,
        meta: mapped.rating !== '—' ? `${mapped.rating} · ${mapped.attendance || 'going'}` : fallback.meta,
        image: mapped.image || HOME_FEATURED_PANEL_IMAGES[i],
        href: `/events/${mapped.slug}`,
      }
    })
    if (fromEvents.length >= 3) return fromEvents

    return HOME_FEATURED_PANELS.map((panel, i) => ({
      ...panel,
      image: HOME_FEATURED_PANEL_IMAGES[i],
      href: `/events/${slugify(panel.title)}`,
    }))
  }, [apiAds, apiEvents])

  return (
    <PageSection padTop={76} padBottom={0}>
      <FadeUp>
      <div
        className="relative flex flex-col gap-[28px] overflow-hidden rounded-[28px] border border-[#f7dfd3] bg-home-featured px-lg pt-3xl pb-3xl sm:px-[46px] sm:pt-[46px] sm:pb-[50px]"
      >
        <img
          src={driftBlob}
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-[-181px] end-[-21px] size-[520px]"
        />

        <div className="relative flex flex-col items-start gap-md sm:flex-row sm:items-end sm:justify-between sm:gap-4xl">
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="text-label-overline text-brand-gradient-end uppercase">
              {t('home.curatedBy')}
            </p>
            <h2 className="mt-[10px] text-[28px] font-bold tracking-[-0.03em] text-ink-primary sm:text-heading-h1">
              {t('home.featuredEvents')}
            </h2>
          </div>
          <Link
            to="/events?featured=1"
            className="group/link relative flex shrink-0 items-center gap-[5px] text-[14px] font-bold text-brand-gradient-end transition-colors duration-fast ease-standard hover:text-ink-brand"
          >
            {t('home.seeFullSelection')}
            <ArrowRightIcon
              size={14}
              className="shrink-0 transition-transform duration-fast ease-standard group-hover/link:translate-x-0.5 motion-reduce:group-hover/link:translate-x-0"
            />
          </Link>
        </div>

        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-3">
          {panels.map((panel) => (
            <Link key={panel.title} to={panel.href} className="min-w-0">
              <FeaturedPanelCard
                date={panel.date}
                title={panel.title}
                venue={panel.venue}
                price={panel.price}
                meta={panel.meta}
                image={panel.image}
              />
            </Link>
          ))}
        </div>
      </div>
      </FadeUp>
    </PageSection>
  )
}

/** Figma `207:4505` — pad-top 88, 4× AuctionCard. */
export function HomeAuctions() {
  const { t } = useTranslation('catalog')
  return (
    <PageSection padTop={88} padBottom={0}>
      <FadeUp>
        <HomeSectionHeader
          overline={t('home.auctionsOverline')}
          heading={t('home.auctionsHeading')}
          lede={t('home.auctionsLede')}
          ledeMaxWidth={560}
          link={{ label: t('home.allAuctionListings'), to: '/auctions' }}
        />
      </FadeUp>
      <StaggerGroup className="mt-[22px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_AUCTIONS.map((auction) => (
          <Link
            key={auction.title}
            to={`/auctions/${slugify(auction.title)}`}
            className="min-w-0"
          >
            <AuctionCard {...auction} className="h-[214px]" />
          </Link>
        ))}
      </StaggerGroup>
    </PageSection>
  )
}

/** Figma `207:4522` — pad-top 88, 4× ExperienceCard Home. */
export function HomeExperiences({ apiExperiences }: { apiExperiences?: ExperienceApiRecord[] }) {
  const { t } = useTranslation('catalog')
  const experiences = useMemo(() => {
    if (apiExperiences && apiExperiences.length > 0) {
      return apiExperiences.map(mapApiExperienceToCard).slice(0, HOME_EXPERIENCES.length)
    }
    return HOME_EXPERIENCES.map((e) => ({ ...e, slug: slugify(e.title) }))
  }, [apiExperiences])

  return (
    <PageSection padTop={88} padBottom={0}>
      <FadeUp>
        <HomeSectionHeader
          overline={t('home.experiencesOverline')}
          heading={t('home.experiencesHeading')}
          lede={t('home.experiencesLede')}
          ledeMaxWidth={null}
          link={{ label: t('home.browseAllExperiences'), to: '/experiences' }}
        />
      </FadeUp>
      <StaggerGroup className="mt-[22px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {experiences.map((experience, i) => (
          <Link
            key={experience.slug}
            to={`/experiences/${experience.slug}`}
            className="min-w-0"
          >
            <ExperienceCard
              context="home"
              title={experience.title}
              location={experience.location}
              category={'category' in experience ? experience.category : undefined}
              summary={'summary' in experience ? experience.summary : undefined}
              rating={experience.rating}
              reviews={'reviews' in experience ? experience.reviews : undefined}
              image={'image' in experience && experience.image ? experience.image : HOME_EXPERIENCE_IMAGES[i]}
            />
          </Link>
        ))}
      </StaggerGroup>
    </PageSection>
  )
}

/**
 * Figma `207:4579` — pad-top 96. Radius-28 band with brand gradient, photo overlay,
 * dark left wash, Display/CTA 50px, white + outline h52 pills.
 */
export function HomeCta() {
  const navigate = useNavigate()
  const { t } = useTranslation(['catalog', 'common'])

  return (
    <PageSection padTop={96} padBottom={0}>
      <FadeUp distance={0} scaleFrom={0.98}>
        <div className="relative overflow-hidden rounded-[28px]">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(153deg, var(--color-brand-gradient-start) 13%, var(--color-ink-brand) 50%, var(--color-ink-brand-strong) 87%)',
            }}
          />
          <img
            src={ctaBand}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover opacity-90 mix-blend-overlay"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(121deg, color-mix(in srgb, var(--color-ink-primary) 90%, transparent) 29%, color-mix(in srgb, var(--color-ink-brand-strong) 42%, transparent) 93%)',
            }}
          />

          <div className="relative flex max-w-[772px] flex-col px-xl py-3xl sm:px-[56px] sm:py-[70px]">
            <h2 className="text-[32px] leading-[1.12] font-bold tracking-[-0.03em] text-ink-inverse sm:text-[40px] lg:text-display-cta">
              {t('home.ctaHeading')}
            </h2>
            <p className="mt-lg text-[17px] leading-[1.55] font-medium text-ink-inverse">
              {t('home.ctaLede')}
            </p>
            <div className="mt-[30px] flex flex-wrap gap-md">
              <Button
                size="lg"
                className="h-[52px] rounded-[26px] bg-surface-default px-[28px] text-[15px] font-bold text-ink-primary hover:bg-surface-default"
                onClick={() => navigate('/register')}
              >
                {t('home.ctaCreateAccount')}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="h-[52px] rounded-[26px] border-[1.5px] border-ink-inverse bg-transparent px-[28px] text-[15px] font-bold text-ink-inverse hover:border-ink-inverse hover:text-ink-inverse"
                onClick={() => navigate('/sign-in')}
              >
                {t('common:actions.signIn')}
              </Button>
            </div>
          </div>
        </div>
      </FadeUp>
    </PageSection>
  )
}

/** Guest business strip — partnerships + Vendor/Talent submit forms (no marketplace). */
export function HomeBusinessStrip() {
  const { t } = useTranslation('catalog')
  return (
    <PageSection padTop={72} padBottom={96}>
      <div className="flex flex-col items-start gap-lg overflow-hidden rounded-[16px] border border-border-default bg-surface-default px-2xl py-lg sm:flex-row sm:items-center">
        <p className="min-w-0 flex-1 text-[14px] leading-normal text-ink-muted">
          <span className="font-bold text-ink-primary">{t('home.businessLead')}</span>
          <span className="text-ink-secondary">
            {' '}
            {t('home.businessBody')}
          </span>
        </p>
        <div className="flex shrink-0 flex-wrap gap-lg text-[13.5px] font-bold text-brand-identity-end">
          <Link to="/for-organizers">{t('home.forOrganizers')}</Link>
          <Link to="/for-talents">{t('home.forTalents')}</Link>
          <Link to="/for-vendors">{t('home.forVendors')}</Link>
        </div>
      </div>
    </PageSection>
  )
}
