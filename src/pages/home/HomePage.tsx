import { useGetAdvertisementsQuery } from '@/app/api/accountApis'
import { useGetEventsQuery } from '@/app/api/eventsApi'
import { useGetExperiencesQuery } from '@/app/api/experiencesApi'
import { useGetTalentsQuery } from '@/app/api/talentsApi'
import { HomeVideoAdsSection } from '@/components/ads'
import { HomeHero } from './HomeHero'
import {
  HomeExperiences,
  HomeFreeEvents,
  HomeRecentlyAdded,
  HomeTalents,
} from './HomeSections'

/**
 * Home — Hero → Recently added (paid) → Talents → Free events → Video ads → Experiences.
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
      <HomeTalents apiTalents={apiTalents} />
      <HomeFreeEvents apiEvents={apiEvents} />
      <HomeVideoAdsSection ads={apiAds} />
      <HomeExperiences apiExperiences={apiExperiences} />
    </>
  )
}
