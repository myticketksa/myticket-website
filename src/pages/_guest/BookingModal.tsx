import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { Button, TextInput } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatMoneySar } from "@/lib/api/locale";
import type { EventSession } from "@/lib/api/mappers/events";
import { sessionRemaining } from "@/lib/api/mappers/events";
import { SessionPicker } from "./SessionPicker";
import type { BookingPaymentMethod } from "@/lib/purchase/paymentBrand";

export type { BookingPaymentMethod } from "@/lib/purchase/paymentBrand";

/**
 * Booking modal — mirrors the mobile app's EventDetails flow:
 * type + showtime → per-ticket name + seat grid → promo/pay.
 *
 * Assigned seating uses the same grey/black/orange seat icons as the app
 * and filters the grid to the chosen ticket type.
 */

export const MAX_TICKETS = 6;

/** Chunk size for large halls — same as the mobile app seat range filter. */
const SEAT_CHUNK = 300;

export type SeatOption = {
  id: number;
  label: string;
  row?: string;
  number?: number;
  ticketTypeId?: number;
  sessionId?: number;
  accessible?: boolean;
  /** Sold / held / reserved — not pickable. */
  taken: boolean;
};

export type BookingLine = {
  name: string;
  seatId?: number;
};

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
  seatsLoading?: boolean;
  /** Parent refetches seats for this showtime (app: `?session=`). */
  onSessionChange?: (sessionId: number | undefined) => void;
  busy?: boolean;
  onConfirm: (booking: {
    typeId: number;
    sessionId: number;
    lines: BookingLine[];
    promoCode: string;
    method: BookingPaymentMethod;
  }) => void;
}

export function BookingModal({
  open,
  onOpenChange,
  eventTitle,
  types,
  sessions,
  seats,
  assignedSeating,
  seatsLoading,
  onSessionChange,
  busy,
  onConfirm,
}: BookingModalProps) {
  const { t } = useTranslation(["catalog", "checkout", "common"]);
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
    const initialSession =
      sessions.length === 1 ? sessions[0]?.id : undefined;
    setTypeId(selectableTypes[0]?.id);
    setSessionId(initialSession);
    setLines([]);
    setPromoCode("");
    setError("");
    setStep(0);
    onSessionChange?.(initialSession);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Changing the date clears the seats chosen under the old one, as the
  // original does — a seat belongs to one showtime.
  function chooseSession(next: number) {
    setSessionId(next);
    setLines((current) =>
      current.map((line) => ({ ...line, seatId: undefined })),
    );
    setError("");
    onSessionChange?.(next);
  }

  function chooseType(next: number) {
    setTypeId(next);
    setLines((current) =>
      current.map((line) => ({ ...line, seatId: undefined })),
    );
    setError("");
  }

  const activeSession = sessions.find((session) => session.id === sessionId);

  /** Seats for this showtime + ticket type — same scoping as the app TicketRow. */
  const seatsForType = useMemo(() => {
    return seats.filter((seat) => {
      if (
        typeId != null &&
        seat.ticketTypeId != null &&
        seat.ticketTypeId !== typeId
      ) {
        return false;
      }
      if (
        sessionId != null &&
        seat.sessionId != null &&
        seat.sessionId !== sessionId
      ) {
        return false;
      }
      return true;
    });
  }, [seats, sessionId, typeId]);

  const unitPrice =
    types.find((type) => type.id === typeId)?.price ?? types[0]?.price ?? 0;
  // The price already has the night's offer in it — ticket types are read from
  // the chosen session, which reports `discountedPrice`. Subtracting the offer
  // again charged 59 for a ticket priced 84. The offer is shown as information,
  // never applied twice.
  const subtotal = unitPrice * lines.length;
  const offerDiscount = 0;

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
    onConfirm({
      typeId: typeId!,
      sessionId: sessionId!,
      lines,
      promoCode: promoCode.trim(),
      method,
    });
  }

  function toggleSeat(lineIndex: number, seatId: number) {
    setLines((current) =>
      current.map((line, i) => {
        if (i !== lineIndex) return line;
        if (line.seatId === seatId) return { ...line, seatId: undefined };
        return { ...line, seatId };
      }),
    );
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-surface-inverse/55 backdrop-blur-[1.5px]" />
        <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-y-auto rounded-t-[22px] bg-bg-page p-xl outline-none sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[90dvh] sm:max-w-[480px] sm:rounded-[22px]">
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
              <li key={index} className="flex flex-1 flex-col gap-[6px]">
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
                    <span className="text-[14px] text-ink-primary">
                      {type.name}
                    </span>
                    <span className="flex items-center gap-sm">
                      <span className="ltr-run text-[14px] text-ink-secondary">
                        {formatMoneySar(type.price)}
                      </span>
                      <input
                        type="radio"
                        name="booking-type"
                        checked={typeId === type.id}
                        onChange={() => chooseType(type.id)}
                        className="size-[16px] accent-[var(--color-ink-brand-mid)]"
                      />
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {step === 0 && (
            <SessionPicker
              className="mb-lg"
              sessions={sessions}
              selectedId={sessionId}
              onSelect={chooseSession}
            />
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
                    canRemove
                      ? "text-ink-primary"
                      : "cursor-not-allowed text-ink-disabled",
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
                  onClick={() =>
                    setLines((current) => [...current, { name: "" }])
                  }
                  className={cn(
                    "flex size-[34px] items-center justify-center rounded-[12px] border border-border-default",
                    canAdd
                      ? "text-ink-primary"
                      : "cursor-not-allowed text-ink-disabled",
                  )}
                >
                  <PlusIcon size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 1 &&
            lines.map((line, index) => {
              const takenByOthers = new Set(
                lines
                  .filter((_, i) => i !== index)
                  .map((other) => other.seatId)
                  .filter((id): id is number => Number.isInteger(id)),
              );
              const selected = seatsForType.find(
                (seat) => seat.id === line.seatId,
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
                          i === index
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="bg-bg-page"
                  />
                  {assignedSeating && (
                    <div className="mt-xs rounded-[11px] bg-white px-[12px] py-[12px]">
                      <div className="mb-sm flex items-center justify-between gap-md">
                        <span className="text-[12px] font-semibold text-ink-primary">
                          {t("detail.seatNumber")}
                        </span>
                        <span
                          className={cn(
                            "text-[12px] font-semibold",
                            selected
                              ? "text-ink-brand-mid"
                              : "text-ink-muted",
                          )}
                        >
                          {selected?.label ?? t("detail.seatNotSelected")}
                        </span>
                      </div>
                      {seatsLoading ? (
                        <p className="py-lg text-center text-[12px] text-ink-secondary">
                          {t("common:states.loading")}
                        </p>
                      ) : seatsForType.length === 0 ? (
                        <p className="rounded-[10px] bg-bg-warm px-[10px] py-[6px] text-center text-[13px] text-ink-secondary">
                          {t("detail.noSeats")}
                        </p>
                      ) : (
                        <SeatMapGrid
                          seats={seatsForType}
                          takenIds={takenByOthers}
                          value={line.seatId}
                          onToggle={(seatId) => toggleSeat(index, seatId)}
                        />
                      )}
                    </div>
                  )}
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
            <p className="mb-sm text-center text-[13px] text-state-danger">
              {error}
            </p>
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
                      total: formatMoneySar(
                        Math.max(0, subtotal - offerDiscount),
                      ),
                    })}
              </Button>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/**
 * Mobile-app seat grid: row labels, chair icons (grey / black / orange),
 * optional 300-seat range chunks for large halls.
 */
function SeatMapGrid({
  seats,
  takenIds,
  value,
  onToggle,
}: {
  seats: SeatOption[];
  takenIds: Set<number>;
  value?: number;
  onToggle: (seatId: number) => void;
}) {
  const { t } = useTranslation(["catalog", "checkout"]);
  const [rangeFilter, setRangeFilter] = useState<number | null>(null);

  const seatRows = useMemo(() => {
    const map = new Map<string, SeatOption[]>();
    seats.forEach((seat) => {
      const row = seat.row || "?";
      const list = map.get(row) ?? [];
      list.push(seat);
      map.set(row, list);
    });
    return Array.from(map.entries()).map(([row, list]) => [
      row,
      list.sort(
        (a, b) => (a.number ?? 0) - (b.number ?? 0),
      ) as SeatOption[],
    ]) as [string, SeatOption[]][];
  }, [seats]);

  const seatRanges = useMemo(() => {
    const buckets = new Map<number, number>();
    seatRows.forEach(([, list]) => {
      list.forEach((seat) => {
        const n = Number(seat.number);
        if (!Number.isFinite(n)) return;
        const start = Math.floor((n - 1) / SEAT_CHUNK) * SEAT_CHUNK + 1;
        const current = buckets.get(start);
        buckets.set(start, current ? Math.max(current, n) : n);
      });
    });
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a - b)
      .map(([start, end]) => ({ start, end }));
  }, [seatRows]);

  const visibleRows = useMemo(() => {
    if (rangeFilter == null) return seatRows;
    return seatRows.filter(([, list]) => {
      const n = Number(list[0]?.number);
      return (
        Number.isFinite(n) &&
        n >= rangeFilter &&
        n < rangeFilter + SEAT_CHUNK
      );
    });
  }, [seatRows, rangeFilter]);

  const activeRange = seatRanges.find((r) => r.start === rangeFilter);

  return (
    <div className="flex flex-col gap-sm">
      {seatRanges.length > 1 && (
        <label className="flex items-center justify-between gap-md rounded-full border border-border-default bg-bg-warm px-[12px] py-[8px]">
          <span className="text-[12px] font-semibold text-ink-primary">
            {activeRange
              ? `${activeRange.start}–${activeRange.end}`
              : t("detail.seatRangeAll")}
          </span>
          <select
            className="bg-transparent text-[12px] text-ink-brand-mid outline-none"
            value={rangeFilter ?? ""}
            aria-label={t("detail.seatRangeTitle")}
            onChange={(event) => {
              const raw = event.target.value;
              setRangeFilter(raw === "" ? null : Number(raw));
            }}
          >
            <option value="">{t("detail.seatRangeAll")}</option>
            {seatRanges.map((range) => (
              <option key={range.start} value={range.start}>
                {range.start}–{range.end}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="max-h-[280px] overflow-y-auto pr-[2px]">
        {visibleRows.map(([row, list]) => (
          <div key={row} className="mb-[12px] flex items-start gap-[8px]">
            <span className="mt-[5px] w-[18px] shrink-0 text-center text-[10px] font-bold text-ink-muted">
              {row}
            </span>
            <div className="flex flex-1 flex-wrap gap-x-[12px] gap-y-[14px]">
              {list.map((seat) => {
                const mine = seat.id === value;
                const heldByOther = !mine && takenIds.has(seat.id);
                const sold = (seat.taken || heldByOther) && !mine;
                const icon = mine
                  ? "/icons/seats/black-seat.svg"
                  : sold
                    ? "/icons/seats/orange-seat.svg"
                    : "/icons/seats/gray-seat.svg";
                const numberSize =
                  String(seat.number ?? seat.label).length >= 4 ? 6 : 8;

                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={sold}
                    aria-pressed={mine}
                    aria-label={seat.label}
                    onClick={() => onToggle(seat.id)}
                    className={cn(
                      "relative flex size-[22px] items-center justify-center",
                      sold && "cursor-not-allowed",
                    )}
                  >
                    {seat.accessible ? (
                      <>
                        <span
                          className="absolute -top-[11px] w-[22px] text-center font-bold text-ink-muted"
                          style={{ fontSize: numberSize }}
                        >
                          {seat.number ?? seat.label}
                        </span>
                        <img
                          src="/icons/seats/special-needs.svg"
                          alt=""
                          aria-hidden="true"
                          draggable={false}
                          className="h-[18px] w-[18px] object-contain"
                        />
                      </>
                    ) : (
                      <>
                        <img
                          src={icon}
                          alt=""
                          aria-hidden="true"
                          draggable={false}
                          className="h-[22px] w-[22px] object-contain"
                        />
                        <span
                          className="absolute top-[3px] w-[22px] text-center font-bold text-white"
                          style={{ fontSize: numberSize }}
                        >
                          {seat.number ?? seat.label}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-md gap-y-sm border-t border-[#ECECEC] pt-sm">
        <Legend
          icon="/icons/seats/gray-seat.svg"
          label={t("checkout:seats.legend.available")}
        />
        <Legend
          icon="/icons/seats/black-seat.svg"
          label={t("checkout:seats.legend.selected")}
        />
        <Legend
          icon="/icons/seats/orange-seat.svg"
          label={t("checkout:seats.legend.sold")}
        />
        <div className="flex items-center gap-sm">
          <img
            src="/icons/seats/special-needs.svg"
            alt=""
            aria-hidden="true"
            className="h-[14px] w-[14px] object-contain"
          />
          <span className="text-[11px] text-ink-primary">
            {t("checkout:seats.legend.accessible")}
          </span>
        </div>
      </div>
    </div>
  );
}

function Legend({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-sm">
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        className="h-[15px] w-[15px] object-contain"
      />
      <span className="text-[11px] text-ink-secondary">{label}</span>
    </div>
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
