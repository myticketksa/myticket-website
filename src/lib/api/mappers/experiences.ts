import type { ExperienceCardProps } from '@/components/cards'
import i18n, { getActiveLocale } from '@/i18n/config'
import { slugify } from '@/pages/_guest/slugify'
import {
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
  /** API `type`: attraction | activity (and any future values). */
  experienceType?: string
  about?: string
  includes?: string[]
  photos?: string[]
  banner?: string
  isFavorite?: boolean
  mapQuery?: string
  openingHours?: { dayOfWeek: number; open: string; close: string; isClosed: boolean }[]
}

/** Short weekday name in the page's language; 0 is Sunday, as the API sends it. */
function dayName(dayOfWeek: number): string {
  // 4 Jan 1970 was a Sunday.
  const date = new Date(Date.UTC(1970, 0, 4 + dayOfWeek))
  return new Intl.DateTimeFormat(getActiveLocale() === 'ar' ? 'ar-SA' : 'en-SA', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date)
}

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

/** Stand-in place name when the API only sends coordinates. */
export function meetingPointLabel(): string {
  return i18n.t('common:labels.meetingPoint')
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
  if (openDays.length === 0) return i18n.t('common:labels.closed')
  const sample = openDays[0]!
  const sameHours = openDays.every((h) => h.open === sample.open && h.close === sample.close)
  if (sameHours && openDays.length >= 5) {
    const days = openDays
      .map((h) => dayName(h.dayOfWeek))
      .join(getActiveLocale() === 'ar' ? '، ' : ', ')
    return `${days} · ${sample.open}–${sample.close}`
  }
  return openDays
    .map((h) => `${dayName(h.dayOfWeek)} ${h.open}–${h.close}`)
    .join(' · ')
}

/** Map flexible experience API rows into card props; keep fixtures usable as fallback. */
export function mapApiExperienceToCard(exp: ApiRecord): MappedExperience {
  const title = pickLocalized(
    exp,
    ['title', 'name', 'name_en'],
    i18n.t('common:labels.untitledExperience'),
  )
  // The id leads the slug ("12-name"), as for talents: the API has no slug,
  // and the list returns 10 a page, so a title alone can't find most places.
  const titleSlug = slugify(title)
  const idPart = exp.id != null ? String(exp.id) : ''
  const slug =
    pickLocalized(exp, ['slug']) ||
    (idPart ? (titleSlug ? `${idPart}-${titleSlug}` : idPart) : titleSlug)

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
    pickLocalized(exp, ['category', 'category_name']) ||
    localizedString(nestedValue(exp, ['category', 'name']))

  const experienceType = pickLocalized(exp, ['type']) || undefined

  // `type` is a code ("attraction" / "activity"); show its name, keep the code
  // in `experienceType` for filtering.
  const typeLabel =
    experienceType && i18n.exists(`common:labels.experienceType.${experienceType}`)
      ? i18n.t(`common:labels.experienceType.${experienceType}`)
      : experienceType

  const duration = pickLocalized(exp, ['duration', 'duration_label', 'type_label'])
  const meta =
    pickLocalized(exp, ['meta']) ||
    (category && duration
      ? `${category} · ${duration}`
      : category || typeLabel || '') ||
    ''

  const ratingVal = formatRating(exp.rating ?? exp.average_rating)
  const reviewCount = pickLocalized(exp, ['raters', 'reviews_count', 'review_count'])
  const rating = reviewCount ? `${ratingVal} (${reviewCount})` : ratingVal

  const maxGuests = exp.maxGuests ?? exp.max_guests ?? exp.max_guests_count
  const guests =
    maxGuests != null && maxGuests !== ''
      ? i18n.t('common:labels.maxGuests', { count: Number(maxGuests) || 0 })
      : pickLocalized(exp, ['guests', 'guests_label'])

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
  const reviews =
    reviewsRaw ||
    (reviewCount ? i18n.t('common:labels.reviews', { count: Number(reviewCount) || 0 }) : undefined)
  const mapQuery = experienceMapQuery(exp.location ?? exp.map_location)
  const openingHours = parseOpeningHours(exp.opening_hours ?? exp.openingHours)

  // When API only sends coordinates, avoid showing raw lng:lat as the place line.
  const placeLooksLikeCoords = Boolean(mapQuery && /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.test(mapQuery))
  const placeLabel = placeLooksLikeCoords ? meetingPointLabel() : place || location || '—'

  return {
    id: exp.id != null ? String(exp.id) : undefined,
    slug,
    title,
    location: placeLooksLikeCoords ? placeLabel : location,
    meta,
    place: placeLabel,
    rating,
    guests,
    flag: flag || undefined,
    tags: tags.length > 0 ? tags : includeTags,
    category: category || typeLabel || undefined,
    experienceType,
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
  const id = idFromSlug(slugOrId)
  if (id) {
    return experiences.find((e) => String(e.id) === id)
  }
  // Older title-only links still open places on the first list page.
  return experiences.find((e) => {
    const mapped = mapApiExperienceToCard(e)
    return mapped.slug === slugOrId || slugify(mapped.title) === slugOrId
  })
}

/** Place id at the front of a URL segment — "12-name" or "12". */
function idFromSlug(slugOrId: string): string | undefined {
  return slugOrId.match(/^(\d+)(?:-|$)/)?.[1]
}

export function resolveExperienceId(
  experiences: ApiRecord[] | undefined,
  slugOrId: string,
): string | undefined {
  const id = idFromSlug(slugOrId)
  if (id) return id
  const match = resolveExperienceFromList(experiences, slugOrId)
  return match?.id != null ? String(match.id) : undefined
}
