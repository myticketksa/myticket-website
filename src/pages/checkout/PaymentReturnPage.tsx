import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetOrderDetailsQuery } from "@/app/api/ordersApi";
import { Button } from "@/components/ui";
import { PageSection } from "@/layouts";
import {
  PAYING_ORDER_KEY,
  consumePaymentBackPath,
  markPaymentSuccess,
} from "@/lib/purchase/paymentReturn";
import { isPaymentPending, isPaymentSettled } from "@/lib/purchase/paymentStatus";

/**
 * Where the payment gateway drops the buyer after paying.
 *
 * Outcome is read from the order on the server — never from URL flags the
 * gateway controls. On success we restore the page they left and leave a
 * session flag so that page can open the success modal.
 *
 * Always offer a way out while polling: if the buyer cancels Apple Pay / closes
 * the gateway, resume logic can still land them here with a pending order, and
 * a spinner-only screen traps them.
 */

const SETTLE_TIMEOUT_MS = 45_000;

function readOrderId(params: URLSearchParams): number | undefined {
  const fromUrl = Number(params.get("orderId") ?? params.get("order_id") ?? "");
  if (Number.isInteger(fromUrl) && fromUrl > 0) return fromUrl;
  const remembered = Number(sessionStorage.getItem(PAYING_ORDER_KEY) ?? "");
  return Number.isInteger(remembered) && remembered > 0 ? remembered : undefined;
}

export function PaymentReturnPage() {
  const { t } = useTranslation(["checkout", "common"]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderId] = useState(() => readOrderId(searchParams));
  const [gaveUp, setGaveUp] = useState(false);

  const { data: order, isError } = useGetOrderDetailsQuery(orderId!, {
    skip: orderId == null,
    pollingInterval: 2500,
  });

  const status = String(
    (order as Record<string, unknown> | undefined)?.paymentStatus ??
      (order as Record<string, unknown> | undefined)?.payment_status ??
      "",
  ).toLowerCase();
  const settling = isPaymentPending(status);
  const paid = isPaymentSettled(status);

  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7585/ingest/e7c61862-ca01-4245-8388-3080d99a6b97", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "000302",
      },
      body: JSON.stringify({
        sessionId: "000302",
        runId: "post-fix",
        hypothesisId: "F",
        location: "PaymentReturnPage.tsx:status",
        message: "payment-return poll",
        data: { orderId, status, settling, paid, gaveUp, isError },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [orderId, status, settling, paid, gaveUp, isError]);
  // #endregion

  useEffect(() => {
    if (settling || orderId == null) return;
    if (paid) {
      markPaymentSuccess(orderId);
      navigate(consumePaymentBackPath(`/order-confirmation?orderId=${orderId}`), {
        replace: true,
      });
      return;
    }
    sessionStorage.removeItem(PAYING_ORDER_KEY);
  }, [navigate, orderId, paid, settling]);

  useEffect(() => {
    if (!settling) return;
    const timer = window.setTimeout(() => setGaveUp(true), SETTLE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [settling]);

  function leaveWaiting(path: string) {
    sessionStorage.removeItem(PAYING_ORDER_KEY);
    navigate(path, { replace: true });
  }

  function tryAgain() {
    sessionStorage.removeItem(PAYING_ORDER_KEY);
    navigate(consumePaymentBackPath("/my-tickets"), { replace: true });
  }

  if (orderId == null || isError) {
    return (
      <Shell title={t("checkout:payment.unknownTitle")}>
        <p className="text-[14px] text-ink-secondary">
          {t("checkout:payment.unknownBody")}
        </p>
        <Button onClick={() => leaveWaiting("/my-tickets")}>
          {t("checkout:payment.goToTickets")}
        </Button>
      </Shell>
    );
  }

  if (settling) {
    return (
      <Shell
        title={
          gaveUp
            ? t("checkout:payment.slowTitle")
            : t("checkout:confirmation.settlingTitle")
        }
        spinner={!gaveUp}
      >
        <p className="text-[14px] text-ink-secondary">
          {gaveUp
            ? t("checkout:payment.slowBody")
            : t("checkout:confirmation.settlingBody")}
        </p>
        <div className="mt-sm flex w-full flex-col gap-sm sm:flex-row sm:justify-center">
          <Button onClick={tryAgain}>{t("checkout:payment.tryAgain")}</Button>
          <Button variant="secondary" onClick={() => leaveWaiting("/my-tickets")}>
            {t("checkout:payment.goToTickets")}
          </Button>
        </div>
      </Shell>
    );
  }

  if (paid) {
    return <Shell title={t("checkout:confirmation.settlingTitle")} spinner />;
  }

  return (
    <Shell title={t("checkout:payment.refusedTitle")}>
      <p className="text-[14px] text-ink-secondary">
        {t("checkout:payment.refusedBody")}
      </p>
      <Button onClick={tryAgain}>{t("checkout:payment.tryAgain")}</Button>
    </Shell>
  );
}

function Shell({
  title,
  spinner,
  children,
}: {
  title: string;
  spinner?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <PageSection padTop={52} padBottom={96}>
      <div
        className="mx-auto flex max-w-[520px] flex-col items-center gap-md text-center"
        role="status"
        aria-live="polite"
      >
        {spinner && (
          <span className="size-[28px] animate-spin rounded-full border-[3px] border-border-default border-t-ink-brand" />
        )}
        <h1 className="text-[22px] font-bold text-ink-primary">{title}</h1>
        {children}
      </div>
    </PageSection>
  );
}
