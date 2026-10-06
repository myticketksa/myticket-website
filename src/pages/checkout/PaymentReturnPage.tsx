import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetOrderDetailsQuery } from "@/app/api/ordersApi";
import { Button } from "@/components/ui";
import { PageSection } from "@/layouts";
import { PAYING_ORDER_KEY } from "@/lib/purchase/useResumePayment";
import { isPaymentPending, isPaymentSettled } from "@/lib/purchase/paymentStatus";

/**
 * Where the payment gateway drops the buyer back.
 *
 * The outcome is read from the order on the server, never from anything the
 * gateway puts in the URL and never from the state of a browser window. The
 * original watched a popup handle and lost the result whenever that window was
 * blocked, closed early, or opened on a phone; this cannot, because the order
 * is the only thing consulted.
 *
 * Three endings, and no others: paid goes to the confirmation, refused goes
 * back to the event with a reason, still-settling keeps asking for a while and
 * then hands the buyer to their tickets, where the order is waiting and can be
 * paid again. A purchase is never silently lost.
 */

/** How long to keep asking before we stop waiting on the gateway. */
const SETTLE_TIMEOUT_MS = 45_000;

function readOrderId(params: URLSearchParams): number | undefined {
  const fromUrl = Number(params.get("orderId") ?? params.get("order_id") ?? "");
  if (Number.isInteger(fromUrl) && fromUrl > 0) return fromUrl;
  const remembered = Number(
    sessionStorage.getItem(PAYING_ORDER_KEY) ?? "",
  );
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
    if (settling) return;
    sessionStorage.removeItem(PAYING_ORDER_KEY);
    if (paid) navigate(`/order-confirmation?orderId=${orderId}`, { replace: true });
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

  if (paid) return <Shell title={t("checkout:confirmation.settlingTitle")} spinner />;

  return (
    <Shell title={t("checkout:payment.refusedTitle")}>
      <p className="text-[14px] text-ink-secondary">
        {t("checkout:payment.refusedBody")}
      </p>
      <Button onClick={() => navigate("/my-tickets", { replace: true })}>
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
