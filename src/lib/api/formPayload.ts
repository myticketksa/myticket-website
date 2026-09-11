import { localizedString } from '@/lib/api/locale'

/** Shared helpers so guest POST bodies match Postman field names and value shapes. */

export type IdLabelOption = { value: string; label: string }

/** Saudi phone as digits with country code, e.g. `9665XXXXXXXX`. */
export function normalizeSaudiPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('966')) return digits
  if (digits.startsWith('0')) return `966${digits.slice(1)}`
  return `966${digits}`
}

/**
 * Login / gift / OTP identifier: leave emails alone; normalize phones to `966…`.
 */
export function normalizeAuthIdentifier(raw: string): string {
  const value = raw.trim()
  if (!value) return ''
  if (value.includes('@')) return value
  return normalizeSaudiPhone(value)
}

export function mapApiIdLabelOptions(
  records: Record<string, unknown>[] | undefined,
  fallback: readonly IdLabelOption[],
): IdLabelOption[] {
  if (!records?.length) return [...fallback]

  const mapped = records
    .map((row) => {
      const value = row.id ?? row.value ?? row.code
      const label =
        localizedString(row.name) ||
        localizedString(row.title) ||
        localizedString(row.label) ||
        localizedString(row.name_en) ||
        localizedString(value)
      if (value == null || !label) return null
      return { value: String(value), label }
    })
    .filter((row): row is IdLabelOption => row != null)

  return mapped.length > 0 ? mapped : [...fallback]
}

/** Only pure numeric seat/ticket ids — never parse fixture labels like `C11` → `11`. */
export function parsePureNumericIds(values: unknown[] | undefined): number[] {
  if (!values?.length) return []
  return values
    .map((value) => {
      const raw = String(value ?? '').trim()
      if (!/^\d+$/.test(raw)) return NaN
      return Number(raw)
    })
    .filter((n) => Number.isFinite(n) && n > 0)
}

export function extractOrderTicketIds(order: Record<string, unknown> | undefined): number[] {
  if (!order) return []

  const direct = parsePureNumericIds(
    (order.ticketIds as unknown[]) ?? (order.ticket_ids as unknown[]),
  )
  if (direct.length) return direct

  const tickets = order.tickets ?? order.items ?? order.order_tickets
  if (!Array.isArray(tickets)) return []

  return tickets
    .map((item) => {
      if (item == null || typeof item !== 'object') {
        return /^\d+$/.test(String(item)) ? Number(item) : NaN
      }
      const row = item as Record<string, unknown>
      const id = row.id ?? row.ticket_id ?? row.ticketId
      return id != null && /^\d+$/.test(String(id)) ? Number(id) : NaN
    })
    .filter((n) => Number.isFinite(n) && n > 0)
}

export function extractOrderId(order: Record<string, unknown> | undefined): number {
  if (!order) return 0
  const raw = order.id ?? order.order_id ?? order.orderId
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 0
}
