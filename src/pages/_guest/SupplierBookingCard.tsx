import { useTranslation } from "react-i18next";
import { getActiveLocale } from "@/i18n/config";
import type { SupplierBooking } from "@/lib/api/mappers/supplierBookings";

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-bold tracking-[0.77px] text-ink-muted uppercase">{label}</p>
      <p className="mt-[4px] text-[15px] font-semibold text-ink-primary">{value}</p>
    </div>
  );
}

/**
 * A trip run by another company (Al-Haddad Scuba): their booking number,
 * departure, guests and meeting point, with their ticket (what their staff
 * scan) and their guest-details form. Everything here comes from their system.
 */
export function SupplierBookingCard({ booking }: { booking: SupplierBooking }) {
  const { t } = useTranslation("common");
  const ar = getActiveLocale() === "ar";
  const name = booking.operator;
  const guests = [
    booking.guests.adults ? t("supplier.adults", { count: booking.guests.adults }) : null,
    booking.guests.children ? t("supplier.children", { count: booking.guests.children }) : null,
    booking.guests.infants ? t("supplier.infants", { count: booking.guests.infants }) : null,
  ]
    .filter(Boolean)
    .join(ar ? "، " : ", ");
  const departs = booking.departsAt
    ? new Date(booking.departsAt).toLocaleString(ar ? "ar-SA" : "en-SA", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Riyadh",
        numberingSystem: "latn",
      })
    : null;
  const notice =
    booking.status === "held"
      ? t("supplier.statusHeld", { name })
      : booking.status === "failed"
        ? t("supplier.statusFailed", { name })
        : booking.status === "cancelled"
          ? booking.cancelledBy === "us"
            ? t("supplier.statusCancelledByThem", { name })
            : t("supplier.statusCancelled")
          : null;

  return (
    <section className="rounded-[20px] border border-border-default bg-surface-default px-lg py-[18px] sm:px-[24px] sm:py-[22px]">
      <p className="text-[13px] font-bold text-ink-brand">{t("supplier.tripBy", { name })}</p>
      {notice ? (
        <p className="mt-md rounded-[14px] bg-bg-tint-brand px-[16px] py-[12px] text-[14px] font-bold text-ink-brand-strong">
          {notice}
        </p>
      ) : null}
      <div className="mt-md grid grid-cols-1 gap-[12px] sm:grid-cols-2 sm:gap-[18px]">
        <Row label={t("supplier.bookingNumber", { name })} value={booking.bookingNumber} />
        <Row label={t("supplier.departs")} value={departs} />
        <Row label={t("supplier.guests")} value={guests || null} />
        <Row label={t("supplier.meeting")} value={booking.meetingText} />
      </div>
      {booking.mapUrl ? (
        <a href={booking.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-xs inline-block text-[14px] text-ink-brand underline">
          {t("supplier.map")}
        </a>
      ) : null}
      {booking.ticketUrl || booking.guestDetailsUrl ? (
        <div className="mt-[18px] flex flex-col gap-md border-t border-dashed border-border-default pt-[18px]">
          {booking.ticketUrl ? (
            <div>
              <a
                href={booking.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[44px] items-center rounded-[22px] bg-brand-primary px-[20px] text-[15px] font-bold text-white"
              >
                {t("supplier.openTicket", { name })}
              </a>
              <p className="mt-[6px] text-[13px] text-ink-muted">{t("supplier.openTicketNote", { name })}</p>
            </div>
          ) : null}
          {booking.guestDetailsUrl ? (
            booking.detailsComplete ? (
              <p className="text-[14px] font-bold text-[#1B8A5A]">✓ {t("supplier.detailsDone")}</p>
            ) : (
              <div>
                <a
                  href={booking.guestDetailsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[44px] items-center rounded-[22px] border border-border-default px-[20px] text-[15px] font-bold text-ink-primary"
                >
                  {t("supplier.guestDetails")}
                </a>
                <p className="mt-[6px] text-[13px] text-ink-muted">{t("supplier.guestDetailsNote", { name })}</p>
              </div>
            )
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
