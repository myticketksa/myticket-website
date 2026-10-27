import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { getActiveLocale } from "@/i18n/config";
import type { ActivitySlot } from "@/app/api/eventsApi";

/**
 * An activity's day, then that day's time (27 Oct 2026) — the app's two
 * drop-downs. Two short lists rather than one row per day and time: in the
 * 10,000-booker run one long list lost about twice as many people while
 * choosing. Full times are greyed, low ones say how many places are left,
 * started ones aren't offered (the server leaves them out).
 */
export interface ActivitySlotPickerProps {
  slots: ActivitySlot[];
  loading?: boolean;
  sessionId?: number;
  time?: string | null;
  /** Places this booking already takes; a time needs room for one more. */
  needed: number;
  onSelect: (sessionId: number | undefined, time: string | null) => void;
  className?: string;
}

const riyadhClock = (iso: string, locale: string) =>
  new Date(iso).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh",
    numberingSystem: "latn",
  });

export function ActivitySlotPicker({ slots, loading, sessionId, time, needed, onSelect, className }: ActivitySlotPickerProps) {
  const { t } = useTranslation(["catalog", "common"]);
  const locale = getActiveLocale() === "ar" ? "ar-SA" : "en-SA";

  const days: { sessionId: number; date: string; slots: ActivitySlot[] }[] = [];
  for (const slot of slots) {
    const day = days.find((d) => d.sessionId === slot.sessionId);
    if (day) day.slots.push(slot);
    else days.push({ sessionId: slot.sessionId, date: slot.date, slots: [slot] });
  }
  const fits = (slot: ActivitySlot) => slot.left == null || slot.left >= Math.max(1, needed);
  const timed = slots.some((slot) => slot.time);
  const chosenDay = days.find((d) => d.sessionId === sessionId);
  const dayLabel = (date: string) =>
    new Date(`${date}T12:00:00Z`).toLocaleDateString(locale, {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC",
      numberingSystem: "latn",
    });
  const select =
    "w-full rounded-[14px] border border-border-default bg-surface-default px-[14px] py-[10px] text-[14px] text-ink-primary";

  if (loading) {
    return <p className={cn("text-[14px] text-ink-secondary", className)}>…</p>;
  }
  if (days.length === 0) {
    return <p className={cn("text-[14px] text-ink-secondary", className)}>{t("detail.noSlots")}</p>;
  }

  return (
    <div className={cn("flex flex-col gap-sm", className)}>
      <label className="flex flex-col gap-xs text-[13px] font-semibold text-ink-primary">
        {t("detail.bookingSlot")}
        <select
          className={select}
          value={sessionId ?? ""}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : undefined;
            const day = days.find((d) => d.sessionId === id);
            // Without times the day is the booking.
            onSelect(id, timed ? null : (day?.slots[0]?.time ?? null));
          }}
        >
          <option value="">{t("detail.pickDay")}</option>
          {days.map((day) => {
            const room = day.slots.some(fits);
            return (
              <option key={day.sessionId} value={day.sessionId} disabled={!room}>
                {room ? dayLabel(day.date) : `${dayLabel(day.date)} — ${t("common:states.soldOut")}`}
              </option>
            );
          })}
        </select>
      </label>

      {timed && chosenDay ? (
        <label className="flex flex-col gap-xs text-[13px] font-semibold text-ink-primary">
          {t("detail.bookingTime")}
          <select
            className={select}
            value={time ?? ""}
            onChange={(e) => onSelect(chosenDay.sessionId, e.target.value || null)}
          >
            <option value="">{t("detail.pickTime")}</option>
            {chosenDay.slots.map((slot) => {
              const range =
                slot.startsAt && slot.endsAt
                  ? `${riyadhClock(slot.startsAt, locale)} – ${riyadhClock(slot.endsAt, locale)}`
                  : (slot.time ?? "");
              const note = !fits(slot)
                ? ` — ${t("common:states.soldOut")}`
                : slot.left != null && slot.left <= 4
                  ? ` — ${t("detail.placesLeft", { count: slot.left })}`
                  : "";
              return (
                <option key={slot.time ?? ""} value={slot.time ?? ""} disabled={!fits(slot)}>
                  {range + note}
                </option>
              );
            })}
          </select>
        </label>
      ) : null}
    </div>
  );
}
