import type { TalentCardProps, TalentDirectoryCardProps } from '@/components/cards'
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

export type MappedTalent = TalentDirectoryCardProps &
  Pick<TalentCardProps, 'reviews' | 'city' | 'nextLabel' | 'nextEvent'> & {
    id?: string
    slug: string
  }

/** Map flexible talent API rows into card props; keep fixtures usable as fallback. */
export function mapApiTalentToCard(talent: ApiRecord): MappedTalent {
  const name = pick(talent, ['name', 'stage_name', 'stageName', 'display_name'], 'Unknown talent')
  const slug = pick(talent, ['slug']) || slugify(name) || str(talent.id)

  const discipline =
    pick(talent, ['discipline', 'craft', 'type', 'category_name', 'performance_category']) ||
    str(nested(talent, ['category', 'name'])) ||
    'Performer'

  const rating = formatRating(talent.rating ?? talent.average_rating ?? nested(talent, ['stats', 'rating']))

  const reviews = pick(talent, ['reviews_count', 'review_count', 'reviews'], '0')
  const city =
    pick(talent, ['city', 'home_city', 'location']) ||
    str(nested(talent, ['city', 'name'])) ||
    str(nested(talent, ['homeCity', 'name']))

  const followers = pick(talent, ['followers_count', 'followers', 'followers_label'])
  const shows = pick(talent, ['shows_count', 'upcoming_shows', 'shows_label'])
  const meta =
    pick(talent, ['meta']) ||
    (followers && shows
      ? `${followers} followers · ${shows} shows`
      : reviews && city
        ? `${reviews} reviews · ${city}`
        : city)

  const nextEventName =
    pick(talent, ['next_event', 'nextEvent', 'next_show_name']) ||
    str(nested(talent, ['next_show', 'name'])) ||
    str(nested(talent, ['nextShow', 'headline']))
  const nextDate =
    pick(talent, ['next_date', 'next_show_date', 'next_label']) ||
    str(nested(talent, ['next_show', 'date']))
  const nextVenue =
    pick(talent, ['next_venue', 'next_show_venue']) || str(nested(talent, ['next_show', 'venue']))
  const nextPrice = pick(talent, ['next_price', 'from_price'])

  const nextLabel = nextDate ? (nextDate.startsWith('Next') ? nextDate : `Next · ${nextDate}`) : undefined
  const nextEvent = nextEventName || undefined
  const nextShow =
    nextDate && nextEventName
      ? {
          headline: `${nextDate.replace(/^Next · /, '')} · ${nextEventName}`,
          detail: `${nextVenue || city}${nextPrice ? ` · from ${nextPrice.startsWith('SAR') ? nextPrice : `SAR ${nextPrice}`}` : ''}`,
        }
      : undefined

  const image =
    pick(talent, ['image', 'profile_photo', 'profilePhoto', 'photo', 'avatar', 'thumbnail']) ||
    undefined

  const verified =
    talent.verified === true ||
    talent.is_verified === true ||
    pick(talent, ['verified']) === 'true' ||
    pick(talent, ['verified']) === '1'

  return {
    id: talent.id != null ? str(talent.id) : undefined,
    slug,
    name,
    discipline,
    meta,
    rating,
    reviews,
    city,
    nextLabel,
    nextEvent,
    nextShow,
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
    return talents.find((t) => str(t.id) === slugOrId)
  }
  return talents.find((t) => {
    const mapped = mapApiTalentToCard(t)
    return mapped.slug === slugOrId || slugify(mapped.name) === slugOrId
  })
}

export function resolveTalentId(talents: ApiRecord[] | undefined, slugOrId: string): string | undefined {
  if (/^\d+$/.test(slugOrId)) return slugOrId
  const match = resolveTalentFromList(talents, slugOrId)
  return match?.id != null ? str(match.id) : undefined
}
