import { useGetAdvertisementsQuery } from '@/app/api/accountApis'
import { useGetEventsQuery } from '@/app/api/eventsApi'
import { useGetExperiencesQuery } from '@/app/api/experiencesApi'
import { useGetTalentsQuery } from '@/app/api/talentsApi'
import { HomeAdsSection } from '@/components/ads'
import { HomeHero } from './HomeHero'
import {
  HomeEvents,
  HomeExperiences,
  HomeFreeEvents,
  HomeRecentlyAdded,
  HomeTalents,
} from './HomeSections'

/**
 * Home — Hero → Ads → Recently added → Tickets & offers → Free events →
 * Talents → Touristic monuments → Fun activities.
 */
export function HomePage() {
  const { data: eventsResult } = useGetEventsQuery()
  const apiEvents = eventsResult?.items
  const { data: apiAds } = useGetAdvertisementsQuery()
  const { data: talentsResult } = useGetTalentsQuery()
  const apiTalents = talentsResult?.items
  const { data: apiExperiences } = useGetExperiencesQuery()

  return (
    <>
      <HomeHero apiEvents={apiEvents} />
      <HomeAdsSection ads={apiAds} />
      <HomeRecentlyAdded apiEvents={apiEvents} />
      <HomeEvents apiEvents={apiEvents} />
      <HomeFreeEvents apiEvents={apiEvents} />
      <HomeTalents apiTalents={apiTalents} />
      <HomeExperiences apiExperiences={apiExperiences} />
    </>
  )
}
