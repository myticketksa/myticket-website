import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PAYING_ORDER_KEY } from "@/lib/purchase/paymentReturn";

export { PAYING_ORDER_KEY } from "@/lib/purchase/paymentReturn";

/**
 * Catch a buyer coming back from the payment gateway, wherever it drops them.
 *
 * If `returnUrl` was accepted, they land on `/payment-return`. If it was
 * dropped (unknown host) they may land on the site home with the paying-order
 * key still set — this routes them into the return handler so the outcome is
 * still read from the order.
 */
export function useResumePayment() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith("/payment-return")) return;
    if (pathname.startsWith("/order-confirmation")) return;

    const pending = Number(sessionStorage.getItem(PAYING_ORDER_KEY) ?? "");
    if (!Number.isInteger(pending) || pending <= 0) return;

    navigate(`/payment-return?orderId=${pending}`, { replace: true });
  }, [navigate, pathname]);
}
