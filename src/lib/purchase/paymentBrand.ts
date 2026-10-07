/** Values the booking UI offers. */
export type BookingPaymentMethod = "card" | "apple" | "wallet";

/** Brands `POST /tickets/orders/pay` accepts for HyperPay / wallet. */
export type PaymentBrand = "CREDIT" | "APPLE" | "WALLET";

/**
 * Map the method the buyer picked to the brand the pay endpoint expects.
 *
 * Apple Pay must be `APPLE` (HyperPay widget brand `APPLEPAY` + Apple entity).
 * Sending `CREDIT` opens the card form instead.
 */
export function toPaymentBrand(method: BookingPaymentMethod): PaymentBrand {
  if (method === "wallet") return "WALLET";
  if (method === "apple") return "APPLE";
  return "CREDIT";
}
