import { useGetAdvertisementsQuery } from '@/app/api/accountApis'
import { useGetEventsQuery } from '@/app/api/eventsApi'
import { useGetExperiencesQuery } from '@/app/api/experiencesApi'
import { useGetTalentsQuery } from '@/app/api/talentsApi'
import { HomeVideoAdsSection } from '@/components/ads'
import { SupportChatBubble } from '@/components/support'
import { HomeHero } from './HomeHero'
import {
  HomeExperiences,
  HomeFreeEvents,
  HomeRecentlyAdded,
  HomeTalents,
  HomeTicketsAndShows,
} from './HomeSections'

/**
 * Home — Hero → Tickets and shows → Recently added (paid) → Talents → Free events → Video ads → Experiences.
 */
export function HomePage() {
  const { data: eventsResult } = useGetEventsQuery()
  const apiEvents = eventsResult?.items
  const { data: pickedResult } = useGetEventsQuery({ featured: true })
  const { data: newestResult } = useGetEventsQuery({ newest: true })
  const { data: apiAds } = useGetAdvertisementsQuery()
  const { data: talentsResult } = useGetTalentsQuery()
  const apiTalents = talentsResult?.items
  const { data: apiExperiences } = useGetExperiencesQuery()

  return (
    <>
      <HomeHero apiAds={apiAds} />
      <HomeTicketsAndShows apiEvents={pickedResult?.items} />
      <HomeRecentlyAdded apiEvents={newestResult?.items} />
      <HomeTalents apiTalents={apiTalents} />
      <HomeFreeEvents apiEvents={apiEvents} />
      <HomeVideoAdsSection ads={apiAds} />
      <HomeExperiences apiExperiences={apiExperiences} />
      <SupportChatBubble />
    </>
  )
}
