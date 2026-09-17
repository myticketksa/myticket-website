import {
  formatApiDate,
  localizedString,
  pickLocalized,
} from '@/lib/api/locale'
import type { MyTicketCard } from '@/lib/api/mappers/orders'

type ApiRecord = Record<string, unknown>

function asRecord(value: unknown): ApiRecord | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as ApiRecord)
    : undefined
}

function giftStatusNote(gift: ApiRecord): string | undefined {
  const status = localizedString(gift.status ?? gift.gift_status).toLowerCase()
  const recipient = localizedString(
    gift.recipientIdentifier ??
      gift.recipient_identifier ??
      gift.recipient ??
      asRecord(gift.recipient)?.email ??
      asRecord(gift.recipient)?.phone,
  )
  const sender = localizedString(
    gift.senderIdentifier ??
      gift.sender_identifier ??
      gift.sender_name ??
      asRecord(gift.sender)?.name ??
      asRecord(gift.sender)?.email,
  )
  const note = localizedString(gift.note)

  if (status.includes('claim') || status.includes('accepted') || status.includes('completed')) {
    return sender ? `Gift from ${sender}` : 'Gift claimed'
  }
  if (status.includes('cancel') || status.includes('expired') || status.includes('return')) {
    return 'Gift returned'
  }
  if (status.includes('pending') || status.includes('await') || status.includes('sent') || !status) {
    if (recipient) return `Gift pending · ${recipient}`
    if (sender) return `Gift from ${sender}`
    return 'Gift pending'
  }
  return note || undefined
}

function isClaimableGift(gift: ApiRecord): boolean {
  const status = localizedString(gift.status ?? gift.gift_status).toLowerCase()
  if (!status) return true
  if (status.includes('claim') || status.includes('accepted') || status.includes('completed')) {
    return false
  }
  if (status.includes('cancel') || status.includes('expired') || status.includes('return')) {
    return false
  }
  return (
    status.includes('pending') ||
    status.includes('await') ||
    status.includes('sent') ||
    status.includes('unclaim')
  )
}

/**
 * Map `GET /gift-tickets` (and detail) rows into the My Tickets card view model.
 * Keeps the existing Transferred-tab card chrome — no new UI.
 */
export function mapGiftTicketToMyTicket(gift: ApiRecord): MyTicketCard & {
  source: 'gift'
  giftTicketId: string
  claimable: boolean
} {
  const giftTicketId = String(
    gift.id ?? gift.giftTicketId ?? gift.gift_ticket_id ?? gift.gift_id ?? '',
  )
  const order = asRecord(gift.order) ?? asRecord(gift.orderDetails)
  const event =
    asRecord(gift.event) ??
    asRecord(order?.event) ??
    asRecord(asRecord(gift.ticket)?.event)

  const title =
    (event ? pickLocalized(event, ['title', 'name']) : '') ||
    localizedString(gift.event_title ?? gift.title ?? gift.name, `Gift ${giftTicketId || '—'}`)

  const when = event
    ? formatApiDate(event.startTime ?? event.starts_at ?? event.date)
    : formatApiDate(gift.startTime ?? gift.starts_at ?? gift.date)
  const place =
    (event ? pickLocalized(event, ['place', 'venue', 'location']) : '') ||
    localizedString(gift.venue ?? gift.place ?? order?.venue)
  const meta = [when, place].filter(Boolean).join(' · ') || '—'

  const cover = localizedString(
    event?.cover ?? event?.banner ?? gift.cover ?? gift.image ?? order?.cover,
  )

  const ticketType = asRecord(gift.ticketType ?? gift.ticket_type) ?? asRecord(order?.ticketType)
  const tickets = Array.isArray(gift.tickets)
    ? gift.tickets
    : Array.isArray(gift.ticketIds)
      ? gift.ticketIds
      : Array.isArray(gift.ticket_ids)
        ? gift.ticket_ids
        : []
  const seatsLabel =
    tickets.length > 0
      ? `${tickets.length} ticket${tickets.length === 1 ? '' : 's'}`
      : localizedString(gift.quantity, '—')

  const claimable = isClaimableGift(gift)
  const resolvedTitle = title || `Gift ${giftTicketId || '—'}`

  return {
    id: giftTicketId ? `gift-${giftTicketId}` : resolvedTitle,
    giftTicketId,
    source: 'gift',
    claimable,
    orderId: String(
      gift.orderId ??
        gift.order_id ??
        order?.reference ??
        order?.id ??
        giftTicketId,
    ),
    title: resolvedTitle,
    meta,
    status: 'TRANSFERRED',
    facts: [
      { label: 'TIER', value: localizedString(ticketType?.name, 'Gift') },
      { label: 'ROW', value: '—' },
      { label: 'SEATS', value: seatsLabel },
      { label: 'GATE', value: localizedString(gift.gate ?? order?.gate, '—') },
    ],
    note: giftStatusNote(gift),
    cover,
    actions: claimable ? [] : ['qr'],
    paid: !claimable,
  }
}
