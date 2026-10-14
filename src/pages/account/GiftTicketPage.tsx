import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Field, TextInput, Textarea } from '@/components/ui'
import { FilterChip, MoneyAmount } from '@/components/data-display'
import { TicketActionHeader } from '@/layouts'
import { NotFoundPage } from '@/pages/system/NotFoundPage'
import { useSendGiftTicketMutation } from '@/app/api/accountApis'
import { useGetOrderDetailsQuery, useGetOrdersQuery } from '@/app/api/ordersApi'
import { mapOrderToDetailView, type OrderDetailView } from '@/lib/api/mappers/orders'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import {
  extractOrderId,
  extractOrderTicketIds,
  normalizeAuthIdentifier,
} from '@/lib/api/formPayload'
import { apiErrorMessage } from '@/lib/api/unwrap'

function findOrder(
  orders: Record<string, unknown>[] | undefined,
  id: string,
): Record<string, unknown> | undefined {
  // No first-order fallback: an id that isn't in the list used to resolve to
  // the newest order, so the gift went out with someone else's ticket.
  return orders?.find(
    (order) =>
      String(order.id ?? '') === id ||
      String(order.order_id ?? '') === id ||
      String(order.reference ?? '') === id ||
      String(order.order_number ?? '') === id,
  )
}

/** Gift / transfer ticket — Figma `207:9806`. */
export function GiftTicketPage() {
  const { t } = useTranslation(['account', 'common'])
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: orders, isLoading: ordersLoading } = useGetOrdersQuery()
  const listOrder = useMemo(() => findOrder(orders, id), [orders, id])
  const detailId = /^\d+$/.test(id) ? id : extractOrderId(listOrder) || ''
  const { data: orderDetail, isFetching: detailFetching } = useGetOrderDetailsQuery(
    detailId,
    { skip: !/^\d+$/.test(String(detailId)) },
  )
  const order = useMemo(
    () =>
      orderDetail && Object.keys(orderDetail).length > 0 ? orderDetail : listOrder,
    [orderDetail, listOrder],
  )
  // The summary is the real order; it used to be a fixed sample
  // ("Thu 8 Oct · Riyadh", "Gold · Floor A · Row C · Seat 12", SAR 280).
  const resolvedTicket = useMemo(
    () => (order ? mapOrderToDetailView(order) : undefined),
    [order],
  )
  const [mode, setMode] = useState<'email' | 'phone'>('email')
  const [recipient, setRecipient] = useState('')
  const [note, setNote] = useState('')
  const [sendGift, sendState] = useSendGiftTicketMutation()

  if (!resolvedTicket) {
    if (ordersLoading || detailFetching) {
      return (
        <>
          <TicketActionHeader label={t('account:gift.header')} />
          <div className="mx-auto w-full max-w-[1040px] px-page-gutter pt-[48px] pb-[96px]">
            <div
              className="h-[420px] w-full animate-pulse rounded-xl bg-bg-skeleton"
              role="status"
              aria-label={t('common:states.loading')}
            />
          </div>
        </>
      )
    }
    return <NotFoundPage />
  }
  const ticket: OrderDetailView = resolvedTicket
  const when = [ticket.startTime, ticket.city].filter((part) => part && part !== '—').join(' · ')
  const seatLine = [
    ...new Set(
      ticket.tickets.map((item) => {
        const hasRow = item.row && item.row !== '—'
        const hasSeat = item.seat && item.seat !== '—'
        return [
          item.ticketTypeLabel,
          item.block !== '—' ? item.block : '',
          hasRow && hasSeat
            ? t('common:labels.rowSeat', { row: item.row, seat: item.seat })
            : hasRow
              ? t('common:labels.row', { row: item.row })
              : '',
        ]
          .filter(Boolean)
          .join(' · ')
      }),
    ),
  ].join(' / ')
  const ticketNumbers = ticket.tickets.map((item) => item.id).join(', ') || ticket.orderId

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
              {ticket.cover ? (
                <img
                  src={ticket.cover}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              ) : null}
            </div>
            <div className="px-xl py-[18px]">
              <p className="text-[12px] font-bold tracking-[0.96px] text-ink-brand-mid uppercase">
                {t('account:gift.sendingEyebrow')}
              </p>
              <p className="mt-[5px] text-[20px] leading-[1.15] font-extrabold tracking-[-0.4px] text-ink-primary">
                {ticket.title}
              </p>
              {when ? <p className="mt-[6px] text-[13.5px] text-ink-secondary">{when}</p> : null}
              <dl className="mt-[14px] flex flex-col gap-[7px] text-[13.5px]">
                <div className="flex items-start justify-between gap-md">
                  <dt className="shrink-0 text-ink-secondary">{t('account:gift.sendingTicket')}</dt>
                  <dd className="min-w-0 max-w-[65%] text-end font-bold break-words text-ink-primary">
                    {seatLine || '—'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-md">
                  <dt className="shrink-0 text-ink-secondary">{t('account:gift.sendingTicketNo')}</dt>
                  <dd className="min-w-0 text-end font-bold break-all text-ink-primary">{ticketNumbers}</dd>
                </div>
                <div className="flex items-start justify-between gap-md">
                  <dt className="shrink-0 text-ink-secondary">{t('account:gift.sendingYouPaid')}</dt>
                  <dd className="min-w-0 text-end font-bold text-ink-primary">
                    <MoneyAmount value={ticket.pricePaid} />
                  </dd>
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
