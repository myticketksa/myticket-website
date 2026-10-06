import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

/**
 * A reservation, drawn as a ticket stub — the shape the original site used.
 *
 * Its card is a warm panel with the event's cover and name, the venue, and two
 * labelled rows: when the booking was made and when the show starts. A coloured
 * tear strip runs down the end, which is what makes it read as a ticket rather
 * than another content card. Tapping it opens the full ticket.
 */
export interface ReservationStubProps {
  to: string;
  title: string;
  venue: string;
  cover?: string;
  /** When the booking was made. */
  bookedAt: string;
  /** When the event starts. */
  startsAt: string;
  /** Shown over the stub when the ticket is not simply valid. */
  note?: string;
  className?: string;
}

export function ReservationStub({
  to,
  title,
  venue,
  cover,
  bookedAt,
  startsAt,
  note,
  className,
}: ReservationStubProps) {
  const { t } = useTranslation(["account", "common"]);

  return (
    <Link
      to={to}
      className={cn(
        "group flex w-full overflow-hidden rounded-[14px] border border-border-default bg-bg-warm transition-[border-color,box-shadow] duration-micro ease-micro hover:border-border-brand hover:shadow-[0_10px_28px_-20px_rgba(25,16,8,0.45)]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-sm p-lg">
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="h-[128px] w-full rounded-[10px] object-cover"
          />
        ) : (
          <div className="h-[128px] w-full rounded-[10px] bg-bg-tint-brand" />
        )}

        <h3 className="text-balance text-[16px] font-bold text-ink-brand">
          {title}
        </h3>
        <p className="text-[13px] text-ink-secondary">{venue}</p>

        <dl className="mt-[2px] flex flex-col gap-[6px] text-[13px]">
          <div className="flex items-center justify-between gap-md">
            <dt className="text-ink-secondary">
              {t("account:tickets.reservationTime")}
            </dt>
            <dd className="ltr-run font-medium text-ink-primary">{bookedAt}</dd>
          </div>
          <div className="flex items-center justify-between gap-md">
            <dt className="text-ink-secondary">
              {t("account:tickets.showTime")}
            </dt>
            <dd className="ltr-run font-medium text-ink-primary">{startsAt}</dd>
          </div>
        </dl>

        {note ? (
          <p className="mt-[2px] text-[12.5px] font-semibold text-ink-brand">
            {note}
          </p>
        ) : null}
      </div>

      {/* The tear strip. Decorative — it is what makes this read as a ticket. */}
      <span aria-hidden className="w-[14px] shrink-0 bg-brand-gradient" />
    </Link>
  );
}
