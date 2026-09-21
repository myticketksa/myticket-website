import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import checkIcon from '@/assets/checkout/check-26.svg'
import { ShareIcon } from '@/components/icons'
import { Divider, PriceDisplay } from '@/components/data-display'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'
import { useGetOrderDetailsQuery } from '@/app/api/ordersApi'
import { useAppSelector } from '@/app/hooks'
import { selectAuthUser } from '@/features/auth/authSlice'
import { mapOrderConfirmation } from '@/lib/api/mappers/orders'

const NEXT_STEP_KEYS = ['offline', 'share', 'remind'] as const

function TicketQr({ value }: { value: string }) {
  return (
    <QRCodeSVG
      value={value}
      size={105}
      level="M"
      marginSize={0}
      bgColor="#FFFFFF"
      fgColor="#0A0A0A"
      aria-label="Ticket QR code"
    />
  )
}

function resolveOrderId(searchParams: URLSearchParams) {
  const fromQuery = searchParams.get('orderId')
  if (fromQuery) return fromQuery
  if (typeof sessionStorage === 'undefined') return ''
  return (
    sessionStorage.getItem('myticket.lastOrderId') ??
    sessionStorage.getItem('myticket.pendingOrderId') ??
    ''
  )
}

function paymentLineLabel(
  label: string,
  t: (key: string) => string,
): string {
  if (label === 'wallet') return t('confirmation.walletBalance')
  if (label === 'card') return t('confirmation.cardPayment')
  return label
}

/**
 * Order Confirmation — Figma `207:8462`. Uses `MainLayout` (SiteHeader + SiteFooter).
 * Data from `GET /tickets/orders/:id` (My tickets order details).
 */
export function OrderConfirmationPage() {
  const { t } = useTranslation('checkout')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = useAppSelector(selectAuthUser)
  const orderId = resolveOrderId(searchParams)
  const { data: order, isFetching, isError } = useGetOrderDetailsQuery(orderId, {
    skip: !orderId,
  })

  const view = useMemo(() => {
    if (order && Object.keys(order).length > 0) {
      return {
        ...mapOrderConfirmation(order, {
          orderId,
          email: user?.email,
          holder: user?.name,
        }),
        apiNote: null as string | null,
      }
    }

    return {
      email: user?.email ?? '—',
      ticketCount: 0,
      reference: orderId || '—',
      placedAt: '—',
      eventTitle: isFetching ? t('confirmation.loadingTitle') : t('confirmation.unavailableTitle'),
      eventMeta: '—',
      tierLabel: t('confirmation.ticketFallback'),
      holder: user?.name ?? t('confirmation.ticketHolder'),
      tickets: [] as { id: string; seat: string; gate: string; qrValue: string }[],
      subtotal: '0.00',
      serviceFee: null as string | null,
      vat: null as string | null,
      total: '0.00',
      paymentLines: [] as { label: string; amount: string }[],
      cashback: null as string | null,
      apiNote: isError
        ? t('confirmation.loadError')
        : isFetching
          ? t('confirmation.loadingNote')
          : orderId
            ? t('confirmation.notFound')
            : t('confirmation.completeCheckout'),
    }
  }, [isError, isFetching, order, orderId, t, user?.email, user?.name])

  return (
    <PageSection padTop={52} padBottom={96}>
      <div className="mx-auto flex max-w-[1040px] flex-col items-center text-center">
        <div className="flex size-[64px] items-center justify-center rounded-[32px] bg-state-success-tint">
          <img src={checkIcon} alt="" className="size-[26px]" />
        </div>
        <h1 className="mt-[18px] text-[32px] leading-[1.02] font-extrabold tracking-[-1.75px] text-ink-primary sm:text-[40px] lg:text-[50px]">
          {t('confirmation.title')}
        </h1>
        <p className="mt-[10px] max-w-[640px] text-[17px] leading-[1.5] text-ink-secondary">
          {t('confirmation.subtitle', { count: view.ticketCount, email: view.email })}
        </p>
        {view.apiNote ? (
          <p className="mt-[8px] max-w-[560px] text-[13px] text-ink-muted">{view.apiNote}</p>
        ) : null}
        <p className="mt-[10px] text-[13.5px] font-bold">
          <span className="text-ink-muted">{t('confirmation.orderReference')}</span>{' '}
          <span className="text-ink-primary">{view.reference}</span>{' '}
          <span className="text-ink-muted">· {view.placedAt}</span>
        </p>
      </div>

      <div className="mx-auto mt-[40px] flex max-w-[1040px] flex-col gap-[32px] lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-lg">
          {view.tickets.map((ticket) => (
            <article
              key={ticket.id}
              className="flex flex-col overflow-hidden rounded-[20px] border border-border-default bg-surface-default sm:flex-row"
            >
              <div className="min-w-0 flex-1 px-lg py-[18px] sm:px-[26px] sm:py-[22px]">
                <p className="text-[12px] font-bold tracking-[0.96px] text-brand-gradient-end">
                  {view.tierLabel}
                </p>
                <h2 className="mt-[6px] text-[20px] leading-[1.1] font-extrabold tracking-[-0.6px] text-ink-primary sm:text-[24px]">
                  {view.eventTitle}
                </h2>
                <p className="mt-[6px] text-[14px] text-ink-secondary">{view.eventMeta}</p>
                <div className="mt-lg grid gap-[26px] sm:grid-cols-3">
                  <div>
                    <p className="text-[11.5px] font-bold tracking-[0.69px] text-ink-muted">
                      {t('confirmation.seat')}
                    </p>
                    <p className="mt-[2px] text-[15px] font-bold text-ink-primary">{ticket.seat}</p>
                  </div>
                  <div>
                    <p className="text-[11.5px] font-bold tracking-[0.69px] text-ink-muted">
                      {t('confirmation.holder')}
                    </p>
                    <p className="mt-[2px] text-[15px] font-bold text-ink-primary">{view.holder}</p>
                  </div>
                  <div>
                    <p className="text-[11.5px] font-bold tracking-[0.69px] text-ink-muted">
                      {t('confirmation.ticketNo')}
                    </p>
                    <p className="mt-[2px] text-[15px] font-bold text-ink-primary">{ticket.id}</p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-center justify-center gap-sm border-t-[1.5px] border-dashed border-border-default bg-bg-page px-[22px] py-[18px] sm:border-t-0 sm:border-l-[1.5px]">
                <div className="rounded-[10px] border border-border-default bg-surface-default p-sm">
                  <TicketQr value={ticket.qrValue} />
                </div>
                {ticket.gate !== '—' ? (
                  <p className="text-[12px] font-semibold text-ink-secondary">{ticket.gate}</p>
                ) : null}
              </div>
            </article>
          ))}

          <section className="rounded-[18px] border border-border-default bg-surface-default p-[22px]">
            <h3 className="text-[17px] font-semibold text-ink-primary">{t('confirmation.whatNext')}</h3>
            <ol className="mt-lg flex flex-col gap-[14px]">
              {NEXT_STEP_KEYS.map((key, index) => (
                <li key={key} className="flex items-start gap-[12px]">
                  <span className="flex size-[28px] shrink-0 items-center justify-center rounded-pill bg-bg-tint-brand text-[13px] font-bold text-ink-brand">
                    {index + 1}
                  </span>
                  <p className="pt-[3px] text-[14px] leading-[1.5] text-ink-primary">
                    {t(`confirmation.nextSteps.${key}`)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-md lg:w-[340px]">
          <div className="rounded-[20px] border border-border-default bg-surface-default p-[24px]">
            <h3 className="text-[15px] font-semibold text-ink-primary">{t('confirmation.whatPaid')}</h3>
            <div className="mt-md flex flex-col gap-sm text-[14px]">
              <div className="flex justify-between gap-md">
                <span className="text-ink-secondary">
                  {view.ticketCount} × {view.tierLabel}
                </span>
                <PriceDisplay context="row">{view.subtotal}</PriceDisplay>
              </div>
              {view.serviceFee != null ? (
                <div className="flex justify-between gap-md">
                  <span className="text-ink-secondary">{t('confirmation.serviceFee')}</span>
                  <PriceDisplay context="row">{view.serviceFee}</PriceDisplay>
                </div>
              ) : null}
              {view.vat != null ? (
                <div className="flex justify-between gap-md">
                  <span className="text-ink-secondary">{t('confirmation.vat')}</span>
                  <PriceDisplay context="row">{view.vat}</PriceDisplay>
                </div>
              ) : null}
            </div>
            <Divider tone="divider" className="my-md" />
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-semibold text-ink-primary">
                {t('confirmation.total')}
              </span>
              <PriceDisplay context="amount">{view.total}</PriceDisplay>
            </div>
            {view.paymentLines.length > 0 ? (
              <div className="mt-md flex flex-col gap-[6px] text-[13px] text-ink-secondary">
                {view.paymentLines.map((line) => (
                  <div key={`${line.label}-${line.amount}`} className="flex justify-between gap-md">
                    <span>{paymentLineLabel(line.label, t)}</span>
                    <span>{line.amount}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {view.cashback != null ? (
              <div className="mt-md flex items-center justify-between rounded-[14px] bg-bg-tint-brand px-lg py-[14px] text-[13px] font-semibold text-ink-brand-strong">
                <span>{t('confirmation.cashbackEarned')}</span>
                <span>+ {view.cashback}</span>
              </div>
            ) : null}
          </div>

          <Button
            type="button"
            size="lg"
            className="h-[50px] w-full rounded-[25px] text-[15px] font-bold"
            onClick={() => navigate('/my-tickets')}
          >
            {t('confirmation.viewTickets')}
          </Button>

          <div className="grid grid-cols-2 gap-sm">
            <Button type="button" variant="secondary" size="sm" icon={<ShareIcon size={14} />}>
              {t('confirmation.shareNight')}
            </Button>
            <Link
              to="/events"
              className={cn(
                'inline-flex h-btn-sm items-center justify-center rounded-btn-sm',
                'border-[1.5px] border-border-default bg-surface-default px-btn-pad-sm',
                'text-[13px] font-semibold text-ink-primary',
                'hover:border-border-brand hover:text-ink-brand',
              )}
            >
              {t('confirmation.keepBrowsing')}
            </Link>
          </div>

          <p className="text-[12px] leading-[1.55] text-ink-muted">
            {t('confirmation.refundNote')}
          </p>
        </aside>
      </div>
    </PageSection>
  )
}
