import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useApplyPromoCodeMutation,
  useCreateOrderMutation,
  usePayOrderMutation,
} from "@/app/api/ordersApi";
import {
  useGetEventDetailsQuery,
  useGetEventsQuery,
} from "@/app/api/eventsApi";
import { useGetEventSeatsQuery } from "@/app/api/seatsApi";
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
import {
  clearHoldSession,
  startPurchaseForEvent,
  writeTicketSelection,
  type TicketSelectionLine,
} from "@/lib/purchase/holdSession";
import { catalogLabel } from "@/lib/i18n/catalogLabels";
import { MoneyAmount, parseMoneyDisplay } from "@/components/data-display";
import {
  ArrowUpRightIcon,
  HeartGlyphIcon,
  MapPinIcon,
  StarFillIcon,
} from "@/components/icons";
import { FadeUp } from "@/components/motion";
import {
  Breadcrumbs,
  DetailSectionTab,
  DetailSectionTabs,
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
  StickyCtaCard,
} from "@/pages/_guest";
import {
  EventVenueMap,
  googleMapsQueryUrl,
  googleMapsUrl,
  parseEventCoordinates,
} from "@/components/maps/EventVenueMap";

/** Event detail tab rail — About · Venue. */
const TABS = ["About", "Venue"] as const;
type Tab = (typeof TABS)[number];

const TAB_IDS: Record<Tab, string> = {
  About: "about",
  Venue: "venue",
};

const TAB_LABEL_KEYS: Record<Tab, string> = {
  About: "detail.about",
  Venue: "detail.venue",
};

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
  const dispatch = useAppDispatch();
  const { requireAuth } = useRequireAuth();
  const [createOrder, createState] = useCreateOrderMutation();
  const [payOrder, payState] = usePayOrderMutation();
  const slugOrId = slug ?? "";
  const [tab, setTab] = useState<Tab>("About");
  const scrollingToRef = useRef<string | null>(null);
  const { isFavourite, toggleFavourite } = useEventFavorites();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<
    Record<number, number>
  >({});

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
  // The modal owns the chosen showtime while booking; the page only needs a
  // default so prices and stock on the panel reflect the next date on sale.
  const selectedSessionId = defaultSessionId;

  const apiTicketTypes = useMemo(
    () =>
      listTicketTypes(
        eventSource ?? resolveEventFromList(apiEvents, slugOrId),
        selectedSessionId,
      ),
    [apiEvents, eventSource, selectedSessionId, slugOrId],
  );
  // Landing on a different event abandons any half-finished purchase.
  useEffect(() => {
    startPurchaseForEvent(resolvedId ?? slugOrId);
  }, [resolvedId, slugOrId]);

  const ticketQuantitiesStorageKey = `myticket.ticketQuantities.${resolvedId ?? slugOrId}`;

  /**
   * One entry per ticket being bought, each with its attendee name — the shape
   * the app and the original website both use. `ticketQuantities` is derived
   * from this so the existing totals and order payload keep working.
   */
  const [bookingOpen, setBookingOpen] = useState(false);

  const { data: apiSeats } = useGetEventSeatsQuery(resolvedId!, {
    skip: !resolvedId || seatingType !== "assigned",
  });

  /** Seat rows for the chosen showtime — the endpoint returns the whole event. */
  const seatOptions = useMemo<SeatOption[]>(() => {
    const rows = Array.isArray(apiSeats) ? apiSeats : [];
    return rows
      .filter((row) => {
        const rowSession = Number(
          (row as Record<string, unknown>).sessionId ??
            (row as Record<string, unknown>).session_id,
        );
        return !Number.isFinite(rowSession) || rowSession === selectedSessionId;
      })
      .map((row) => {
        const record = row as Record<string, unknown>;
        const id = Number(record.id);
        const label =
          String(record.label ?? "") ||
          `${String(record.row ?? "")}${String(record.number ?? "")}`;
        return {
          id,
          label: label || String(id),
          ticketTypeId: Number(
            (record.ticket_type as Record<string, unknown> | undefined)?.id,
          ),
          taken: String(record.status ?? "").toLowerCase() !== "available",
        };
      })
      .filter((seat) => Number.isInteger(seat.id));
  }, [apiSeats, selectedSessionId]);
  const [applyPromo] = useApplyPromoCodeMutation();

  const bookingTypeOptions = useMemo(
    () =>
      apiTicketTypes.map((tier) => ({
        id: tier.id,
        name: tier.name,
        price: tier.price,
        remaining: tier.remaining,
        disabled: tier.remaining === 0,
      })),
    [apiTicketTypes],
  );




  useEffect(() => {
    if (apiTicketTypes.length === 0) return;
    let storedQuantities: Record<string, unknown> = {};
    try {
      const parsed: unknown = JSON.parse(
        sessionStorage.getItem(ticketQuantitiesStorageKey) ?? "{}",
      );
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        storedQuantities = parsed as Record<string, unknown>;
      }
    } catch {
      storedQuantities = {};
    }

    const hasStoredQuantities = Object.keys(storedQuantities).length > 0;
    const nextQuantities = Object.fromEntries(
      apiTicketTypes.map((tier) => {
        const rawQuantity = Number(storedQuantities[String(tier.id)] ?? 0);
        const quantity = Number.isFinite(rawQuantity)
          ? Math.max(0, Math.floor(rawQuantity))
          : 0;
        return [tier.id, Math.min(6, tier.remaining ?? 6, quantity)];
      }),
    );
    const firstAvailable =
      apiTicketTypes.find((tier) => tier.remaining !== 0) ?? apiTicketTypes[0]!;
    if (!hasStoredQuantities && firstAvailable.remaining !== 0) {
      nextQuantities[firstAvailable.id] = 1;
    }

    const storedActiveId = Number(sessionStorage.getItem("myticket.ticketId"));
    const nextId = apiTicketTypes.some(
      (tier) =>
        tier.id === storedActiveId &&
        tier.remaining !== 0 &&
        nextQuantities[tier.id] > 0,
    )
      ? storedActiveId
      : (apiTicketTypes.find(
          (tier) => tier.remaining !== 0 && nextQuantities[tier.id] > 0,
        )?.id ?? firstAvailable.id);

    setTicketQuantities(nextQuantities);
    setSelectedTicketId(nextId);
    sessionStorage.setItem("myticket.ticketId", String(nextId));
    sessionStorage.setItem(
      ticketQuantitiesStorageKey,
      JSON.stringify(nextQuantities),
    );
  }, [apiTicketTypes, ticketQuantitiesStorageKey]);

  const selectedTicket =
    apiTicketTypes.find((tier) => tier.id === selectedTicketId) ??
    apiTicketTypes[0];
  const ticketQty = selectedTicket
    ? (ticketQuantities[selectedTicket.id] ?? 0)
    : 0;
  const assignedSelection = useMemo<TicketSelectionLine[]>(() => {
    if (seatingType !== "assigned") return [];
    return apiTicketTypes.flatMap((tier) => {
      const quantity = ticketQuantities[tier.id] ?? 0;
      if (quantity < 1) return [];
      return [
        {
          ticketId: tier.id,
          name: tier.name,
          quantity,
          price: tier.price,
        },
      ];
    });
  }, [apiTicketTypes, seatingType, ticketQuantities]);
  const assignedQuantity = assignedSelection.reduce(
    (sum, line) => sum + line.quantity,
    0,
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
   * Order summary for both seating types, derived from the live selection.
   *
   * This used to be computed for free seating only; assigned-seating events
   * fell through to a hardcoded fixture, which is why the panel read
   * "2 tickets = 360" at quantity 1 and froze the total at 435. Summing every
   * selected tier also makes a mixed General + VIP basket add up.
   */
  const orderTotals = useMemo(() => {
    const lines = apiTicketTypes.flatMap((tier) => {
      const quantity = ticketQuantities[tier.id] ?? 0;
      if (quantity < 1) return [];
      return [{ tier, quantity, amount: tier.price * quantity }];
    });
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
    const free = subtotal <= 0;

    // The server charges exactly the sum of the discounted item prices, with
    // VAT already inside them (`isVatIncluded`). The 5% service fee and 15% VAT
    // this used to add on top were invented by the frontend — a two-ticket
    // order priced 259 was being shown to the buyer as 313.
    const total = subtotal;

    const summaryLines =
      lines.length > 1
        ? lines.map((line) => ({
            label: `${line.tier.name} × ${line.quantity}`,
            value: free
              ? t("common:currency.free")
              : formatMoneySar(line.amount),
          }))
        : [
            {
              label: t("detail.ticketCount", { count }),
              value: free ? t("common:currency.free") : formatMoneySar(subtotal),
            },
          ];

    return {
      count,
      lines: [
        ...summaryLines,
        ...(free
          ? []
          : [{ label: t("detail.vatIncluded"), value: "" }]),
      ],
      total: free ? t("common:currency.free") : formatMoneySar(total),
      unitPrice: selectedTicket?.price ?? 0,
      orderTotal: total,
    };
  }, [apiTicketTypes, selectedTicket, t, ticketQuantities]);




  /**
   * Free-seating purchase, start to finish, without leaving the page.
   *
   * The order endpoint takes the whole booking in one call — showtime, items,
   * attendee names, promo — so splitting it across pages only invented
   * intermediate state, which is where the wrong-event and stale-hold bugs came
   * from. A hall with assigned seats still needs its own step, because seats
   * must be held on a timer.
   */
  /** The modal's Pay button. Creates the order, applies any code, pays. */
  async function confirmBooking(booking: {
    typeId: number;
    sessionId: number;
    lines: BookingLine[];
    promoCode: string;
    method: "card" | "apple" | "wallet";
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

    try {
      const created = await createOrder({
        eventId: resolvedId,
        body: {
          sessionId: booking.sessionId,
          ticketId: booking.typeId,
          quantity: booking.lines.length,
          items: [
            { ticketId: booking.typeId, quantity: booking.lines.length },
          ],
          ...(seatIds.length ? { seatIds } : {}),
          beneficiaries: booking.lines.map((line, index) => ({
            quantity_id: index + 1,
            name: line.name.trim(),
          })),
        },
      }).unwrap();

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

      await payOrder({
        orderId,
        brand: booking.method === "wallet" ? "WALLET" : "CREDIT",
      }).unwrap();

      sessionStorage.setItem("myticket.lastOrderId", String(orderId));
      clearHoldSession();
      setBookingOpen(false);
      navigate(`/order-confirmation?orderId=${orderId}`);
    } catch (error) {
      dispatch(
        toastPushed("error", apiErrorMessage(error, t("detail.claimFailed"))),
      );
    }
  }



  // This button only opens the dialog — paying happens on its last step.
  const primaryLabel =
    orderTotals.orderTotal <= 0 && seatingType === "free"
      ? t("detail.claimFreeTicket")
      : t("detail.bookNow");

  // The button only opens the booking dialog. It used to route to a seat map
  // and to a separate checkout page; neither is part of the flow any more.
  const primaryTo = undefined;

  async function handlePrimaryClick(): Promise<boolean> {
    // Free seating completes here. Assigned seating still goes to the seat map,
    // because those seats have to be held on a timer before they are paid for.
    // Everything is booked in the modal now, as the original site does it.
    setBookingOpen(true);
    return false;
    if (assignedQuantity < 1) {
      dispatch(toastPushed("error", t("detail.pickTicketType")));
      return false;
    }
    writeTicketSelection({
      eventId: resolvedId ? String(resolvedId) : undefined,
      slug: slugOrId || detailCard?.slug || listCard?.slug,
      sessionId: selectedSessionId,
      lines: assignedSelection,
    });
    if (resolvedId)
      sessionStorage.setItem("myticket.eventId", String(resolvedId));
    if (slugOrId) sessionStorage.setItem("myticket.eventSlug", slugOrId);
    return true;
  }

  useEffect(() => {
    const nodes = TABS.map((item) =>
      document.getElementById(TAB_IDS[item]),
    ).filter((el): el is HTMLElement => el != null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingToRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (!top?.target.id) return;
        const match = (Object.entries(TAB_IDS) as [Tab, string][]).find(
          ([, id]) => id === top.target.id,
        );
        if (match) setTab(match[0]);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const jumpTo = (item: Tab) => {
    const id = TAB_IDS[item];
    const el = document.getElementById(id);
    setTab(item);
    if (!el) return;
    scrollingToRef.current = id;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      if (scrollingToRef.current === id) scrollingToRef.current = null;
    }, 700);
  };

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
          Mobile stack: title → ticket CTA → tabs/content.
          Desktop: article column + sticky CTA (row-span), same as before.
        */}
        <div className="grid w-full grid-cols-1 items-start gap-2xl sm:gap-3xl lg:grid-cols-[minmax(0,1fr)_388px] lg:gap-x-[48px] lg:gap-y-0">
          <header className="min-w-0 lg:col-start-1 lg:row-start-1">
            <FadeUp>
              <h1 className="text-balance text-display-hero text-ink-primary">
                {title}
              </h1>

              <div className="mt-[14px] flex flex-col gap-sm text-[14px] sm:flex-row sm:flex-wrap sm:items-center sm:gap-[18px] sm:text-[15px]">
                {display.rating ? (
                  <span className="inline-flex items-center gap-[5px] font-semibold text-ink-primary">
                    <StarFillIcon size={15} />
                    {display.rating}
                  </span>
                ) : null}
                <span className="text-ink-secondary">{display.when}</span>
                <span className="text-ink-secondary">{display.venue}</span>
              </div>
            </FadeUp>

            <div className="mt-xl flex flex-col gap-md sm:mt-[22px] sm:flex-row sm:flex-wrap sm:gap-row-gap">
              <Button
                variant="secondary"
                className="h-[44px] w-full rounded-[20px] border px-lg sm:h-[40px] sm:w-auto"
                icon={<HeartGlyphIcon size={16} filled={isSaved} />}
                onClick={() => void handleSave()}
              >
                {isSaved ? t("detail.saved") : t("common:actions.save")}
              </Button>
              <Button
                variant="secondary"
                className="h-[44px] w-full rounded-[20px] border px-lg sm:h-[40px] sm:w-auto"
                icon={<ArrowUpRightIcon size={16} />}
                disabled
                title={t("detail.shareUnavailable")}
              >
                {t("detail.share")}
              </Button>
            </div>
          </header>

          <BookingModal
            open={bookingOpen}
            onOpenChange={setBookingOpen}
            eventTitle={title}
            types={bookingTypeOptions}
            sessions={bookableSessions}
            seats={seatOptions}
            assignedSeating={seatingType === "assigned"}
            busy={createState.isLoading || payState.isLoading}
            onConfirm={(booking) => void confirmBooking(booking)}
          />

          <StickyCtaCard
            className="w-full min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1"
            fromPrice={display.fromPrice}
            note={t("detail.fixtureSalesClose")}
            tiers={[]}
            totals={orderTotals.lines}
            total={orderTotals.total}
            primaryLabel={isPastEvent ? t("detail.eventEnded") : primaryLabel}
            primaryTo={primaryTo}
            primaryDisabled={
              isPastEvent ||
              createState.isLoading ||
              payState.isLoading ||
              (apiTicketTypes.length > 0 &&
                (seatingType === "assigned"
                  ? assignedQuantity < 1
                  : !selectedTicket || ticketQty < 1))
            }
            qtyInteractive={apiTicketTypes.length > 0}
            onSelectTier={(selectedTier) => {
              const match = apiTicketTypes.find(
                (tier) => tier.id === selectedTier.id,
              );
              if (!match) return;
              setSelectedTicketId(match.id);
              sessionStorage.setItem("myticket.ticketId", String(match.id));
              const nextQuantity = Math.min(
                match.remaining ?? 6,
                Math.max(1, ticketQuantities[match.id] ?? 0),
              );
              const nextQuantities = {
                ...ticketQuantities,
                [match.id]: nextQuantity,
              };
              setTicketQuantities(nextQuantities);
              sessionStorage.setItem(
                ticketQuantitiesStorageKey,
                JSON.stringify(nextQuantities),
              );
              if (seatingType === "assigned") {
                writeTicketSelection({
                  eventId: resolvedId ? String(resolvedId) : undefined,
                  slug: slugOrId || detailCard?.slug || listCard?.slug,
                  sessionId: selectedSessionId,
                  lines: apiTicketTypes.flatMap((tier) => {
                    const quantity = nextQuantities[tier.id] ?? 0;
                    if (quantity < 1) return [];
                    return [
                      {
                        ticketId: tier.id,
                        name: tier.name,
                        quantity,
                        price: tier.price,
                      },
                    ];
                  }),
                });
              }
            }}
            onChangeQty={(selectedTier, qty) => {
              const match = apiTicketTypes.find(
                (tier) => tier.id === selectedTier.id,
              );
              if (!match) return;
              setSelectedTicketId(match.id);
              sessionStorage.setItem("myticket.ticketId", String(match.id));
              const nextQty = Math.max(0, Math.min(match.remaining ?? 6, qty));
              const nextQuantities = {
                ...ticketQuantities,
                [match.id]: nextQty,
              };
              setTicketQuantities(nextQuantities);
              sessionStorage.setItem(
                ticketQuantitiesStorageKey,
                JSON.stringify(nextQuantities),
              );
              if (seatingType === "assigned") {
                writeTicketSelection({
                  eventId: resolvedId ? String(resolvedId) : undefined,
                  slug: slugOrId || detailCard?.slug || listCard?.slug,
                  sessionId: selectedSessionId,
                  lines: apiTicketTypes.flatMap((tier) => {
                    const quantity = nextQuantities[tier.id] ?? 0;
                    if (quantity < 1) return [];
                    return [
                      {
                        ticketId: tier.id,
                        name: tier.name,
                        quantity,
                        price: tier.price,
                      },
                    ];
                  }),
                });
              }
            }}
            onPrimaryClick={() => handlePrimaryClick()}
            footerNote={t("detail.fixtureFooterNote")}
          />

          <article className="min-w-0 lg:col-start-1 lg:row-start-2">
            <div className="sticky top-[var(--spacing-header)] z-10 mt-sm bg-bg-page pt-sm sm:mt-[34px]">
              <DetailSectionTabs
                aria-label={t("detail.sectionsAria")}
                className="gap-xl sm:gap-[26px]"
              >
                {TABS.map((item) => (
                  <DetailSectionTab
                    key={item}
                    active={tab === item}
                    onClick={() => jumpTo(item)}
                    className="flex min-h-[44px] items-end sm:min-h-0"
                  >
                    {t(TAB_LABEL_KEYS[item])}
                  </DetailSectionTab>
                ))}
              </DetailSectionTabs>
            </div>

            <section
              id="about"
              className="scroll-mt-[calc(var(--spacing-header)+72px)]"
            >
              <p className="mt-2xl max-w-[720px] text-pretty text-[15px] leading-[1.6] text-ink-body sm:mt-[28px] sm:text-[16px]">
                {display.about}
              </p>
            </section>

            <section
              id="venue"
              className="scroll-mt-[calc(var(--spacing-header)+72px)] mt-3xl sm:mt-[44px]"
            >
              <h2 className="text-balance text-heading-h2-section text-ink-primary">
                {t("detail.venue")}
              </h2>
              <div className="mt-[18px] overflow-hidden rounded-[18px] border border-border-default bg-surface-default">
                <div className="relative h-[200px] w-full overflow-hidden bg-bg-skeleton sm:h-[260px]">
                  {coordinates ? (
                    <EventVenueMap
                      key={`${coordinates.latitude},${coordinates.longitude}`}
                      latitude={coordinates.latitude}
                      longitude={coordinates.longitude}
                      ariaLabel={t("detail.mapAlt", { venue: display.venue })}
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-sm px-lg text-center">
                      <span className="flex size-[44px] items-center justify-center rounded-pill bg-bg-tint-brand text-ink-brand">
                        <MapPinIcon size={20} />
                      </span>
                      <p className="text-[14.5px] font-bold text-ink-primary">
                        {t(
                          venueFromApi
                            ? "detail.noMapTitle"
                            : "detail.noLocationTitle",
                        )}
                      </p>
                      <p className="max-w-[320px] text-[12.5px] leading-[1.5] text-ink-secondary">
                        {t(
                          venueFromApi
                            ? "detail.noMapBody"
                            : "detail.noLocationBody",
                        )}
                      </p>
                    </div>
                  )}
                </div>
                {(venueFromApi || mapsHref) && (
                  <div className="flex flex-col items-stretch gap-md px-lg py-md sm:flex-row sm:items-center sm:justify-between sm:gap-lg sm:px-3xl">
                    <p className="min-w-0 text-[13px] text-pretty text-ink-secondary sm:text-[14px]">
                      {venueFromApi}
                    </p>
                    {mapsHref ? (
                      <a
                        href={mapsHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-[44px] shrink-0 items-center justify-center rounded-[18px] border-[1.5px] border-border-default bg-surface-default px-lg text-[13px] font-semibold text-ink-primary hover:border-border-brand hover:text-ink-brand sm:h-[36px]"
                      >
                        {t("detail.openInMaps")}
                      </a>
                    ) : null}
                  </div>
                )}
              </div>
            </section>
          </article>
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
