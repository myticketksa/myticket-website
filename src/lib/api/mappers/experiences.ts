import type { ExperienceCardProps } from '@/components/cards'
import { slugify } from '@/pages/_guest/slugify'
import {
  formatMoneySar,
  localizedString,
  nestedValue,
  pickLocalized,
} from '@/lib/api/locale'

type ApiRecord = Record<string, unknown>

function formatRating(value: unknown): string {
  if (value == null || value === '') return '—'
  const n = Number(value)
  return Number.isFinite(n) ? n.toFixed(1) : localizedString(value, '—')
}

function tagsFrom(record: ApiRecord): string[] {
  const raw = record.tags ?? record.services ?? record.categories
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') {
        return localizedString(item) || pickLocalized(item as ApiRecord, ['name', 'label', 'title'])
      }
      return localizedString(item)
    })
    .filter(Boolean)
    .slice(0, 2)
}

export type MappedExperience = ExperienceCardProps & {
  id?: string
  slug: string
  meta: string
  place: string
  tags: string[]
  about?: string
  includes?: string[]
  photos?: string[]
  banner?: string
  isFavorite?: boolean
  mapQuery?: string
  openingHours?: { dayOfWeek: number; open: string; close: string; isClosed: boolean }[]
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/** Parse bilingual / JSON-string `includes` payloads into a string list. */
export function parseExperienceIncludes(value: unknown): string[] {
  const asArray = (input: unknown): string[] => {
    if (!Array.isArray(input)) return []
    return input.map((item) => localizedString(item)).filter(Boolean)
  }

  if (Array.isArray(value)) return asArray(value)

  const text = localizedString(value)
  if (!text) return []

  try {
    const parsed = JSON.parse(text) as unknown
    const fromJson = asArray(parsed)
    if (fromJson.length > 0) return fromJson
  } catch {
    /* not JSON — fall through */
  }

  if (text.includes('|')) {
    return text
      .split('|')
      .map((part) => part.trim())
      .filter(Boolean)
  }

  return [text]
}

/** `lng:lat` or `lat,lng` → Google Maps query `lat,lng`. */
export function experienceMapQuery(location: unknown): string | undefined {
  const raw = localizedString(location)
  if (!raw) return undefined
  const colon = raw.match(/^(-?\d+(?:\.\d+)?)\s*:\s*(-?\d+(?:\.\d+)?)$/)
  if (colon) {
    // API seed uses longitude:latitude (e.g. 46.6753:24.7136 for Riyadh).
    const lng = colon[1]!
    const lat = colon[2]!
    return `${lat},${lng}`
  }
  const comma = raw.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
  if (comma) return `${comma[1]},${comma[2]}`
  return raw
}

function parseOpeningHours(value: unknown) {
  if (!Array.isArray(value)) return undefined
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as ApiRecord
      const dayOfWeek = Number(row.dayOfWeek ?? row.day_of_week)
      if (!Number.isFinite(dayOfWeek)) return null
      return {
        dayOfWeek,
        open: String(row.open ?? '00:00'),
        close: String(row.close ?? '00:00'),
        isClosed: Boolean(row.isClosed ?? row.is_closed),
      }
    })
    .filter((row): row is NonNullable<typeof row> => row != null)
}

export function formatOpeningHoursLine(hours: MappedExperience['openingHours']): string | undefined {
  if (!hours?.length) return undefined
  const openDays = hours.filter((h) => !h.isClosed)
  if (openDays.length === 0) return 'Closed'
  const sample = openDays[0]!
  const sameHours = openDays.every((h) => h.open === sample.open && h.close === sample.close)
  if (sameHours && openDays.length >= 5) {
    const days = openDays.map((h) => DAY_NAMES[h.dayOfWeek] ?? String(h.dayOfWeek)).join(', ')
    return `${days} · ${sample.open}–${sample.close}`
  }
  return openDays
    .map((h) => `${DAY_NAMES[h.dayOfWeek] ?? h.dayOfWeek} ${h.open}–${h.close}`)
    .join(' · ')
}

/** Map flexible experience API rows into card props; keep fixtures usable as fallback. */
export function mapApiExperienceToCard(exp: ApiRecord): MappedExperience {
  const title = pickLocalized(exp, ['title', 'name', 'name_en'], 'Untitled experience')
  const slug = pickLocalized(exp, ['slug']) || slugify(title) || String(exp.id ?? '')

  const location =
    pickLocalized(exp, ['location', 'region']) ||
    localizedString(nestedValue(exp, ['place', 'name_en'])) ||
    localizedString(nestedValue(exp, ['place', 'name'])) ||
    pickLocalized(exp, ['place_name'], '')

  const place =
    typeof exp.place === 'string'
      ? exp.place
      : pickLocalized(exp, ['place_name']) ||
        localizedString(exp.place) ||
        location.split(',')[0]?.trim() ||
        location

  const category =
    pickLocalized(exp, ['category', 'category_name', 'type']) ||
    localizedString(nestedValue(exp, ['category', 'name']))

  const duration = pickLocalized(exp, ['duration', 'duration_label', 'type_label'])
  const meta = pickLocalized(exp, ['meta']) || (category && duration ? `${category} · ${duration}` : category)

  const ratingVal = formatRating(exp.rating ?? exp.average_rating)
  const reviewCount = pickLocalized(exp, ['raters', 'reviews_count', 'review_count'])
  const rating = reviewCount ? `${ratingVal} (${reviewCount})` : ratingVal

  const maxGuests = exp.maxGuests ?? exp.max_guests ?? exp.max_guests_count
  const guests =
    maxGuests != null && maxGuests !== ''
      ? `Max ${maxGuests} guests`
      : pickLocalized(exp, ['guests', 'guests_label'])

  const price = formatMoneySar(exp.price ?? exp.from_price ?? exp.price_per_person)

  const tags = tagsFrom(exp)
  const includes = parseExperienceIncludes(exp.includes)
  const includeTags = includes.slice(0, 2)
  const flag = pickLocalized(exp, ['flag', 'badge', 'status_label'])
  const photos = Array.isArray(exp.photos)
    ? exp.photos.map((item) => localizedString(item)).filter(Boolean)
    : []
  const cover =
    pickLocalized(exp, ['cover', 'banner', 'image', 'cover_image', 'thumbnail']) ||
    photos[0] ||
    undefined
  const banner = pickLocalized(exp, ['banner']) || cover

  const summary =
    pickLocalized(exp, ['summary', 'description', 'about']) ||
    localizedString(exp.about) ||
    localizedString(nestedValue(exp, ['place', 'about_en'])) ||
    undefined

  const reviewsRaw = pickLocalized(exp, ['reviews_label'])
  const reviews = reviewsRaw || (reviewCount ? `${reviewCount} reviews` : undefined)
  const mapQuery = experienceMapQuery(exp.location ?? exp.map_location)
  const openingHours = parseOpeningHours(exp.opening_hours ?? exp.openingHours)

  // When API only sends coordinates, avoid showing raw lng:lat as the place line.
  const placeLooksLikeCoords = Boolean(mapQuery && /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.test(mapQuery))
  const placeLabel = placeLooksLikeCoords ? 'Meeting point' : place || location || '—'

  return {
    id: exp.id != null ? String(exp.id) : undefined,
    slug,
    title,
    location: placeLooksLikeCoords ? placeLabel : location,
    meta,
    place: placeLabel,
    rating,
    guests,
    price,
    flag: flag || undefined,
    tags: tags.length > 0 ? tags : includeTags,
    category: category || undefined,
    summary,
    about: summary,
    includes: includes.length > 0 ? includes : undefined,
    photos: photos.length > 0 ? photos : cover ? [cover] : undefined,
    banner: banner || undefined,
    isFavorite:
      exp.isFavorite != null || exp.is_favorite != null
        ? Boolean(exp.isFavorite ?? exp.is_favorite)
        : undefined,
    mapQuery,
    openingHours,
    reviews,
    eyebrow: meta || undefined,
    image: cover || undefined,
  }
}

export function resolveExperienceFromList(
  experiences: ApiRecord[] | undefined,
  slugOrId: string,
): ApiRecord | undefined {
  if (!experiences?.length) return undefined
  if (/^\d+$/.test(slugOrId)) {
    return experiences.find((e) => String(e.id) === slugOrId)
  }
  return experiences.find((e) => {
    const mapped = mapApiExperienceToCard(e)
    return mapped.slug === slugOrId || slugify(mapped.title) === slugOrId
  })
}

export function resolveExperienceId(
  experiences: ApiRecord[] | undefined,
  slugOrId: string,
): string | undefined {
  if (/^\d+$/.test(slugOrId)) return slugOrId
  const match = resolveExperienceFromList(experiences, slugOrId)
  return match?.id != null ? String(match.id) : undefined
}
