import { useGetAdvertisementsQuery } from '@/app/api/accountApis'
import { useGetEventsQuery } from '@/app/api/eventsApi'
import { useGetExperiencesQuery } from '@/app/api/experiencesApi'
import { useGetTalentsQuery } from '@/app/api/talentsApi'
import { HomeVideoAdsSection } from '@/components/ads'
import { SupportChatBubble } from '@/components/support'
import { PageSection } from '@/layouts'
import { HomeHero } from './HomeHero'
import {
  EventsComingSoon,
  HomeExperiences,
  HomeRecentlyAdded,
  HomeTalents,
  HomeTicketsAndShows,
} from './HomeSections'

/**
 * Home — Hero → Tickets and shows → Recently added (paid) → Talents → Video ads → Experiences.
 */
export function HomePage() {
  const { data: pickedResult, isSuccess: pickedLoaded } = useGetEventsQuery({ featured: true })
  const { data: newestResult, isSuccess: newestLoaded } = useGetEventsQuery({ newest: true })
  // Nothing on sale yet: "Events coming soon" stands where the two event rows would be.
  const eventsComingSoon =
    pickedLoaded &&
    newestLoaded &&
    (pickedResult?.items ?? []).length === 0 &&
    (newestResult?.items ?? []).length === 0
  const { data: apiAds } = useGetAdvertisementsQuery()
  // The top 5 rated: highest average review first.
  const { data: talentsResult } = useGetTalentsQuery({ sort: 'top_rated', perPage: 5 })
  const apiTalents = talentsResult?.items
  const { data: apiExperiences } = useGetExperiencesQuery()

  return (
    <>
      <HomeHero apiAds={apiAds} />
      {eventsComingSoon ? (
        <PageSection padTop={72} padBottom={0}>
          <EventsComingSoon />
        </PageSection>
      ) : null}
      <HomeTicketsAndShows apiEvents={pickedResult?.items} />
      <HomeRecentlyAdded apiEvents={newestResult?.items} />
      <HomeTalents apiTalents={apiTalents} />
      <HomeVideoAdsSection ads={apiAds} />
      <HomeExperiences apiExperiences={apiExperiences} />
      <SupportChatBubble />
    </>
  )
}
