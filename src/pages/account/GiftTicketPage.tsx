import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Field, TextInput, Textarea } from '@/components/ui'
import { FilterChip } from '@/components/data-display'
import { TicketActionHeader } from '@/layouts'
import { MY_TICKETS, type TicketFixture } from '@/pages/_account/fixtures'
import { useSendGiftTicketMutation } from '@/app/api/accountApis'
import { useGetOrdersQuery } from '@/app/api/ordersApi'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import {
  extractOrderId,
  extractOrderTicketIds,
  normalizeAuthIdentifier,
} from '@/lib/api/formPayload'
import { apiErrorMessage } from '@/lib/api/unwrap'

function mapOrderToTicket(order: Record<string, unknown>): TicketFixture {
  const id = String(order.id ?? order.order_id ?? '')
  const title = String(
    order.title ?? order.event_title ?? order.name ?? `Order ${id || '—'}`,
  )
  return {
    id: id || title,
    orderId: String(order.reference ?? order.order_number ?? id),
    title,
    meta: String(order.meta ?? order.venue ?? order.status ?? ''),
    status: String(order.status ?? 'UPCOMING') as TicketFixture['status'],
    cover: String(order.cover ?? order.image ?? MY_TICKETS[0]?.cover ?? ''),
    countdown: order.countdown ? String(order.countdown) : undefined,
    facts: Array.isArray(order.facts)
      ? (order.facts as { label: string; value: string }[])
      : [
          { label: 'When', value: String(order.starts_at ?? order.date ?? '—') },
          { label: 'Seats', value: String(order.seats ?? order.quantity ?? '—') },
        ],
    actions: (order.actions as TicketFixture['actions']) ?? ['qr'],
    note: order.note ? String(order.note) : undefined,
  }
}

function resolveOrder(
  orders: Record<string, unknown>[] | undefined,
  id: string,
): Record<string, unknown> | undefined {
  if (!orders?.length) return undefined
  return (
    orders.find(
      (order) =>
        String(order.id ?? '') === id ||
        String(order.order_id ?? '') === id ||
        String(order.reference ?? '') === id ||
        String(order.order_number ?? '') === id,
    ) ?? orders[0]
  )
}

function resolveTicket(
  orders: Record<string, unknown>[] | undefined,
  id: string,
): TicketFixture {
  const match = resolveOrder(orders, id)
  if (match) return mapOrderToTicket(match)
  return MY_TICKETS.find((item) => item.id === id) ?? MY_TICKETS[0]
}

/** Gift / transfer ticket — Figma `207:9806`. */
export function GiftTicketPage() {
  const { t } = useTranslation(['account', 'common'])
  const { id = 'winter-nights' } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: orders } = useGetOrdersQuery()
  const order = useMemo(() => resolveOrder(orders, id), [orders, id])
  const ticket = useMemo(() => resolveTicket(orders, id), [orders, id])
  const [mode, setMode] = useState<'email' | 'phone'>('email')
  const [recipient, setRecipient] = useState('')
  const [note, setNote] = useState('')
  const [sendGift, sendState] = useSendGiftTicketMutation()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!recipient.trim()) {
      dispatch(toastPushed('error', t('account:gift.errorRecipient')))
      return
    }

    const orderId = extractOrderId(order)
    const ticketIds = extractOrderTicketIds(order)
    if (!orderId || ticketIds.length === 0) {
      dispatch(toastPushed('error', t('account:gift.errorOrder')))
      return
    }

    try {
      await sendGift({
        orderId,
        ticketIds,
        recipientIdentifier: normalizeAuthIdentifier(recipient),
        note: note.trim() || undefined,
      }).unwrap()
      dispatch(toastPushed('success', t('account:gift.success')))
      navigate(`/my-tickets/${ticket.id}`)
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('account:gift.error'))))
    }
  }

  return (
    <>
      <TicketActionHeader label={t('account:gift.header')} />
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-xl px-page-gutter pt-[48px] pb-[96px] lg:flex-row lg:items-start lg:gap-[32px]">
        <div className="min-w-0 flex-1">
          <h1 className="text-heading-h1 text-ink-primary">
            {t('account:gift.title')}
          </h1>
          <p className="mt-[10px] max-w-[560px] text-[16px] leading-normal text-ink-secondary">
            {t('account:gift.subtitle')}
          </p>

          <form
            className="mt-[30px] flex flex-col gap-xl rounded-[20px] border border-border-default bg-surface-default p-[26px]"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div>
              <p className="text-[13px] font-semibold text-ink-primary">{t('account:gift.sendTo')}</p>
              <div className="mt-[8px] flex flex-wrap gap-[8px]">
                <FilterChip
                  selected={mode === 'email'}
                  onClick={() => setMode('email')}
                  className="h-[36px] rounded-[18px] px-lg text-[13.5px] font-semibold"
                >
                  {t('account:gift.email')}
                </FilterChip>
                <FilterChip
                  selected={mode === 'phone'}
                  onClick={() => setMode('phone')}
                  className="h-[36px] rounded-[18px] px-lg text-[13.5px] font-semibold"
                >
                  {t('account:gift.phone')}
                </FilterChip>
              </div>
              <TextInput
                id="recipient"
                className="mt-[10px]"
                type={mode === 'email' ? 'email' : 'tel'}
                placeholder={mode === 'email' ? 'friend@email.com' : '+966 5X XXX XXXX'}
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                required
              />
              <p className="mt-[7px] text-[12.5px] text-ink-muted">
                If they don&apos;t have a MyTicket account yet, we&apos;ll help them make one in a
                minute.
              </p>
            </div>

            <Field
              label={
                <>
                  {t('account:gift.noteLabel')}{' '}
                  <span className="font-medium text-ink-muted">{t('account:gift.noteOptional')}</span>
                </>
              }
              htmlFor="gift-note"
            >
              <Textarea
                id="gift-note"
                rows={3}
                className="min-h-[88px]"
                placeholder={t('account:gift.notePlaceholder')}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </Field>

            <div className="rounded-[14px] border border-border-default bg-bg-page px-[18px] py-lg">
              <p className="text-[13.5px] font-bold text-ink-primary">
                {t('account:gift.howTitle')}
              </p>
              <ul className="mt-[8px] flex flex-col gap-[6px] text-[13px] leading-[1.5] text-ink-secondary">
                <li>
                  · {t('account:gift.howClaimBefore')}{' '}
                  <span className="font-bold text-ink-primary">
                    {t('account:gift.howClaimEmphasis')}
                  </span>
                </li>
                <li>
                  · {t('account:gift.howDeadlineBefore')}{' '}
                  <span className="font-bold text-ink-primary">
                    {t('account:gift.howDeadlineEmphasis')}
                  </span>{' '}
                  {t('account:gift.howDeadlineAfter')}
                </li>
                <li>· {t('account:gift.howQr')}</li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-md">
              <Button size="lg" type="submit" disabled={sendState.isLoading}>
                {t('account:gift.cta')}
              </Button>
              <Link
                to={`/my-tickets/${ticket.id}`}
                className="inline-flex h-[50px] items-center px-[18px] text-[14px] font-medium text-ink-secondary hover:text-ink-brand"
              >
                {t('common:actions.cancel')}
              </Link>
            </div>
          </form>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-[14px] lg:w-[380px]">
          <div className="overflow-hidden rounded-[20px] border border-border-default bg-surface-default">
            <div className="relative h-[189px] bg-placeholder-gradient">
              <img
                src={ticket.cover}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </div>
            <div className="px-xl py-[18px]">
              <p className="text-[12px] font-bold tracking-[0.96px] text-ink-brand-mid uppercase">
                {t('account:gift.sendingEyebrow')}
              </p>
              <p className="mt-[5px] text-[20px] leading-[1.15] font-extrabold tracking-[-0.4px] text-ink-primary">
                {ticket.title}
              </p>
              <p className="mt-[6px] text-[13.5px] text-ink-secondary">Thu 8 Oct · 20:00 · Riyadh</p>
              <dl className="mt-[14px] flex flex-col gap-[7px] text-[13.5px]">
                <div className="flex items-start justify-between gap-md">
                  <dt className="shrink-0 text-ink-secondary">{t('account:gift.sendingTicket')}</dt>
                  <dd className="min-w-0 max-w-[65%] text-end font-bold break-words text-ink-primary">
                    Gold · Floor A · Row C · Seat 12
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-md">
                  <dt className="shrink-0 text-ink-secondary">{t('account:gift.sendingTicketNo')}</dt>
                  <dd className="min-w-0 text-end font-bold text-ink-primary">MT-84193-2</dd>
                </div>
                <div className="flex items-start justify-between gap-md">
                  <dt className="shrink-0 text-ink-secondary">{t('account:gift.sendingYouPaid')}</dt>
                  <dd className="min-w-0 text-end font-bold text-ink-primary">SAR 280.00</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-[16px] border border-border-default bg-bg-page px-[18px] py-lg">
            <p className="text-[13px] leading-[1.55] text-ink-secondary">
              <span className="font-bold text-ink-primary">
                {t('account:gift.whyScreenshotTitle')}
              </span>{' '}
              {t('account:gift.whyScreenshotBody')}
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
