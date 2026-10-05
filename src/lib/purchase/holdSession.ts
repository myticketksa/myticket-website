import { parsePureNumericIds } from "@/lib/api/formPayload";

/** Soft seat hold window shown in the purchase header. */
export const HOLD_DURATION_MS = 10 * 60 * 1000;

export const HOLD_STORAGE_KEY = "myticket.mockHold";

export type HeldSeatSnapshot = {
  id?: string;
  label: string;
  category?: string;
  meta?: string;
  price?: number;
  row?: string;
};

export type TicketSelectionLine = {
  ticketId: number;
  name: string;
  quantity: number;
  price?: number;
};

export type StoredTicketSelection = {
  eventId?: string;
  slug?: string;
  /** Chosen showtime. The API rejects an order that does not name one. */
  sessionId?: number;
  lines: TicketSelectionLine[];
};

const TICKET_SELECTION_KEY = "myticket.ticketSelection";

export function writeTicketSelection(selection: StoredTicketSelection) {
  const lines = selection.lines
    .map((line) => ({
      ticketId: Number(line.ticketId),
      name: line.name.trim(),
      quantity: Math.max(0, Math.floor(Number(line.quantity) || 0)),
      price:
        line.price != null && Number.isFinite(Number(line.price))
          ? Number(line.price)
          : undefined,
    }))
    .filter((line) => Number.isInteger(line.ticketId) && line.quantity > 0);

  if (lines.length === 0) {
    sessionStorage.removeItem(TICKET_SELECTION_KEY);
    sessionStorage.removeItem("myticket.ticketQty");
    return;
  }

  sessionStorage.setItem(
    TICKET_SELECTION_KEY,
    JSON.stringify({
      eventId: selection.eventId,
      slug: selection.slug,
      sessionId: selection.sessionId,
      lines,
    }),
  );
  if (Number.isInteger(selection.sessionId)) {
    sessionStorage.setItem("myticket.sessionId", String(selection.sessionId));
  }
  sessionStorage.setItem(
    "myticket.ticketQty",
    String(lines.reduce((sum, line) => sum + line.quantity, 0)),
  );
  sessionStorage.setItem("myticket.ticketId", String(lines[0]!.ticketId));
}

export function readTicketSelection(): StoredTicketSelection | null {
  try {
    const raw = JSON.parse(
      sessionStorage.getItem(TICKET_SELECTION_KEY) ?? "null",
    ) as StoredTicketSelection | null;
    if (!raw || !Array.isArray(raw.lines)) return null;
    const lines = raw.lines.filter(
      (line) =>
        Number.isInteger(Number(line.ticketId)) &&
        Number(line.quantity) > 0 &&
        Boolean(line.name),
    );
    if (lines.length === 0) return null;
    return {
      eventId: raw.eventId,
      slug: raw.slug,
      sessionId: Number.isInteger(Number(raw.sessionId))
        ? Number(raw.sessionId)
        : undefined,
      lines: lines.map((line) => ({
        ticketId: Number(line.ticketId),
        name: String(line.name),
        quantity: Math.floor(Number(line.quantity)),
        price:
          line.price != null && Number.isFinite(Number(line.price))
            ? Number(line.price)
            : undefined,
      })),
    };
  } catch {
    return null;
  }
}

export type HoldSession = {
  seatIds?: Array<string | number>;
  seats?: HeldSeatSnapshot[];
  holdId?: string;
  /** One hold per ticket type when the order mixes types. */
  holdIds?: string[];
  items?: { ticketId: number; quantity: number; seatIds?: number[] }[];
  ticketId?: number | string;
  eventId?: string;
  total?: number;
  subtotal?: number;
  serviceFee?: number;
  vat?: number;
  heldAt?: number;
  slug?: string;
  /** Chosen showtime. The API rejects an order that does not name one. */
  sessionId?: number;
  /** Free seating skips the seat map — quantity-only checkout. */
  seatingType?: "free" | "assigned";
  quantity?: number;
};

/**
 * The showtime chosen earlier in the flow. Checked on the hold first, then the
 * ticket selection, then the standalone key, so a buyer who reloads mid-flow
 * keeps their choice.
 */
export function readSelectedSessionId(): number | undefined {
  const fromHold = Number(readHoldSession()?.sessionId);
  if (Number.isInteger(fromHold) && fromHold > 0) return fromHold;
  const fromSelection = Number(readTicketSelection()?.sessionId);
  if (Number.isInteger(fromSelection) && fromSelection > 0) return fromSelection;
  const stored = Number(sessionStorage.getItem("myticket.sessionId") ?? "");
  return Number.isInteger(stored) && stored > 0 ? stored : undefined;
}

export function readHoldSession(): HoldSession | null {
  try {
    const raw = sessionStorage.getItem(HOLD_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HoldSession;
  } catch {
    return null;
  }
}

export function writeHoldSession(session: HoldSession) {
  sessionStorage.setItem(
    HOLD_STORAGE_KEY,
    JSON.stringify({
      ...session,
      heldAt: session.heldAt ?? Date.now(),
    }),
  );
}

export function clearHoldSession() {
  sessionStorage.removeItem(HOLD_STORAGE_KEY);
}

/** Every scratch key a purchase writes, all of them global to the tab. */
const PURCHASE_SCRATCH_KEYS = [
  HOLD_STORAGE_KEY,
  TICKET_SELECTION_KEY,
  "myticket.ticketQty",
  "myticket.ticketId",
  "myticket.sessionId",
  "myticket.pendingOrderId",
  "myticket.checkoutEventId",
] as const;

const ACTIVE_EVENT_KEY = "myticket.activePurchaseEvent";

/**
 * Drop a half-finished purchase when the buyer moves to a different event.
 *
 * These keys are global to the tab, so without this a quantity of six and a
 * running ten-minute hold followed you from one event to the next — QA saw a
 * seat map demand "exactly 6" seats carried over from somewhere else, with a
 * Continue button that could never enable.
 */
export function startPurchaseForEvent(eventKey: string | number | undefined) {
  if (eventKey == null || eventKey === "") return;
  const key = String(eventKey);
  const previous = sessionStorage.getItem(ACTIVE_EVENT_KEY);
  if (previous === key) return;
  if (previous != null) {
    for (const scratch of PURCHASE_SCRATCH_KEYS) {
      sessionStorage.removeItem(scratch);
    }
  }
  sessionStorage.setItem(ACTIVE_EVENT_KEY, key);
}

export function holdRemainingMs(
  session: HoldSession | null | undefined,
  now = Date.now(),
): number {
  if (!session?.heldAt) return 0;
  return Math.max(0, session.heldAt + HOLD_DURATION_MS - now);
}

export function formatHoldCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function numericHoldSeatIds(
  session: HoldSession | null | undefined,
): number[] {
  return parsePureNumericIds(session?.seatIds);
}

export function hasValidApiHold(
  session: HoldSession | null | undefined,
): boolean {
  if (!session) return false;
  if (session.seatingType === "free") {
    const qty = Number(session.quantity ?? session.seats?.length ?? 0);
    return Boolean(session.eventId && session.ticketId != null && qty > 0);
  }
  if (!session.holdId) return false;
  return numericHoldSeatIds(session).length > 0;
}

/** Persist a free-seating (no seat map) checkout session. */
export function writeFreeSeatingSession(input: {
  eventId: string;
  ticketId: number | string;
  quantity: number;
  unitPrice: number;
  slug?: string;
  label?: string;
  sessionId?: number;
}) {
  const quantity = Math.max(1, Math.floor(input.quantity));
  const unitPrice = Math.max(0, Number(input.unitPrice) || 0);
  const subtotal = unitPrice * quantity;
  const serviceFee = Math.round(subtotal * 0.05);
  const vat = Math.round((subtotal + serviceFee) * 0.15);
  const seats: HeldSeatSnapshot[] = Array.from(
    { length: quantity },
    (_, index) => ({
      label: input.label
        ? `${input.label} × ${index + 1}`
        : `General admission ${index + 1}`,
      meta: "Free seating",
      price: unitPrice,
    }),
  );

  writeHoldSession({
    seatingType: "free",
    eventId: input.eventId,
    ticketId: input.ticketId,
    quantity,
    seats,
    seatIds: [],
    subtotal,
    serviceFee,
    vat,
    total: subtotal + serviceFee + vat,
    slug: input.slug,
    sessionId: input.sessionId ?? readSelectedSessionId(),
  });
}
