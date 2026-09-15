import { useGetAdvertisementsQuery } from '@/app/api/accountApis'
import { useGetEventCategoriesQuery, useGetEventsQuery } from '@/app/api/eventsApi'
import { useGetExperiencesQuery } from '@/app/api/experiencesApi'
import { useGetTalentsQuery } from '@/app/api/talentsApi'
import { HomeAdsSection } from '@/components/ads'
import { HomeHero } from './HomeHero'
import {
  HomeCategories,
  HomeCta,
  HomeEvents,
  HomeExperiences,
  HomeFeatured,
  HomeFreeEvents,
  HomeTalents,
} from './HomeSections'

/**
 * Home — Figma `207:4362` (guest BIG_CHANGES: no public vendor/organizer discovery).
 * Catalog APIs with fixture fallback in section components.
 */
export function HomePage() {
  const { data: apiEvents } = useGetEventsQuery()
  const { data: apiTalents } = useGetTalentsQuery()
  const { data: apiExperiences } = useGetExperiencesQuery()
  const { data: apiCategories } = useGetEventCategoriesQuery()
  const { data: apiAds } = useGetAdvertisementsQuery()

  return (
    <>
      <HomeHero apiEvents={apiEvents} />
      <HomeAdsSection ads={apiAds} />
      <HomeTalents apiTalents={apiTalents} />
      <HomeCategories apiCategories={apiCategories} />
      <HomeEvents apiEvents={apiEvents} />
      <HomeFreeEvents apiEvents={apiEvents} />
      <HomeFeatured apiAds={apiAds} apiEvents={apiEvents} />
      <HomeExperiences apiExperiences={apiExperiences} />
      <HomeCta />
    </>
  )
}
