import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { getActiveLocale } from "@/i18n/config";
import type { EventSession } from "@/lib/api/mappers/events";
import { sessionRemaining } from "@/lib/api/mappers/events";

/**
 * Showtime picker, following the MyTicket app's booking-date control.
 *
 * The app shows one row per date reading "Thursday 08-10 from 06:00 PM to
 * 09:00 PM", with any offer appended in orange, and clears the seat choice
 * whenever the date changes. Same here: a single showtime renders as a plain
 * line, several render as choosable rows.
 */
export interface SessionPickerProps {
  sessions: EventSession[];
  selectedId?: number;
  onSelect: (sessionId: number) => void;
  className?: string;
}

function formatRange(session: EventSession, locale: string): string {
  const start = session.startsAt ? new Date(session.startsAt) : undefined;
  if (!start || Number.isNaN(start.getTime())) return "";
  const day = start.toLocaleDateString(locale, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
    numberingSystem: "latn",
  });
  const time = (value: Date) =>
    value.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
      numberingSystem: "latn",
    });
  const end = session.endsAt ? new Date(session.endsAt) : undefined;
  return end && !Number.isNaN(end.getTime())
    ? `${day} · ${time(start)} – ${time(end)}`
    : `${day} · ${time(start)}`;
}

export function SessionPicker({
  sessions,
  selectedId,
  onSelect,
  className,
}: SessionPickerProps) {
  const { t } = useTranslation(["catalog", "common"]);
  const locale = getActiveLocale() === "ar" ? "ar-SA" : "en-SA";
  if (sessions.length === 0) return null;

  const discountLabel = (session: EventSession) => {
    if (!session.discountValue) return undefined;
    return session.discountType === "percentage"
      ? `− ${session.discountValue}%`
      : t("common:currency.minusAmount", { amount: session.discountValue });
  };

  if (sessions.length === 1) {
    const only = sessions[0]!;
    return (
      <div className={cn("flex flex-col gap-[2px]", className)}>
        <span className="text-[13px] text-ink-secondary">
          {t("detail.bookingDate")}
        </span>
        <span className="ltr-run text-[14px] font-semibold text-ink-primary">
          {formatRange(only, locale)}
        </span>
      </div>
    );
  }

  return (
    <fieldset className={cn("flex flex-col gap-xs", className)}>
      <legend className="mb-xs text-[13px] font-semibold text-ink-primary">
        {t("detail.bookingDate")}
      </legend>
      <div className="flex flex-col gap-[6px]">
        {sessions.map((session) => {
          const selected = session.id === selectedId;
          const left = sessionRemaining(session);
          const soldOut = left === 0;
          const discount = discountLabel(session);
          return (
            <button
              key={session.id}
              type="button"
              disabled={soldOut}
              aria-pressed={selected}
              onClick={() => onSelect(session.id)}
              className={cn(
                "flex w-full items-center justify-between gap-md rounded-[14px] border px-[14px] py-[10px] text-start transition-[border-color,background-color] duration-micro ease-micro",
                selected
                  ? "border-border-brand bg-bg-tint-brand"
                  : "border-border-default bg-surface-default hover:border-border-brand",
                soldOut && "cursor-not-allowed opacity-55 hover:border-border-default",
              )}
            >
              <span className="ltr-run text-[14px] font-medium text-ink-primary">
                {formatRange(session, locale)}
              </span>
              {soldOut ? (
                <span className="shrink-0 text-[13px] text-ink-muted">
                  {t("common:states.soldOut")}
                </span>
              ) : (
                discount && (
                  <span className="ltr-run shrink-0 text-[13px] font-semibold text-brand-gradient-end">
                    {discount}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
