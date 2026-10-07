import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useApplyPromoCodeMutation,
  useCreateOrderMutation,
  usePayOrderMutation,
} from "@/app/api/ordersApi";
import {
  useGetEventDetailsQuery,
  useGetEventsQuery,
} from "@/app/api/eventsApi";
import {
  useGetEventSeatsQuery,
  useHoldSeatsMutation,
  useReleaseHoldMutation,
} from "@/app/api/seatsApi";
import { useAppDispatch } from "@/app/hooks";
import { toastPushed } from "@/features/ui/uiSlice";
import { apiErrorMessage } from "@/lib/api/unwrap";
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
  EVENT_DETAIL_GALLERY,
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

  const resolvedId = useMemo(
    () => resolveEventId(apiEvents, slugOrId),
    [apiEvents, slugOrId],
  );

  const {
    data: apiDetail,
    isLoading: detailLoading,
    isError: detailError,
  } = useGetEventDetailsQuery(resolvedId!, {
    skip: !resolvedId,
  });
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
        ]) ?? t("detail.fixtureAbout"),
    }),
    [apiDetail, detailCard, listCard, t],
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

  const galleryImages = useMemo(() => {
    const apiImages = collectGalleryImages(apiDetail);
    const main =
      detailCard?.image ?? listCard?.image ?? EVENT_DETAIL_GALLERY.main;
    return [
      ...apiImages,
      main,
      EVENT_DETAIL_GALLERY.main,
      ...EVENT_DETAIL_GALLERY.thumbs,
    ].filter((src): src is string => Boolean(src));
  }, [apiDetail, detailCard?.image, listCard?.image]);

  const galleryThumbs = useMemo(() => {
    const apiImages = collectGalleryImages(apiDetail);
    if (apiImages.length >= 3) return apiImages.slice(1, 4);
    return [...EVENT_DETAIL_GALLERY.thumbs];
  }, [apiDetail]);

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

  const bookingTypeOptions = useMemo(
    () =>
      bookingTicketTypes.map((tier) => ({
        id: tier.id,
        name: tier.name,
        price: tier.price,
        remaining: tier.remaining,
        disabled: tier.remaining === 0,
      })),
    [bookingTicketTypes],
  );





  const eventStartRaw =
    apiDetail?.startTime ??
    apiDetail?.starts_at ??
    apiDetail?.start_at ??
    apiDetail?.datetime ??
    (listCard && "startTime" in listCard ? listCard.startTime : undefined);
  const eventStart = eventStartRaw ? new Date(String(eventStartRaw)) : null;
  const isPastEvent = Boolean(
    eventStart &&
    !Number.isNaN(eventStart.getTime()) &&
    eventStart.getTime() <= Date.now(),
  );






  /**
   * Same sequence as the mobile app: soft-hold assigned seats, create order
   * with `holdId` + `seatIds`, optional promo, then pay.
   */
  async function confirmBooking(booking: {
    typeId: number;
    sessionId: number;
    lines: BookingLine[];
    promoCode: string;
    method: BookingPaymentMethod;
  }): Promise<void> {
    if (!resolvedId) return;

    let allowed = false;
    requireAuth(() => {
      allowed = true;
    });
    if (!allowed) return;

    const seatIds = booking.lines
      .map((line) => line.seatId)
      .filter((id): id is number => Number.isInteger(id));
    const assigned = seatingType === "assigned";

    if (assigned && seatIds.length !== booking.lines.length) {
      dispatch(toastPushed("error", t("detail.seatRequired")));
      return;
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
          return;
        }
      }

      const created = await createOrder({
        eventId: resolvedId,
        body: {
          sessionId: booking.sessionId,
          ticketId: booking.typeId,
          quantity: booking.lines.length,
          items: [
            { ticketId: booking.typeId, quantity: booking.lines.length },
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

      // Order creation consumes the hold — don't release on later pay errors.
      holdId = undefined;

      const orderId = Number(created.id ?? created.orderId ?? created.order_id);
      if (!Number.isFinite(orderId) || orderId <= 0) {
        dispatch(toastPushed("error", t("detail.claimFailed")));
        return;
      }

      if (booking.promoCode) {
        try {
          await applyPromo({ orderId, promoCode: booking.promoCode }).unwrap();
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

      // Wallet (and any brand that settles inline) — no hosted page.
      navigate(`/order-confirmation?orderId=${orderId}`);
    } catch (error) {
      if (holdId) {
        void releaseHold({ eventId: resolvedId, holdId });
      }
      const message = apiErrorMessage(error, t("detail.claimFailed"));
      dispatch(
        toastPushed(
          "error",
          message === "seat_unavailable" || message === "hold_not_found"
            ? t("detail.seatHoldFailed")
            : message === "ticket_mismatch"
              ? t("detail.pickTicketType")
              : message,
        ),
      );
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
        <FadeUp>
          <DetailGallery
            category={display.category}
            flag={display.flag}
            mainImage={
              detailCard?.image ?? listCard?.image ?? EVENT_DETAIL_GALLERY.main
            }
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

            {display.when ? (
              <p className="ltr-run text-[14px] font-bold text-ink-primary">
                {display.when}
              </p>
            ) : null}

            <p className="max-w-[720px] text-pretty text-[15px] leading-[1.6] text-ink-body sm:text-[16px]">
              {display.about}
            </p>
          </div>

          {apiTicketTypes.length > 0 ? (
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

          <div className="flex flex-col gap-md sm:flex-row">
            <Button
              className="w-full sm:w-auto"
              disabled={isPastEvent}
              onClick={() => setBookingOpen(true)}
            >
              {isPastEvent ? t("detail.eventEnded") : primaryLabel}
            </Button>
          </div>

          <BookingModal
            open={bookingOpen}
            onOpenChange={setBookingOpen}
            eventTitle={title}
            types={bookingTypeOptions}
            sessions={bookableSessions}
            seats={seatOptions}
            seatsLoading={seatsLoading || seatsFetching}
            assignedSeating={seatingType === "assigned"}
            onSessionChange={setBookingSessionId}
            busy={
              createState.isLoading ||
              payState.isLoading ||
              holdState.isLoading
            }
            onConfirm={(booking) => void confirmBooking(booking)}
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
