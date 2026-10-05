import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { Button, TextInput } from "@/components/ui";
import { cn } from "@/lib/cn";
import { getActiveLocale } from "@/i18n/config";
import { formatMoneySar } from "@/lib/api/locale";
import type { EventSession } from "@/lib/api/mappers/events";
import { sessionRemaining } from "@/lib/api/mappers/events";

/**
 * Booking, in the order the original site's modal does it.
 *
 * Reservation type, booking date with its offer shown on the row, number of
 * tickets behind plus/minus that stay disabled until a date is chosen, one card
 * per ticket holding a name and a seat, promo code, a breakdown reading
 * original amount then each discount then total, payment method, pay. The
 * original validates in that same order: every ticket needs a name, then a
 * seat, and no two tickets may take the same seat.
 */

export const MAX_TICKETS = 6;

export type SeatOption = {
  id: number;
  label: string;
  ticketTypeId?: number;
  taken: boolean;
};

export type BookingLine = {
  name: string;
  seatId?: number;
};

export type BookingPaymentMethod = "card" | "apple" | "wallet";

export interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  /** Ticket types on sale for the chosen showtime. */
  types: { id: number; name: string; price: number; disabled?: boolean }[];
  sessions: EventSession[];
  seats: SeatOption[];
  /** Assigned seating asks for a seat per ticket; free seating does not. */
  assignedSeating: boolean;
  busy?: boolean;
  onConfirm: (booking: {
    typeId: number;
    sessionId: number;
    lines: BookingLine[];
    promoCode: string;
    method: BookingPaymentMethod;
  }) => void;
}

function sessionLabel(session: EventSession, locale: string): string {
  const start = session.startsAt ? new Date(session.startsAt) : undefined;
  if (!start || Number.isNaN(start.getTime())) return `#${session.id}`;
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

export function BookingModal({
  open,
  onOpenChange,
  eventTitle,
  types,
  sessions,
  seats,
  assignedSeating,
  busy,
  onConfirm,
}: BookingModalProps) {
  const { t } = useTranslation(["catalog", "checkout", "common"]);
  const locale = getActiveLocale() === "ar" ? "ar-SA" : "en-SA";
  const selectableTypes = types.filter((type) => !type.disabled);

  const [typeId, setTypeId] = useState<number | undefined>();
  const [sessionId, setSessionId] = useState<number | undefined>();
  const [lines, setLines] = useState<BookingLine[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [method, setMethod] = useState<BookingPaymentMethod>("card");
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  // Reopening starts clean; a half-filled booking from last time is worse than
  // an empty one.
  useEffect(() => {
    if (!open) return;
    setTypeId(selectableTypes[0]?.id);
    setSessionId(undefined);
    setLines([]);
    setPromoCode("");
    setError("");
    setStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Changing the date clears the seats chosen under the old one, as the
  // original does — a seat belongs to one showtime.
  function chooseSession(next: number) {
    setSessionId(next);
    setLines((current) => current.map((line) => ({ ...line, seatId: undefined })));
    setError("");
  }

  const activeSession = sessions.find((session) => session.id === sessionId);
  const seatsForSession = useMemo(
    () => seats.filter((seat) => !seat.taken),
    [seats],
  );
  const unitPrice =
    types.find((type) => type.id === typeId)?.price ?? types[0]?.price ?? 0;
  const subtotal = unitPrice * lines.length;
  const offerDiscount = (() => {
    if (!activeSession?.discountValue) return 0;
    return activeSession.discountType === "percentage"
      ? Math.round((subtotal * activeSession.discountValue) / 100)
      : activeSession.discountValue * lines.length;
  })();

  const remaining = activeSession ? sessionRemaining(activeSession) : undefined;
  const ceiling = Math.min(MAX_TICKETS, remaining ?? MAX_TICKETS);
  const canAdd = Boolean(sessionId) && lines.length < ceiling;
  const canRemove = lines.length > 0;

  const STEPS = [
    t("detail.stepWhen"),
    t("detail.stepWho"),
    t("detail.stepPay"),
  ];

  /** Each step is checked on its own, in the order the original validates. */
  function validate(index: number): string {
    if (index === 0) {
      if (!typeId) return t("detail.pickTicketType");
      if (!sessionId) return t("detail.pickShowtime");
      return "";
    }
    if (index === 1) {
      if (lines.length === 0) return t("detail.addAtLeastOne");
      if (lines.some((line) => !line.name.trim()))
        return t("detail.nameRequired");
      if (assignedSeating) {
        if (lines.some((line) => line.seatId == null))
          return t("detail.seatRequired");
        const seen = new Set(lines.map((line) => line.seatId));
        if (seen.size !== lines.length) return t("detail.seatDuplicate");
      }
      return "";
    }
    return "";
  }

  function next() {
    const message = validate(step);
    if (message) return setError(message);
    setError("");
    setStep((current) => Math.min(STEPS.length - 1, current + 1));
  }

  function back() {
    setError("");
    setStep((current) => Math.max(0, current - 1));
  }

  function submit() {
    for (let index = 0; index < STEPS.length; index += 1) {
      const message = validate(index);
      if (message) {
        setStep(index);
        return setError(message);
      }
    }
    setError("");
    onConfirm({ typeId: typeId!, sessionId: sessionId!, lines, promoCode: promoCode.trim(), method });
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-surface-inverse/55 backdrop-blur-[1.5px]" />
        <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-y-auto rounded-t-[22px] bg-bg-page p-xl outline-none sm:inset-0 sm:m-auto sm:h-fit sm:max-w-[440px] sm:rounded-[22px]">
          <div className="mb-lg flex items-start justify-between gap-md">
            <div className="flex flex-col gap-[2px]">
              <DialogPrimitive.Title className="text-[17px] font-bold text-ink-primary">
                {t("detail.bookNow")}
              </DialogPrimitive.Title>
              <span className="text-[13px] text-ink-secondary">{eventTitle}</span>
            </div>
            <DialogPrimitive.Close
              aria-label={t("common:actions.close")}
              className="shrink-0 rounded-full p-[6px] text-ink-secondary hover:text-ink-primary"
            >
              <CloseIcon size={18} />
            </DialogPrimitive.Close>
          </div>

          <ol className="mb-lg flex items-center gap-[6px]">
            {STEPS.map((label, index) => (
              <li key={label} className="flex flex-1 flex-col gap-[6px]">
                <span
                  className={cn(
                    "h-[3px] rounded-full",
                    index <= step ? "bg-ink-brand-mid" : "bg-border-default",
                  )}
                />
                <span
                  className={cn(
                    "text-[12px]",
                    index === step
                      ? "font-semibold text-ink-primary"
                      : "text-ink-muted",
                  )}
                >
                  {label}
                </span>
              </li>
            ))}
          </ol>

          {step === 0 && selectableTypes.length > 1 && (
            <fieldset className="mb-lg flex flex-col gap-xs">
              <legend className="mb-xs text-[13px] font-semibold text-ink-primary">
                {t("detail.reservationType")}
              </legend>
              <div className="flex flex-col gap-[6px]">
                {selectableTypes.map((type) => (
                  <label
                    key={type.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-md rounded-[14px] border px-[14px] py-[10px]",
                      typeId === type.id
                        ? "border-border-brand bg-bg-tint-brand"
                        : "border-border-default bg-surface-default",
                    )}
                  >
                    <span className="text-[14px] text-ink-primary">{type.name}</span>
                    <span className="flex items-center gap-sm">
                      <span className="ltr-run text-[14px] text-ink-secondary">
                        {formatMoneySar(type.price)}
                      </span>
                      <input
                        type="radio"
                        name="booking-type"
                        checked={typeId === type.id}
                        onChange={() => setTypeId(type.id)}
                        className="size-[16px] accent-[var(--color-ink-brand-mid)]"
                      />
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {step === 0 && (
          <label className="mb-lg flex flex-col gap-xs">
            <span className="text-[13px] font-semibold text-ink-primary">
              {t("detail.bookingDate")}
            </span>
            <select
              value={sessionId ?? ""}
              onChange={(event) => chooseSession(Number(event.target.value))}
              className="h-[44px] rounded-[12px] border border-border-default bg-surface-default px-[12px] text-[14px] text-ink-primary"
            >
              <option value="" disabled>
                {t("detail.pickShowtime")}
              </option>
              {sessions.map((session) => {
                const discount = session.discountValue
                  ? session.discountType === "percentage"
                    ? ` — ${session.discountValue}%`
                    : ` — ${session.discountValue}`
                  : "";
                return (
                  <option key={session.id} value={session.id}>
                    {sessionLabel(session, locale)}
                    {discount}
                  </option>
                );
              })}
            </select>
          </label>
          )}

          {step === 1 && (
          <div className="mb-lg flex items-center justify-between gap-md">
            <span className="text-[14px] font-semibold text-ink-primary">
              {t("detail.ticketsNumber")}
            </span>
            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                aria-label={t("detail.removeTicket")}
                disabled={!canRemove}
                onClick={() => setLines((current) => current.slice(0, -1))}
                className={cn(
                  "flex size-[34px] items-center justify-center rounded-[12px] border border-border-default",
                  canRemove ? "text-ink-primary" : "cursor-not-allowed text-ink-disabled",
                )}
              >
                <MinusIcon size={16} />
              </button>
              <span className="ltr-run min-w-[1.5ch] text-center text-[15px] font-semibold tabular-nums text-ink-primary">
                {lines.length}
              </span>
              <button
                type="button"
                aria-label={t("detail.addTicket")}
                disabled={!canAdd}
                onClick={() => setLines((current) => [...current, { name: "" }])}
                className={cn(
                  "flex size-[34px] items-center justify-center rounded-[12px] border border-border-default",
                  canAdd ? "text-ink-primary" : "cursor-not-allowed text-ink-disabled",
                )}
              >
                <PlusIcon size={16} />
              </button>
            </div>
          </div>

          )}

          {step === 1 && lines.map((line, index) => {
            const takenByOthers = new Set(
              lines.filter((_, i) => i !== index).map((other) => other.seatId),
            );
            return (
              <div
                key={index}
                className="mb-sm flex flex-col gap-xs rounded-[14px] border border-border-default bg-surface-default p-[14px]"
              >
                <span className="text-[13px] font-semibold text-ink-primary">
                  {t("detail.ticketNumber", { n: index + 1 })}
                </span>
                <TextInput
                  value={line.name}
                  placeholder={t("detail.attendeeName")}
                  aria-label={t("detail.attendeeNameFor", { n: index + 1 })}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, name: event.target.value } : item,
                      ),
                    )
                  }
                  className="bg-bg-page"
                />
                {assignedSeating &&
                  (seatsForSession.length === 0 ? (
                    <span className="rounded-[10px] bg-bg-warm px-[10px] py-[6px] text-center text-[13px] text-ink-secondary">
                      {t("detail.noSeats")}
                    </span>
                  ) : (
                    <select
                      value={line.seatId ?? ""}
                      aria-label={t("detail.seatFor", { n: index + 1 })}
                      onChange={(event) =>
                        setLines((current) =>
                          current.map((item, i) =>
                            i === index
                              ? { ...item, seatId: Number(event.target.value) }
                              : item,
                          ),
                        )
                      }
                      className="h-[42px] rounded-[12px] border border-border-default bg-bg-page px-[12px] text-[14px] text-ink-primary"
                    >
                      <option value="" disabled>
                        {t("detail.seatNumber")}
                      </option>
                      {seatsForSession.map((seat) => (
                        <option
                          key={seat.id}
                          value={seat.id}
                          disabled={takenByOthers.has(seat.id)}
                        >
                          {seat.label}
                        </option>
                      ))}
                    </select>
                  ))}
              </div>
            );
          })}

          {step === 2 && (
          <div className="mb-lg mt-sm flex items-center gap-xs">
            <TextInput
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value)}
              placeholder={t("checkout:checkout.promoPlaceholder")}
              aria-label={t("checkout:checkout.promoLabel")}
              className="bg-surface-default"
            />
          </div>
          )}

          {step === 2 && lines.length > 0 && (
            <div className="mb-lg flex flex-col gap-[6px] border-t border-border-default pt-md">
              <Row
                label={t("checkout:checkout.originalAmount")}
                value={formatMoneySar(subtotal)}
              />
              {offerDiscount > 0 && (
                <Row
                  label={t("checkout:checkout.offerDiscount")}
                  value={`− ${formatMoneySar(offerDiscount)}`}
                />
              )}
              <div className="mt-[4px] flex items-center justify-between gap-md">
                <span className="text-[15px] font-semibold text-ink-primary">
                  {t("checkout:checkout.total")}
                </span>
                <span className="ltr-run text-[18px] font-semibold text-ink-primary">
                  {formatMoneySar(Math.max(0, subtotal - offerDiscount))}
                </span>
              </div>
              <span className="text-[12px] text-ink-muted">
                {t("checkout:checkout.vatIncluded")}
              </span>
            </div>
          )}

          {step === 2 && (
          <fieldset className="mb-lg flex flex-col gap-xs">
            <legend className="mb-xs text-[13px] font-semibold text-ink-primary">
              {t("checkout:checkout.paymentMethod")}
            </legend>
            <div className="flex flex-col gap-[6px]">
              {(
                [
                  ["card", t("checkout:checkout.methods.card")],
                  ["apple", t("checkout:checkout.methods.apple")],
                  ["wallet", t("checkout:checkout.methods.wallet")],
                ] as const
              ).map(([id, label]) => (
                <label
                  key={id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-md rounded-[14px] border px-[14px] py-[10px]",
                    method === id
                      ? "border-border-brand bg-bg-tint-brand"
                      : "border-border-default bg-surface-default",
                  )}
                >
                  <span className="text-[14px] text-ink-primary">{label}</span>
                  <input
                    type="radio"
                    name="booking-method"
                    checked={method === id}
                    onChange={() => setMethod(id)}
                    className="size-[16px] accent-[var(--color-ink-brand-mid)]"
                  />
                </label>
              ))}
            </div>
          </fieldset>
          )}

          {error && (
            <p className="mb-sm text-center text-[13px] text-state-danger">{error}</p>
          )}

          <div className="flex items-center gap-sm">
            {step > 0 && (
              <Button variant="secondary" onClick={back} className="flex-1">
                {t("common:actions.back")}
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={next} className="flex-1">
                {t("common:actions.next")}
              </Button>
            ) : (
              <Button onClick={submit} disabled={busy} className="flex-1">
                {busy
                  ? t("detail.claiming")
                  : t("detail.payNow", {
                      total: formatMoneySar(Math.max(0, subtotal - offerDiscount)),
                    })}
              </Button>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-md">
      <span className="text-[14px] text-ink-secondary">{label}</span>
      <span className="ltr-run text-[14px] text-ink-primary">{value}</span>
    </div>
  );
}
