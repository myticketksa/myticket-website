import { Dialog as DialogPrimitive } from "radix-ui";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
import { PageSection } from "@/layouts";

export interface PaymentSuccessModalProps {
  open: boolean;
  orderId: number | null;
  onClose: () => void;
}

/**
 * Shown after the gateway returns the buyer to the page they left.
 * Two next steps only: open My reservation, or gift the ticket.
 */
export function PaymentSuccessModal({
  open,
  orderId,
  onClose,
}: PaymentSuccessModalProps) {
  const { t } = useTranslation(["checkout", "common"]);
  const navigate = useNavigate();

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-surface-inverse/55 backdrop-blur-[1.5px]" />
        <DialogPrimitive.Content className="fixed inset-0 z-[60] m-auto h-fit w-[min(100vw-2rem,420px)] rounded-[22px] bg-surface-default p-xl outline-none shadow-overlay">
          <PageSection padTop={0} padBottom={0}>
            <div className="flex flex-col items-center gap-md text-center">
              <span
                className="flex size-[52px] items-center justify-center rounded-full bg-state-success-tint text-[22px] font-bold text-state-success"
                aria-hidden
              >
                ✓
              </span>
              <DialogPrimitive.Title className="text-[18px] font-bold text-ink-primary">
                {t("checkout:payment.successTitle")}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-[14px] leading-[1.55] text-ink-secondary">
                {t("checkout:payment.successBody", {
                  orderId: orderId ?? "",
                })}
              </DialogPrimitive.Description>
              <Button
                className="w-full"
                onClick={() => {
                  onClose();
                  navigate("/my-tickets");
                }}
              >
                {t("checkout:payment.goToReservation")}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                disabled={orderId == null}
                onClick={() => {
                  onClose();
                  if (orderId) {
                    navigate(`/my-tickets/${orderId}/gift`);
                  }
                }}
              >
                {t("checkout:payment.giftTicket")}
              </Button>
            </div>
          </PageSection>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
