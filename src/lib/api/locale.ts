/** Shared helpers for MyTicket API records (often bilingual `{ en, ar }`). */

type ApiRecord = Record<string, unknown>

/** Prefer `en`, then `ar`, then any string leaf on bilingual objects. */
export function localizedString(value: unknown, fallback = ''): string {
  if (value == null) return fallback
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const text = String(value).trim()
    return text || fallback
  }
  if (typeof value === 'object') {
    const record = value as ApiRecord
    for (const key of ['en', 'ar', 'name', 'title', 'label', 'name_en', 'name_ar']) {
      const nested = record[key]
      if (typeof nested === 'string' && nested.trim()) return nested.trim()
      if (nested && typeof nested === 'object') {
        const deeper = localizedString(nested)
        if (deeper) return deeper
      }
    }
  }
  return fallback
}

export function pickLocalized(record: ApiRecord, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const text = localizedString(record[key])
    if (text) return text
  }
  return fallback
}

export function nestedValue(record: ApiRecord, path: string[]): unknown {
  let current: unknown = record
  for (const key of path) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as ApiRecord)[key]
  }
  return current
}

export function formatMoneySar(value: unknown, fallback = 'SAR —'): string {
  if (value == null || value === '') return fallback
  if (typeof value === 'string' && /sar/i.test(value)) return value
  const n = Number(value)
  if (!Number.isFinite(n)) return localizedString(value, fallback)
  if (n === 0) return 'Free'
  return `SAR ${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`
}

export function formatApiDate(value: unknown): string {
  const raw = localizedString(value)
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
