import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ApiRecord as EventApiRecord } from '@/app/api/eventsApi'
import type { ApiRecord as ExperienceApiRecord } from '@/app/api/experiencesApi'
import type { ApiRecord as TalentApiRecord } from '@/app/api/talentsApi'
import { EventCard, ExperienceCard, TalentCard } from '@/components/cards'
import { FadeUp } from '@/components/motion'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui'
import { PageSection } from '@/layouts'
import { mapApiEventToCard } from '@/lib/api/mappers/events'
import { mapApiExperienceToCard, type MappedExperience } from '@/lib/api/mappers/experiences'
import { mapApiTalentToCard } from '@/lib/api/mappers/talents'
import { useEventFavorites } from '@/lib/favorites/useEventFavorites'
import { HomeSectionHeader } from './HomeSectionHeader'

/** Rail sizes. The talents row is centred on wide screens for five. */
const HOME_TALENT_COUNT = 5
const HOME_EVENT_COUNT = 8

/** Limited public talent strip — circular avatar, name, star rating. */
export function HomeTalents({ apiTalents }: { apiTalents?: TalentApiRecord[] }) {
  const { t } = useTranslation(['catalog', 'common'])
  // Real talents only; the design file's sample performers used to stand in.
  const talents = useMemo(
    () => (apiTalents ?? []).map(mapApiTalentToCard).slice(0, HOME_TALENT_COUNT),
    [apiTalents],
  )

  if (talents.length === 0) return null

  return (
    <PageSection padTop={84} padBottom={0}>
      <FadeUp>
        <HomeSectionHeader
          heading={t('home.talentsHeading')}
          link={{ label: t('common:actions.viewAll'), to: '/talents' }}
        />
      </FadeUp>
      <div className="relative mt-[26px]">
        <Carousel opts={{ align: 'start', loop: talents.length > 3 }}>
          {/* From lg up the five talents fit with room to spare, so the row is
              centred rather than left-aligned with a gap at the end. Below lg
              it scrolls and stays aligned with the heading. */}
          <CarouselContent className="lg:justify-center">
            {talents.map((talent) => (
              <CarouselItem
                key={talent.slug}
                className="basis-[32%] sm:basis-[26%] md:basis-1/5 lg:basis-1/6"
              >
                <Link to={`/talents/${talent.slug}`} className="block min-w-0">
                  <TalentCard
                    name={talent.name}
                    discipline={talent.discipline}
                    rating={talent.rating}
                    reviews={'reviews' in talent ? talent.reviews : ''}
                    city={'city' in talent ? talent.city : ''}
                    verified={talent.verified}
                    image={talent.image}
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

/** Newest paid events first — free events live in their own rail. */
export function HomeRecentlyAdded({ apiEvents }: { apiEvents?: EventApiRecord[] }) {
  const { t } = useTranslation(['catalog', 'common'])
  const { isFavourite, toggleFavourite, canFavourite } = useEventFavorites()

  const events = useMemo(() => {
    if (apiEvents && apiEvents.length > 0) {
      const ranked = [...apiEvents].sort((a, b) => {
        const aTime =
          Date.parse(String(a.created_at ?? a.createdAt ?? '')) ||
          Number(a.id) ||
          0
        const bTime =
          Date.parse(String(b.created_at ?? b.createdAt ?? '')) ||
          Number(b.id) ||
          0
        return bTime - aTime
      })
      return ranked
        .map(mapApiEventToCard)
        .filter((event) => !event.isFree)
        .slice(0, HOME_EVENT_COUNT)
    }
    return []
  }, [apiEvents])

  if (events.length === 0) return null

  return (
    <PageSection padTop={72} padBottom={0}>
      <FadeUp>
        <HomeSectionHeader
          heading={t('home.recentlyAddedHeading')}
          link={{ label: t('common:actions.viewAll'), to: '/events?sort=newest' }}
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
  const { t } = useTranslation(['catalog', 'common'])
  const { isFavourite, toggleFavourite, canFavourite } = useEventFavorites()

  const freeEvents = useMemo(() => {
    if (apiEvents && apiEvents.length > 0) {
      return apiEvents
        .map(mapApiEventToCard)
        .filter((event) => event.isFree)
        .slice(0, HOME_EVENT_COUNT)
    }
    return []
  }, [apiEvents])

  if (freeEvents.length === 0) return null

  return (
    <PageSection padTop={60} padBottom={0}>
      <FadeUp>
        <HomeSectionHeader
          heading={t('home.freeEventsHeading')}
          link={{ label: t('common:actions.viewAll'), to: '/events?free=1' }}
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
          {events.map((event) => (
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
                  image={event.image}
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

/** Home experience rails — attractions first, then activities (API `type`). */
export function HomeExperiences({ apiExperiences }: { apiExperiences?: ExperienceApiRecord[] }) {
  const { t } = useTranslation(['catalog', 'common'])

  const mapped = useMemo(
    (): MappedExperience[] => (apiExperiences ?? []).map(mapApiExperienceToCard),
    [apiExperiences],
  )

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
              heading={t('home.attractionsHeading')}
              link={{
                label: t('common:actions.viewAll'),
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
              heading={t('home.activitiesHeading')}
              link={{
                label: t('common:actions.viewAll'),
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
                  image={experience.image}
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
