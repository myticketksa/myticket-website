import { useGetAdvertisementsQuery } from '@/app/api/accountApis'
import { useGetEventCategoriesQuery, useGetEventsQuery } from '@/app/api/eventsApi'
import { useGetExperiencesQuery } from '@/app/api/experiencesApi'
import { useGetTalentsQuery } from '@/app/api/talentsApi'
import { HomeHero } from './HomeHero'
import {
  HomeAuctions,
  HomeBusinessStrip,
  HomeCategories,
  HomeCta,
  HomeEvents,
  HomeExperiences,
  HomeFeatured,
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
      <HomeTalents apiTalents={apiTalents} />
      <HomeCategories apiCategories={apiCategories} />
      <HomeEvents apiEvents={apiEvents} />
      <HomeFeatured apiAds={apiAds} apiEvents={apiEvents} />
      <HomeAuctions />
      <HomeExperiences apiExperiences={apiExperiences} />
      <HomeCta />
      <HomeBusinessStrip />
    </>
  )
}
