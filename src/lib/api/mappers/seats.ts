import { asList, unwrapData } from "@/lib/api/unwrap";

export type ApiRecord = Record<string, unknown>;

export type SeatMapStatus = "available" | "sold" | "held";

export interface MappedSeat {
  id: string;
  status: SeatMapStatus;
  zoneId?: string;
  zoneLabel?: string;
  accessible?: boolean;
  price?: number;
  category?: string;
  row: string;
  number: number;
}

export interface MappedSeatRow {
  row: string;
  seats: MappedSeat[];
}

function textValue(raw: unknown): string | undefined {
  if (typeof raw === "string" || typeof raw === "number") {
    const value = String(raw).trim();
    return value || undefined;
  }
  if (!raw || typeof raw !== "object") return undefined;

  const record = raw as ApiRecord;
  for (const key of [
    "name",
    "label",
    "title",
    "slug",
    "name_en",
    "en",
    "name_ar",
    "ar",
    "id",
  ]) {
    const value = textValue(record[key]);
    if (value) return value;
  }
  return undefined;
}

function zoneFrom(
  record: ApiRecord,
): { id: string; label: string } | undefined {
  const candidates = [
    record.zone_name,
    record.zoneName,
    record.zone_label,
    record.zoneLabel,
    record.zone,
    record.tier,
    record.category_name,
    record.categoryName,
    record.category,
    record.ticket_type,
    record.ticketType,
    record.type,
    record.zone_id,
    record.status,
  ];

  for (const candidate of candidates) {
    const label = textValue(candidate);
    if (!label) continue;
    const normalized = label.toLowerCase().trim();
    if (
      ["available", "sold", "held", "reserved", "accessible"].includes(
        normalized,
      )
    )
      continue;
    const id =
      normalized.includes("vip") || normalized.includes("premium")
        ? "vip"
        : normalized.includes("gold")
          ? "gold"
          : normalized.includes("silver")
            ? "silver"
            : normalized.includes("bronze")
              ? "bronze"
              : normalized.replace(/\s+/g, "-");
    return { id, label };
  }

  return undefined;
}

function isTruthy(raw: unknown): boolean {
  return (
    raw === true ||
    raw === 1 ||
    ["true", "1", "yes"].includes(String(raw).toLowerCase())
  );
}

function accessibleFrom(record: ApiRecord): boolean {
  const fields = [
    record.accessible,
    record.is_accessible,
    record.isAccessible,
    record.accessibility,
    record.special_needs,
    record.specialNeeds,
    record.seat_type,
    record.status,
  ];
  if (fields.some(isTruthy)) return true;
  return fields.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes("access"),
  );
}

function statusFrom(record: ApiRecord): SeatMapStatus {
  const raw =
    textValue(
      record.status ??
        record.state ??
        record.availability ??
        record.seat_status ??
        "available",
    )?.toLowerCase() ?? "available";
  if (
    raw === "sold" ||
    raw === "reserved" ||
    raw === "booked" ||
    raw === "taken"
  )
    return "sold";
  if (raw === "held" || raw === "hold" || raw === "pending") return "held";
  return "available";
}

function rowLabel(record: ApiRecord, index: number): string {
  const raw =
    record.row ??
    record.seat_row ??
    record.seatRow ??
    record.rowLabel ??
    record.row_label ??
    record.section ??
    record.block;
  const label = textValue(raw);
  if (label) return label.toUpperCase();
  return String.fromCharCode(65 + (index % 26));
}

function seatNumber(record: ApiRecord, indexInRow: number): number {
  const raw =
    record.number ??
    record.seat_number ??
    record.seatNumber ??
    record.seat_no ??
    record.column ??
    record.col;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : indexInRow + 1;
}

function seatId(record: ApiRecord, row: string, number: number): string {
  const candidates = [record.id, record.seatId, record.seat_id];
  for (const raw of candidates) {
    if (raw != null && /^\d+$/.test(String(raw).trim()))
      return String(raw).trim();
  }
  for (const raw of candidates) {
    if (raw != null && String(raw).trim()) return String(raw).trim();
  }
  return `${row}${number}`;
}

/**
 * Map `GET /seats/event/{id}` payloads into row/column UI seats.
 * Returns `null` when the live seat list is empty.
 */
export function mapApiSeatsToRows(payload: unknown): MappedSeatRow[] | null {
  const root = unwrapData<unknown>(payload);
  const direct = Array.isArray(root)
    ? (root as ApiRecord[])
    : asList<ApiRecord>(payload);
  const containers = ["seats", "rows", "zones", "sections", "blocks", "items"];
  const records = direct.length
    ? direct
    : root && typeof root === "object"
      ? containers.reduce<ApiRecord[]>((found, key) => {
          const value = (root as ApiRecord)[key];
          return found.length || !Array.isArray(value)
            ? found
            : (value as ApiRecord[]);
        }, [])
      : [];
  if (!records.length) return null;

  const flatten = (
    items: ApiRecord[],
    inheritedZone?: unknown,
    inheritedRow?: unknown,
  ): ApiRecord[] =>
    items.flatMap((record) => {
      const nestedKey = containers.find((key) => Array.isArray(record[key]));
      const nested = nestedKey ? (record[nestedKey] as ApiRecord[]) : undefined;
      const zone =
        record.zone ??
        record.zone_name ??
        record.zoneName ??
        record.tier ??
        record.category ??
        inheritedZone ??
        (nestedKey === "rows" || nestedKey === "seats"
          ? (record.name ?? record.label ?? record.title ?? record.slug)
          : undefined);
      const row =
        record.row ??
        record.seat_row ??
        record.seatRow ??
        record.row_label ??
        record.rowLabel ??
        (nestedKey === "seats"
          ? (record.row_name ?? record.rowName ?? record.name ?? record.label)
          : undefined) ??
        inheritedRow;
      if (nested) return flatten(nested, zone, row);
      return [{ ...record, zone: record.zone ?? zone, row: record.row ?? row }];
    });
  const list = flatten(records);

  const grouped = new Map<string, MappedSeat[]>();

  list.forEach((record, index) => {
    const row = rowLabel(record, index);
    const existing = grouped.get(row) ?? [];
    const number = seatNumber(record, existing.length);
    const priceRaw =
      record.price ??
      record.amount ??
      record.ticket_price ??
      record.price_amount;
    const price =
      priceRaw != null && Number.isFinite(Number(priceRaw))
        ? Number(priceRaw)
        : undefined;
    const zone = zoneFrom(record);
    const category = textValue(
      record.category_name ??
        record.categoryName ??
        record.category ??
        record.tier,
    );

    existing.push({
      id: seatId(record, row, number),
      status: statusFrom(record),
      zoneId: zone?.id,
      zoneLabel: zone?.label,
      accessible: accessibleFrom(record),
      price,
      category: category ?? zone?.label,
      row,
      number,
    });
    grouped.set(row, existing);
  });

  return Array.from(grouped.entries()).map(([row, seats]) => ({
    row,
    seats: seats.sort((a, b) => a.number - b.number),
  }));
}

export function unwrapHoldId(held: ApiRecord): string | undefined {
  const raw = held.holdId ?? held.hold_id ?? held.id;
  return raw != null ? String(raw) : undefined;
}
