import { parsePureNumericIds } from '@/lib/api/formPayload'

/** Soft seat hold window shown in the purchase header. */
export const HOLD_DURATION_MS = 10 * 60 * 1000

export const HOLD_STORAGE_KEY = 'myticket.mockHold'

export type HeldSeatSnapshot = {
  id?: string
  label: string
  category?: string
  meta?: string
  price: number
  row?: string
}

export type HoldSession = {
  seatIds?: Array<string | number>
  seats?: HeldSeatSnapshot[]
  holdId?: string
  ticketId?: number | string
  eventId?: string
  total?: number
  subtotal?: number
  serviceFee?: number
  vat?: number
  heldAt?: number
  slug?: string
  /** Free seating skips the seat map — quantity-only checkout. */
  seatingType?: 'free' | 'assigned'
  quantity?: number
}

export function readHoldSession(): HoldSession | null {
  try {
    const raw = sessionStorage.getItem(HOLD_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as HoldSession
  } catch {
    return null
  }
}

export function writeHoldSession(session: HoldSession) {
  sessionStorage.setItem(
    HOLD_STORAGE_KEY,
    JSON.stringify({
      ...session,
      heldAt: session.heldAt ?? Date.now(),
    }),
  )
}

export function clearHoldSession() {
  sessionStorage.removeItem(HOLD_STORAGE_KEY)
}

export function holdRemainingMs(session: HoldSession | null | undefined, now = Date.now()): number {
  if (!session?.heldAt) return 0
  return Math.max(0, session.heldAt + HOLD_DURATION_MS - now)
}

export function formatHoldCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function numericHoldSeatIds(session: HoldSession | null | undefined): number[] {
  return parsePureNumericIds(session?.seatIds)
}

export function hasValidApiHold(session: HoldSession | null | undefined): boolean {
  if (!session) return false
  if (session.seatingType === 'free') {
    const qty = Number(session.quantity ?? session.seats?.length ?? 0)
    return Boolean(session.eventId && session.ticketId != null && qty > 0)
  }
  if (!session.holdId) return false
  return numericHoldSeatIds(session).length > 0
}

/** Persist a free-seating (no seat map) checkout session. */
export function writeFreeSeatingSession(input: {
  eventId: string
  ticketId: number | string
  quantity: number
  unitPrice: number
  slug?: string
  label?: string
}) {
  const quantity = Math.max(1, Math.floor(input.quantity))
  const unitPrice = Math.max(0, Number(input.unitPrice) || 0)
  const subtotal = unitPrice * quantity
  const serviceFee = Math.round(subtotal * 0.05)
  const vat = Math.round((subtotal + serviceFee) * 0.15)
  const seats: HeldSeatSnapshot[] = Array.from({ length: quantity }, (_, index) => ({
    label: input.label
      ? `${input.label} × ${index + 1}`
      : `General admission ${index + 1}`,
    meta: 'Free seating',
    price: unitPrice,
  }))

  writeHoldSession({
    seatingType: 'free',
    eventId: input.eventId,
    ticketId: input.ticketId,
    quantity,
    seats,
    seatIds: [],
    subtotal,
    serviceFee,
    vat,
    total: subtotal + serviceFee + vat,
    slug: input.slug,
  })
}
