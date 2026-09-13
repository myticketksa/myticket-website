import {
  formatApiDate,
  formatMoneySar,
  localizedString,
  pickLocalized,
} from '@/lib/api/locale'

type ApiRecord = Record<string, unknown>

export type OrderConfirmationTicket = {
  id: string
  seat: string
  gate: string
}

export type OrderConfirmationView = {
  email: string
  ticketCount: number
  reference: string
  placedAt: string
  eventTitle: string
  eventMeta: string
  tierLabel: string
  holder: string
  tickets: OrderConfirmationTicket[]
  subtotal: string
  serviceFee: string
  vat: string
  total: string
  walletPaid: string
  cardPaid: string
  cashback: string
}

function asRecord(value: unknown): ApiRecord | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as ApiRecord)
    : undefined
}

function formatSeatLabel(seat: unknown, fallback = '—'): string {
  if (seat == null) return fallback
  if (typeof seat === 'string' || typeof seat === 'number') {
    const text = String(seat).trim()
    return text || fallback
  }
  const record = asRecord(seat)
  if (!record) return fallback

  const label = localizedString(record.label)
  if (label) return label

  const row = localizedString(record.row)
  const number = record.number ?? record.seat_number ?? record.seatNumber
  if (row && number != null && String(number).trim()) {
    return `Row ${row} · Seat ${number}`
  }
  if (row) return `Row ${row}`
  return fallback
}

function money(value: unknown, fallback = 'SAR 0.00'): string {
  if (value == null || value === '') return fallback
  const formatted = formatMoneySar(value, fallback)
  if (formatted === 'Free') return 'SAR 0.00'
  // Keep two-decimal checkout style when formatMoneySar drops cents on whole numbers.
  const n = Number(value)
  if (Number.isFinite(n)) {
    return `SAR ${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
  return formatted
}

function mapTickets(order: ApiRecord): OrderConfirmationTicket[] {
  const tickets = order.tickets
  if (Array.isArray(tickets) && tickets.length > 0) {
    return tickets.map((item, index) => {
      const ticket = asRecord(item) ?? {}
      const fromTicket = formatSeatLabel(ticket.seat, '')
      const fromOrderSeats = Array.isArray(order.seats)
        ? formatSeatLabel(order.seats[index], '')
        : ''
      return {
        id: String(ticket.id ?? ticket.ticket_number ?? `MT-${index + 1}`),
        seat: fromTicket || fromOrderSeats || '—',
        gate: localizedString(ticket.gate ?? ticket.entry, 'Scan at gate'),
      }
    })
  }

  const seats = order.seats
  if (Array.isArray(seats) && seats.length > 0) {
    return seats.map((item, index) => ({
      id: String(asRecord(item)?.seat_id ?? `MT-${index + 1}`),
      seat: formatSeatLabel(item),
      gate: 'Scan at gate',
    }))
  }

  return []
}

/**
 * Map `GET /tickets/orders/:id` (sample: nested event, ticketType, tickets[].seat)
 * into the order-confirmation page view model. UI-agnostic — strings only.
 */
export function mapOrderConfirmation(
  order: ApiRecord,
  opts: { orderId?: string; email?: string; holder?: string } = {},
): OrderConfirmationView {
  const event = asRecord(order.event)
  const ticketType = asRecord(order.ticketType ?? order.ticket_type)
  const tickets = mapTickets(order)

  const eventTitle =
    (event && pickLocalized(event, ['title', 'name'])) ||
    localizedString(order.event_title ?? order.title, 'Your event')

  const when = event ? formatApiDate(event.startTime ?? event.starts_at ?? event.date) : ''
  const place =
    (event && pickLocalized(event, ['place', 'venue', 'location'])) ||
    localizedString(order.venue ?? order.place)
  const eventMeta = [when, place].filter(Boolean).join(' · ') || '—'

  const firstTicket = Array.isArray(order.tickets) ? asRecord(order.tickets[0]) : undefined
  const tierName =
    localizedString(ticketType?.name) ||
    localizedString(firstTicket?.ticketType) ||
    'Ticket'
  const tierLabel = tierName.toUpperCase()

  const quantity = Number(order.quantity ?? tickets.length) || tickets.length || 1
  const unitPrice = Number(ticketType?.price)
  const amount = Number(order.amount ?? order.total)
  const computedSubtotal =
    Number.isFinite(unitPrice) && quantity > 0 ? unitPrice * quantity : undefined
  const subtotalRaw =
    order.subtotal ?? order.items_total ?? computedSubtotal ?? amount
  const serviceFeeRaw = order.service_fee ?? order.serviceFee ?? order.fees ?? 0
  const vatRaw = order.vat ?? order.tax ?? 0
  const totalRaw = order.total ?? order.amount ?? amount

  const placedRaw = order.created_at ?? order.placed_at
  const placedAt = formatApiDate(placedRaw) || localizedString(placedRaw) || '—'

  return {
    email: opts.email || localizedString(order.email ?? order.customer_email) || '—',
    ticketCount: quantity,
    reference: String(order.reference ?? order.order_number ?? order.id ?? opts.orderId ?? '—'),
    placedAt,
    eventTitle,
    eventMeta,
    tierLabel,
    holder:
      opts.holder ||
      localizedString(order.holder ?? order.customer_name) ||
      'Ticket holder',
    tickets:
      tickets.length > 0
        ? tickets
        : [
            {
              id: String(order.id ?? opts.orderId ?? '—'),
              seat: formatSeatLabel(order.seat, 'General admission'),
              gate: 'Scan at gate',
            },
          ],
    subtotal: money(subtotalRaw),
    serviceFee: money(serviceFeeRaw),
    vat: money(vatRaw),
    total: money(totalRaw),
    walletPaid: money(order.wallet_paid ?? order.wallet_amount ?? 0),
    cardPaid: money(order.card_paid ?? order.card_amount ?? totalRaw),
    cashback: money(order.cashback ?? order.cashback_earned ?? 0),
  }
}
