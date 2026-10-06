import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui";
import { PageSection } from "@/layouts";
import { useGetOrderDetailsQuery } from "@/app/api/ordersApi";
import { isPaymentPending, isPaymentSettled } from "@/lib/purchase/paymentStatus";

/**
 * Payment runs in a separate browser *tab*; this overlay stays on the booking
 * tab and polls the order until it settles, then closes the payment tab and
 * focuses this one again.
 *
 * The gateway must not load in an iframe/overlay — 3-D Secure and its return
 * navigate the top frame and tear the SPA apart.
 */
export interface PaymentFrameProps {
  open: boolean;
  orderId: number | null;
  /** Tab opened on the Pay click (gesture-safe). */
  paymentWindow?: Window | null;
  onPaid: (orderId: number) => void;
  onFailed: (orderId: number) => void;
  onClose: () => void;
}

function closePaymentTab(tab: Window | null | undefined) {
  if (!tab || tab.closed) return;
  try {
    tab.close();
  } catch {
    // Cross-origin after gateway redirect — ignore.
  }
}

export function PaymentFrame({
  open,
  orderId,
  paymentWindow = null,
  onPaid,
  onFailed,
  onClose,
}: PaymentFrameProps) {
  const { t } = useTranslation(["checkout", "common"]);
  const tabRef = useRef<Window | null>(null);
  const onPaidRef = useRef(onPaid);
  const onFailedRef = useRef(onFailed);
  const handledRef = useRef(false);

  onPaidRef.current = onPaid;
  onFailedRef.current = onFailed;

  useEffect(() => {
    if (!open) {
      handledRef.current = false;
      tabRef.current = null;
      return;
    }
    tabRef.current = paymentWindow;
  }, [open, paymentWindow]);

  const { data: order } = useGetOrderDetailsQuery(orderId!, {
    skip: !open || orderId == null,
    pollingInterval: 2500,
  });

  const status = String(
    (order as Record<string, unknown> | undefined)?.paymentStatus ?? "",
  ).toLowerCase();

  useEffect(() => {
    if (!open || orderId == null || handledRef.current) return;
    if (isPaymentPending(status)) return;

    handledRef.current = true;
    closePaymentTab(tabRef.current);
    tabRef.current = null;
    // Bring the buyer back to this tab before routing/toasting.
    try {
      window.focus();
    } catch {
      // ignore
    }

    if (isPaymentSettled(status)) onPaidRef.current(orderId);
    else onFailedRef.current(orderId);
  }, [open, orderId, status]);

  if (!open) return null;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        closePaymentTab(tabRef.current);
        onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-surface-inverse/65 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed inset-0 z-[60] m-auto h-fit w-[min(100vw-2rem,420px)] rounded-[22px] bg-surface-default p-xl outline-none">
          <PageSection padTop={0} padBottom={0}>
            <div className="flex flex-col items-center gap-md text-center">
              <span className="size-[28px] animate-spin rounded-full border-[3px] border-border-default border-t-ink-brand" />
              <DialogPrimitive.Title className="text-[17px] font-bold text-ink-primary">
                {t("checkout:payment.frameTitle")}
              </DialogPrimitive.Title>
              <p className="text-[14px] text-ink-secondary">
                {t("checkout:payment.windowNote")}
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  const tab = tabRef.current;
                  if (tab && !tab.closed) {
                    tab.focus();
                    return;
                  }
                  tabRef.current = window.open("about:blank", "_blank");
                  tabRef.current?.focus();
                }}
              >
                {t("checkout:payment.reopenWindow")}
              </Button>
              <button
                type="button"
                onClick={() => {
                  closePaymentTab(tabRef.current);
                  onClose();
                }}
                className="text-[13px] text-ink-muted underline"
              >
                {t("common:actions.cancel")}
              </button>
            </div>
          </PageSection>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
