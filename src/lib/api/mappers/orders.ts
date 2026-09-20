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

export type MyTicketCard = {
  id: string
  orderId: string
  title: string
  /** City / venue place string from the event. */
  city: string
  /** Formatted event start time. */
  startTime: string
  /** Formatted order / reservation date. */
  orderDate: string
  /** Legacy combined meta — kept for gift/detail fallbacks. */
  meta: string
  status: 'UPCOMING' | 'AWAITING SEAT' | 'PAST' | 'TRANSFERRED' | 'LISTED'
  countdown?: string
  facts: { label: string; value: string }[]
  note?: string
  cover: string
  actions: Array<'qr' | 'transfer' | 'resell' | 'refund'>
  /** True when paymentStatus is succeeded / paid / completed. */
  paid: boolean
  paymentStatus?: string
}

/** Paid enough to use QR / gift / refund / resell. */
export function isOrderPaid(order: ApiRecord | undefined): boolean {
  if (!order) return false
  const payment = localizedString(order.paymentStatus ?? order.payment_status).toLowerCase()
  return (
    payment === 'succeeded' ||
    payment === 'paid' ||
    payment === 'completed' ||
    payment.includes('success')
  )
}

function countdownFromStart(startTime: unknown): string | undefined {
  const raw = localizedString(startTime)
  if (!raw) return undefined
  const start = new Date(raw)
  if (Number.isNaN(start.getTime())) return undefined
  const diffMs = start.getTime() - Date.now()
  if (diffMs <= 0) return undefined
  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
  if (days <= 0) return undefined
  return `IN ${days} DAY${days === 1 ? '' : 'S'}`
}

function seatFacts(order: ApiRecord): { tier: string; row: string; seats: string } {
  const ticketType = asRecord(order.ticketType ?? order.ticket_type)
  const tier = localizedString(ticketType?.name, 'Ticket')

  const seats = Array.isArray(order.seats) ? order.seats : []
  const ticketSeats = Array.isArray(order.tickets)
    ? order.tickets
        .map((item) => formatSeatLabel(asRecord(item)?.seat, ''))
        .filter(Boolean)
    : []

  const labels =
    seats.length > 0
      ? seats.map((item) => formatSeatLabel(item)).filter((label) => label !== '—')
      : ticketSeats

  const row =
    localizedString(asRecord(order.seat)?.row) ||
    localizedString(asRecord(seats[0])?.row) ||
    '—'

  return {
    tier,
    row,
    seats: labels.length > 0 ? labels.join(', ') : String(order.quantity ?? '—'),
  }
}

function resolveTicketStatus(order: ApiRecord): MyTicketCard['status'] {
  const payment = localizedString(order.paymentStatus ?? order.payment_status).toLowerCase()
  const orderStatus = localizedString(order.orderStatus ?? order.order_status ?? order.status).toLowerCase()
  const event = asRecord(order.event)
  const startRaw = event?.startTime ?? event?.starts_at ?? order.starts_at
  const start = startRaw ? new Date(String(startRaw)) : null
  const isPast = start != null && !Number.isNaN(start.getTime()) && start.getTime() < Date.now()

  if (orderStatus.includes('transfer')) return 'TRANSFERRED'
  if (orderStatus.includes('list') || orderStatus.includes('resale')) return 'LISTED'
  if (isPast) return 'PAST'
  if (payment.includes('pending') && !labelsHasSeat(order)) return 'AWAITING SEAT'
  return 'UPCOMING'
}

function labelsHasSeat(order: ApiRecord) {
  if (Array.isArray(order.seats) && order.seats.length > 0) return true
  if (!Array.isArray(order.tickets)) return false
  return order.tickets.some((item) => asRecord(item)?.seat != null)
}

/**
 * Map `GET /tickets/orders` rows into the My Tickets card view model.
 * Sample: nested `event`, `ticketType`, `tickets[].seat`, `seats[]`, payment/order status.
 */
export function mapOrderToMyTicket(order: ApiRecord): MyTicketCard {
  const event = asRecord(order.event)
  const id = String(order.id ?? order.order_id ?? '')
  const title =
    (event && pickLocalized(event, ['title', 'name'])) ||
    localizedString(order.event_title ?? order.title, `Order ${id || '—'}`)

  const when = event
    ? formatApiDate(event.startTime ?? event.starts_at ?? event.date)
    : formatApiDate(order.starts_at ?? order.date)
  const place =
    (event && pickLocalized(event, ['place', 'venue', 'location', 'city'])) ||
    localizedString(order.venue ?? order.place ?? order.city)
  const meta = [when, place].filter(Boolean).join(' · ') || '—'
  const orderDate = formatApiDate(order.created_at ?? order.createdAt ?? order.placed_at) || '—'

  const cover = localizedString(
    event?.cover ?? event?.banner ?? order.cover ?? order.image,
  )
  const { tier, row, seats } = seatFacts(order)
  const status = resolveTicketStatus(order)
  const payment = localizedString(order.paymentStatus ?? order.payment_status).toLowerCase()
  const paid = isOrderPaid(order)

  const baseActions: MyTicketCard['actions'] =
    status === 'PAST'
      ? ['qr']
      : status === 'TRANSFERRED'
        ? ['qr']
        : status === 'LISTED'
          ? ['qr']
          : ['qr', 'transfer', 'resell', 'refund']

  return {
    id: id || title,
    orderId: String(order.reference ?? order.order_number ?? id),
    title,
    city: place || '—',
    startTime: when || '—',
    orderDate,
    meta,
    status,
    countdown: status === 'UPCOMING' || status === 'AWAITING SEAT'
      ? countdownFromStart(event?.startTime ?? event?.starts_at)
      : undefined,
    facts: [
      { label: 'TIER', value: tier },
      { label: 'ROW', value: row },
      { label: 'SEATS', value: seats },
      { label: 'GATE', value: localizedString(order.gate ?? order.entry, '—') },
    ],
    note:
      !paid || payment === 'pending'
        ? 'Payment pending'
        : order.note
          ? String(order.note)
          : undefined,
    cover,
    actions: baseActions,
    paid,
    paymentStatus: payment || undefined,
  }
}

export type OrderTicketSeatView = {
  id: string
  ticketTypeLabel: string
  scanStatus: string
  gate: string
  block: string
  row: string
  seat: string
}

export type OrderDetailView = {
  id: string
  orderId: string
  title: string
  meta: string
  city: string
  startTime: string
  cover: string
  quantity: number
  paid: boolean
  paymentStatus: string
  paymentLabel: string
  paymentMethod: string
  purchasedAt: string
  pricePaid: string
  platformFee: string
  seatingType: 'free' | 'assigned'
  tickets: OrderTicketSeatView[]
  organizerName: string
}

function seatField(seat: unknown, key: string): string {
  const record = asRecord(seat)
  if (!record) return ''
  return localizedString(record[key] ?? record[`${key}_name`])
}

/**
 * Map `GET /tickets/orders/:id` into the ticket detail page view model.
 * Free seating (`seat: null`) keeps the field grid with em dashes / GA — stable layout.
 */
export function mapOrderToDetailView(
  order: ApiRecord,
  opts: { holderName?: string } = {},
): OrderDetailView {
  const event = asRecord(order.event)
  const ticketType = asRecord(order.ticketType ?? order.ticket_type)
  const id = String(order.id ?? order.order_id ?? '')
  const title =
    (event && pickLocalized(event, ['title', 'name'])) ||
    localizedString(order.event_title ?? order.title, `Order ${id || '—'}`)
  const when = event
    ? formatApiDate(event.startTime ?? event.starts_at ?? event.date)
    : formatApiDate(order.created_at)
  const place =
    (event && pickLocalized(event, ['place', 'venue', 'location', 'city'])) ||
    localizedString(order.venue ?? order.place ?? order.city)
  const seatingRaw = String(event?.seatingType ?? event?.seating_type ?? 'assigned').toLowerCase()
  const seatingType = seatingRaw === 'free' ? 'free' : 'assigned'
  const paid = isOrderPaid(order)
  const payment = localizedString(order.paymentStatus ?? order.payment_status, 'pending')
  const paymentMethod = localizedString(
    order.paymentMethod ??
      order.payment_method ??
      order.payment_channel ??
      order.paymentChannel ??
      order.method,
    paid ? 'Card' : '—',
  )
  const tierName = localizedString(ticketType?.name, 'Ticket')

  const rawTickets = Array.isArray(order.tickets) ? order.tickets : []
  const tickets: OrderTicketSeatView[] =
    rawTickets.length > 0
      ? rawTickets.map((item, index) => {
          const ticket = asRecord(item) ?? {}
          const seat = ticket.seat
          const hasSeat = seat != null && typeof seat === 'object'
          return {
            id: String(ticket.id ?? `${id}-${index + 1}`),
            ticketTypeLabel: localizedString(ticket.ticketType ?? ticket.ticket_type, tierName),
            scanStatus: localizedString(ticket.scanStatus ?? ticket.scan_status, payment),
            gate: hasSeat ? seatField(seat, 'gate') || '—' : '—',
            block: hasSeat
              ? seatField(seat, 'block') || seatField(seat, 'section') || '—'
              : seatingType === 'free'
                ? 'General'
                : '—',
            row: hasSeat ? seatField(seat, 'row') || '—' : '—',
            seat: hasSeat
              ? seatField(seat, 'number') ||
                seatField(seat, 'seat_number') ||
                formatSeatLabel(seat, '—')
              : seatingType === 'free'
                ? 'GA'
                : '—',
          }
        })
      : [
          {
            id: id || '1',
            ticketTypeLabel: tierName,
            scanStatus: payment,
            gate: '—',
            block: seatingType === 'free' ? 'General' : '—',
            row: '—',
            seat: seatingType === 'free' ? 'GA' : '—',
          },
        ]

  const feeRaw = order.service_fee ?? order.serviceFee ?? order.platform_fee ?? order.fees
  void opts

  return {
    id: id || title,
    orderId: String(order.reference ?? order.order_number ?? id),
    title,
    meta: [when, place].filter(Boolean).join(' · ') || '—',
    city: place || '—',
    startTime: when || '—',
    cover: localizedString(event?.cover ?? event?.banner ?? order.cover),
    quantity: Number(order.quantity ?? tickets.length) || tickets.length || 1,
    paid,
    paymentStatus: payment,
    paymentLabel: paid ? 'Paid' : 'Payment pending',
    paymentMethod,
    purchasedAt: formatApiDate(order.created_at ?? order.placed_at) || '—',
    pricePaid: money(order.amount ?? order.total),
    platformFee: feeRaw == null || feeRaw === '' ? '—' : money(feeRaw),
    seatingType,
    tickets,
    organizerName: localizedString(
      asRecord(event?.organizer)?.name ?? order.organizer_name,
      'Organizer',
    ),
  }
}

