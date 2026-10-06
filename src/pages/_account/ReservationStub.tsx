import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

/**
 * A reservation drawn as an actual ticket, the way the original site drew it.
 *
 * What makes it read as a ticket is not the content — it is the shape. A warm
 * body and a narrow coloured strip, separated by a real gap rather than sharing
 * an edge, and a round notch punched out of each side at the half-way line. A
 * previous attempt had the colour and the rows right and still looked like a
 * card, because it had neither the gap nor the notches.
 *
 * The notches are drawn in the page colour and sit half outside the edge, so
 * they read as holes rather than dots.
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
  /** Stamped across the ticket — "past", "transferred" and the like. */
  stamp?: string;
  className?: string;
}

export function ReservationStub({
  to,
  title,
  venue,
  cover,
  bookedAt,
  startsAt,
  stamp,
  className,
}: ReservationStubProps) {
  const { t } = useTranslation(["account", "common"]);

  return (
    <Link
      to={to}
      className={cn(
        "group relative flex w-full max-w-[380px] gap-[6px]",
        className,
      )}
    >
      {/* body */}
      <div className="flex min-w-0 flex-[.9] flex-col gap-[6px] rounded-s-[12px] bg-bg-warm p-lg transition-shadow duration-micro ease-micro group-hover:shadow-[0_12px_30px_-22px_rgba(25,16,8,0.5)]">
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="h-[110px] w-full rounded-[8px] object-cover"
          />
        ) : (
          <div className="h-[110px] w-full rounded-[8px] bg-bg-tint-brand" />
        )}

        <h3 className="text-balance text-[16px] font-bold text-ink-brand">
          {title}
        </h3>
        <p className="text-[13px] text-ink-secondary">{venue}</p>

        <dl className="mt-[2px] flex flex-col gap-[4px] text-[13px] text-ink-secondary">
          <div className="flex items-center justify-between gap-md">
            <dt>{t("account:tickets.reservationTime")}</dt>
            <dd className="ltr-run text-ink-primary">{bookedAt}</dd>
          </div>
          <div className="flex items-center justify-between gap-md">
            <dt>{t("account:tickets.showTime")}</dt>
            <dd className="ltr-run text-ink-primary">{startsAt}</dd>
          </div>
        </dl>
      </div>

      {/* the torn-off stub */}
      <div className="flex-[.1] rounded-e-[12px] bg-brand-gradient" />

      {/* the two punched holes, in the page colour so they read as holes */}
      <span
        aria-hidden
        className="absolute start-0 top-1/2 size-[22px] -translate-y-1/2 -translate-x-1/2 rounded-full bg-bg-page rtl:translate-x-1/2"
      />
      <span
        aria-hidden
        className="absolute end-0 top-1/2 size-[22px] -translate-y-1/2 translate-x-1/2 rounded-full bg-bg-page rtl:-translate-x-1/2"
      />

      {stamp ? (
        <span className="absolute start-[18px] top-[16px] rotate-[-8deg] rounded-[6px] border-2 border-state-danger/70 px-sm py-[2px] text-[12px] font-extrabold tracking-[0.06em] text-state-danger/80 uppercase">
          {stamp}
        </span>
      ) : null}
    </Link>
  );
}
