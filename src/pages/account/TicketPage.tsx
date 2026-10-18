import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  useCancelOrderMutation,
  useGetOrderDetailsQuery,
  useGetOrdersQuery,
  useRequestRefundMutation,
} from '@/app/api/ordersApi'
import { FormDialog } from '@/components/feedback'
import { Button } from '@/components/ui'
import { AccountSplit, TicketActionHeader } from '@/layouts'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAuthUser } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import {
  isOrderPaid,
  mapOrderToDetailView,
  type OrderDetailView,
} from '@/lib/api/mappers/orders'
import { extractOrderId } from '@/lib/api/formPayload'
import { apiErrorMessage } from '@/lib/api/unwrap'
import { cn } from '@/lib/cn'
import { PrintableTicket, saveTicketsPdf } from './ticketPdf'

function resolveOrderFromList(
  orders: Record<string, unknown>[] | undefined,
  id: string,
): Record<string, unknown> | undefined {
  if (!orders?.length) return undefined
  return orders.find(
    (order) =>
      String(order.id ?? '') === id ||
      String(order.order_id ?? '') === id ||
      String(order.reference ?? '') === id ||
      String(order.order_number ?? '') === id,
  )
}

function isCancellable(order: Record<string, unknown> | undefined) {
  if (!order) return false
  if (isOrderPaid(order)) return false
  const status = String(
    order.orderStatus ?? order.order_status ?? order.status ?? '',
  ).toLowerCase()
  const payment = String(order.paymentStatus ?? order.payment_status ?? '').toLowerCase()
  return (
    payment.includes('pending') ||
    status.includes('pending') ||
    status.includes('unpaid') ||
    status.includes('await') ||
    status.includes('draft') ||
    status.includes('created') ||
    status.includes('active')
  )
}

function TicketQr({ value }: { value: string }) {
  const { t } = useTranslation('common')
  return (
    <QRCodeSVG
      value={value}
      size={200}
      level="M"
      marginSize={1}
      bgColor="#FFFFFF"
      fgColor="#0A0A0A"
      aria-label={t('a11y.ticketQr')}
    />
  )
}

/**
 * Ticket detail page — for direct links. From My Tickets the same details
 * open in a dialog (`TicketDetailsModal`), as on the original site.
 */
export function TicketPage() {
  const { t } = useTranslation('account')
  const { id = '' } = useParams()
  const navigate = useNavigate()

  return (
    <>
      <TicketActionHeader
        label={t('ticket.label')}
        backHref="/my-tickets"
        backLabel={t('ticket.backToTickets')}
      />
      <AccountSplit className="!gap-xl pt-[44px] lg:!gap-[40px]">
        <div className="flex flex-col">
          <TicketDetails id={id} onCancelled={() => navigate('/my-tickets')} />

          <Link
            to="/events"
            className="mx-auto mt-[40px] text-[14px] font-semibold text-ink-secondary hover:text-ink-brand"
          >
            ← {t('ticket.backToBrowsing')}
          </Link>
        </div>
      </AccountSplit>
    </>
  )
}

/** QR, gift, cancel, download PDF + core order fields — page and dialog alike. */
export function TicketDetails({
  id,
  onCancelled,
  headingLevel = 1,
}: {
  id: string
  onCancelled: () => void
  headingLevel?: 1 | 2
}) {
  const { t } = useTranslation('account')
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const { data: orders } = useGetOrdersQuery()
  const [cancelOrder, cancelState] = useCancelOrderMutation()
  const [requestRefund, refundState] = useRequestRefundMutation()
  const [confirmingRefund, setConfirmingRefund] = useState(false)
  // 'refunded' when it went through at once (paid from the wallet), else 'requested'.
  const [refundSent, setRefundSent] = useState<'requested' | 'refunded' | null>(null)

  const listOrder = useMemo(() => resolveOrderFromList(orders, id), [orders, id])
  const detailId = /^\d+$/.test(id) ? id : extractOrderId(listOrder) || id
  const { data: orderDetail } = useGetOrderDetailsQuery(detailId, {
    skip: !detailId || !/^\d+$/.test(String(detailId)),
  })

  const orderRecord = useMemo(() => {
    if (orderDetail && Object.keys(orderDetail).length > 0) return orderDetail
    return listOrder
  }, [orderDetail, listOrder])

  const detail: OrderDetailView | undefined = useMemo(() => {
    if (!orderRecord) return undefined
    return mapOrderToDetailView(orderRecord, { holderName: user?.name })
  }, [orderRecord, user?.name])

  const paid = detail?.paid ?? false
  const canCancel = isCancellable(orderRecord)
  // Refunds are for the whole order; the server says when one may be asked
  // for (window open, nothing scanned or given away), as in the app.
  const refundStatus =
    refundSent ??
    (orderRecord?.refundStatus === 'requested' || orderRecord?.refundStatus === 'refunded'
      ? (orderRecord.refundStatus as 'requested' | 'refunded')
      : orderRecord?.refundedAt
        ? 'refunded'
        : null)
  const canRefund = orderRecord?.canRequestRefund === true && !refundStatus

  async function handleRefund() {
    const orderId = extractOrderId(orderRecord)
    setConfirmingRefund(false)
    if (!orderId) return
    try {
      const result = await requestRefund(orderId).unwrap()
      setRefundSent(result?.refundStatus === 'refunded' ? 'refunded' : 'requested')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('ticket.refundFailed'))))
    }
  }

  async function handleCancel() {
    const orderId = extractOrderId(orderRecord)
    if (!orderId) {
      dispatch(toastPushed('error', t('ticket.cancelUnavailable')))
      return
    }
    try {
      await cancelOrder(orderId).unwrap()
      dispatch(toastPushed('success', t('ticket.cancelSuccess')))
      onCancelled()
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('ticket.cancelError'))))
    }
  }

  const tickets = detail?.tickets ?? []
  const title = detail?.title ?? t('tickets.title')
  const orderIdLabel = detail?.orderId ?? id

  // The button did nothing before. The PDF is built here, one page per
  // ticket, from cards drawn off screen while it runs.
  const [printing, setPrinting] = useState(false)
  const printRefs = useRef<(HTMLDivElement | null)[]>([])

  async function handleDownload() {
    if (!detail || printing) return
    printRefs.current = []
    setPrinting(true)
    // Two frames: the off-screen cards mount, then lay out.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    try {
      const nodes = printRefs.current.filter((node): node is HTMLDivElement => node != null)
      await saveTicketsPdf(nodes, `myticket-${orderIdLabel}.pdf`)
    } catch (error) {
      console.error(error)
      dispatch(toastPushed('error', t('ticket.downloadError')))
    } finally {
      setPrinting(false)
    }
  }

  const Heading = headingLevel === 1 ? 'h1' : 'h2'

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <Heading className="text-[24px] leading-[1.06] font-extrabold tracking-[-0.9px] text-ink-primary sm:text-[30px]">
          {title}
        </Heading>
        <Button
          variant="secondary"
          size="md"
          className="h-[38px] rounded-[19px]"
          disabled={!paid}
          loading={printing}
          onClick={() => void handleDownload()}
        >
          {t('ticket.downloadPdf')}
        </Button>
      </div>

      {printing && detail ? (
        <div aria-hidden="true" className="pointer-events-none fixed top-0 -left-[10000px] flex flex-col gap-lg">
          {(tickets.length > 0 ? tickets : [undefined]).map((seat, seatIndex) => (
            <PrintableTicket
              key={seat?.id ?? seatIndex}
              ref={(node) => {
                printRefs.current[seatIndex] = node
              }}
              detail={detail}
              seat={seat}
              ticketNo={seat?.id ?? `${orderIdLabel}-${seatIndex + 1}`}
            />
          ))}
        </div>
      ) : null}

      {refundStatus ? (
        <p className="mt-lg rounded-[14px] bg-bg-tint-brand px-[16px] py-[12px] text-[14px] font-bold text-ink-brand-strong">
          {refundStatus === 'refunded' ? t('ticket.refunded') : t('ticket.refundRequested')}
        </p>
      ) : null}

      <div className="mt-lg flex flex-col gap-lg">
        {(tickets.length > 0 ? tickets : [undefined]).map((seat, seatIndex) => {
          const ticketNo = seat?.id ?? `${orderIdLabel}-${seatIndex + 1}`
          const qrValue = seat?.qrValue || ticketNo
          return (
            <article
              key={seat?.id ?? seatIndex}
              className="relative flex flex-col overflow-hidden rounded-[20px] border border-border-default bg-surface-default sm:flex-row"
            >
              <div className="min-w-0 flex-1 px-lg py-[18px] sm:px-[24px] sm:py-[22px]">
                <div className="mt-0 grid grid-cols-2 gap-[12px] sm:grid-cols-3 sm:gap-[18px]">
                  {[
                    // The name typed for this ticket at booking, as the app shows it.
                    ...(seat?.holderName ? [[t('ticket.fieldName'), seat.holderName]] : []),
                    [t('ticket.fieldCity'), detail?.city ?? '—'],
                    [t('ticket.fieldStartTime'), detail?.startTime ?? '—'],
                    [t('ticket.fieldTicketNumber'), ticketNo],
                    [t('ticket.fieldSeat'), seat?.seat ?? '—'],
                    [t('ticket.fieldTicketType'), seat?.ticketTypeLabel ?? '—'],
                    [t('ticket.fieldPaymentMethod'), detail?.paymentMethod ?? '—'],
                    [t('ticket.fieldReservationDate'), detail?.purchasedAt ?? '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-[11px] font-bold tracking-[0.77px] text-ink-muted uppercase">
                        {label}
                      </p>
                      <p className="mt-[4px] text-[15px] font-semibold text-ink-primary">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-[22px] flex flex-wrap gap-[10px] border-t border-dashed border-border-default pt-[18px]">
                  {paid ? (
                    <Link to={`/my-tickets/${detail?.id ?? id}/gift`}>
                      <Button variant="secondary" size="md">
                        {t('ticket.gift')}
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="secondary" size="md" disabled>
                      {t('ticket.gift')}
                    </Button>
                  )}
                  {canRefund && (
                    <Button
                      variant="secondary"
                      size="md"
                      loading={refundState.isLoading}
                      onClick={() => setConfirmingRefund(true)}
                    >
                      {t('ticket.requestRefund')}
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      variant="destructive"
                      size="md"
                      loading={cancelState.isLoading}
                      onClick={() => void handleCancel()}
                    >
                      {t('ticket.cancelOrder')}
                    </Button>
                  )}
                </div>
              </div>

              <div className="relative flex w-full shrink-0 flex-col items-center justify-center gap-[14px] border-t-2 border-dashed border-border-default bg-bg-page px-[22px] py-[28px] sm:w-[260px] sm:border-t-0 sm:border-s-2 md:w-[280px]">
                <div
                  className={cn(
                    'rounded-[16px] border border-border-default bg-surface-default p-[14px]',
                    !paid && 'opacity-40',
                  )}
                >
                  <TicketQr value={qrValue} />
                </div>
                <div className="text-center text-[13px] leading-[1.45]">
                  <p className="font-semibold text-ink-secondary">
                    {t('ticket.scanAtGate', {
                      gate: seat?.gate && seat.gate !== '—' ? seat.gate : '—',
                    })}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="absolute top-[-11px] start-[-13px] size-[22px] rounded-[11px] border border-border-default bg-bg-page"
                />
                <span
                  aria-hidden="true"
                  className="absolute bottom-[-11px] start-[-13px] size-[22px] rounded-[11px] border border-border-default bg-bg-page"
                />
              </div>
            </article>
          )
        })}
      </div>

      <FormDialog
        open={confirmingRefund}
        onOpenChange={setConfirmingRefund}
        title={t('ticket.requestRefund')}
        description={t('ticket.refundConfirmBody')}
      >
        <div className="mt-lg flex flex-wrap justify-end gap-[10px]">
          <Button variant="secondary" size="md" onClick={() => setConfirmingRefund(false)}>
            {t('ticket.refundKeep')}
          </Button>
          <Button size="md" onClick={() => void handleRefund()}>
            {t('ticket.refundConfirm')}
          </Button>
        </div>
      </FormDialog>
    </div>
  )
}
