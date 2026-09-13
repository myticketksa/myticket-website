/** Shared helpers for MyTicket API records (often bilingual `{ en, ar }`). */

import type { Locale } from '@/i18n/config'
import { readStoredLocale } from '@/i18n/config'

type ApiRecord = Record<string, unknown>

export type LocalizedOptions = {
  locale?: Locale
  fallback?: string
}

function preferredKeys(locale: Locale): string[] {
  return locale === 'ar'
    ? ['ar', 'name_ar', 'title_ar', 'label_ar', 'en', 'name_en', 'name', 'title', 'label']
    : ['en', 'name_en', 'name', 'title', 'label', 'ar', 'name_ar']
}

/** Resolve bilingual API values using the active UI locale (defaults to stored). */
export function localizedString(
  value: unknown,
  fallbackOrOptions: string | LocalizedOptions = '',
): string {
  const options: LocalizedOptions =
    typeof fallbackOrOptions === 'string'
      ? { fallback: fallbackOrOptions }
      : fallbackOrOptions
  const fallback = options.fallback ?? ''
  const locale = options.locale ?? readStoredLocale()

  if (value == null) return fallback
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const text = String(value).trim()
    return text || fallback
  }
  if (typeof value === 'object') {
    const record = value as ApiRecord
    for (const key of preferredKeys(locale)) {
      const nested = record[key]
      if (typeof nested === 'string' && nested.trim()) return nested.trim()
      if (nested && typeof nested === 'object') {
        const deeper = localizedString(nested, { locale, fallback: '' })
        if (deeper) return deeper
      }
    }
  }
  return fallback
}

export function pickLocalized(
  record: ApiRecord,
  keys: string[],
  fallbackOrOptions: string | LocalizedOptions = '',
): string {
  const options: LocalizedOptions =
    typeof fallbackOrOptions === 'string'
      ? { fallback: fallbackOrOptions }
      : fallbackOrOptions
  for (const key of keys) {
    const text = localizedString(record[key], options)
    if (text) return text
  }
  return options.fallback ?? ''
}

export function nestedValue(record: ApiRecord, path: string[]): unknown {
  let current: unknown = record
  for (const key of path) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as ApiRecord)[key]
  }
  return current
}

function bcp47(locale: Locale): string {
  return locale === 'ar' ? 'ar-SA' : 'en-SA'
}

export function formatMoneySar(
  value: unknown,
  fallbackOrLocale: string | Locale = 'SAR —',
  localeArg?: Locale,
): string {
  const locale =
    localeArg ??
    (fallbackOrLocale === 'en' || fallbackOrLocale === 'ar'
      ? fallbackOrLocale
      : readStoredLocale())
  const fallback =
    fallbackOrLocale === 'en' || fallbackOrLocale === 'ar' ? 'SAR —' : fallbackOrLocale

  if (value == null || value === '') return fallback
  if (typeof value === 'string' && /sar|ر\.?\s*س/i.test(value)) return value
  const n = Number(value)
  if (!Number.isFinite(n)) return localizedString(value, { locale, fallback })
  if (n === 0) return locale === 'ar' ? 'مجاني' : 'Free'
  try {
    return new Intl.NumberFormat(bcp47(locale), {
      style: 'currency',
      currency: 'SAR',
      numberingSystem: 'latn',
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    }).format(n)
  } catch {
    return `SAR ${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`
  }
}

export function formatApiDate(value: unknown, localeArg?: Locale): string {
  const locale = localeArg ?? readStoredLocale()
  const raw = localizedString(value, { locale })
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString(bcp47(locale), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    numberingSystem: 'latn',
  })
}

/** First ticket type id from an event detail/list row (for hold / create order). */
export function firstTicketTypeId(event: ApiRecord | undefined): number | undefined {
  if (!event) return undefined
  const types = event.ticketTypes ?? event.ticket_types ?? event.tickets
  if (!Array.isArray(types) || types.length === 0) return undefined
  const first = types[0] as ApiRecord
  const id = first?.id ?? first?.ticket_id ?? first?.ticketId
  if (id == null || !/^\d+$/.test(String(id))) return undefined
  return Number(id)
}
