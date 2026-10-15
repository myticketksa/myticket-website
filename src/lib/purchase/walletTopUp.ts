/**
 * Wallet top-up handoff to the payment page.
 *
 * The API answers a top-up with the payment page's address and nothing else
 * — no order id — and the gateway sends the buyer back to /payment-return
 * without one. So the amount and start time are kept here, and success is
 * read from the wallet's own history: a top-up entry for that amount, made
 * after the buyer left.
 */

const KEY = 'myticket.walletTopUp'

export type PendingTopUp = { amount: number; startedAt: number }

export function beginTopUpRedirect(amount: number): void {
  sessionStorage.setItem(KEY, JSON.stringify({ amount, startedAt: Date.now() }))
}

export function readPendingTopUp(): PendingTopUp | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PendingTopUp>
    const amount = Number(parsed.amount)
    const startedAt = Number(parsed.startedAt)
    return Number.isFinite(amount) && amount > 0 && Number.isFinite(startedAt)
      ? { amount, startedAt }
      : null
  } catch {
    return null
  }
}

export function clearPendingTopUp(): void {
  sessionStorage.removeItem(KEY)
}

/** Whether the wallet history shows this top-up as paid. */
export function hasTopUpEntry(
  transactions: Record<string, unknown>[] | undefined,
  pending: PendingTopUp,
): boolean {
  // Two minutes of slack for the server clock against this one.
  const since = pending.startedAt - 2 * 60 * 1000
  return (transactions ?? []).some((row) => {
    const type = String(row.transaction_type ?? row.type ?? '').toLowerCase()
    const amount = Number(row.amount)
    const at = Date.parse(String(row.created_at ?? ''))
    return (
      type === 'topup' &&
      Math.abs(amount - pending.amount) < 0.01 &&
      Number.isFinite(at) &&
      at >= since
    )
  })
}
