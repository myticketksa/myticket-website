import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export const PAYING_ORDER_KEY = 'myticket.payingOrderId'

/**
 * Catch a buyer coming back from the payment gateway, wherever it drops them.
 *
 * The gateway's return address is configured on its side and currently lands on
 * the site's home page, so a buyer finished paying and found themselves on the
 * home page with no idea whether they had bought anything. We cannot change
 * where it sends them, but we can notice.
 *
 * An order id is stored the moment we hand the page over. On any page load, if
 * that id is still there, the payment is unresolved and the return handler
 * takes over and decides the outcome from the order itself. The key is cleared
 * only once the outcome is known, so this cannot strand anyone in a loop.
 */
export function useResumePayment() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname.startsWith('/payment-return')) return
    if (pathname.startsWith('/order-confirmation')) return

    const pending = Number(sessionStorage.getItem(PAYING_ORDER_KEY) ?? '')
    if (!Number.isInteger(pending) || pending <= 0) return

    navigate(`/payment-return?orderId=${pending}`, { replace: true })
  }, [navigate, pathname])
}
