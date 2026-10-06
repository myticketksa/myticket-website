import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui";
import { PageSection } from "@/layouts";
import { useGetOrderDetailsQuery } from "@/app/api/ordersApi";

/**
 * The gateway, in its own window, with the outcome read from our server.
 *
 * It has to be a separate window. The gateway's 3-D Secure step and its redirect
 * page both navigate the top frame, so inside an overlay they either tear the
 * site out from under the buyer or strand themselves — both were tried and both
 * were watched happening.
 *
 * What is NOT copied from the original is how it learned the result: it polled
 * `window.closed` and lost the answer whenever the window was blocked, closed
 * early, or opened on a phone. The window here is only a place to type a card.
 * The truth comes from polling the order, so a closed window, a blocked popup or
 * a buyer who wanders off cannot produce a wrong outcome.
 */
export interface PaymentFrameProps {
  open: boolean;
  orderId: number | null;
  onPaid: (orderId: number) => void;
  onFailed: (orderId: number) => void;
  onClose: () => void;
}

export function PaymentFrame({
  open,
  orderId,
  onPaid,
  onFailed,
  onClose,
}: PaymentFrameProps) {
  const { t } = useTranslation(["checkout", "common"]);
  // The window is opened by the click, before this renders — see the booking
  // handler. Here we only need a handle to close it when the order settles.
  const windowRef = useRef<Window | null>(null);
  useEffect(() => {
    if (!open) return;
    windowRef.current = window.open("", "MyTicketPayment");
  }, [open]);

  const { data: order } = useGetOrderDetailsQuery(orderId!, {
    skip: !open || orderId == null,
    pollingInterval: 2500,
  });

  const status = String(
    (order as Record<string, unknown> | undefined)?.paymentStatus ?? "",
  ).toLowerCase();

  useEffect(() => {
    if (!open || orderId == null || !status) return;
    if (status.includes("pending") || status.includes("await")) return;
    windowRef.current?.close();
    if (status.includes("paid") || status.includes("success")) onPaid(orderId);
    else onFailed(orderId);
  }, [onFailed, onPaid, open, orderId, status]);

  if (!open) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
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
                onClick={() => window.open("", "MyTicketPayment")?.focus()}
              >
                {t("checkout:payment.reopenWindow")}
              </Button>
              <button
                type="button"
                onClick={onClose}
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
