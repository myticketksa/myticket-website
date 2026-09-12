import { asList } from '@/lib/api/unwrap'

export type ApiRecord = Record<string, unknown>

export type SeatMapStatus =
  | 'available'
  | 'vip'
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'sold'
  | 'held'
  | 'accessible'

export interface MappedSeat {
  id: string
  status: SeatMapStatus
  price?: number
  category?: string
  row: string
  number: number
}

export interface MappedSeatRow {
  row: string
  seats: MappedSeat[]
}

function tierFrom(raw: unknown): SeatMapStatus | null {
  const value = String(raw ?? '').toLowerCase()
  if (!value) return null
  if (value.includes('vip')) return 'vip'
  if (value.includes('gold')) return 'gold'
  if (value.includes('silver')) return 'silver'
  if (value.includes('bronze')) return 'bronze'
  if (value.includes('access')) return 'accessible'
  return null
}

function statusFrom(record: ApiRecord): SeatMapStatus {
  const raw = String(record.status ?? record.state ?? 'available').toLowerCase()
  if (raw === 'sold' || raw === 'reserved') return 'sold'
  if (raw === 'held' || raw === 'hold') return 'held'
  return (
    tierFrom(record.tier ?? record.category ?? record.zone ?? record.type) ?? 'gold'
  )
}

function rowLabel(record: ApiRecord, index: number): string {
  const raw = record.row ?? record.rowLabel ?? record.row_label ?? record.section
  if (raw != null && String(raw).trim()) return String(raw).trim().toUpperCase()
  return String.fromCharCode(65 + (index % 26))
}

function seatNumber(record: ApiRecord, indexInRow: number): number {
  const raw = record.number ?? record.seatNumber ?? record.seat_number ?? record.col
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : indexInRow + 1
}

function seatId(record: ApiRecord, row: string, number: number): string {
  const raw = record.id ?? record.seatId ?? record.seat_id
  if (raw != null && String(raw).trim()) return String(raw)
  return `${row}${number}`
}

/**
 * Map `GET /seats/event/{id}` payloads into row/column UI seats.
 * Returns `null` when the list is empty so callers keep the Figma fixture hall.
 */
export function mapApiSeatsToRows(payload: unknown): MappedSeatRow[] | null {
  const list = Array.isArray(payload)
    ? (payload as ApiRecord[])
    : asList<ApiRecord>(payload)
  if (list.length === 0) return null

  const grouped = new Map<string, MappedSeat[]>()

  list.forEach((record, index) => {
    const row = rowLabel(record, index)
    const existing = grouped.get(row) ?? []
    const number = seatNumber(record, existing.length)
    const priceRaw = record.price ?? record.amount ?? record.ticket_price
    const price = priceRaw != null && Number.isFinite(Number(priceRaw)) ? Number(priceRaw) : undefined
    const category =
      record.category != null || record.tier != null || record.zone != null
        ? String(record.category ?? record.tier ?? record.zone)
        : undefined

    existing.push({
      id: seatId(record, row, number),
      status: statusFrom(record),
      price,
      category,
      row,
      number,
    })
    grouped.set(row, existing)
  })

  return Array.from(grouped.entries()).map(([row, seats]) => ({
    row,
    seats: seats.sort((a, b) => a.number - b.number),
  }))
}

export function unwrapHoldId(held: ApiRecord): string | undefined {
  const raw = held.holdId ?? held.hold_id ?? held.id
  return raw != null ? String(raw) : undefined
}
