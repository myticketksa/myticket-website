import { useGetAdvertisementsQuery } from '@/app/api/accountApis'
import { useGetEventsQuery } from '@/app/api/eventsApi'
import { useGetExperiencesQuery } from '@/app/api/experiencesApi'
import { useGetTalentsQuery } from '@/app/api/talentsApi'
import { HomeVideoAdsSection } from '@/components/ads'
import { SupportChatBubble } from '@/components/support'
import { HomeHero } from './HomeHero'
import {
  HomeExperiences,
  HomeRecentlyAdded,
  HomeTalents,
  HomeTicketsAndShows,
} from './HomeSections'

/**
 * Home — Hero → Tickets and shows → Recently added (paid) → Talents → Video ads → Experiences.
 */
export function HomePage() {
  const { data: pickedResult } = useGetEventsQuery({ featured: true })
  const { data: newestResult } = useGetEventsQuery({ newest: true })
  const { data: apiAds } = useGetAdvertisementsQuery()
  // The top 5 rated: highest average review first.
  const { data: talentsResult } = useGetTalentsQuery({ sort: 'top_rated', perPage: 5 })
  const apiTalents = talentsResult?.items
  const { data: apiExperiences } = useGetExperiencesQuery()

  return (
    <>
      <HomeHero apiAds={apiAds} />
      <HomeTicketsAndShows apiEvents={pickedResult?.items} />
      <HomeRecentlyAdded apiEvents={newestResult?.items} />
      <HomeTalents apiTalents={apiTalents} />
      <HomeVideoAdsSection ads={apiAds} />
      <HomeExperiences apiExperiences={apiExperiences} />
      <SupportChatBubble />
    </>
  )
}
