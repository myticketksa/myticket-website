/**
 * Committed Talents photography from Figma `207:5539` / `207:5726`
 * (MCP Asset API, `.png` suffix). Wired into catalog / detail `image` props.
 */
import week1 from '@/assets/talents/week-1.jpg'
import week2 from '@/assets/talents/week-2.jpg'
import week3 from '@/assets/talents/week-3.jpg'
import week4 from '@/assets/talents/week-4.jpg'
import catalog1 from '@/assets/talents/catalog-1.jpg'
import catalog2 from '@/assets/talents/catalog-2.jpg'
import catalog3 from '@/assets/talents/catalog-3.jpg'
import catalog4 from '@/assets/talents/catalog-4.jpg'
import catalog5 from '@/assets/talents/catalog-5.jpg'
import detailHero from '@/assets/talents/detail-hero.jpg'
import detailPortrait from '@/assets/talents/detail-portrait.jpg'
import detailThumb1 from '@/assets/talents/detail-thumb-1.jpg'
import detailThumb2 from '@/assets/talents/detail-thumb-2.jpg'
import detailThumb3 from '@/assets/talents/detail-thumb-3.jpg'
import similar1 from '@/assets/talents/similar-1.jpg'
import similar2 from '@/assets/talents/similar-2.jpg'
import similar3 from '@/assets/talents/similar-3.jpg'
import similar4 from '@/assets/talents/similar-4.jpg'

/** “Playing this week” TalentCard row — Figma week cards. */
export const TALENT_WEEK_IMAGES = [week1, week2, week3, week4] as const

/**
 * Directory grid photography. Figma exports five unique frames; the remaining
 * catalog slots reuse week / similar crops so every card has a real photo.
 */
export const TALENT_CATALOG_IMAGES = [
  catalog1,
  catalog2,
  catalog3,
  catalog4,
  catalog5,
  week1,
  week2,
  similar1,
  similar2,
] as const

export const TALENT_DETAIL_GALLERY = {
  main: detailHero,
  /** Portrait + stage shots for the three thumbs. */
  thumbs: [detailPortrait, detailThumb1, detailThumb2] as const,
  portrait: detailPortrait,
  stage: detailThumb3,
} as const

export const TALENT_SIMILAR_IMAGES = [
  similar1,
  similar2,
  similar3,
  similar4,
] as const
