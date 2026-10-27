import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { baseApi } from "@/app/api/baseApi";
import {
  useApplyPromoCodeMutation,
  useCancelOrderMutation,
  useCreateOrderMutation,
  useGetOrdersQuery,
  usePayOrderMutation,
} from "@/app/api/ordersApi";
import {
  useGetActivitySlotsQuery,
  useGetEventDetailsQuery,
  useGetEventsQuery,
} from "@/app/api/eventsApi";
import {
  useGetEventSeatsQuery,
  useHoldSeatsMutation,
  useReleaseHoldMutation,
} from "@/app/api/seatsApi";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectAuthUser, userUpdated } from "@/features/auth/authSlice";
import { toastPushed } from "@/features/ui/uiSlice";
import { apiErrorDetails, apiErrorMessage } from "@/lib/api/unwrap";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { useEventFavorites } from "@/lib/favorites/useEventFavorites";
import { formatMoneySar, localizedString } from "@/lib/api/locale";
import {
  listBookableSessions,
  listTicketTypes,
  mapApiEventToCard,
  resolveEventFromList,
  resolveEventId,
  resolveDefaultSessionId,
  resolveSeatingType,
  listSessions,
  listActivities,
  sessionIsOver,
  type EventActivity,
  type EventSession,
} from "@/lib/api/mappers/events";
import { mapApiSeatsToRows } from "@/lib/api/mappers/seats";
import {
  beginPaymentRedirect,
  buildPaymentReturnUrl,
} from "@/lib/purchase/paymentReturn";
import { toPaymentBrand, type BookingPaymentMethod } from "@/lib/purchase/paymentBrand";
import {
  clearHoldSession,
  startPurchaseForEvent,
} from "@/lib/purchase/holdSession";
import { catalogLabel } from "@/lib/i18n/catalogLabels";
import { getActiveLocale } from "@/i18n/config";
import { MoneyAmount, parseMoneyDisplay } from "@/components/data-display";
import {
  HeartGlyphIcon,
  MapPinIcon,
  StarFillIcon,
} from "@/components/icons";
import { FadeUp } from "@/components/motion";
import {
  Breadcrumbs,
} from "@/components/navigation";
import { Button } from "@/components/ui";
import { PageSection } from "@/layouts";
import { NotFoundPage } from "@/pages/system/NotFoundPage";
import {
  DetailGallery,
  BookingModal,
  type BookingLine,
  type SeatOption,
  SimilarSection,
  slugify,
} from "@/pages/_guest";
import {
  googleMapsQueryUrl,
  googleMapsUrl,
  parseEventCoordinates,
} from "@/components/maps/EventVenueMap";

function pickDetailString(
  record: Record<string, unknown> | undefined,
  keys: string[],
): string | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const text = localizedString(record[key]);
    if (text) return text;
  }
  return undefined;
}

function collectGalleryImages(
  record: Record<string, unknown> | undefined,
): string[] {
  if (!record) return [];
  const buckets = [
    record.images,
    record.gallery,
    record.photos,
    record.media,
    record.event_images,
  ];
  const out: string[] = [];
  for (const bucket of buckets) {
    if (!Array.isArray(bucket)) continue;
    for (const item of bucket) {
      if (typeof item === "string" && item.trim()) {
        out.push(item.trim());
        continue;
      }
      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const src = localizedString(
          row.url ?? row.src ?? row.image ?? row.path,
        );
        if (src) out.push(src);
      }
    }
  }
  return out;
}

/** Event detail — Figma `207:4797` continuous article + scroll-spy tabs. */
export function EventDetailPage() {
  const { t } = useTranslation(["catalog", "common", "checkout"]);
  const { slug } = useParams();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const dispatch = useAppDispatch();
  const { requireAuth, isAuthenticated } = useRequireAuth();
  const [createOrder, createState] = useCreateOrderMutation();
  const [payOrder, payState] = usePayOrderMutation();
  const [applyPromo] = useApplyPromoCodeMutation();
  const [cancelOrder] = useCancelOrderMutation();
  const [holdSeats, holdState] = useHoldSeatsMutation();
  const [releaseHold] = useReleaseHoldMutation();
  const slugOrId = slug ?? "";
  const { isFavourite, toggleFavourite } = useEventFavorites();

  const { data: eventsResult } = useGetEventsQuery();
  const apiEvents = eventsResult?.items;

  const catalog = useMemo(() => {
    if (apiEvents && apiEvents.length > 0) {
      return apiEvents.map(mapApiEventToCard);
    }
    // No sample catalogue behind the API — an empty list stays empty.
    return [];
  }, [apiEvents]);

  // The detail is asked for by the address's own slug (or id): the API finds
  // an event either way. Resolving it through the list first meant only the
  // first page of 10 could open — 25 of 35 events showed "page not found".
  const {
    data: apiDetail,
    isLoading: detailLoading,
    isError: detailError,
  } = useGetEventDetailsQuery(slugOrId, {
    skip: !slugOrId,
  });

  /** The event's numeric id, which seats, holds, orders and favourites need. */
  const resolvedId = useMemo(
    () =>
      resolveEventId(apiEvents, slugOrId) ??
      (apiDetail?.id != null ? String(apiDetail.id) : undefined),
    [apiDetail?.id, apiEvents, slugOrId],
  );
  const { isLoading: eventsLoading } = useGetEventsQuery();

  const isSaved = isFavourite(resolvedId);

  async function handleSave() {
    if (!resolvedId) {
      dispatch(toastPushed("error", t("detail.saveUnavailable")));
      return;
    }
    try {
      const ok = await toggleFavourite(resolvedId);
      if (ok) {
        dispatch(
          toastPushed(
            "success",
            isSaved ? t("detail.removedSaved") : t("detail.saved"),
          ),
        );
      }
    } catch (error) {
      dispatch(
        toastPushed("error", apiErrorMessage(error, t("detail.saveError"))),
      );
    }
  }

  const listCard = useMemo(() => {
    const fromCatalog = catalog.find(
      (e) => e.slug === slugOrId || slugify(e.title) === slugOrId,
    );
    if (fromCatalog) return fromCatalog;
    if (apiEvents?.length) {
      const raw = resolveEventFromList(apiEvents, slugOrId);
      return raw ? mapApiEventToCard(raw) : undefined;
    }
    return undefined;
  }, [apiEvents, catalog, slugOrId]);

  const detailCard = useMemo(() => {
    if (apiDetail && Object.keys(apiDetail).length > 0) {
      return mapApiEventToCard(apiDetail);
    }
    return undefined;
  }, [apiDetail]);

  const display = useMemo(
    () => ({
      title: detailCard?.title ?? listCard?.title ?? "",
      category:
        detailCard?.category ?? listCard?.category ?? "",
      flag:
        detailCard?.flag ??
        (listCard && "flag" in listCard ? listCard.flag : undefined) ??
        undefined,
      rating:
        detailCard?.rating && detailCard.rating !== "—"
          ? detailCard.rating
          : listCard?.rating && listCard.rating !== "—"
            ? listCard.rating
            : undefined,
      when:
        pickDetailString(apiDetail, [
          "when",
          "date_label",
          "starts_at",
          "datetime",
        ]) ??
        listCard?.date ??
        undefined,
      venue: detailCard?.venue || listCard?.venue || "",
      fromPrice: detailCard?.price ?? listCard?.price ?? "",
      about:
        pickDetailString(apiDetail, [
          "description",
          "about",
          "summary",
          "overview",
        ]),
    }),
    [apiDetail, detailCard, listCard],
  );

  const title = display.title;

  const listEvent = useMemo(
    () => resolveEventFromList(apiEvents, slugOrId),
    [apiEvents, slugOrId],
  );

  const coordinates = useMemo(() => {
    return (
      parseEventCoordinates(apiDetail) ??
      parseEventCoordinates(listEvent) ??
      null
    );
  }, [apiDetail, listEvent]);

  const venueFromApi = detailCard?.venue || listCard?.venue || "";

  const mapsHref = coordinates
    ? googleMapsUrl(coordinates.latitude, coordinates.longitude)
    : venueFromApi
      ? googleMapsQueryUrl(venueFromApi)
      : undefined;

  // Only the event's own photos. The design file's stock photos used to be
  // appended to every gallery and filled the thumbnails.
  const mainImage = detailCard?.image ?? listCard?.image;
  const galleryImages = useMemo(
    () =>
      [mainImage, ...collectGalleryImages(apiDetail)].filter(
        (src): src is string => Boolean(src),
      ),
    [apiDetail, mainImage],
  );
  const galleryThumbs = useMemo(
    () => galleryImages.filter((src) => src !== mainImage).slice(0, 3),
    [galleryImages, mainImage],
  );

  useEffect(() => {
    if (resolvedId)
      sessionStorage.setItem("myticket.eventId", String(resolvedId));
  }, [resolvedId]);

  const eventSource =
    apiDetail && Object.keys(apiDetail).length > 0 ? apiDetail : undefined;
  const seatingType = resolveSeatingType(
    eventSource ?? resolveEventFromList(apiEvents, slugOrId),
  );
  /**
   * Showtime for this purchase. Every order must name one — the API rejects a
   * body without `sessionId` and answers `session_required`.
   *
   * Following the app's booking-date control: past dates are dropped, the next
   * one is preselected, and changing it clears the ticket quantities the way the
   * app clears the chosen seat.
   */
  const bookableSessions = useMemo(
    () =>
      listBookableSessions(eventSource ?? resolveEventFromList(apiEvents, slugOrId)),
    [apiEvents, eventSource, slugOrId],
  );
  const defaultSessionId = useMemo(
    () =>
      resolveDefaultSessionId(
        eventSource ?? resolveEventFromList(apiEvents, slugOrId),
      ),
    [apiEvents, eventSource, slugOrId],
  );
  // Panel prices use the next bookable showtime; the modal can pick another
  // and we refetch seats for that date (same as the mobile app).
  const selectedSessionId = defaultSessionId;
  const [bookingSessionId, setBookingSessionId] = useState<
    number | undefined
  >();

  const apiTicketTypes = useMemo(
    () =>
      listTicketTypes(
        eventSource ?? resolveEventFromList(apiEvents, slugOrId),
        selectedSessionId,
      ),
    [apiEvents, eventSource, selectedSessionId, slugOrId],
  );

  /** Types for the modal's chosen showtime (each date can have its own price). */
  const bookingTicketTypes = useMemo(
    () =>
      listTicketTypes(
        eventSource ?? resolveEventFromList(apiEvents, slugOrId),
        bookingSessionId ?? selectedSessionId,
      ),
    [apiEvents, bookingSessionId, eventSource, selectedSessionId, slugOrId],
  );
  // Landing on a different event abandons any half-finished purchase.
  useEffect(() => {
    startPurchaseForEvent(resolvedId ?? slugOrId);
  }, [resolvedId, slugOrId]);

  const [bookingOpen, setBookingOpen] = useState(false);
  const seatsSessionId = bookingSessionId ?? selectedSessionId;

  const {
    data: apiSeats,
    isLoading: seatsLoading,
    isFetching: seatsFetching,
  } = useGetEventSeatsQuery(
    {
      eventId: resolvedId!,
      sessionId: seatsSessionId,
    },
    {
      // Seats API requires auth — don't probe it on public detail (401 used to kick guests to sign-in).
      skip:
        !resolvedId ||
        seatingType !== "assigned" ||
        !isAuthenticated ||
        !bookingOpen,
      // Keep inventory fresh while the modal is open, matching the app's 15s poll.
      pollingInterval: bookingOpen ? 15_000 : 0,
    },
  );

  /**
   * Unwrap + map the same way SeatSelectionPage / the mobile app do.
   * Treating the envelope as an array left the modal with zero seats.
   */
  const seatOptions = useMemo<SeatOption[]>(() => {
    const rows = mapApiSeatsToRows(apiSeats, seatsSessionId);
    if (!rows?.length) return [];
    const options: SeatOption[] = [];
    for (const { seats } of rows) {
      for (const seat of seats) {
        const id = Number(seat.id);
        if (!Number.isInteger(id)) continue;
        options.push({
          id,
          label: `${seat.row}${seat.number}`,
          row: seat.row,
          number: seat.number,
          ticketTypeId: seat.ticketTypeId,
          sessionId: seatsSessionId,
          accessible: seat.accessible,
          taken: seat.status !== "available",
        });
      }
    }
    return options;
  }, [apiSeats, seatsSessionId]);

  // Things to book inside the event (27 Oct 2026): listed as their own rows,
  // each booked on its own days and times.
  const activities = useMemo(
    () => listActivities(eventSource ?? resolveEventFromList(apiEvents, slugOrId)),
    [apiEvents, eventSource, slugOrId],
  );
  const [activityId, setActivityId] = useState<number | undefined>();
  // Every event has at least one; an ordinary event's single one is hidden.
  // Several are listed; a single one with times is booked by day and time.
  const listsActivities = activities.length > 1;
  const bookingActivity =
    activities.find((activity) => activity.id === activityId) ??
    (activities.length === 1 && activities[0]!.startTimes.length > 0 ? activities[0] : undefined);
  const { data: activitySlots, isFetching: activitySlotsLoading } = useGetActivitySlotsQuery(
    { eventId: resolvedId!, activityId: bookingActivity?.id ?? 0 },
    { skip: !resolvedId || !bookingActivity || !bookingOpen, refetchOnMountOrArgChange: true },
  );

  const bookingTypeOptions = useMemo(
    () =>
      bookingTicketTypes
        .filter((tier) => !bookingActivity || bookingActivity.ticketTypeIds.includes(tier.id))
        .map((tier) => ({
        id: tier.id,
        name: tier.name,
        price: tier.price,
        remaining: tier.remaining,
        disabled: tier.remaining === 0,
      })),
    [bookingTicketTypes, bookingActivity],
  );





  const eventStartRaw =
    apiDetail?.startTime ??
    apiDetail?.starts_at ??
    apiDetail?.start_at ??
    apiDetail?.datetime ??
    (listCard && "startTime" in listCard ? listCard.startTime : undefined);
  const eventStart = eventStartRaw ? new Date(String(eventStartRaw)) : null;
  // Ended once every date is over — a running event is still on sale. With
  // no dates listed, fall back to its start.
  const allSessions = listSessions(eventSource ?? resolveEventFromList(apiEvents, slugOrId));
  const isPastEvent =
    allSessions.length > 0
      ? allSessions.every((session) => sessionIsOver(session))
      : Boolean(
          eventStart &&
            !Number.isNaN(eventStart.getTime()) &&
            eventStart.getTime() <= Date.now(),
        );






  type BookingBase = {
    typeId: number;
    sessionId: number;
    /** An activity's start time ("09:00"), when it has times. */
    time?: string | null;
    lines: BookingLine[];
  };

  /**
   * An order made for this booking before paying — Apply on a promo code makes
   * it, as the app does, so the discount can be shown. Pay then uses it
   * rather than making a second one; closing the dialog or going back to
   * change the tickets cancels it so its seats go back on sale.
   */
  const authUser = useAppSelector(selectAuthUser);
  // Valid tickets already held for this event on the chosen day: the booking
  // says so before paying (people unsure a payment went through booked again).
  const { data: myOrders } = useGetOrdersQuery(undefined, { skip: !authUser });
  const alreadyHeld = useMemo(() => {
    const chosenId = bookingSessionId ?? selectedSessionId;
    const chosen = bookableSessions.find((session) => session.id === chosenId);
    const day = (at: unknown) => (at ? String(at).slice(0, 10) : null);
    const chosenDay = day(chosen?.startsAt);
    return (myOrders ?? [])
      .filter((order) => {
        const o = order as Record<string, unknown>;
        const event = o.event as Record<string, unknown> | undefined;
        return String(event?.id ?? "") === String(resolvedId ?? "")
          && String(o.paymentStatus ?? "") === "completed"
          && !o.refundedAt && o.isOver !== true;
      })
      .flatMap((order) => (Array.isArray((order as Record<string, unknown>).tickets)
        ? ((order as Record<string, unknown>).tickets as Record<string, unknown>[])
        : []))
      .filter((ticket) => !["gifted", "cancelled"].includes(String(ticket.scanStatus ?? ""))
        && (!chosenDay || day(ticket.startsAt) === chosenDay)).length;
  }, [myOrders, bookableSessions, bookingSessionId, selectedSessionId, resolvedId]);
  const pendingOrderRef = useRef<{
    orderId: number;
    promoApplied: boolean;
    /** What the order costs now — after the code, once applied. */
    amount: number;
    /** What it cost before any code. */
    before: number;
  } | null>(null);
  /** Bumped when the pending order is cancelled, so the dialog drops its promo. */
  const [promoResetSignal, setPromoResetSignal] = useState(0);

  function cancelUnpaidOrder(orderId: number) {
    void cancelOrder(orderId)
      .unwrap()
      .catch(() => undefined)
      .finally(() => {
        dispatch(
          baseApi.util.invalidateTags([
            { type: "Event", id: `seats-${resolvedId}` },
            { type: "Event", id: String(resolvedId) },
          ]),
        );
      });
  }

  function discardPendingOrder() {
    const pending = pendingOrderRef.current;
    pendingOrderRef.current = null;
    if (pending) cancelUnpaidOrder(pending.orderId);
  }

  function signedIn(): boolean {
    let allowed = false;
    requireAuth(() => {
      allowed = true;
    });
    return allowed;
  }

  /**
   * Same sequence as the mobile app: soft-hold assigned seats, then create the
   * order with `holdId` + `seatIds`. A free event's order comes back already
   * paid and goes straight to the confirmation (returns null).
   */
  async function startOrder(
    booking: BookingBase,
  ): Promise<{ orderId: number; amount: number; before: number } | null> {
    if (!resolvedId) return null;
    const seatIds = booking.lines
      .map((line) => line.seatId)
      .filter((id): id is number => Number.isInteger(id));
    const assigned = seatingType === "assigned";

    if (assigned && seatIds.length !== booking.lines.length) {
      dispatch(toastPushed("error", t("detail.seatRequired")));
      return null;
    }

    let holdId: string | undefined;
    try {
      if (assigned && seatIds.length > 0) {
        const held = await holdSeats({
          eventId: resolvedId,
          seatIds,
          ticketId: booking.typeId,
          seats: seatIds.map((seatId) => ({
            seatId,
            ticketTypeId: booking.typeId,
          })),
        }).unwrap();
        holdId = String(held.holdId ?? held.hold_id ?? "").trim() || undefined;
        if (!holdId) {
          dispatch(toastPushed("error", t("detail.seatHoldFailed")));
          return null;
        }
      }

      const created = await createOrder({
        eventId: resolvedId,
        body: {
          sessionId: booking.sessionId,
          ticketId: booking.typeId,
          quantity: booking.lines.length,
          items: [
            {
              ticketId: booking.typeId,
              quantity: booking.lines.length,
              ...(booking.time ? { sessionId: booking.sessionId, time: booking.time } : {}),
            },
          ],
          ...(assigned && seatIds.length
            ? { seatIds, holdId }
            : {}),
          beneficiaries: booking.lines.map((line, index) => ({
            quantity_id: index + 1,
            name: line.name.trim(),
          })),
        },
      }).unwrap();
      // Order creation consumes the hold.
      holdId = undefined;

      const orderId = Number(created.id ?? created.orderId ?? created.order_id);
      if (!Number.isFinite(orderId) || orderId <= 0) {
        dispatch(toastPushed("error", failedBookingLabel()));
        return null;
      }

      // Free events come back already paid: the API completes the order and
      // issues the tickets on creation, and refuses a payment after that
      // ("Payment already made"). Paying anyway showed an error over a ticket
      // that was already issued, and a second press booked a second one.
      const createdStatus = created.paymentStatus ?? created.payment_status;
      if (createdStatus === "completed") {
        clearHoldSession();
        setBookingOpen(false);
        navigate(`/order-confirmation?orderId=${orderId}`);
        return null;
      }

      const amount = Number(created.amount) || 0;
      return { orderId, amount, before: amount };
    } catch (error) {
      if (holdId) {
        void releaseHold({ eventId: resolvedId, holdId });
      }
      throw error;
    }
  }

  function failedBookingLabel() {
    return isFreeEntry ? t("detail.claimFailed") : t("detail.bookingFailed");
  }

  function bookingErrorMessage(error: unknown): string {
    const { message: code } = apiErrorDetails(error);
    // Codes come back raw: `apiErrorMessage` swaps them for the fallback, so
    // comparing its result to "seat_unavailable" never matched.
    return code === "insufficient_balance"
      ? t("checkout:checkout.walletInsufficient")
      : code === "seat_unavailable" || code === "hold_not_found"
        ? t("detail.seatHoldFailed")
        : code === "ticket_mismatch"
          ? t("detail.pickTicketType")
          : apiErrorMessage(error, failedBookingLabel());
  }

  /** Apply in the dialog: make the order if there isn't one, apply the code, return the new total. */
  async function applyPromoForBooking(
    booking: BookingBase,
    code: string,
  ): Promise<{ amount: number; before: number } | null> {
    if (!resolvedId || !signedIn()) return null;
    try {
      let pending = pendingOrderRef.current;
      if (!pending) {
        const started = await startOrder(booking);
        if (!started) return null;
        pending = { ...started, promoApplied: false };
        pendingOrderRef.current = pending;
      }
      // Already on this order (a Pay that failed after applying it): the API
      // would refuse it twice, so answer with what it did the first time.
      if (pending.promoApplied) {
        return { amount: pending.amount, before: pending.before };
      }
      const result = await applyPromo({ orderId: pending.orderId, promoCode: code }).unwrap();
      const amount = Number(result.amount);
      pendingOrderRef.current = {
        ...pending,
        promoApplied: true,
        amount: Number.isFinite(amount) ? amount : pending.amount,
      };
      dispatch(toastPushed("success", t("checkout:checkout.promoApplied")));
      return Number.isFinite(amount) ? { amount, before: pending.amount } : null;
    } catch (error) {
      // The API explains a refused code in words (expired, for another event…).
      dispatch(
        toastPushed(
          "error",
          apiErrorDetails(error).status === 422
            ? apiErrorMessage(error, t("checkout:checkout.promoFailed"))
            : bookingErrorMessage(error),
        ),
      );
      return null;
    }
  }

  async function confirmBooking(booking: BookingBase & {
    promoCode: string;
    method: BookingPaymentMethod;
  }): Promise<void> {
    if (!resolvedId || !signedIn()) return;

    // Set once an order exists and cleared once it is paid or handed to the
    // payment page — an order left behind by a failed payment is cancelled.
    let unpaidOrderId: number | undefined;
    try {
      let pending = pendingOrderRef.current;
      if (!pending) {
        const started = await startOrder(booking);
        if (!started) return;
        pending = { ...started, promoApplied: false };
      }
      const { orderId } = pending;
      unpaidOrderId = orderId;
      pendingOrderRef.current = pending;
      let amountDue = pending.amount;

      // A code typed but not applied still counts, as before Apply existed.
      if (booking.promoCode && !pending.promoApplied) {
        try {
          const applied = await applyPromo({ orderId, promoCode: booking.promoCode }).unwrap();
          const amount = Number(applied.amount);
          if (Number.isFinite(amount)) amountDue = amount;
          pendingOrderRef.current = { ...pending, promoApplied: true, amount: amountDue };
        } catch (error) {
          dispatch(
            toastPushed(
              "error",
              apiErrorMessage(error, t("checkout:checkout.promoFailed")),
            ),
          );
        }
      }

      const payBrand = toPaymentBrand(booking.method);
      const returnUrl = buildPaymentReturnUrl(orderId);
      const paid = await payOrder({
        orderId,
        brand: payBrand,
        // Gateway status page sends the buyer here with the order reference.
        // Host must be allow-listed on the API (https myticket.sa, or localhost).
        returnUrl,
      }).unwrap();
      unpaidOrderId = undefined;
      pendingOrderRef.current = null;

      clearHoldSession();
      setBookingOpen(false);

      const redirectUrl =
        typeof paid?.redirectUrl === "string"
          ? paid.redirectUrl
          : typeof (paid as { redirect_url?: unknown })?.redirect_url === "string"
            ? (paid as { redirect_url: string }).redirect_url
            : undefined;

      if (redirectUrl) {
        // Same tab → gateway → /payment-return?orderId=… → back here + modal.
        beginPaymentRedirect(orderId, `${pathname}${search}`);
        window.location.assign(redirectUrl);
        return;
      }

      // Wallet (and any brand that settles inline) — no hosted page. The
      // balance on screen comes from sign-in; take the payment off it.
      if (booking.method === "wallet" && authUser) {
        dispatch(
          userUpdated({
            ...authUser,
            walletBalance: Math.max(0, (authUser.walletBalance ?? 0) - amountDue),
          }),
        );
      }
      navigate(`/order-confirmation?orderId=${orderId}`);
    } catch (error) {
      const { status, message: code } = apiErrorDetails(error);
      // A payment that failed before any money moved leaves an unpaid order
      // holding the seats: the seat showed as sold and the order sat in My
      // Tickets. Cancel it so both are released. Not for "already paid" or
      // "not active" (both 400) or a network error, where it may have gone
      // through — that order stays, and paying again reuses it.
      const unpaidForSure =
        code === "insufficient_balance" ||
        status === 409 ||
        (typeof status === "number" && status >= 500);
      if (unpaidOrderId && unpaidForSure) {
        pendingOrderRef.current = null;
        setPromoResetSignal((value) => value + 1);
        cancelUnpaidOrder(unpaidOrderId);
      }
      dispatch(toastPushed("error", bookingErrorMessage(error)));
    }
  }

  /** Offer on the default showtime, shown beside the price list. */
  const sessionOffer = (() => {
    const active = bookableSessions.find(
      (session) => session.id === selectedSessionId,
    );
    if (!active?.discountValue) return undefined;
    return active.discountType === "percentage"
      ? t("detail.percentOff", { value: active.discountValue })
      : t("detail.amountOff", { value: active.discountValue });
  })();

  /**
   * Free entry, not free seating. `seatingType: "free"` only means seats are
   * unreserved — Comedy Nights is "free" seating at 120 a ticket. Entry is free
   * when the event says so, or when every ticket on sale costs nothing.
   */
  const isFreeEntry =
    eventSource?.isFree === true ||
    (apiTicketTypes.length > 0 &&
      apiTicketTypes.every((tier) => tier.price <= 0));

  const primaryLabel = isFreeEntry
    ? t("detail.claimFreeTicket")
    : t("detail.bookNow");





  const stillLoading = eventsLoading || detailLoading;
  const eventMissing =
    !stillLoading && !detailCard && !listCard && (detailError || !resolvedId);

  // An unknown slug used to render the fixture event rather than failing. A URL
  // that names no real event is a 404, the same as any other missing page.
  if (eventMissing) return <NotFoundPage />;

  if (stillLoading && !detailCard && !listCard) {
    return (
      <PageSection padTop={26} padBottom={64}>
        <div
          className="h-[420px] w-full animate-pulse rounded-xl bg-bg-skeleton"
          role="status"
          aria-label={t("common:states.loading")}
        />
      </PageSection>
    );
  }

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: t("detail.crumbHome"), href: "/" },
            { label: t("detail.crumbEvents"), href: "/events" },
            { label: catalogLabel(t, display.category), href: "/events" },
            { label: title },
          ]}
        />
      </PageSection>

      <PageSection padTop={16} padBottom={0}>
        <FadeUp inView={false}>
          <DetailGallery
            category={display.category}
            flag={display.flag}
            mainImage={mainImage}
            thumbs={galleryThumbs}
            images={galleryImages}
          />
        </FadeUp>
      </PageSection>

      <PageSection padTop={34} padBottom={0}>
        {/*
          Laid out like the original show-details page: title with rating and a
          favourite toggle, then the address, date and description, then the
          ticket-price list, then the actions. No sticky side card, no tab rail.
        */}
        <div className="flex w-full flex-col gap-2xl">
          <header className="flex flex-col gap-md">
            <div className="flex flex-wrap items-center justify-between gap-md">
              <h1 className="text-balance text-display-hero text-ink-primary">
                {title}
              </h1>
              <div className="flex items-center gap-lg">
                {display.rating ? (
                  <span className="ltr-run inline-flex items-center gap-[5px] text-[15px] font-semibold text-ink-primary">
                    <StarFillIcon size={16} />
                    {display.rating}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  className="inline-flex items-center gap-sm text-[14px] text-ink-primary hover:text-ink-brand"
                >
                  <HeartGlyphIcon size={18} filled={isSaved} />
                  <span className="max-sm:hidden">
                    {isSaved
                      ? t("detail.removeFromFavourites")
                      : t("detail.addToFavourites")}
                  </span>
                </button>
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-lg">
            <div className="flex flex-wrap items-center justify-between gap-md">
              <p className="flex min-w-0 items-center gap-sm text-[14px] text-ink-secondary">
                <MapPinIcon size={18} className="shrink-0 text-ink-brand" />
                {venueFromApi || display.venue}
              </p>
              {mapsHref ? (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] font-semibold text-ink-brand hover:underline"
                >
                  {t("detail.openInMaps")}
                </a>
              ) : null}
            </div>

            {/* With activities, each has its own days and times (listed below). */}
            {display.when && !listsActivities ? (
              <p className="ltr-run text-[14px] font-bold text-ink-primary">
                {display.when}
              </p>
            ) : null}

            {display.about ? (
              <p className="max-w-[720px] text-pretty text-[15px] leading-[1.6] text-ink-body sm:text-[16px]">
                {display.about}
              </p>
            ) : null}
          </div>

          {listsActivities ? (
            <ActivityList
              activities={activities}
              sessions={allSessions}
              types={apiTicketTypes}
              onBook={(id) => {
                setActivityId(id);
                setBookingOpen(true);
              }}
              disabled={isPastEvent}
            />
          ) : apiTicketTypes.length > 0 ? (
            <section className="overflow-hidden rounded-[18px] border border-border-default bg-surface-default">
              <div className="flex items-center justify-between gap-md border-b border-border-default px-lg py-md">
                <h2 className="text-[15px] font-semibold text-ink-primary">
                  {t("detail.ticketPrices")}
                </h2>
                {sessionOffer ? (
                  <span className="ltr-run text-[13px] font-semibold text-brand-gradient-end">
                    {sessionOffer}
                  </span>
                ) : null}
              </div>
              <ul className="max-h-[220px] overflow-y-auto">
                {apiTicketTypes.map((tier) => (
                  <li
                    key={tier.id}
                    className="flex items-center justify-between gap-md px-lg py-sm odd:bg-bg-warm/60"
                  >
                    <span className="text-[14px] text-ink-primary">
                      {tier.name}
                    </span>
                    <span className="ltr-run text-[14px] font-semibold text-ink-brand">
                      {formatMoneySar(tier.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : isFreeEntry ? (
            <p className="text-[16px] font-semibold text-ink-brand">
              {t("detail.freeActivity")}
            </p>
          ) : null}

          {!listsActivities ? (
            <div className="flex flex-col gap-md sm:flex-row">
              <Button
                className="w-full sm:w-auto"
                disabled={isPastEvent}
                onClick={() => setBookingOpen(true)}
              >
                {isPastEvent ? t("detail.eventEnded") : primaryLabel}
              </Button>
            </div>
          ) : null}

          <BookingModal
            open={bookingOpen}
            onOpenChange={(open) => {
              // Closing without paying gives back the order Apply made.
              if (!open) discardPendingOrder();
              setBookingOpen(open);
            }}
            eventTitle={bookingActivity && listsActivities ? `${bookingActivity.name} — ${title}` : title}
            types={bookingTypeOptions}
            activitySlots={bookingActivity ? (activitySlots ?? []) : undefined}
            activitySlotsLoading={activitySlotsLoading}
            sessions={bookableSessions}
            seats={seatOptions}
            seatsLoading={seatsLoading || seatsFetching}
            assignedSeating={seatingType === "assigned"}
            freeEntry={isFreeEntry}
            onSessionChange={setBookingSessionId}
            alreadyHeld={alreadyHeld}
            busy={
              createState.isLoading ||
              payState.isLoading ||
              holdState.isLoading
            }
            onConfirm={(booking) => void confirmBooking(booking)}
            onApplyPromo={applyPromoForBooking}
            onDiscardPromo={discardPendingOrder}
            promoResetSignal={promoResetSignal}
          />
        </div>
      </PageSection>

      <SimilarSection
        heading={t("detail.similar")}
        headingClassName="text-heading-h2-feature"
        link={{ label: t("detail.similarEventsLink"), to: "/events" }}
      >
        {catalog
          .filter((e) => e.title !== title)
          .slice(0, 4)
          .map((event) => (
            <SimilarEventCard
              key={event.slug ?? event.title}
              slug={event.slug ?? slugify(event.title)}
              title={event.title}
              date={event.date}
              venue={event.venue}
              rating={event.rating}
              price={event.price}
              image={event.image}
            />
          ))}
      </SimilarSection>
    </>
  );
}

/**
 * Figma similar card `207:5148` — 315×~314, media 170, no catalog chrome
 * (no heart / badges / attendance). Kept local until a DS similar card exists.
 */
function SimilarEventCard({
  slug: eventSlug,
  title,
  date,
  venue,
  rating,
  price,
  image,
}: {
  slug: string;
  title: string;
  date: string;
  venue: string;
  rating: string;
  price: string;
  image?: string;
}) {
  const { t } = useTranslation("catalog");
  const { t: tCommon } = useTranslation("common");
  const isFree = parseMoneyDisplay(price).kind === "free";
  return (
    <Link
      to={`/events/${eventSlug}`}
      className="flex min-w-0 flex-col overflow-hidden rounded-[16px] border border-border-default bg-surface-default"
    >
      <div className="h-[150px] w-full overflow-hidden bg-bg-skeleton sm:h-[170px]">
        {image ? (
          <img src={image} alt="" className="size-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-lg pt-[15px] pb-[16px]">
        <p className="text-[12px] font-semibold text-ink-muted">{date}</p>
        <p className="mt-[6px] text-[15px] leading-[1.25] font-semibold text-balance text-ink-primary">
          {title}
        </p>
        <p className="mt-[6px] text-[13px] text-ink-secondary">{venue}</p>
        <div className="mt-auto flex items-end justify-between gap-md pt-[12px]">
          <span className="flex items-center gap-[5px] text-[13px] font-medium text-ink-primary">
            <StarFillIcon size={13} />
            {rating}
          </span>
          {isFree ? (
            <MoneyAmount
              value={price}
              freeLabel={tCommon("currency.freeTickets")}
              className="shrink-0 text-[15px] font-semibold text-ink-primary sm:text-[17px]"
            />
          ) : (
            <span className="shrink-0 text-[15px] font-semibold text-ink-primary sm:text-[17px]">
              {t("detail.from")}{" "}
              <MoneyAmount
                value={price}
                className="inline-flex align-baseline"
              />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/** "Every day except Friday · 09:00 – 16:00" — Riyadh days and its first time to its last one's end. */
function activitySchedule(activity: EventActivity, t: (key: string, options?: Record<string, unknown>) => string, locale: string) {
  const dayName = (day: number) =>
    new Date(Date.UTC(2024, 0, 7 + day)).toLocaleDateString(locale, { weekday: "long", timeZone: "UTC" });
  const days = activity.weekdays;
  const dayText =
    days.length === 0 || days.length === 7
      ? t("detail.activityEveryDay")
      : days.length >= 5
        ? t("detail.activityEveryDayExcept", {
            days: [0, 1, 2, 3, 4, 5, 6].filter((d) => !days.includes(d)).map(dayName).join(locale.startsWith("ar") ? "، " : ", "),
          })
        : days.map(dayName).join(locale.startsWith("ar") ? "، " : ", ");
  const times = activity.startTimes;
  if (!times.length) return dayText;
  const [h, m] = times[times.length - 1]!.split(":").map(Number);
  const endMinutes = h! * 60 + m! + (activity.durationMinutes ?? 60);
  const clock = (minutes: number) =>
    new Date(Date.UTC(2024, 0, 1, Math.floor(minutes / 60) % 24, minutes % 60)).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
      numberingSystem: "latn",
    });
  const [fh, fm] = times[0]!.split(":").map(Number);
  return `${dayText} · ${clock(fh! * 60 + fm!)} – ${clock(endMinutes)}`;
}

/** The next day (and time) an activity runs, Riyadh time, from the event's dates — the app's date badge. */
function nextOpening(activity: EventActivity, sessions: EventSession[]): Date | null {
  const now = Date.now();
  const riyadhDay = (iso: string) => {
    const d = new Date(new Date(iso).getTime() + 3 * 3600 * 1000);
    return { date: d.toISOString().slice(0, 10), weekday: d.getUTCDay() };
  };
  for (const session of [...sessions].sort((a, b) => String(a.startsAt).localeCompare(String(b.startsAt)))) {
    if (!session.startsAt) continue;
    const { date, weekday } = riyadhDay(session.startsAt);
    if (activity.weekdays.length && !activity.weekdays.includes(weekday)) continue;
    if (!activity.startTimes.length) {
      if (new Date(session.endsAt ?? session.startsAt).getTime() > now) return new Date(`${date}T12:00:00+03:00`);
      continue;
    }
    for (const time of activity.startTimes) {
      const start = new Date(`${date}T${time}:00+03:00`);
      if (start.getTime() > now) return start;
    }
  }
  return null;
}

/**
 * The event's activities ("فئات التذاكر"), as the app lists them: a date
 * badge with the next day it runs beside a card with its name, days and
 * times, and its lowest price. A row opens the booking for that activity.
 */
function ActivityList({
  activities,
  sessions,
  types,
  onBook,
  disabled,
}: {
  activities: EventActivity[];
  sessions: EventSession[];
  types: { id: number; name: string; price: number; detail?: string }[];
  onBook: (activityId: number) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation(["catalog", "common"]);
  const locale = getActiveLocale() === "ar" ? "ar-SA" : "en-SA";
  return (
    <section className="flex flex-col gap-md">
      <h2 className="text-[20px] font-bold text-ink-primary">{t("detail.activitiesTitle")}</h2>
      {activities.map((activity) => {
        const own = types.filter((type) => activity.ticketTypeIds.includes(type.id));
        const next = nextOpening(activity, sessions);
        const from = own.length ? Math.min(...own.map((type) => type.price)) : null;
        return (
          <button
            key={activity.id}
            type="button"
            disabled={disabled}
            onClick={() => onBook(activity.id)}
            className="group flex items-stretch gap-[10px] text-start disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="bg-brand-gradient flex w-[68px] shrink-0 flex-col items-center justify-center rounded-[16px] py-sm text-white">
              <span className="ltr-run text-[22px] font-bold leading-none">
                {next ? next.toLocaleDateString("en-US", { day: "numeric", timeZone: "Asia/Riyadh" }) : "—"}
              </span>
              <span className="mt-[2px] text-[12px]">
                {next ? next.toLocaleDateString(locale, { month: "long", timeZone: "Asia/Riyadh" }) : ""}
              </span>
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-md rounded-[18px] border border-border-default bg-surface-default px-lg py-md transition-colors group-hover:border-border-brand">
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-bold text-ink-brand">{activity.name}</span>
                <span className="block text-[13px] text-ink-secondary">{activitySchedule(activity, t, locale)}</span>
                {activity.description ? (
                  <span className="mt-[2px] block text-[13px] text-ink-body">{activity.description}</span>
                ) : null}
                {from != null ? (
                  <span className="mt-[2px] block text-[13px] font-semibold text-ink-primary">
                    {t("detail.activityFrom", { price: formatMoneySar(from) })}
                  </span>
                ) : null}
              </span>
              <span aria-hidden className="text-[22px] text-ink-brand">
                {getActiveLocale() === "ar" ? "‹" : "›"}
              </span>
            </span>
          </button>
        );
      })}
    </section>
  );
}
