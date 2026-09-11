import { slugify } from '@/pages/_guest/slugify'
import type { EventCardProps } from '@/components/cards'
import {
  firstTicketTypeId,
  formatApiDate,
  formatMoneySar,
  localizedString,
  nestedValue,
  pickLocalized,
} from '@/lib/api/locale'

type ApiRecord = Record<string, unknown>

/** Map flexible event API rows into EventCard props; keep fixtures usable as fallback. */
export function mapApiEventToCard(event: ApiRecord): EventCardProps & {
  id?: string
  slug: string
  ticketTypeId?: number
} {
  const title =
    pickLocalized(event, ['title', 'name', 'name_en'], '') ||
    localizedString(nestedValue(event, ['translations', '0', 'title']), 'Untitled event')

  const slug =
    pickLocalized(event, ['slug']) ||
    slugify(title) ||
    String(event.id ?? '')

  const venue =
    pickLocalized(event, ['place', 'venue', 'venue_name', 'location']) ||
    localizedString(nestedValue(event, ['venue', 'name'])) ||
    localizedString(nestedValue(event, ['place', 'name']))

  const priceRaw =
    event.priceFrom ??
    event.price_from ??
    event.from_price ??
    event.discountedPrice ??
    event.price ??
    nestedValue(event, ['ticketTypes', '0', 'price'])

  const price =
    event.isFree === true || Number(priceRaw) === 0
      ? 'Free'
      : formatMoneySar(priceRaw)

  const image =
    pickLocalized(event, ['cover', 'banner', 'image', 'cover_image', 'banner_image', 'thumbnail']) ||
    undefined

  const date =
    formatApiDate(event.startTime ?? event.starts_at ?? event.start_at ?? event.datetime ?? event.date) ||
    pickLocalized(event, ['date', 'starts_at', 'start_at', 'datetime', 'startTime'], '')

  const ratingRaw = event.rating ?? event.average_rating
  const rating =
    ratingRaw == null || ratingRaw === '' || Number(ratingRaw) === 0
      ? '—'
      : String(Number(ratingRaw).toFixed(1))

  const attendees = event.attendees ?? event.attendance ?? event.attending_label
  const attendance =
    attendees == null || attendees === ''
      ? ''
      : typeof attendees === 'number'
        ? `${attendees.toLocaleString('en-US')} going`
        : localizedString(attendees)

  const category =
    pickLocalized(event, ['category', 'category_name']) ||
    localizedString(nestedValue(event, ['category', 'name']))

  const flag =
    event.isFeatured === true
      ? 'Featured'
      : pickLocalized(event, ['flag', 'badge', 'status_label']) || undefined

  const ticketTypeId = firstTicketTypeId(event)

  return {
    id: event.id != null ? String(event.id) : undefined,
    slug,
    date,
    title,
    venue,
    rating,
    attendance,
    price,
    category: category || undefined,
    flag: flag || undefined,
    image,
    ticketTypeId,
  }
}

export function resolveEventFromList(
  events: ApiRecord[] | undefined,
  slugOrId: string,
): ApiRecord | undefined {
  if (!events?.length) return undefined
  if (/^\d+$/.test(slugOrId)) {
    return events.find((e) => String(e.id) === slugOrId)
  }
  return events.find((e) => {
    const mapped = mapApiEventToCard(e)
    return mapped.slug === slugOrId || slugify(mapped.title) === slugOrId
  })
}

export function resolveEventId(events: ApiRecord[] | undefined, slugOrId: string): string | undefined {
  if (/^\d+$/.test(slugOrId)) return slugOrId
  const match = resolveEventFromList(events, slugOrId)
  return match?.id != null ? String(match.id) : undefined
}
