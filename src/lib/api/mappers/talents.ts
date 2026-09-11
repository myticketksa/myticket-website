import type { TalentCardProps, TalentDirectoryCardProps } from '@/components/cards'
import { slugify } from '@/pages/_guest/slugify'
import { localizedString, nestedValue, pickLocalized } from '@/lib/api/locale'

type ApiRecord = Record<string, unknown>

function formatRating(value: unknown): string {
  if (value == null || value === '') return '—'
  const n = Number(value)
  return Number.isFinite(n) ? n.toFixed(1) : localizedString(value, '—')
}

export type MappedTalent = TalentDirectoryCardProps &
  Pick<TalentCardProps, 'reviews' | 'city' | 'nextLabel' | 'nextEvent'> & {
    id?: string
    slug: string
  }

/** Map flexible talent API rows into card props; keep fixtures usable as fallback. */
export function mapApiTalentToCard(talent: ApiRecord): MappedTalent {
  const performer = (talent.performer as ApiRecord | undefined) ?? {}
  const name =
    pickLocalized(performer, ['stageName', 'stage_name', 'name']) ||
    pickLocalized(talent, ['name', 'stage_name', 'stageName', 'display_name'], 'Unknown talent')

  const slug = pickLocalized(talent, ['slug']) || slugify(name) || String(talent.id ?? '')

  const categories = nestedValue(talent, ['categories', 'performanceCategories'])
  const firstCategory =
    Array.isArray(categories) && categories[0] && typeof categories[0] === 'object'
      ? localizedString((categories[0] as ApiRecord).name_en) ||
        localizedString((categories[0] as ApiRecord).name) ||
        localizedString((categories[0] as ApiRecord).name_ar)
      : ''

  const discipline =
    firstCategory ||
    pickLocalized(talent, ['discipline', 'craft', 'type', 'category_name', 'performance_category']) ||
    localizedString(nestedValue(talent, ['category', 'name'])) ||
    'Performer'

  const rating = formatRating(talent.rating ?? talent.average_rating ?? nestedValue(talent, ['stats', 'rating']))

  const reviews = pickLocalized(talent, ['raters', 'reviews_count', 'review_count', 'reviews'], '0')
  const city =
    localizedString(nestedValue(performer, ['homeCity', 'name'])) ||
    pickLocalized(talent, ['city', 'home_city', 'location']) ||
    localizedString(nestedValue(talent, ['city', 'name'])) ||
    localizedString(nestedValue(talent, ['homeCity', 'name']))

  const followers = pickLocalized(talent, ['followers_count', 'followers', 'followers_label'])
  const shows = pickLocalized(talent, ['shows_count', 'upcoming_shows', 'shows_label'])
  const meta =
    pickLocalized(talent, ['meta']) ||
    (followers && shows
      ? `${followers} followers · ${shows} shows`
      : reviews && city
        ? `${reviews} reviews · ${city}`
        : city)

  const image =
    pickLocalized(performer, ['profilePhoto', 'profile_photo', 'photo', 'avatar']) ||
    pickLocalized(talent, ['image', 'profile_photo', 'profilePhoto', 'photo', 'avatar', 'thumbnail']) ||
    undefined

  const verified =
    talent.verified === true ||
    talent.is_verified === true ||
    talent.isFollowing === true ||
    pickLocalized(talent, ['verified']) === 'true' ||
    pickLocalized(talent, ['verified']) === '1'

  return {
    id: talent.id != null ? String(talent.id) : undefined,
    slug,
    name,
    discipline,
    meta,
    rating,
    reviews,
    city,
    verified: verified || undefined,
    image,
  }
}

export function resolveTalentFromList(
  talents: ApiRecord[] | undefined,
  slugOrId: string,
): ApiRecord | undefined {
  if (!talents?.length) return undefined
  if (/^\d+$/.test(slugOrId)) {
    return talents.find((t) => String(t.id) === slugOrId)
  }
  return talents.find((t) => {
    const mapped = mapApiTalentToCard(t)
    return mapped.slug === slugOrId || slugify(mapped.name) === slugOrId
  })
}

export function resolveTalentId(talents: ApiRecord[] | undefined, slugOrId: string): string | undefined {
  if (/^\d+$/.test(slugOrId)) return slugOrId
  const match = resolveTalentFromList(talents, slugOrId)
  return match?.id != null ? String(match.id) : undefined
}
