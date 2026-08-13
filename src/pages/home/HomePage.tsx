import { HomeHero } from './HomeHero'
import {
  HomeAuctions,
  HomeBusinessStrip,
  HomeCategories,
  HomeCta,
  HomeEvents,
  HomeExperiences,
  HomeFeatured,
  HomeOrganizers,
  HomeTalents,
  HomeVendors,
} from './HomeSections'

/**
 * Home — Figma `207:4362`.
 *
 * Header and footer come from `MainLayout`. Sections keep their own pad-tops from the
 * frame (60 / 84 / 72 / 60 / 76 / 88×4 / 96 / 72+96). Fixture data lives in `home-data.ts`.
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
      <HomeOrganizers />
      <HomeVendors />
      <HomeCta />
      <HomeBusinessStrip />
    </>
  )
}
