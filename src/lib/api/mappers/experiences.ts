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
  const flag = pickLocalized(exp, ['flag', 'badge', 'status_label'])
  const image =
    pickLocalized(exp, ['cover', 'banner', 'image', 'cover_image', 'thumbnail']) ||
    localizedString(nestedValue(exp, ['photos', 'cover'])) ||
    undefined

  const summary =
    pickLocalized(exp, ['summary', 'description']) ||
    localizedString(exp.about) ||
    localizedString(nestedValue(exp, ['place', 'about_en'])) ||
    undefined

  const reviewsRaw = pickLocalized(exp, ['reviews_label'])
  const reviews = reviewsRaw || (reviewCount ? `${reviewCount} reviews` : undefined)

  return {
    id: exp.id != null ? String(exp.id) : undefined,
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
