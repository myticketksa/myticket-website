import { mapApiEventToCard } from '@/lib/api/mappers/events'
import { mapApiExperienceToCard } from '@/lib/api/mappers/experiences'
import { mapApiTalentToCard } from '@/lib/api/mappers/talents'
import { localizedString } from '@/lib/api/locale'
import type { SavedItemFixture, SavedKind } from '@/pages/_account/fixtures'

export type FavoriteSource = 'event' | 'experience' | 'talent'

export type MappedFavorite = SavedItemFixture & {
  /** Target entity id (event / experience / talent). Used for unfavorite APIs. */
  itemId: string
  /** Favorite row id from GET /favorites. */
  favoriteRowId?: string
  source: FavoriteSource
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

export function favoriteRecordType(record: Record<string, unknown>): FavoriteSource {
  const value = String(record.type ?? record.kind ?? record.favoritable_type ?? 'event').toLowerCase()
  if (value.includes('experience')) return 'experience'
  if (value.includes('talent')) return 'talent'
  return 'event'
}

/** Nested entity from GET /favorites `{ type, item }` (with legacy fallbacks). */
export function favoriteRecordItem(record: Record<string, unknown>): Record<string, unknown> {
  return (
    asRecord(record.item) ??
    asRecord(record.event) ??
    asRecord(record.talent) ??
    asRecord(record.experience) ??
    asRecord(record.favoritable) ??
    record
  )
}

export function favoriteItemId(record: Record<string, unknown>): string | undefined {
  const item = favoriteRecordItem(record)
  const raw = item.id ?? record.event_id ?? record.eventId ?? record.favoritable_id
  return raw == null ? undefined : String(raw)
}

export function mapFavoriteRecord(record: Record<string, unknown>): MappedFavorite | null {
  const source = favoriteRecordType(record)
  const item = favoriteRecordItem(record)
  const itemId = favoriteItemId(record)
  if (!itemId) return null

  const favoriteRowId = record.id != null ? String(record.id) : undefined
  const kind = (source.charAt(0).toUpperCase() + source.slice(1)) as SavedKind

  if (source === 'experience') {
    const exp = mapApiExperienceToCard(item)
    return {
      title: exp.title,
      kind: 'Experience',
      when: exp.meta || '',
      place: exp.place || exp.location || '',
      price: exp.price || '',
      cta: '',
      href: `/experiences/${exp.slug}`,
      cover: exp.image || '',
      itemId,
      favoriteRowId,
      source,
    }
  }

  if (source === 'talent') {
    const talent = mapApiTalentToCard(item)
    return {
      title: talent.name,
      kind: 'Talent',
      when: talent.discipline || '',
      place: talent.city || '',
      price: talent.rating || '',
      cta: '',
      href: `/talents/${talent.slug}`,
      cover: talent.image || '',
      itemId,
      favoriteRowId,
      source,
    }
  }

  const event = mapApiEventToCard(item)
  return {
    title: event.title || localizedString(item.title, 'Favorite'),
    kind: kind === 'Vendor' ? 'Event' : 'Event',
    when: event.date || '',
    place: event.venue || localizedString(item.place),
    price: event.price || '',
    cta: '',
    href: `/events/${event.slug}`,
    cover: event.image || String(item.cover ?? item.banner ?? ''),
    itemId,
    favoriteRowId,
    source: 'event',
  }
}
