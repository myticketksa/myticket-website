import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CloseIcon } from "@/components/icons";
import { useGetOrderDetailsQuery } from "@/app/api/ordersApi";

/**
 * The gateway's own payment page, shown over the site instead of replacing it.
 *
 * The card form is still served by the gateway, so card details never touch our
 * code and the PCI posture is unchanged — this only changes where the page is
 * drawn. The buyer keeps their place on the event, there is no popup to be
 * blocked, and no hand-off to a different site to come back from.
 *
 * The frame is never asked what happened. It cannot be read across origins and
 * should not be trusted if it could; the outcome comes from polling the order on
 * our server, exactly as it does on the return page. Closing the overlay cancels
 * nothing — the order stays payable.
 */
export interface PaymentFrameProps {
  open: boolean;
  url: string | null;
  orderId: number | null;
  onPaid: (orderId: number) => void;
  onFailed: (orderId: number) => void;
  onClose: () => void;
}

export function PaymentFrame({
  open,
  url,
  orderId,
  onPaid,
  onFailed,
  onClose,
}: PaymentFrameProps) {
  const { t } = useTranslation(["checkout", "common"]);

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
    if (status.includes("paid") || status.includes("success")) onPaid(orderId);
    else onFailed(orderId);
  }, [onFailed, onPaid, open, orderId, status]);

  if (!url) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-surface-inverse/65 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-[60] flex h-[92dvh] flex-col overflow-hidden rounded-t-[22px] bg-surface-default outline-none sm:inset-0 sm:m-auto sm:h-[640px] sm:max-h-[90dvh] sm:w-[min(100vw-2rem,460px)] sm:rounded-[22px]">
          <div className="flex items-center justify-between gap-md border-b border-border-default px-lg py-md">
            <DialogPrimitive.Title className="text-[15px] font-semibold text-ink-primary">
              {t("checkout:payment.frameTitle")}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label={t("common:actions.close")}
              className="rounded-full p-[6px] text-ink-secondary hover:text-ink-primary"
            >
              <CloseIcon size={18} />
            </DialogPrimitive.Close>
          </div>

          <iframe
            src={url}
            title={t("checkout:payment.frameTitle")}
            className="min-h-0 w-full flex-1 border-0"
            // The gateway needs these to run its own card and 3-D Secure flow.
            allow="payment *; clipboard-write"
          />

          <p className="border-t border-border-default px-lg py-sm text-center text-[12px] text-ink-muted">
            {t("checkout:payment.frameNote")}
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
