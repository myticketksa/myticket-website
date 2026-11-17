/**
 * A trip run by another company (Al-Haddad Scuba, 11 Nov 2026): their booking
 * as the API sends it on an order (`supplierBookings`). Everything here comes
 * from their system.
 */
export type SupplierBooking = {
  supplier: string
  operator: string
  /** held (paid, being confirmed) / booked / failed / cancelled / released */
  status: string
  cancelledBy: string | null
  bookingNumber: string | null
  departsAt: string | null
  guests: { adults: number; children: number; infants: number }
  ticketUrl: string | null
  guestDetailsUrl: string | null
  detailsComplete: boolean
  meetingText: string | null
  mapUrl: string | null
}

const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value : null)

export function mapSupplierBookings(order: Record<string, unknown> | undefined): SupplierBooking[] {
  const rows = order?.supplierBookings
  if (!Array.isArray(rows)) return []
  return rows.flatMap((row) => {
    if (!row || typeof row !== 'object') return []
    const r = row as Record<string, unknown>
    const g = (r.guests && typeof r.guests === 'object' ? r.guests : {}) as Record<string, unknown>
    return [
      {
        supplier: String(r.supplier ?? ''),
        operator: String(r.operator ?? ''),
        status: String(r.status ?? ''),
        cancelledBy: text(r.cancelledBy),
        bookingNumber: r.bookingNumber != null ? String(r.bookingNumber) : null,
        departsAt: text(r.departsAt),
        guests: { adults: Number(g.adults ?? 0), children: Number(g.children ?? 0), infants: Number(g.infants ?? 0) },
        ticketUrl: text(r.ticketUrl),
        guestDetailsUrl: text(r.guestDetailsUrl),
        detailsComplete: r.detailsComplete === true,
        meetingText: text(r.meetingText),
        mapUrl: text(r.mapUrl),
      },
    ]
  })
}
