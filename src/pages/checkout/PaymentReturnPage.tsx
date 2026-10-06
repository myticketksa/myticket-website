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
    (order as Record<string, unknown> | undefined)?.paymentStatus ?? "",
  ).toLowerCase();
  const settling = isPaymentPending(status);
  const paid = isPaymentSettled(status);

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

  if (orderId == null || isError) {
    return (
      <Shell title={t("checkout:payment.unknownTitle")}>
        <p className="text-[14px] text-ink-secondary">
          {t("checkout:payment.unknownBody")}
        </p>
        <Button onClick={() => navigate("/my-tickets", { replace: true })}>
          {t("checkout:payment.goToTickets")}
        </Button>
      </Shell>
    );
  }

  if (settling && !gaveUp) {
    return (
      <Shell title={t("checkout:confirmation.settlingTitle")} spinner>
        <p className="text-[14px] text-ink-secondary">
          {t("checkout:confirmation.settlingBody")}
        </p>
      </Shell>
    );
  }

  if (settling) {
    return (
      <Shell title={t("checkout:payment.slowTitle")}>
        <p className="text-[14px] text-ink-secondary">
          {t("checkout:payment.slowBody")}
        </p>
        <Button onClick={() => navigate("/my-tickets", { replace: true })}>
          {t("checkout:payment.goToTickets")}
        </Button>
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
      <Button
        onClick={() =>
          navigate(consumePaymentBackPath("/my-tickets"), { replace: true })
        }
      >
        {t("checkout:payment.tryAgain")}
      </Button>
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
