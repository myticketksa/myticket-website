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
  if (!session?.holdId) return false
  return numericHoldSeatIds(session).length > 0
}
