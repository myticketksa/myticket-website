import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteFooter, SiteHeader } from "@/components/navigation";
import { PaymentSuccessModal } from "@/components/feedback";
import { PageFade } from "@/components/motion";
import { useAppSelector } from "@/app/hooks";
import { selectIsAuthenticated } from "@/features/auth/authSlice";
import { useHeaderAccount } from "@/lib/auth/accountChip";
import { consumePaymentSuccessOrderId } from "@/lib/purchase/paymentReturn";
import { useResumePayment } from "@/lib/purchase/useResumePayment";

/**
 * Pattern A — MainLayout.
 * Active nav derived from path: Events · Experiences · Talents · Facilities.
 */
function resolveNav(
  pathname: string,
): {
  activeItem?: string;
  activeItemState?: "active" | "section";
} {
  const segments = pathname.split("/").filter(Boolean);
  const root = segments[0];
  if (!root) return {};

  if (root === "search") return {};

  if (
    pathname.startsWith("/for-vendors") ||
    pathname.startsWith("/apply/facilities") ||
    pathname.startsWith("/apply/vendor") ||
    pathname.startsWith("/my-facilities-application") ||
    pathname.startsWith("/my-vendor-application")
  ) {
    return { activeItem: "Facilities", activeItemState: "active" };
  }

  if (root === "talents" || pathname.startsWith("/apply/talent")) {
    return {
      activeItem: "Talents",
      activeItemState: segments.length === 1 ? "active" : "section",
    };
  }

  if (root === "events") {
    return {
      activeItem: "Events",
      activeItemState: segments.length === 1 ? "active" : "section",
    };
  }

  if (root === "experiences") {
    return {
      activeItem: "Experiences",
      activeItemState: segments.length === 1 ? "active" : "section",
    };
  }

  return {};
}

export function MainLayout() {
  // A payment left in flight is picked up wherever the gateway drops the buyer.
  useResumePayment();
  const { pathname } = useLocation();
  const nav = resolveNav(pathname);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const account = useHeaderAccount();
  const signedIn = isAuthenticated || pathname === "/order-confirmation";
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null);

  // After /payment-return restores the prior page, open the success modal once.
  useEffect(() => {
    if (pathname.startsWith("/payment-return")) return;
    const id = consumePaymentSuccessOrderId();
    if (id != null) setSuccessOrderId(id);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col bg-bg-page">
      <SiteHeader
        state={signedIn ? "signedIn" : "signedOut"}
        activeItem={nav.activeItem}
        activeItemState={nav.activeItemState}
        account={signedIn ? account : undefined}
      />
      <main className="flex-1">
        <PageFade>
          <Outlet />
        </PageFade>
      </main>
      <SiteFooter />
      <PaymentSuccessModal
        open={successOrderId != null}
        orderId={successOrderId}
        onClose={() => setSuccessOrderId(null)}
      />
    </div>
  );
}
