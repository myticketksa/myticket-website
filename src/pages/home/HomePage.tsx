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
 */
export function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeTalents />
      <HomeCategories />
      <HomeEvents />
      <HomeFeatured />
      <HomeAuctions />
      <HomeExperiences />
      <HomeCta />
      <HomeBusinessStrip />
    </>
  )
}
