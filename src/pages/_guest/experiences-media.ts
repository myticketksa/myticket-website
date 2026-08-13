/**
 * Committed Experiences photography from Figma `207:6795` / `207:7048`
 * (MCP Asset API, `.png` suffix). Wired into catalog / detail `image` props.
 */
import catalog1 from '@/assets/experiences/catalog-1.jpg'
import catalog2 from '@/assets/experiences/catalog-2.jpg'
import catalog3 from '@/assets/experiences/catalog-3.jpg'
import catalog4 from '@/assets/experiences/catalog-4.jpg'
import catalog5 from '@/assets/experiences/catalog-5.jpg'
import catalog6 from '@/assets/experiences/catalog-6.jpg'
import catalog7 from '@/assets/experiences/catalog-7.jpg'
import catalog8 from '@/assets/experiences/catalog-8.jpg'
import detailHero from '@/assets/experiences/detail-hero.jpg'
import detailThumb1 from '@/assets/experiences/detail-thumb-1.jpg'
import detailThumb2 from '@/assets/experiences/detail-thumb-2.jpg'
import detailThumb3 from '@/assets/experiences/detail-thumb-3.jpg'
import detailNearby from '@/assets/experiences/detail-nearby.jpg'
import detailMap from '@/assets/experiences/detail-map.jpg'

export const EXPERIENCE_CATALOG_IMAGES = [
  catalog1,
  catalog2,
  catalog3,
  catalog4,
  catalog5,
  catalog6,
  catalog7,
  catalog8,
] as const

export const EXPERIENCE_DETAIL_GALLERY = {
  main: detailHero,
  thumbs: [detailThumb1, detailThumb2, detailThumb3] as const,
} as const

export const EXPERIENCE_DETAIL_MAP = detailMap
export const EXPERIENCE_DETAIL_NEARBY = detailNearby
