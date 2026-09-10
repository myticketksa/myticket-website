import type { ExperienceCardProps } from '@/components/cards'
import { slugify } from '@/pages/_guest/slugify'

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

function formatRating(value: unknown): string {
  if (value == null || value === '') return '—'
  const n = Number(value)
  return Number.isFinite(n) ? n.toFixed(1) : str(value)
}

function tagsFrom(record: ApiRecord): string[] {
  const raw = record.tags ?? record.services ?? record.categories
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    if (typeof item === 'string') return item
    if (item && typeof item === 'object') {
      const obj = item as ApiRecord
      return pick(obj, ['name', 'label', 'title'], str(item))
    }
    return str(item)
  }).filter(Boolean).slice(0, 2)
}

export type MappedExperience = ExperienceCardProps & {
  id?: string
  slug: string
  meta: string
  place: string
  tags: string[]
}

/** Map flexible experience API rows into card props; keep fixtures usable as fallback. */
export function mapApiExperienceToCard(exp: ApiRecord): MappedExperience {
  const title = pick(exp, ['title', 'name', 'name_en'], 'Untitled experience')
  const slug = pick(exp, ['slug']) || slugify(title) || str(exp.id)

  const location =
    pick(exp, ['location', 'region']) ||
    str(nested(exp, ['place', 'name_en'])) ||
    str(nested(exp, ['place', 'name'])) ||
    pick(exp, ['place_name'], '')

  const place =
    pick(exp, ['place', 'place_name']) ||
    location.split(',')[0]?.trim() ||
    location

  const category =
    pick(exp, ['category', 'category_name', 'type']) ||
    str(nested(exp, ['category', 'name']))

  const duration = pick(exp, ['duration', 'duration_label', 'type_label'])
  const meta = pick(exp, ['meta']) || (category && duration ? `${category} · ${duration}` : category)

  const ratingVal = formatRating(exp.rating ?? exp.average_rating)
  const reviewCount = pick(exp, ['reviews_count', 'review_count'])
  const rating = reviewCount ? `${ratingVal} (${reviewCount})` : ratingVal

  const maxGuests = exp.maxGuests ?? exp.max_guests ?? exp.max_guests_count
  const guests =
    maxGuests != null && maxGuests !== ''
      ? `Max ${maxGuests} guests`
      : pick(exp, ['guests', 'guests_label'])

  const priceRaw = exp.price ?? exp.from_price ?? exp.price_per_person
  const price =
    typeof priceRaw === 'number'
      ? `SAR ${priceRaw}`
      : pick(exp, ['price', 'price_label'], priceRaw != null ? `SAR ${priceRaw}` : 'SAR —')

  const tags = tagsFrom(exp)
  const flag = pick(exp, ['flag', 'badge', 'status_label'])
  const image =
    pick(exp, ['image', 'cover', 'cover_image', 'banner', 'thumbnail']) ||
    str(nested(exp, ['photos', 'cover'])) ||
    undefined

  const summary =
    pick(exp, ['summary', 'about', 'about_en', 'description']) ||
    str(nested(exp, ['place', 'about_en'])) ||
    undefined

  const reviewsRaw = pick(exp, ['reviews_label'])
  const reviews =
    reviewsRaw ||
    (reviewCount ? `${reviewCount} reviews` : undefined)

  return {
    id: exp.id != null ? str(exp.id) : undefined,
    slug,
    title,
    location,
    meta,
    place,
    rating,
    guests,
    price,
    flag: flag || undefined,
    tags,
    category: category || undefined,
    summary,
    reviews,
    eyebrow: meta || undefined,
    image: image || undefined,
  }
}

export function resolveExperienceFromList(
  experiences: ApiRecord[] | undefined,
  slugOrId: string,
): ApiRecord | undefined {
  if (!experiences?.length) return undefined
  if (/^\d+$/.test(slugOrId)) {
    return experiences.find((e) => str(e.id) === slugOrId)
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
  return match?.id != null ? str(match.id) : undefined
}
