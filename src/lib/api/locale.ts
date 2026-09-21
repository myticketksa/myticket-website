/** Shared helpers for MyTicket API records (often bilingual `{ en, ar }`). */

import type { Locale } from '@/i18n/config'
import { getActiveLocale } from '@/i18n/config'

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

/** Resolve bilingual API values using the active UI locale (defaults to i18n language). */
export function localizedString(
  value: unknown,
  fallbackOrOptions: string | LocalizedOptions = '',
): string {
  const options: LocalizedOptions =
    typeof fallbackOrOptions === 'string'
      ? { fallback: fallbackOrOptions }
      : fallbackOrOptions
  const fallback = options.fallback ?? ''
  const locale = options.locale ?? getActiveLocale()

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

/**
 * Format a SAR amount as a figure only (no "SAR" / "ر.س" text).
 * Pair with `MoneyAmount` / `SarSymbol` in the UI for the official currency mark.
 * Plain-text fallbacks still use the Unicode Saudi Riyal sign (U+20C1) when needed.
 */
export function formatMoneySar(
  value: unknown,
  fallbackOrLocale: string | Locale = '—',
  localeArg?: Locale,
): string {
  const locale =
    localeArg ??
    (fallbackOrLocale === 'en' || fallbackOrLocale === 'ar'
      ? fallbackOrLocale
      : getActiveLocale())
  const fallback =
    fallbackOrLocale === 'en' || fallbackOrLocale === 'ar' ? '—' : fallbackOrLocale

  if (value == null || value === '') return fallback
  if (typeof value === 'string') {
    const stripped = value
      .replace(/^(From|من)\s+/i, '')
      .replace(/^(?:SAR|SR|RS|﷼|⃁|ر\.?\s*س\.?)\s*/i, '')
      .trim()
    if (/^(free|مجاني)$/i.test(stripped)) {
      return locale === 'ar' ? 'مجاني' : 'Free'
    }
    if (/^[\d,]+(?:\.\d+)?\+?$/.test(stripped)) return stripped
    if (/sar|ر\.?\s*س|⃁/i.test(value)) return stripped || fallback
  }
  const n = Number(value)
  if (!Number.isFinite(n)) return localizedString(value, { locale, fallback })
  if (n === 0) return locale === 'ar' ? 'مجاني' : 'Free'
  try {
    return new Intl.NumberFormat(bcp47(locale), {
      numberingSystem: 'latn',
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    }).format(n)
  } catch {
    return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)
  }
}

export function formatApiDate(value: unknown, localeArg?: Locale): string {
  const locale = localeArg ?? getActiveLocale()
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

/**
 * Human-friendly notification timestamps:
 * recent → relative ("3 hours ago"); yesterday → "Yesterday, 08:06"; else short date + time.
 */
export function formatHumanDateTime(value: unknown, localeArg?: Locale): string {
  const locale = localeArg ?? getActiveLocale()
  const raw = localizedString(value, { locale })
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const absSec = Math.abs(diffSec)
  const rtf = new Intl.RelativeTimeFormat(bcp47(locale), { numeric: 'auto' })

  if (absSec < 60) return rtf.format(-Math.round(diffSec), 'second')
  if (absSec < 3600) return rtf.format(-Math.round(diffSec / 60), 'minute')
  if (absSec < 86400) return rtf.format(-Math.round(diffSec / 3600), 'hour')

  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startYesterday = new Date(startToday)
  startYesterday.setDate(startYesterday.getDate() - 1)
  const timePart = date.toLocaleTimeString(bcp47(locale), {
    hour: '2-digit',
    minute: '2-digit',
    numberingSystem: 'latn',
  })

  if (date >= startYesterday && date < startToday) {
    const yesterdayLabel = locale === 'ar' ? 'أمس' : 'Yesterday'
    return `${yesterdayLabel}, ${timePart}`
  }

  if (date >= startToday) {
    const todayLabel = locale === 'ar' ? 'اليوم' : 'Today'
    return `${todayLabel}, ${timePart}`
  }

  if (absSec < 7 * 86400) {
    return `${rtf.format(-Math.round(diffSec / 86400), 'day')}, ${timePart}`
  }

  return date.toLocaleString(bcp47(locale), {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    numberingSystem: 'latn',
  })
}

/** Bucket a timestamp into Today / Yesterday / Earlier for inbox grouping. */
export function notificationDayGroup(
  value: unknown,
): 'TODAY' | 'YESTERDAY' | 'EARLIER' {
  const raw = localizedString(value)
  if (!raw) return 'EARLIER'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return 'EARLIER'
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startYesterday = new Date(startToday)
  startYesterday.setDate(startYesterday.getDate() - 1)
  if (date >= startToday) return 'TODAY'
  if (date >= startYesterday) return 'YESTERDAY'
  return 'EARLIER'
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
