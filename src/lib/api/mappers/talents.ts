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
    biography?: string
    isFollowing?: boolean
    /** When false, show “Myticket Discovery” badge. When true, hide discovery badge. */
    ownDiscovery?: boolean
  }

/** Map flexible talent API rows into card props; keep fixtures usable as fallback. */
export function mapApiTalentToCard(talent: ApiRecord): MappedTalent {
  const performer = (talent.performer as ApiRecord | undefined) ?? {}
  const name =
    pickLocalized(performer, ['stageName', 'stage_name', 'name']) ||
    pickLocalized(talent, ['name', 'stage_name', 'stageName', 'display_name'], 'Unknown talent')

  // The id leads the slug ("12-name"). The API has no slug and no lookup by
  // name, and the list returns 10 a page, so a name alone can't find most
  // talents from their profile URL.
  const nameSlug = slugify(name)
  const idPart = talent.id != null ? String(talent.id) : ''
  const slug =
    pickLocalized(talent, ['slug']) ||
    (idPart ? (nameSlug ? `${idPart}-${nameSlug}` : idPart) : nameSlug)

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

  const biography =
    pickLocalized(performer, ['biography', 'bio']) ||
    pickLocalized(talent, ['biography', 'bio']) ||
    undefined

  const ownDiscovery =
    typeof talent.ownDiscovery === 'boolean'
      ? talent.ownDiscovery
      : typeof talent.own_discovery === 'boolean'
        ? (talent.own_discovery as boolean)
        : undefined

  const isFollowing =
    talent.isFollowing === true ||
    talent.is_following === true ||
    talent.following === true

  return {
    id: talent.id != null ? String(talent.id) : undefined,
    slug,
    name,
    discipline,
    meta,
    rating,
    reviews,
    city,
    image,
    biography,
    isFollowing,
    ownDiscovery,
    /** Discovery badge replaces verified — only when ownDiscovery is explicitly false. */
    verified: ownDiscovery === false,
  }
}

/** Talent id at the front of a profile URL segment — "12-name" or "12". */
function idFromSlug(slugOrId: string): string | undefined {
  return slugOrId.match(/^(\d+)(?:-|$)/)?.[1]
}

export function resolveTalentFromList(
  talents: ApiRecord[] | undefined,
  slugOrId: string,
): ApiRecord | undefined {
  if (!talents?.length) return undefined
  const id = idFromSlug(slugOrId)
  if (id) {
    return talents.find((t) => String(t.id) === id)
  }
  // Older name-only links still open talents on the first list page.
  return talents.find((t) => {
    const mapped = mapApiTalentToCard(t)
    return mapped.slug === slugOrId || slugify(mapped.name) === slugOrId
  })
}

export function resolveTalentId(talents: ApiRecord[] | undefined, slugOrId: string): string | undefined {
  const id = idFromSlug(slugOrId)
  if (id) return id
  const match = resolveTalentFromList(talents, slugOrId)
  return match?.id != null ? String(match.id) : undefined
}
