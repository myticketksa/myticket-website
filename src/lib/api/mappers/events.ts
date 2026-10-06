import { slugify } from "@/pages/_guest/slugify";
import type { EventCardProps } from "@/components/cards";
import {
  firstTicketTypeId,
  formatApiDate,
  formatMoneySar,
  localizedString,
  nestedValue,
  pickLocalized,
} from "@/lib/api/locale";

type ApiRecord = Record<string, unknown>;

export type EventSeatingType = "free" | "assigned";

/**
 * A showtime. The API nests these under `event.sessions`, and every order must
 * name one — posting without `sessionId` is rejected with `session_required`.
 * Price and remaining stock are per session, not per ticket type.
 */
export type EventSession = {
  id: number;
  startsAt?: string;
  endsAt?: string;
  /** "percentage" or "amount", as the app's offer type. */
  discountType?: string;
  discountValue?: number;
  tickets: Array<{
    ticketTypeId: number;
    price?: number;
    discountedPrice?: number;
    remaining?: number;
  }>;
};

export function listSessions(event: ApiRecord | undefined): EventSession[] {
  const rows = event?.sessions;
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as ApiRecord;
    const id = Number(record.id);
    if (!Number.isInteger(id)) return [];
    const ticketRows = Array.isArray(record.tickets) ? record.tickets : [];
    const tickets = ticketRows.flatMap((ticketRow) => {
      if (!ticketRow || typeof ticketRow !== "object") return [];
      const ticket = ticketRow as ApiRecord;
      const ticketTypeId = Number(ticket.ticketTypeId ?? ticket.ticket_type_id);
      if (!Number.isInteger(ticketTypeId)) return [];
      return [
        {
          ticketTypeId,
          price: numberOrUndefined(ticket.price),
          discountedPrice: numberOrUndefined(ticket.discountedPrice),
          remaining: numberOrUndefined(ticket.remaining),
        },
      ];
    });
    return [
      {
        id,
        startsAt: stringOrUndefined(record.startsAt),
        endsAt: stringOrUndefined(record.endsAt),
        discountType: stringOrUndefined(record.discountType),
        discountValue: numberOrUndefined(record.discountValue),
        tickets,
      },
    ];
  });
}

/**
 * Showtimes a buyer can still book, soonest first.
 *
 * The app drops any date that has already started and keeps today if its time
 * has not passed yet; the web does the same so the two agree on what is on sale.
 * If every session is in the past we return them all rather than an empty
 * picker, so the page explains itself instead of looking broken.
 */
export function listBookableSessions(
  event: ApiRecord | undefined,
  now = Date.now(),
): EventSession[] {
  const sessions = listSessions(event);
  if (sessions.length === 0) return [];
  const byTime = [...sessions].sort(
    (a, b) => sessionTime(a) - sessionTime(b),
  );
  const upcoming = byTime.filter((session) => {
    const starts = sessionTime(session);
    return !Number.isFinite(starts) || starts >= now;
  });
  return upcoming.length > 0 ? upcoming : byTime;
}

function sessionTime(session: EventSession): number {
  const parsed = session.startsAt ? Date.parse(session.startsAt) : NaN;
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

/** Total seats left for a showtime, across its ticket types. */
export function sessionRemaining(session: EventSession): number | undefined {
  const counts = session.tickets
    .map((ticket) => ticket.remaining)
    .filter((value): value is number => value != null);
  if (counts.length === 0) return undefined;
  return counts.reduce((sum, value) => sum + value, 0);
}

/**
 * The session a buyer lands on by default: the next one that has not started,
 * falling back to the first listed when every session is in the past.
 */
export function resolveDefaultSessionId(
  event: ApiRecord | undefined,
): number | undefined {
  const sessions = listSessions(event);
  if (sessions.length === 0) return undefined;
  const now = Date.now();
  const upcoming = sessions
    .filter((session) => {
      const starts = session.startsAt ? Date.parse(session.startsAt) : NaN;
      return Number.isFinite(starts) && starts >= now;
    })
    .sort((a, b) => Date.parse(a.startsAt!) - Date.parse(b.startsAt!));
  return (upcoming[0] ?? sessions[0])!.id;
}

function numberOrUndefined(value: unknown): number | undefined {
  // Number(null) === 0 in JS — treat null/empty as missing, not free.
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function resolveSeatingType(
  event: ApiRecord | undefined,
): EventSeatingType {
  const raw = String(
    event?.seatingType ?? event?.seating_type ?? "assigned",
  ).toLowerCase();
  return raw === "free" ? "free" : "assigned";
}

/**
 * Ticket types priced and stocked for one showtime.
 *
 * Stock and discounts live on the session, never on the ticket type — the type
 * itself reports `remaining: null`. Passing no `sessionId` used to sum every
 * session together, which showed five dates' stock as if it were one date's
 * (496 seats where the night actually had 97) and drove a bogus urgency badge.
 * With no session given we fall back to the default one rather than the sum.
 */
export function listTicketTypes(
  event: ApiRecord | undefined,
  sessionId?: number,
): Array<{
  id: number;
  name: string;
  price: number;
  detail?: string;
  remaining?: number;
  isSpecialNeeds: boolean;
}> {
  if (!event) return [];
  const types = event.ticketTypes ?? event.ticket_types ?? event.tickets;
  if (!Array.isArray(types)) return [];

  const sessions = listSessions(event);
  const activeId = sessionId ?? resolveDefaultSessionId(event);
  const active =
    sessions.find((session) => session.id === activeId) ?? sessions[0];

  const remainingByType = new Map<number, number>();
  const priceByType = new Map<number, number>();
  for (const ticket of active?.tickets ?? []) {
    if (ticket.remaining != null) {
      remainingByType.set(ticket.ticketTypeId, ticket.remaining);
    }
    const effective = ticket.discountedPrice ?? ticket.price;
    if (effective != null) priceByType.set(ticket.ticketTypeId, effective);
  }

  return types.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as ApiRecord;
    const idRaw = record.id ?? record.ticket_id ?? record.ticketId;
    if (idRaw == null || !/^\d+$/.test(String(idRaw))) return [];
    const listed = Number(record.price ?? record.amount ?? 0);
    // Session pricing wins — the same tier costs 84 one night and 70 the next.
    const price = priceByType.get(Number(idRaw)) ?? listed;
    return [
      {
        id: Number(idRaw),
        name: localizedString(record.name ?? record.title, `Ticket ${idRaw}`),
        price: Number.isFinite(price) ? price : 0,
        detail: localizedString(
          record.description ?? record.detail ?? record.zone,
        ),
        remaining: remainingByType.get(Number(idRaw)),
        isSpecialNeeds:
          record.isSpecialNeeds === true ||
          record.is_special_needs === true ||
          record.isSpecialNeeds === 1 ||
          record.is_special_needs === 1 ||
          String(
            record.isSpecialNeeds ?? record.is_special_needs,
          ).toLowerCase() === "true",
      },
    ];
  });
}

/** Map flexible event API rows into EventCard props; keep fixtures usable as fallback. */
export function mapApiEventToCard(event: ApiRecord): EventCardProps & {
  id?: string;
  slug: string;
  ticketTypeId?: number;
  isFree?: boolean;
  seatingType?: EventSeatingType;
  startTime?: string;
} {
  const title =
    pickLocalized(event, ["title", "name", "name_en"], "") ||
    localizedString(
      nestedValue(event, ["translations", "0", "title"]),
      "Untitled event",
    );

  const slug =
    pickLocalized(event, ["slug"]) || slugify(title) || String(event.id ?? "");

  const venue =
    pickLocalized(event, ["place", "venue", "venue_name", "location"]) ||
    localizedString(nestedValue(event, ["venue", "name"])) ||
    localizedString(nestedValue(event, ["place", "name"]));

  const priceRaw =
    event.priceFrom ??
    event.price_from ??
    event.from_price ??
    event.discountedPrice ??
    event.price ??
    nestedValue(event, ["ticketTypes", "0", "price"]);

  const price =
    event.isFree === true || Number(priceRaw) === 0
      ? "Free"
      : formatMoneySar(priceRaw);

  const image =
    pickLocalized(event, [
      "cover",
      "banner",
      "image",
      "cover_image",
      "banner_image",
      "thumbnail",
    ]) || undefined;

  const date =
    formatApiDate(
      event.startTime ??
        event.starts_at ??
        event.start_at ??
        event.datetime ??
        event.date,
    ) ||
    pickLocalized(
      event,
      ["date", "starts_at", "start_at", "datetime", "startTime"],
      "",
    );

  const ratingRaw = event.rating ?? event.average_rating;
  const rating =
    ratingRaw == null || ratingRaw === "" || Number(ratingRaw) === 0
      ? "—"
      : String(Number(ratingRaw).toFixed(1));

  const attendees =
    event.attendees ?? event.attendance ?? event.attending_label;
  const attendance =
    attendees == null || attendees === ""
      ? ""
      : typeof attendees === "number"
        ? `${attendees.toLocaleString("en-US")} going`
        : localizedString(attendees);

  const category =
    pickLocalized(event, ["category", "category_name"]) ||
    localizedString(nestedValue(event, ["category", "name"]));

  const flag =
    event.isFeatured === true
      ? "Featured"
      : pickLocalized(event, ["flag", "badge", "status_label"]) || undefined;

  const ticketTypeId = firstTicketTypeId(event);
  const startRaw =
    event.startTime ?? event.starts_at ?? event.start_at ?? event.datetime;
  const startTime =
    typeof startRaw === "string" && startRaw.trim()
      ? startRaw
      : startRaw instanceof Date
        ? startRaw.toISOString()
        : undefined;

  return {
    id: event.id != null ? String(event.id) : undefined,
    slug,
    date,
    title,
    venue,
    rating,
    attendance,
    price,
    isFree:
      event.isFree === true || event.is_free === true || Number(priceRaw) === 0,
    seatingType: resolveSeatingType(event),
    startTime,
    category: category || undefined,
    flag: flag || undefined,
    image,
    ticketTypeId,
  };
}

export function resolveEventFromList(
  events: ApiRecord[] | undefined,
  slugOrId: string,
): ApiRecord | undefined {
  if (!events?.length) return undefined;
  if (/^\d+$/.test(slugOrId)) {
    return events.find((e) => String(e.id) === slugOrId);
  }
  return events.find((e) => {
    const mapped = mapApiEventToCard(e);
    return mapped.slug === slugOrId || slugify(mapped.title) === slugOrId;
  });
}

export function resolveEventId(
  events: ApiRecord[] | undefined,
  slugOrId: string,
): string | undefined {
  if (/^\d+$/.test(slugOrId)) return slugOrId;
  const match = resolveEventFromList(events, slugOrId);
  return match?.id != null ? String(match.id) : undefined;
}
