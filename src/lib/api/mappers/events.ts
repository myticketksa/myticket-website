import { slugify } from '@/pages/_guest/slugify'
import type { EventCardProps } from '@/components/cards'

type ApiRecord = Record<string, unknown>

function str(value: unknown, fallback = ''): string {
  if (value == null) return fallback
  return String(value)
}

function pick(record: ApiRecord, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = record[key]
    if (value != null && value !== '') return str(value)
  }
  return fallback
}

function nested(record: ApiRecord, path: string[]): unknown {
  let current: unknown = record
  for (const key of path) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as ApiRecord)[key]
  }
  return current
}

/** Map flexible event API rows into EventCard props; keep fixtures usable as fallback. */
export function mapApiEventToCard(event: ApiRecord): EventCardProps & { id?: string; slug: string } {
  const title = pick(event, ['title', 'name', 'name_en'], 'Untitled event')
  const slug =
    pick(event, ['slug']) ||
    slugify(title) ||
    str(event.id)

  const venue =
    pick(event, ['venue', 'venue_name', 'location']) ||
    str(nested(event, ['venue', 'name'])) ||
    str(nested(event, ['place', 'name']))

  const priceRaw = event.price ?? event.from_price ?? nested(event, ['ticketTypes', '0', 'price'])
  const price =
    typeof priceRaw === 'number'
      ? `SAR ${priceRaw}`
      : pick(event, ['price_label', 'price'], priceRaw != null ? `SAR ${priceRaw}` : 'SAR —')

  const image =
    pick(event, ['image', 'cover', 'cover_image', 'banner', 'banner_image', 'thumbnail']) ||
    undefined

  const date = pick(event, ['date', 'starts_at', 'start_at', 'datetime'], '')
  const rating = pick(event, ['rating', 'average_rating'], '—')
  const attendance = pick(event, ['attendance', 'attending_label', 'attendees'], '')
  const category = pick(event, ['category', 'category_name'], '')
  const flag = pick(event, ['flag', 'badge', 'status_label'])

  return {
    id: event.id != null ? str(event.id) : undefined,
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
