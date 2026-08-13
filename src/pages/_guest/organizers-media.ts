/**
 * Committed Organizers photography from Figma `207:6112` / `207:6154`
 * (MCP Asset API, `.png` suffix). Wired into card `cover` / `avatar` props.
 */
import cover1 from '@/assets/organizers/cover-1.jpg'
import cover2 from '@/assets/organizers/cover-2.jpg'
import cover3 from '@/assets/organizers/cover-3.jpg'
import cover4 from '@/assets/organizers/cover-4.jpg'
import cover5 from '@/assets/organizers/cover-5.jpg'
import cover6 from '@/assets/organizers/cover-6.jpg'
import mark1 from '@/assets/organizers/mark-1.jpg'
import mark2 from '@/assets/organizers/mark-2.jpg'
import mark3 from '@/assets/organizers/mark-3.jpg'
import mark4 from '@/assets/organizers/mark-4.jpg'
import homeMark5 from '@/assets/home/organizer-5.jpg'
import homeMark6 from '@/assets/home/organizer-6.jpg'
import detailCover from '@/assets/organizers/detail-cover.jpg'
import detailEvent1 from '@/assets/organizers/detail-event-1.jpg'
import detailEvent2 from '@/assets/organizers/detail-event-2.jpg'
import detailEvent3 from '@/assets/organizers/detail-event-3.jpg'
import detailEvent4 from '@/assets/organizers/detail-event-4.jpg'
import detailEvent5 from '@/assets/organizers/detail-event-5.jpg'
import detailEvent6 from '@/assets/organizers/detail-event-6.jpg'

export const ORGANIZER_COVER_IMAGES = [
  cover1,
  cover2,
  cover3,
  cover4,
  cover5,
  cover6,
] as const

/** Figma exports four marks; last two fall back to Home organizer avatars. */
export const ORGANIZER_MARK_IMAGES = [
  mark1,
  mark2,
  mark3,
  mark4,
  homeMark5,
  homeMark6,
] as const

export const ORGANIZER_DETAIL_COVER = detailCover
export const ORGANIZER_DETAIL_MARK = mark1

export const ORGANIZER_DETAIL_EVENT_IMAGES = [
  detailEvent1,
  detailEvent2,
  detailEvent3,
  detailEvent4,
  detailEvent5,
  detailEvent6,
] as const
