/**
 * Same-tab payment handoff.
 *
 * Pay sends the buyer to the gateway in this tab. The gateway's status page
 * then sends them to `returnUrl` with the order id we put there. Session keys
 * keep a back-path so we can land them where they started and show a success
 * modal — the gateway itself never knows about our SPA routes.
 */

export const PAYING_ORDER_KEY = "myticket.payingOrderId";
export const PAYMENT_BACK_PATH_KEY = "myticket.paymentBackPath";
export const PAYMENT_SUCCESS_ORDER_KEY = "myticket.paymentSuccessOrderId";

/** Hosts the API allow-lists for `returnUrl` (must stay in sync with backend). */
const ALLOWED_RETURN_HOSTS = new Set([
  "myticket.sa",
  "www.myticket.sa",
  "localhost",
  "127.0.0.1",
]);

/**
 * Build the URL HyperPay / the status page may send the buyer back to.
 *
 * The API drops any return address that is not https on an allow-listed host
 * (http is only accepted for localhost). When this origin cannot be used we
 * fall back to production so the order reference still arrives somewhere.
 */
export function buildPaymentReturnUrl(orderId: number): string {
  const path = `/payment-return?orderId=${orderId}`;
  try {
    const origin = new URL(window.location.origin);
    const host = origin.hostname.toLowerCase();
    const localHttp =
      origin.protocol === "http:" &&
      (host === "localhost" || host === "127.0.0.1");
    const secureAllowed =
      origin.protocol === "https:" && ALLOWED_RETURN_HOSTS.has(host);

    if (localHttp || secureAllowed) {
      return `${origin.origin}${path}`;
    }
  } catch {
    // fall through
  }
  return `https://myticket.sa${path}`;
}

/** Remember the order and the page to restore after the gateway. */
export function beginPaymentRedirect(orderId: number, backPath: string): void {
  sessionStorage.setItem(PAYING_ORDER_KEY, String(orderId));
  sessionStorage.setItem(
    PAYMENT_BACK_PATH_KEY,
    backPath.startsWith("/") ? backPath : "/",
  );
  sessionStorage.setItem("myticket.lastOrderId", String(orderId));
}

export function consumePaymentBackPath(fallback = "/"): string {
  const path = sessionStorage.getItem(PAYMENT_BACK_PATH_KEY) ?? fallback;
  sessionStorage.removeItem(PAYMENT_BACK_PATH_KEY);
  return path.startsWith("/") ? path : fallback;
}

/** Mark success so the restored page can open a modal. */
export function markPaymentSuccess(orderId: number): void {
  sessionStorage.setItem(PAYMENT_SUCCESS_ORDER_KEY, String(orderId));
  sessionStorage.removeItem(PAYING_ORDER_KEY);
}

export function consumePaymentSuccessOrderId(): number | null {
  const raw = sessionStorage.getItem(PAYMENT_SUCCESS_ORDER_KEY);
  sessionStorage.removeItem(PAYMENT_SUCCESS_ORDER_KEY);
  const id = Number(raw ?? "");
  return Number.isInteger(id) && id > 0 ? id : null;
}
