/**
 * Reading the order's payment status.
 *
 * The API says `completed` when a payment has gone through, not `paid` or
 * `success`. Matching on the wrong words told a buyer their payment had failed
 * while the gateway, the transaction and the order all said it succeeded —
 * caught against a real approved card, order 3985.
 *
 * Kept in one place so the three screens that ask this question cannot drift
 * apart again, and spelled generously because the words come from a service we
 * do not control.
 */
const SETTLED_OK = ["completed", "paid", "success", "captured", "settled"];
const UNSETTLED = ["pending", "await", "initiat", "process"];

export function isPaymentPending(status: string | undefined | null): boolean {
  const value = String(status ?? "").toLowerCase();
  if (!value) return true;
  return UNSETTLED.some((word) => value.includes(word));
}

export function isPaymentSettled(status: string | undefined | null): boolean {
  const value = String(status ?? "").toLowerCase();
  if (isPaymentPending(value)) return false;
  return SETTLED_OK.some((word) => value.includes(word));
}
