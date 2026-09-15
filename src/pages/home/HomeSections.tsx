import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ApiRecord as EventApiRecord } from '@/app/api/eventsApi'
import type { ApiRecord as ExperienceApiRecord } from '@/app/api/experiencesApi'
import type { ApiRecord as TalentApiRecord } from '@/app/api/talentsApi'
import {
  EventCard,
  ExperienceCard,
  FeaturedPanelCard,
  TalentCard,
} from '@/components/cards'
import { CategoryChip } from '@/components/data-display'
import { ArrowRightIcon } from '@/components/icons'
import { FadeUp } from '@/components/motion'
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui'
import { PageSection } from '@/layouts'
import { mapCategoryLabel } from '@/lib/api/mappers/categories'
import { mapApiEventToCard } from '@/lib/api/mappers/events'
import { mapApiExperienceToCard, type MappedExperience } from '@/lib/api/mappers/experiences'
import { mapApiTalentToCard } from '@/lib/api/mappers/talents'
import { useEventFavorites } from '@/lib/favorites/useEventFavorites'
import { catalogLabel } from '@/lib/i18n/catalogLabels'
import { slugify } from '@/pages/_guest'
import ctaBand from '@/assets/home/cta-band.jpg'
import driftBlob from '@/assets/home/drift-blob.svg'
import {
  HOME_CATEGORIES,
  HOME_EVENTS,
  HOME_EXPERIENCES,
  HOME_FEATURED_PANELS,
  HOME_TALENTS,
} from './home-data'
import {
  HOME_EVENT_IMAGES,
  HOME_EXPERIENCE_IMAGES,
  HOME_FEATURED_PANEL_IMAGES,
  HOME_TALENT_IMAGES,
} from './home-media'
import { HomeSectionHeader } from './HomeSectionHeader'

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
      <div className="relative mt-[26px]">
        <Carousel opts={{ align: 'start', loop: talents.length > 3 }}>
          <CarouselContent>
            {talents.map((talent, i) => (
              <CarouselItem
                key={talent.slug}
                className="basis-[70%] sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
              >
                <Link to={`/talents/${talent.slug}`} className="block min-w-0">
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
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:inline-flex" />
          <CarouselNext className="hidden sm:inline-flex" />
        </Carousel>
      </div>
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

/** Figma `207:4459` — upcoming events carousel (no time tabs). */
export function HomeEvents({ apiEvents }: { apiEvents?: EventApiRecord[] }) {
  const { t } = useTranslation('catalog')
  const { isFavourite, toggleFavourite, canFavourite } = useEventFavorites()

  const events = useMemo(() => {
    if (apiEvents && apiEvents.length > 0) {
      return apiEvents.map(mapApiEventToCard).slice(0, HOME_EVENTS.length)
    }
    return HOME_EVENTS.map((e) => ({
      ...e,
      slug: slugify(e.title),
      isFree: e.price === 'Free',
    }))
  }, [apiEvents])

  return (
    <PageSection padTop={60} padBottom={0}>
      <FadeUp>
        <HomeSectionHeader
          overline={t('home.onSaleNow')}
          heading={t('home.eventsHeading')}
          lede={t('home.eventsCountMoment', { count: events.length })}
        />
      </FadeUp>
      <EventCarousel
        events={events}
        isFavourite={isFavourite}
        toggleFavourite={toggleFavourite}
        canFavourite={canFavourite}
      />
    </PageSection>
  )
}

/** Free events rail — directly under upcoming; hidden when empty. */
export function HomeFreeEvents({ apiEvents }: { apiEvents?: EventApiRecord[] }) {
  const { t } = useTranslation('catalog')
  const { isFavourite, toggleFavourite, canFavourite } = useEventFavorites()

  const freeEvents = useMemo(() => {
    if (apiEvents && apiEvents.length > 0) {
      return apiEvents
        .map(mapApiEventToCard)
        .filter((event) => event.isFree)
        .slice(0, 8)
    }
    return HOME_EVENTS.filter((e) => e.price === 'Free').map((e) => ({
      ...e,
      slug: slugify(e.title),
      isFree: true as const,
    }))
  }, [apiEvents])

  if (freeEvents.length === 0) return null

  return (
    <PageSection padTop={60} padBottom={0}>
      <FadeUp>
        <HomeSectionHeader
          overline={t('home.freeEventsOverline')}
          heading={t('home.freeEventsHeading')}
          lede={t('home.freeEventsLede', { count: freeEvents.length })}
          link={{ label: t('home.seeAllFreeEvents'), to: '/events?free=1' }}
        />
      </FadeUp>
      <EventCarousel
        events={freeEvents}
        isFavourite={isFavourite}
        toggleFavourite={toggleFavourite}
        canFavourite={canFavourite}
      />
    </PageSection>
  )
}

type CarouselEvent = ReturnType<typeof mapApiEventToCard> | {
  slug: string
  date: string
  title: string
  venue: string
  rating: string
  attendance: string
  price: string
  category?: string
  flag?: string
  image?: string
  id?: string
  isFree?: boolean
}

function EventCarousel({
  events,
  isFavourite,
  toggleFavourite,
  canFavourite,
}: {
  events: CarouselEvent[]
  isFavourite: (id: unknown) => boolean
  toggleFavourite: (id: unknown) => void | Promise<boolean | void>
  canFavourite: (id: unknown) => boolean
}) {
  return (
    <div className="relative mt-[22px]">
      <Carousel opts={{ align: 'start', loop: events.length > 3 }}>
        <CarouselContent>
          {events.map((event, i) => (
            <CarouselItem
              key={event.slug}
              className="basis-[85%] sm:basis-1/2 lg:basis-1/4"
            >
              <Link to={`/events/${event.slug}`} className="block min-w-0">
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
                  favourited={'id' in event && event.id ? isFavourite(event.id) : false}
                  onToggleFavourite={
                    'id' in event && event.id && canFavourite(event.id)
                      ? () => void toggleFavourite(event.id!)
                      : undefined
                  }
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:inline-flex" />
        <CarouselNext className="hidden sm:inline-flex" />
      </Carousel>
    </div>
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

        <div className="relative">
          <Carousel opts={{ align: 'start', loop: panels.length > 2 }}>
            <CarouselContent>
              {panels.map((panel) => (
                <CarouselItem key={panel.title} className="basis-[90%] sm:basis-1/2 md:basis-1/3">
                  <Link to={panel.href} className="block min-w-0">
                    <FeaturedPanelCard
                      date={panel.date}
                      title={panel.title}
                      venue={panel.venue}
                      price={panel.price}
                      meta={panel.meta}
                      image={panel.image}
                    />
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:inline-flex" />
            <CarouselNext className="hidden sm:inline-flex" />
          </Carousel>
        </div>
      </div>
      </FadeUp>
    </PageSection>
  )
}

/** Home experience rails — attractions first, then activities (API `type`). */
export function HomeExperiences({ apiExperiences }: { apiExperiences?: ExperienceApiRecord[] }) {
  const { t } = useTranslation('catalog')

  const mapped = useMemo((): MappedExperience[] => {
    if (apiExperiences && apiExperiences.length > 0) {
      return apiExperiences.map(mapApiExperienceToCard)
    }
    return HOME_EXPERIENCES.map((e) => ({
      title: e.title,
      location: e.location,
      category: e.category,
      summary: e.summary,
      rating: e.rating,
      reviews: e.reviews,
      slug: slugify(e.title),
      meta: e.category,
      place: e.location,
      tags: [],
      experienceType: 'attraction',
    }))
  }, [apiExperiences])

  const attractions = useMemo(
    () => mapped.filter((item) => (item.experienceType ?? 'attraction') === 'attraction'),
    [mapped],
  )
  const activities = useMemo(
    () => mapped.filter((item) => item.experienceType === 'activity'),
    [mapped],
  )

  return (
    <>
      {attractions.length > 0 ? (
        <PageSection padTop={88} padBottom={0}>
          <FadeUp>
            <HomeSectionHeader
              overline={t('home.attractionsOverline', { defaultValue: 'Worth the trip' })}
              heading={t('home.attractionsHeading', { defaultValue: 'Attractions' })}
              lede={t('home.attractionsLede', {
                defaultValue: 'Landmarks and destinations open year-round.',
              })}
              ledeMaxWidth={null}
              link={{
                label: t('home.browseAllAttractions', { defaultValue: 'Browse attractions' }),
                to: '/experiences?type=attraction',
              }}
            />
          </FadeUp>
          <ExperienceCarousel items={attractions} />
        </PageSection>
      ) : null}

      {activities.length > 0 ? (
        <PageSection padTop={88} padBottom={0}>
          <FadeUp>
            <HomeSectionHeader
              overline={t('home.activitiesOverline', { defaultValue: 'Do something' })}
              heading={t('home.activitiesHeading', { defaultValue: 'Activities' })}
              lede={t('home.activitiesLede', {
                defaultValue: 'Workshops, tours and hands-on experiences.',
              })}
              ledeMaxWidth={null}
              link={{
                label: t('home.browseAllActivities', { defaultValue: 'Browse activities' }),
                to: '/experiences?type=activity',
              }}
            />
          </FadeUp>
          <ExperienceCarousel items={activities} />
        </PageSection>
      ) : null}
    </>
  )
}

function ExperienceCarousel({ items }: { items: MappedExperience[] }) {
  return (
    <div className="relative mt-[22px]">
      <Carousel opts={{ align: 'start', loop: items.length > 3 }}>
        <CarouselContent>
          {items.map((experience, i) => (
            <CarouselItem
              key={experience.slug ?? experience.id ?? i}
              className="basis-[85%] sm:basis-1/2 lg:basis-1/4"
            >
              <Link
                to={`/experiences/${experience.slug ?? experience.id}`}
                className="block min-w-0"
              >
                <ExperienceCard
                  context="home"
                  title={experience.title}
                  location={experience.location}
                  category={experience.category}
                  summary={experience.summary}
                  rating={experience.rating}
                  reviews={experience.reviews}
                  image={experience.image ?? HOME_EXPERIENCE_IMAGES[i % HOME_EXPERIENCE_IMAGES.length]}
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:inline-flex" />
        <CarouselNext className="hidden sm:inline-flex" />
      </Carousel>
    </div>
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
