import { useGetAdvertisementsQuery } from '@/app/api/accountApis'
import { useGetEventsQuery } from '@/app/api/eventsApi'
import { useGetExperiencesQuery } from '@/app/api/experiencesApi'
import { useGetTalentsQuery } from '@/app/api/talentsApi'
import { HomeVideoAdsSection } from '@/components/ads'
import { HomeHero } from './HomeHero'
import {
  HomeEvents,
  HomeExperiences,
  HomeFreeEvents,
  HomeRecentlyAdded,
  HomeTalents,
} from './HomeSections'

/**
 * Home — Hero (with image ads) → Recently added → Tickets & offers → Talents →
 * Free events → Video ads → Touristic monuments → Fun activities.
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
      <HomeHero apiAds={apiAds} />
      <HomeRecentlyAdded apiEvents={apiEvents} />
      <HomeEvents apiEvents={apiEvents} />
      <HomeTalents apiTalents={apiTalents} />
      <HomeFreeEvents apiEvents={apiEvents} />
      <HomeVideoAdsSection ads={apiAds} />
      <HomeExperiences apiExperiences={apiExperiences} />
    </>
  )
}
