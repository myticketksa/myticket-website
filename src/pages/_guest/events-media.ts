/**
 * Committed Events photography from Figma `207:4600` / `207:4797`
 * (MCP Asset API, `.png` suffix). Wired into catalog / detail `image` props.
 */
import catalog1 from '@/assets/events/catalog-1.jpg'
import catalog2 from '@/assets/events/catalog-2.jpg'
import catalog3 from '@/assets/events/catalog-3.jpg'
import catalog4 from '@/assets/events/catalog-4.jpg'
import catalog5 from '@/assets/events/catalog-5.jpg'
import catalog6 from '@/assets/events/catalog-6.jpg'
import catalog7 from '@/assets/events/catalog-7.jpg'
import catalog8 from '@/assets/events/catalog-8.jpg'
import catalog9 from '@/assets/events/catalog-9.jpg'
import detailHero from '@/assets/events/detail-hero.jpg'
import detailThumb1 from '@/assets/events/detail-thumb-1.jpg'
import detailThumb2 from '@/assets/events/detail-thumb-2.jpg'
import detailThumb3 from '@/assets/events/detail-thumb-3.jpg'
import lineup1 from '@/assets/events/lineup-1.jpg'
import lineup2 from '@/assets/events/lineup-2.jpg'
import lineup3 from '@/assets/events/lineup-3.jpg'
import lineup4 from '@/assets/events/lineup-4.jpg'
import organizerAvatar from '@/assets/events/organizer-avatar.jpg'
import venueMap from '@/assets/events/venue-map.jpg'

export const EVENT_CATALOG_IMAGES = [
  catalog1,
  catalog2,
  catalog3,
  catalog4,
  catalog5,
  catalog6,
  catalog7,
  catalog8,
  catalog9,
] as const

export const EVENT_DETAIL_GALLERY = {
  main: detailHero,
  thumbs: [detailThumb1, detailThumb2, detailThumb3] as const,
} as const

export const EVENT_DETAIL_LINEUP_IMAGES = [
  lineup1,
  lineup2,
  lineup3,
  lineup4,
] as const

export const EVENT_DETAIL_ORGANIZER_AVATAR = organizerAvatar

/** Venue map photo — sourced from experience detail map asset. */
export const EVENT_DETAIL_VENUE_MAP = venueMap
