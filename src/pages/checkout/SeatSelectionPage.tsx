import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { CloseIcon, SarSymbol } from "@/components/icons";
import { Divider, FilterChip, PriceDisplay } from "@/components/data-display";
import { EmptyState } from "@/components/feedback";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useGetEventsQuery } from "@/app/api/eventsApi";
import {
  useGetEventSeatsQuery,
  useHoldSeatsMutation,
  useReleaseHoldMutation,
} from "@/app/api/seatsApi";
import { useAppDispatch } from "@/app/hooks";
import { toastPushed } from "@/features/ui/uiSlice";
import { parsePureNumericIds } from "@/lib/api/formPayload";
import { firstTicketTypeId } from "@/lib/api/locale";
import {
  listTicketTypes,
  mapApiEventToCard,
  resolveEventFromList,
  resolveEventId,
  resolveSeatingType,
} from "@/lib/api/mappers/events";
import {
  mapApiSeatsToRows,
  type MappedSeat,
  type MappedSeatRow,
  type SeatMapStatus,
} from "@/lib/api/mappers/seats";
import { apiErrorMessage } from "@/lib/api/unwrap";
import {
  writeFreeSeatingSession,
  writeHoldSession,
} from "@/lib/purchase/holdSession";

type Zone = string;

interface SelectedSeat {
  id: string;
  label: string;
  category?: string;
  price?: number;
}

function seatClass(
  status: SeatMapStatus | "selected",
  zoneId?: string,
  accessible = false,
) {
  if (status === "selected")
    return "border-transparent bg-brand-gradient text-ink-inverse";
  if (status === "sold")
    return accessible
      ? "border-border-default bg-seat-sold"
      : "border-border-default bg-seat-sold";
  if (status === "held")
    return accessible
      ? "border-border-default bg-seat-sold"
      : "border-neutral-scrollbar bg-[repeating-linear-gradient(135deg,var(--color-border-divider)_0_3px,var(--color-neutral-scrollbar)_3px_6px)]";
  if (zoneId === "vip") return "border-seat-vip bg-seat-vip-tint";
  if (zoneId === "gold") return "border-ink-brand bg-bg-tint-brand";
  if (zoneId === "silver") return "border-seat-silver bg-seat-silver-tint";
  if (zoneId === "bronze") return "border-ink-secondary bg-border-divider";
  return "border-border-default bg-border-divider";
}

function zoneTone(zoneId: string) {
  if (zoneId === "vip") return "bg-seat-vip";
  if (zoneId === "gold") return "bg-ink-brand";
  if (zoneId === "silver") return "bg-seat-silver";
  if (zoneId === "bronze") return "bg-ink-secondary";
  return "bg-border-divider";
}

function SeatButton({
  seat,
  selected,
  onClick,
  label,
}: {
  seat: MappedSeat;
  selected: boolean;
  onClick?: () => void;
  label: string;
}) {
  const interactive = seat.status !== "sold" && seat.status !== "held";
  const visualStatus = selected ? "selected" : seat.status;
  const seatIcon =
    visualStatus === "selected"
      ? "/icons/seats/black-seat.svg"
      : visualStatus === "sold" || visualStatus === "held"
        ? "/icons/seats/orange-seat.svg"
        : "/icons/seats/gray-seat.svg";

  return (
    <button
      type="button"
      aria-label={label}
      disabled={!interactive}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex size-10 items-center justify-center rounded-[8px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-brand",
        seatClass(visualStatus, seat.zoneId, seat.accessible),
        !interactive && "cursor-not-allowed",
        seat.accessible && !interactive && "opacity-55",
      )}
    >
      {seat.accessible ? (
        <span className="flex h-[34px] flex-col items-center justify-center leading-none">
          <img
            src="/icons/seats/special-needs.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-[23px] w-[22px] object-contain"
          />
          <span
            className={cn(
              "text-[9px] font-bold",
              selected ? "text-white" : "text-black",
            )}
          >
            {seat.number}
          </span>
        </span>
      ) : (
        <span className="relative flex h-[22px] w-[23px] items-center justify-center">
          <img
            src={seatIcon}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={cn(
              "h-[23px] w-[22px] object-contain",
              !interactive && "grayscale opacity-60",
            )}
          />
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center text-[9px] font-bold",
              selected ? "text-white" : "text-ink-primary",
            )}
          >
            {seat.number}
          </span>
        </span>
      )}
    </button>
  );
}

function SeatBlock({
  rows,
  zone,
  selectedIds,
  onToggle,
  getSeatLabel,
}: {
  rows: MappedSeatRow[];
  zone: Zone;
  selectedIds: Set<string>;
  onToggle: (seat: MappedSeat) => void;
  getSeatLabel: (seat: MappedSeat) => string;
}) {
  return (
    <div className="flex flex-col gap-md">
      {rows.map(({ row, seats }) => (
        <div key={row} className="flex items-center justify-center gap-sm">
          <span className="w-[22px] shrink-0 text-center text-[12px] font-bold text-ink-secondary">
            {row}
          </span>
          <div className="grid min-w-0 max-w-[820px] flex-1 grid-cols-[repeat(auto-fit,minmax(40px,1fr))] gap-x-[4px] gap-y-sm">
            {seats.map((seat) => {
              const selected = selectedIds.has(seat.id);
              const zoneMatch =
                zone === "all" || selected || seat.zoneId === zone;
              return (
                <span key={seat.id} className={cn(!zoneMatch && "opacity-25")}>
                  <SeatButton
                    seat={seat}
                    selected={selected}
                    label={getSeatLabel(seat)}
                    onClick={() => onToggle(seat)}
                  />
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SeatLegend({
  available,
  selected,
  sold,
  accessible,
}: {
  available: string;
  selected: string;
  sold: string;
  accessible: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-lg gap-y-sm border-t border-border-divider px-md py-md">
      {[
        { src: "/icons/seats/orange-seat.svg", label: sold },
        { src: "/icons/seats/black-seat.svg", label: selected },
        { src: "/icons/seats/gray-seat.svg", label: available },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-sm">
          <img
            src={item.src}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-[22px] w-[23px] object-contain"
          />
          <span className="text-[12px] text-ink-secondary">{item.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-sm text-ink-secondary">
        <img
          src="/icons/seats/special-needs.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-[24px] w-[22px] object-contain"
        />
        <span className="text-[12px]">{accessible}</span>
      </div>
    </div>
  );
}

/**
 * Seat Selection — Figma `207:7446`. Purchase header comes from `PurchaseLayout`.
 */
export function SeatSelectionPage() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { slug } = useParams();
  const [zone, setZone] = useState<Zone>("all");
  const [selected, setSelected] = useState<SelectedSeat[]>([]);
  const [holding, setHolding] = useState(false);
  const [requestedQuantity] = useState<number | undefined>(() => {
    const stored = Number(sessionStorage.getItem("myticket.ticketQty"));
    return Number.isInteger(stored) && stored > 0 && stored <= 6
      ? stored
      : undefined;
  });
  const selectedIds = useMemo(
    () => new Set(selected.map((seat) => seat.id)),
    [selected],
  );
  const continuingRef = useRef(false);

  const { data: eventsResult, isLoading: eventsLoading } = useGetEventsQuery();
  const apiEvents = eventsResult?.items;
  const [holdSeats] = useHoldSeatsMutation();
  const [releaseHold] = useReleaseHoldMutation();
  const resolvedEventId = useMemo(
    () =>
      resolveEventId(apiEvents, slug ?? "") ??
      (/^\d+$/.test(slug ?? "") ? slug : undefined),
    [apiEvents, slug],
  );

  // Free seating never uses the seat map — bounce to checkout or event detail.
  useEffect(() => {
    const event = resolveEventFromList(apiEvents, slug ?? "");
    if (!event || !slug) return;
    if (resolveSeatingType(event) !== "free") return;

    const mapped = mapApiEventToCard(event);
    if (mapped.isFree) {
      navigate(`/events/${slug}`, { replace: true });
      return;
    }

    const ticket = listTicketTypes(event)[0];
    const ticketId = ticket?.id ?? mapped.ticketTypeId;
    const eventId =
      resolvedEventId ?? (mapped.id ? String(mapped.id) : undefined);
    if (!eventId || !ticketId) {
      navigate(`/events/${slug}`, { replace: true });
      return;
    }

    writeFreeSeatingSession({
      eventId,
      ticketId,
      quantity: 1,
      unitPrice: ticket?.price ?? 0,
      slug,
      label: ticket?.name,
    });
    sessionStorage.setItem("myticket.ticketId", String(ticketId));
    sessionStorage.setItem("myticket.eventId", eventId);
    sessionStorage.setItem("myticket.eventSlug", slug);
    navigate("/checkout", { replace: true });
  }, [apiEvents, navigate, resolvedEventId, slug]);

  const {
    data: apiSeats,
    isLoading: seatsLoading,
    isFetching: seatsFetching,
  } = useGetEventSeatsQuery(resolvedEventId!, {
    skip: !resolvedEventId,
  });

  const liveRows = useMemo(() => mapApiSeatsToRows(apiSeats ?? []), [apiSeats]);
  const usingLiveMap = Boolean(liveRows && liveRows.length > 0);
  const waitingForSeats =
    eventsLoading ||
    (!resolvedEventId && apiEvents === undefined) ||
    (Boolean(resolvedEventId) &&
      (seatsLoading || (seatsFetching && !usingLiveMap)));
  const seatsUnavailable = !waitingForSeats && !usingLiveMap;

  const zoneOptions = useMemo(() => {
    const options = new Map<string, string>();
    liveRows?.forEach(({ seats }) =>
      seats.forEach((seat) => {
        if (seat.zoneId)
          options.set(seat.zoneId, seat.zoneLabel ?? seat.zoneId);
      }),
    );
    return [...options.entries()].map(([id, label]) => ({ id, label }));
  }, [liveRows]);

  useEffect(() => {
    setSelected([]);
    setZone("all");
  }, [usingLiveMap, resolvedEventId]);

  useEffect(() => {
    const eventRecord = resolveEventFromList(apiEvents, slug ?? "");
    const storedTicketId = Number(sessionStorage.getItem("myticket.ticketId"));
    const availableTicketTypes = listTicketTypes(eventRecord);
    const ticketTypeId = availableTicketTypes.some(
      (ticket) => ticket.id === storedTicketId,
    )
      ? storedTicketId
      : firstTicketTypeId(eventRecord);
    if (ticketTypeId)
      sessionStorage.setItem("myticket.ticketId", String(ticketTypeId));
    if (resolvedEventId)
      sessionStorage.setItem("myticket.eventId", String(resolvedEventId));
  }, [apiEvents, resolvedEventId, slug]);

  // Release only when the tab is closed / unloaded — not on React Strict Mode remounts
  // or when continuing to checkout (those unmounts used to wipe a valid holdId).
  useEffect(() => {
    const releaseOnUnload = () => {
      if (continuingRef.current) return;
      try {
        const mock = JSON.parse(
          sessionStorage.getItem("myticket.mockHold") || "null",
        ) as {
          holdId?: string;
          eventId?: string;
        } | null;
        const eventId = mock?.eventId ?? resolvedEventId;
        if (mock?.holdId && eventId) {
          void releaseHold({ eventId, holdId: String(mock.holdId) });
          sessionStorage.removeItem("myticket.mockHold");
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("pagehide", releaseOnUnload);
    return () => window.removeEventListener("pagehide", releaseOnUnload);
  }, [releaseHold, resolvedEventId]);

  const hasCompletePrices =
    selected.length > 0 && selected.every((seat) => seat.price != null);
  const subtotal = hasCompletePrices
    ? selected.reduce((sum, seat) => sum + (seat.price ?? 0), 0)
    : null;
  const serviceFee = subtotal == null ? null : Math.round(subtotal * 0.05);
  const vat =
    subtotal == null || serviceFee == null
      ? null
      : Math.round((subtotal + serviceFee) * 0.15);
  const total =
    subtotal == null || serviceFee == null || vat == null
      ? null
      : subtotal + serviceFee + vat;

  /**
   * Seated checkout requires a real API soft-hold (`holdId` + numeric `seatIds`).
   * Fixture labels like `C11` cannot create an order on the live API.
   */
  async function continueToCheckout() {
    if (
      selected.length === 0 ||
      (requestedQuantity != null && selected.length !== requestedQuantity) ||
      !hasCompletePrices ||
      waitingForSeats ||
      seatsUnavailable
    )
      return;

    if (resolvedEventId)
      sessionStorage.setItem("myticket.eventId", resolvedEventId);
    else if (slug) sessionStorage.setItem("myticket.eventId", slug);

    const eventRecord = resolveEventFromList(apiEvents, slug ?? "");
    const storedTicketId = sessionStorage.getItem("myticket.ticketId");
    const ticketId =
      (storedTicketId && /^\d+$/.test(storedTicketId)
        ? Number(storedTicketId)
        : undefined) ?? firstTicketTypeId(eventRecord);
    const numericSeatIds = parsePureNumericIds(selected.map((seat) => seat.id));

    if (!usingLiveMap || numericSeatIds.length !== selected.length) {
      dispatch(toastPushed("error", t("seats.liveRequired")));
      return;
    }

    if (!resolvedEventId || !ticketId) {
      dispatch(toastPushed("error", t("seats.ticketMissing")));
      return;
    }

    setHolding(true);
    try {
      const held = await holdSeats({
        eventId: resolvedEventId,
        seatIds: numericSeatIds,
        ticketId,
      }).unwrap();
      const holdId = held.holdId ?? held.hold_id ?? held.id;
      if (holdId == null || String(holdId).trim() === "") {
        throw new Error("Hold id missing from seat hold response");
      }

      continuingRef.current = true;
      writeHoldSession({
        seatIds: numericSeatIds,
        seats: selected,
        ticketId,
        holdId: String(holdId),
        eventId: resolvedEventId,
        total: total ?? 0,
        subtotal: subtotal ?? 0,
        serviceFee: serviceFee ?? 0,
        vat: vat ?? 0,
        heldAt: Date.now(),
        slug: slug ?? undefined,
      });
      sessionStorage.setItem("myticket.ticketId", String(ticketId));
      navigate("/checkout");
    } catch (error) {
      dispatch(
        toastPushed("error", apiErrorMessage(error, t("seats.holdFailed"))),
      );
    } finally {
      setHolding(false);
    }
  }

  function toggleSeat(seat: MappedSeat) {
    if (!usingLiveMap || seat.status === "sold" || seat.status === "held")
      return;

    setSelected((current) => {
      if (current.some((item) => item.id === seat.id)) {
        return current.filter((item) => item.id !== seat.id);
      }
      if (current.length >= (requestedQuantity ?? 6)) return current;

      return [
        ...current,
        {
          id: seat.id,
          label: t("seats.rowSeat", { row: seat.row, number: seat.number }),
          category: seat.category,
          price: seat.price,
        },
      ];
    });
  }

  function zoneLabel(id: string, label: string) {
    if (["vip", "gold", "silver", "bronze"].includes(id))
      return t(`seats.zones.${id}`);
    return label;
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-lg pb-32 lg:grid-cols-[minmax(0,1fr)_400px] lg:pb-0">
      <section className="min-w-0 flex-1 overflow-hidden rounded-[20px] border border-border-default bg-surface-default">
        <div className="flex flex-col gap-md border-b border-border-divider px-md py-md sm:px-xl sm:py-lg">
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <p className="text-[15px] font-semibold text-ink-primary">
              {t("seats.hall")}
            </p>
            {waitingForSeats ? (
              <p className="text-[13px] font-semibold text-ink-secondary">
                {t("seats.loading")}
              </p>
            ) : null}
          </div>
          {usingLiveMap ? (
            <div className="flex flex-wrap gap-sm">
              <FilterChip
                selected={zone === "all"}
                onClick={() => setZone("all")}
                className="h-9 rounded-pill px-md text-[13px] font-semibold"
              >
                {t("seats.zones.all")}
              </FilterChip>
              {zoneOptions.map((item) => (
                <FilterChip
                  key={item.id}
                  selected={zone === item.id}
                  onClick={() => setZone(item.id)}
                  className="h-9 rounded-pill px-md text-[13px] font-semibold"
                >
                  <span className="inline-flex items-center gap-[7px]">
                    <span
                      className={cn(
                        "size-[9px] rounded-full",
                        zoneTone(item.id),
                      )}
                    />
                    {zoneLabel(item.id, item.label)}
                  </span>
                </FilterChip>
              ))}
            </div>
          ) : null}
        </div>

        {/* <div className="bg-gradient-to-b from-bg-page via-surface-default via-[55%] to-surface-default px-sm py-lg sm:px-lg sm:py-xl"> */}
        <div className="px-sm py-lg sm:px-lg sm:py-xl">
          {waitingForSeats ? (
            <p className="py-3xl text-center text-[14px] font-semibold text-ink-secondary">
              {t("seats.loading")}
            </p>
          ) : seatsUnavailable ? (
            <EmptyState
              variant="gated"
              className="mx-auto py-3xl"
              title={t("seats.unavailableTitle")}
              body={t("seats.unavailableBody")}
              ctaLabel={t("seats.backToEvent")}
              onCtaClick={() => navigate(slug ? `/events/${slug}` : "/events")}
            />
          ) : (
            <SeatBlock
              rows={liveRows ?? []}
              zone={zone}
              selectedIds={selectedIds}
              onToggle={toggleSeat}
              getSeatLabel={(seat) => {
                const label = t("seats.rowSeat", {
                  row: seat.row,
                  number: seat.number,
                });
                return seat.accessible
                  ? `${t("seats.legend.accessible")} · ${label}`
                  : label;
              }}
            />
          )}
        </div>

        <SeatLegend
          available={t("seats.legend.available")}
          selected={t("seats.legend.selected")}
          sold={t("seats.legend.sold")}
          accessible={t("seats.legend.accessible")}
        />
      </section>

      <aside className="min-w-0 lg:sticky lg:top-lg">
        <div className="rounded-[20px] border border-border-default bg-surface-default p-md sm:p-[20px]">
          <div className="flex items-baseline justify-between gap-md">
            <h2 className="text-[17px] font-semibold text-ink-primary">
              {t("seats.yourSeats")}
            </h2>
            <p className="text-[13px] text-ink-secondary">
              {t("seats.selectedOf", {
                count: selected.length,
                max: requestedQuantity ?? 6,
              })}
            </p>
          </div>

          {selected.length ? (
            <ul className="mt-lg flex flex-col gap-[12px]">
              {selected.map((seat) => (
                <li key={seat.id} className="flex items-start gap-[10px]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-ink-primary">
                      {seat.label}
                    </p>
                    {seat.category ? (
                      <p className="text-[12px] text-ink-secondary">
                        {seat.category}
                      </p>
                    ) : null}
                  </div>
                  {seat.price != null ? (
                    <PriceDisplay
                      context="row"
                      className="text-[14px] font-semibold"
                      value={seat.price}
                    />
                  ) : null}
                  <button
                    type="button"
                    aria-label={t("seats.removeSeat", { label: seat.label })}
                    className="text-ink-muted hover:text-ink-primary"
                    onClick={() =>
                      setSelected((current) =>
                        current.filter((item) => item.id !== seat.id),
                      )
                    }
                  >
                    <CloseIcon size={13} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-lg text-[13px] text-ink-muted">
              {requestedQuantity != null
                ? t("seats.mapHintQuantity", { count: requestedQuantity })
                : t("seats.mapHint")}
            </p>
          )}

          <Divider tone="divider" className="my-lg" />

          <div className="flex flex-col gap-sm text-[14px]">
            <div className="flex justify-between">
              <span className="text-ink-secondary">{t("seats.subtotal")}</span>
              {subtotal != null ? (
                <PriceDisplay context="row" value={subtotal} />
              ) : (
                <span className="text-ink-muted">—</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">
                {t("seats.serviceFee")}
              </span>
              {serviceFee != null ? (
                <PriceDisplay context="row" value={serviceFee} />
              ) : (
                <span className="text-ink-muted">—</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">{t("seats.vat")}</span>
              {vat != null ? (
                <PriceDisplay context="row" value={vat} />
              ) : (
                <span className="text-ink-muted">—</span>
              )}
            </div>
          </div>

          <div className="mt-md flex items-baseline justify-between border-t border-border-divider pt-md">
            <span className="text-[16px] font-semibold text-ink-primary">
              {t("seats.total")}
            </span>
            {total != null ? (
              <PriceDisplay context="stat" value={total} />
            ) : (
              <span className="text-[18px] font-bold text-ink-muted">—</span>
            )}
          </div>

          <Button
            type="button"
            size="lg"
            className="mt-lg hidden h-[52px] w-full rounded-[26px] text-[16px] font-semibold lg:flex"
            disabled={
              holding ||
              waitingForSeats ||
              seatsUnavailable ||
              selected.length === 0 ||
              (requestedQuantity != null &&
                selected.length !== requestedQuantity) ||
              !hasCompletePrices ||
              !usingLiveMap
            }
            onClick={() => void continueToCheckout()}
          >
            {holding ? t("seats.holding") : t("seats.continuePaymentLabel")}
            {total != null ? (
              <span className="ms-2 inline-flex items-center justify-center gap-[0.35em]">
                <SarSymbol size={16} />
                <span>{total.toLocaleString("en-US")}</span>
              </span>
            ) : null}
          </Button>
          <p className="mt-md hidden text-center text-[12px] leading-[1.5] text-ink-muted lg:block">
            {seatsUnavailable ? t("seats.needLive") : t("seats.holdNote")}
          </p>
        </div>
      </aside>
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border-divider bg-surface-default px-page-gutter pt-sm pb-3 shadow-[0_-8px_24px_rgba(25,16,8,0.08)] lg:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        <div className="mx-auto flex w-full max-w-[var(--container-page)] items-center gap-md">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-ink-muted">
              {t("seats.total")}
            </p>
            {total != null ? (
              <PriceDisplay context="row" className="font-bold" value={total} />
            ) : (
              <span className="text-[16px] font-bold text-ink-muted">—</span>
            )}
          </div>
          <Button
            type="button"
            size="lg"
            className="h-[48px] min-w-[180px] rounded-[24px] px-lg text-[15px] font-semibold"
            disabled={
              holding ||
              waitingForSeats ||
              seatsUnavailable ||
              selected.length === 0 ||
              (requestedQuantity != null &&
                selected.length !== requestedQuantity) ||
              !hasCompletePrices ||
              !usingLiveMap
            }
            onClick={() => void continueToCheckout()}
          >
            {holding ? t("seats.holding") : t("seats.continuePaymentLabel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
