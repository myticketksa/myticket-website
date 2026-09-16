import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import eventThumb from '@/assets/checkout/event-thumb.png'
import { CheckIcon } from '@/components/icons'
import { PriceDisplay } from '@/components/data-display'
import { Button, Checkbox, Field, Radio, RadioGroup, TextInput } from '@/components/ui'
import { cn } from '@/lib/cn'
import { usePayOrderMutation, useCreateOrderMutation, useApplyPromoCodeMutation } from '@/app/api/ordersApi'
import { useReleaseHoldMutation } from '@/app/api/seatsApi'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { formatAuthWalletBalance, selectAuthUser } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { parsePureNumericIds } from '@/lib/api/formPayload'
import { apiErrorMessage } from '@/lib/api/unwrap'
import {
  clearHoldSession,
  hasValidApiHold,
  readHoldSession,
  type HeldSeatSnapshot,
} from '@/lib/purchase/holdSession'

type PaymentMethod = 'card' | 'apple' | 'tabby' | 'tamara' | 'wallet' | 'sadad'

type HeldSeat = HeldSeatSnapshot

const FALLBACK_SEATS: HeldSeat[] = [
  { row: 'C', label: 'Row C, seat 11', meta: 'Gold · Floor Block A', price: 520 },
  { row: 'C', label: 'Row C, seat 12', meta: 'Gold · Floor Block A', price: 520 },
]

function MethodMark({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'flex h-[30px] min-w-[62px] items-center justify-center rounded-[7px] px-[10px]',
        'text-[12px] font-bold tracking-[0.24px]',
        className,
      )}
    >
      {children}
    </span>
  )
}

/**
 * Checkout — Figma `207:8228`. Purchase header comes from `PurchaseLayout`.
 */
export function CheckoutPage() {
  const { t } = useTranslation('checkout')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const walletLabel = formatAuthWalletBalance(user?.walletBalance)
  const [payOrder, payState] = usePayOrderMutation()
  const [createOrder, createState] = useCreateOrderMutation()
  const [applyPromo, promoState] = useApplyPromoCodeMutation()
  const [releaseHold] = useReleaseHoldMutation()
  const paidRef = useRef(false)
  const [method, setMethod] = useState<PaymentMethod>('tabby')
  const [assignGuests, setAssignGuests] = useState(false)
  const [acceptRefund, setAcceptRefund] = useState(true)

  const hold = useMemo(() => readHoldSession(), [])
  const isFreeSeating = hold?.seatingType === 'free'
  const seats = useMemo(() => {
    if (hold?.seats && hold.seats.length > 0) return hold.seats
    if (isFreeSeating) {
      const qty = Math.max(1, Number(hold?.quantity ?? 1))
      return Array.from({ length: qty }, (_, index) => ({
        label: `General admission ${index + 1}`,
        meta: 'Free seating',
        price: Number(hold?.subtotal ? hold.subtotal / qty : 0),
      }))
    }
    return FALLBACK_SEATS
  }, [hold, isFreeSeating])
  const selectedCount = Math.max(1, seats.length)
  const subtotal =
    hold?.subtotal ?? seats.reduce((sum, seat) => sum + Number(seat.price || 0), 0)
  const serviceFee = hold?.serviceFee ?? Math.round(subtotal * 0.05)
  const vat = hold?.vat ?? Math.round((subtotal + serviceFee) * 0.15)
  const total = hold?.total ?? subtotal + serviceFee + vat

  // Do not release on unmount — Strict Mode remounts were clearing holdId before pay.
  // Only release when the tab is actually closed / navigated away from the site.
  useEffect(() => {
    if (!hasValidApiHold(hold)) {
      const slug = hold?.slug || sessionStorage.getItem('myticket.eventSlug')
      dispatch(toastPushed('error', t('checkout.holdExpired')))
      const fallback =
        hold?.seatingType === 'free'
          ? slug
            ? `/events/${slug}`
            : '/'
          : slug
            ? `/events/${slug}/seats`
            : '/'
      navigate(fallback, { replace: true })
      return
    }

    if (hold?.seatingType === 'free') return

    const releaseOnUnload = () => {
      if (paidRef.current) return
      const current = readHoldSession()
      if (current?.holdId && current.eventId) {
        void releaseHold({ eventId: current.eventId, holdId: String(current.holdId) })
        clearHoldSession()
      }
    }
    window.addEventListener('pagehide', releaseOnUnload)
    return () => window.removeEventListener('pagehide', releaseOnUnload)
  }, [dispatch, hold, navigate, releaseHold, t])
  const [sendReminders, setSendReminders] = useState(true)
  const [marketing, setMarketing] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [guestNames, setGuestNames] = useState<string[]>(() =>
    Array.from({ length: selectedCount }, () => ''),
  )

  useEffect(() => {
    setGuestNames((current) => {
      if (current.length === selectedCount) return current
      return Array.from({ length: selectedCount }, (_, index) => current[index] ?? '')
    })
  }, [selectedCount])

  const payLabels: Record<PaymentMethod, string> = {
    card: t('checkout.pay'),
    apple: t('checkout.payApple'),
    tabby: t('checkout.payTabby'),
    tamara: t('checkout.payTamara'),
    wallet: t('checkout.payWallet'),
    sadad: t('checkout.paySadad'),
  }
  const payLabel = payLabels[method]
  const paying = payState.isLoading || createState.isLoading
  const assurances = [
    t('checkout.assurances.issued'),
    t('checkout.assurances.held'),
  ] as const
  const tabbySchedule = [
    t('checkout.tabbySchedule.today'),
    t('checkout.tabbySchedule.month1'),
    t('checkout.tabbySchedule.month2'),
    t('checkout.tabbySchedule.month3'),
  ] as const

  function buildBeneficiaries(count: number) {
    const buyerName = user?.name?.trim() || t('confirmation.ticketHolder')
    return Array.from({ length: count }, (_, index) => {
      const assigned = guestNames[index]?.trim()
      return {
        quantity_id: index + 1,
        // API requires one beneficiary per ticket. When guests aren't assigned,
        // every seat is named for the buyer.
        name: assignGuests ? assigned || `${buyerName} (${index + 1})` : buyerName,
      }
    })
  }

  async function ensureOrderId(): Promise<number | null> {
    const existing = Number(sessionStorage.getItem('myticket.pendingOrderId') || '')
    if (existing) return existing

    const mock = readHoldSession()
    const eventId =
      mock?.eventId ||
      sessionStorage.getItem('myticket.eventId') ||
      sessionStorage.getItem('myticket.checkoutEventId')
    if (!eventId) {
      dispatch(toastPushed('error', t('checkout.eventMissing')))
      return null
    }

    if (!hasValidApiHold(mock)) {
      const seatsPath =
        mock?.seatingType === 'free'
          ? mock?.slug
            ? `/events/${mock.slug}`
            : '/'
          : mock?.slug
            ? `/events/${mock.slug}/seats`
            : '/'
      dispatch(toastPushed('error', t('checkout.holdIncomplete')))
      navigate(seatsPath, { replace: true })
      return null
    }

    const freeSeating = mock!.seatingType === 'free'
    const seatIds = freeSeating ? [] : parsePureNumericIds(mock!.seatIds)
    const holdId = freeSeating ? undefined : String(mock!.holdId)
    const count = freeSeating
      ? Math.max(1, Number(mock!.quantity ?? mock!.seats?.length ?? 1))
      : Math.max(1, seatIds.length)

    let ticketId: number | undefined
    if (mock?.ticketId != null && /^\d+$/.test(String(mock.ticketId))) {
      ticketId = Number(mock.ticketId)
    }
    const storedTicketId = sessionStorage.getItem('myticket.ticketId')
    if (!ticketId && storedTicketId && /^\d+$/.test(storedTicketId)) {
      ticketId = Number(storedTicketId)
    }
    if (!ticketId) {
      dispatch(toastPushed('error', t('checkout.ticketMissing')))
      return null
    }

    if (assignGuests) {
      const missing = guestNames
        .slice(0, count)
        .findIndex((name) => !name.trim())
      if (missing >= 0) {
        dispatch(toastPushed('error', t('checkout.guestName', { n: missing + 1 })))
        return null
      }
    }

    const body = freeSeating
      ? {
          quantity: count,
          ticketId,
          items: [{ ticketId, quantity: count }],
          beneficiaries: buildBeneficiaries(count),
        }
      : {
          quantity: count,
          ticketId,
          items: [{ ticketId, quantity: count }],
          // Seated events require both fields — never omit them.
          seatIds,
          holdId,
          beneficiaries: buildBeneficiaries(count),
        }

    const created = await createOrder({
      eventId,
      body,
    }).unwrap()

    const orderId = Number(created.id ?? created.orderId ?? created.order_id)
    if (!Number.isFinite(orderId) || orderId <= 0) return null
    sessionStorage.setItem('myticket.pendingOrderId', String(orderId))
    return orderId
  }

  async function handleApplyPromo() {
    const code = promoCode.trim()
    if (!code) {
      dispatch(toastPushed('error', t('checkout.promoEnter')))
      return
    }
    try {
      const orderId = await ensureOrderId()
      if (!orderId) {
        dispatch(toastPushed('error', t('checkout.promoNeedOrder')))
        return
      }
      await applyPromo({ orderId, promoCode: code }).unwrap()
      setPromoApplied(true)
      dispatch(toastPushed('success', t('checkout.promoApplied')))
    } catch (error) {
      setPromoApplied(false)
      dispatch(toastPushed('error', apiErrorMessage(error, t('checkout.promoFailed'))))
    }
  }

  async function handlePay() {
    try {
      let pendingOrderId = Number(sessionStorage.getItem('myticket.pendingOrderId') || '')
      if (!pendingOrderId) {
        pendingOrderId = (await ensureOrderId()) ?? 0
      }
      if (pendingOrderId) {
        await payOrder({
          orderId: pendingOrderId,
          brand: method === 'wallet' ? 'WALLET' : 'CREDIT',
        }).unwrap()
        sessionStorage.setItem('myticket.lastOrderId', String(pendingOrderId))
        sessionStorage.removeItem('myticket.pendingOrderId')
        clearHoldSession()
        paidRef.current = true
        dispatch(toastPushed('success', t('checkout.paymentSubmitted')))
        navigate(`/order-confirmation?orderId=${pendingOrderId}`)
        return
      }
      navigate('/order-confirmation')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('checkout.paymentFailed'))))
    }
  }

  return (
    <div className="flex flex-col gap-[40px] lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <h1 className="text-[32px] leading-[1.04] font-extrabold tracking-[-1.61px] text-ink-primary sm:text-[40px] lg:text-[46px]">
          {t('checkout.title')}
        </h1>

        <section className="mt-[30px] rounded-[18px] border border-border-default bg-surface-default p-[22px]">
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <h2 className="text-[17px] font-semibold text-ink-primary">{t('checkout.ticketHolder')}</h2>
            <p className="text-[13px] text-ink-secondary">
              {t('checkout.signedInAs', { name: user?.name ?? 'Sara Al-Harbi' })}
            </p>
          </div>

          <div className="mt-lg flex flex-col gap-[14px]">
            <div className="grid gap-[14px] md:grid-cols-2">
              <Field label={t('checkout.fullName')} htmlFor="checkout-name">
                <TextInput
                  id="checkout-name"
                  name="name"
                  defaultValue={user?.name ?? 'Sara Al-Harbi'}
                  className="bg-bg-page"
                />
              </Field>
              <Field label={t('checkout.mobile')} htmlFor="checkout-mobile">
                <TextInput
                  id="checkout-mobile"
                  name="mobile"
                  defaultValue={user?.phone ?? '+966 55 214 4417'}
                  className="bg-bg-page"
                />
              </Field>
            </div>
            <Field label={t('checkout.email')} htmlFor="checkout-email">
              <TextInput
                id="checkout-email"
                name="email"
                type="email"
                defaultValue={user?.email ?? 'sara.alharbi@example.com'}
                className="bg-bg-page"
              />
            </Field>
          </div>

          <Checkbox
            id="assign-guests"
            className="mt-[14px]"
            checked={assignGuests}
            onCheckedChange={(value) => setAssignGuests(value === true)}
            label={t('checkout.assignGuests')}
          />
          {assignGuests && (
            <div className="mt-[14px] grid gap-[14px] md:grid-cols-2">
              {guestNames.map((name, index) => (
                <Field
                  key={index}
                  label={t('checkout.guestLabel', { n: index + 1 })}
                  htmlFor={`guest-${index}`}
                >
                  <TextInput
                    id={`guest-${index}`}
                    value={name}
                    onChange={(event) => {
                      const next = [...guestNames]
                      next[index] = event.target.value
                      setGuestNames(next)
                    }}
                    placeholder={user?.name ?? t('checkout.guestPlaceholder')}
                    className="bg-bg-page"
                  />
                </Field>
              ))}
            </div>
          )}
        </section>

        <section className="mt-[18px] rounded-[18px] border border-border-default bg-surface-default p-[22px]">
          <h2 className="text-[17px] font-semibold text-ink-primary">{t('checkout.paymentMethod')}</h2>
          <p className="mt-[6px] text-[14px] text-ink-secondary">{t('checkout.paymentLede')}</p>

          <RadioGroup
            value={method}
            onValueChange={(value) => setMethod(value as PaymentMethod)}
            className="mt-[18px] flex flex-col gap-[10px]"
          >
            <PaymentCard
              value="card"
              selected={method === 'card'}
              title={t('checkout.methods.card')}
              subtitle={t('checkout.methods.cardSub')}
              leading={
                <MethodMark className="w-[62px] bg-surface-inverse text-bg-page">
                  CARD
                </MethodMark>
              }
            />

            <PaymentCard
              value="apple"
              selected={method === 'apple'}
              title={t('checkout.methods.apple')}
              subtitle={t('checkout.methods.appleSub')}
              leading={
                <MethodMark className="w-[62px] bg-surface-inverse text-bg-page">
                  Pay
                </MethodMark>
              }
            />

            <PaymentCard
              value="tabby"
              selected={method === 'tabby'}
              title={t('checkout.methods.tabby')}
              subtitle={t('checkout.methods.tabbySub')}
              leading={
                <MethodMark className="bg-brand-gradient-start text-ink-body">
                  tabby
                </MethodMark>
              }
              trailing={
                <span className="rounded-[13px] bg-bg-tint-brand px-[10px] py-[5px] text-[12px] font-semibold text-ink-brand-strong">
                  {t('checkout.methods.tabbyBadge')}
                </span>
              }
            >
              {method === 'tabby' && (
                <div className="mt-lg w-full border-t border-border-divider pt-lg">
                  <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-4">
                    {tabbySchedule.map((label) => (
                      <div
                        key={label}
                        className="rounded-[12px] border border-border-default bg-bg-page p-md text-center"
                      >
                        <p className="text-[11px] font-semibold tracking-[0.55px] text-ink-muted">
                          {label}
                        </p>
                        <p className="mt-[5px] text-[15px] font-semibold text-ink-primary">
                          SAR 314
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-[10px] text-[12px] leading-[1.5] text-ink-secondary">
                    {t('checkout.methods.tabbyNote')}
                  </p>
                </div>
              )}
            </PaymentCard>

            <PaymentCard
              value="tamara"
              selected={method === 'tamara'}
              title={t('checkout.methods.tamara')}
              subtitle={t('checkout.methods.tamaraSub')}
              leading={
                <MethodMark className="bg-payment-tamara text-payment-tamara-ink">
                  tamara
                </MethodMark>
              }
              trailing={
                <span className="rounded-[13px] bg-payment-tamara-badge px-[10px] py-[5px] text-[12px] font-semibold text-payment-tamara-badge-ink">
                  {t('checkout.methods.tamaraBadge')}
                </span>
              }
            />

            <PaymentCard
              value="wallet"
              selected={method === 'wallet'}
              title={t('checkout.methods.wallet')}
              subtitle={t('checkout.methods.walletSub', { balance: walletLabel })}
              leading={
                <MethodMark className="bg-bg-tint-brand text-ink-link-hover">
                  {walletLabel}
                </MethodMark>
              }
            />

            <PaymentCard
              value="sadad"
              selected={method === 'sadad'}
              title={t('checkout.methods.sadad')}
              subtitle={t('checkout.methods.sadadSub')}
              leading={
                <MethodMark className="bg-border-divider text-ink-body">SADAD</MethodMark>
              }
            />
          </RadioGroup>
        </section>

        <section className="mt-[18px] rounded-[18px] border border-border-default bg-surface-default p-[22px]">
          <h2 className="text-[17px] font-semibold text-ink-primary">{t('checkout.beforePay')}</h2>
          <div className="mt-[14px] flex flex-col gap-md">
            <Checkbox
              id="accept-refund"
              checked={acceptRefund}
              onCheckedChange={(value) => setAcceptRefund(value === true)}
              label={t('checkout.acceptRefund')}
            />
            <Checkbox
              id="send-reminders"
              checked={sendReminders}
              onCheckedChange={(value) => setSendReminders(value === true)}
              label={t('checkout.sendReminders')}
            />
            <Checkbox
              id="marketing"
              checked={marketing}
              onCheckedChange={(value) => setMarketing(value === true)}
              label={t('checkout.marketing')}
            />
          </div>
        </section>
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-[14px] lg:w-[400px]">
        <div className="overflow-hidden rounded-[20px] border border-border-default bg-surface-default shadow-checkout-summary">
          <div className="flex gap-[14px] border-b border-border-divider p-[18px]">
            <img
              src={eventThumb}
              alt=""
              className="size-[76px] shrink-0 rounded-[12px] object-cover"
            />
            <div className="min-w-0">
              <p className="text-[15px] leading-[1.25] font-semibold text-ink-primary">
                Winter Nights: Live at King Abdullah Park
              </p>
              <p className="mt-[4px] text-[13px] leading-[1.4] text-ink-secondary">
                Thu 8 Oct 2026 · 20:00
              </p>
              <p className="text-[13px] leading-[1.4] text-ink-secondary">
                King Abdullah Park, Riyadh
              </p>
            </div>
          </div>

          <div className="p-[18px]">
            <h3 className="text-[13px] font-bold tracking-[0.91px] text-ink-muted">
              {t('checkout.yourSeats')}
            </h3>
            <ul className="mt-md flex flex-col gap-[9px]">
              {seats.map((seat) => {
                const row =
                  seat.row ??
                  seat.label.match(/Row\s+([A-Z0-9]+)/i)?.[1] ??
                  seat.label.slice(0, 1)
                return (
                  <li key={seat.label} className="flex items-center gap-[11px]">
                    <span className="flex size-[30px] items-center justify-center rounded-[8px] bg-brand-identity-end text-[11px] font-bold text-ink-inverse">
                      {row}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-ink-primary">{seat.label}</p>
                      <p className="text-[12px] text-ink-secondary">
                        {seat.meta ?? seat.category ?? t('checkout.selectedSeat')}
                      </p>
                    </div>
                    <PriceDisplay context="row" className="font-semibold">
                      SAR {seat.price}
                    </PriceDisplay>
                  </li>
                )
              })}
            </ul>

            <div className="mt-lg flex gap-sm">
              <TextInput
                placeholder={t('checkout.promoPlaceholder')}
                value={promoCode}
                onChange={(event) => {
                  setPromoCode(event.target.value)
                  setPromoApplied(false)
                }}
                className="h-11 flex-1 rounded-[11px] bg-bg-page text-[14px]"
              />
              <Button
                type="button"
                variant="secondary"
                loading={promoState.isLoading}
                className="h-11 rounded-[11px] border border-border-default px-[18px] text-[14px]"
                onClick={() => void handleApplyPromo()}
              >
                {t('checkout.promoApply')}
              </Button>
            </div>

            <div className="mt-lg border-t border-border-divider pt-[14px]">
              <div className="flex flex-col gap-[8px] text-[14px]">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">
                    {t('checkout.seatsCount', { count: seats.length })}
                  </span>
                  <PriceDisplay context="row">SAR {subtotal.toLocaleString()}</PriceDisplay>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">{t('checkout.promoLabel')}</span>
                  <span className={promoApplied ? 'font-semibold text-ink-brand' : 'text-ink-muted'}>
                    {promoApplied ? promoCode.trim().toUpperCase() : t('checkout.promoNone')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">{t('checkout.serviceFee')}</span>
                  <PriceDisplay context="row">SAR {serviceFee.toLocaleString()}</PriceDisplay>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">{t('checkout.vat')}</span>
                  <PriceDisplay context="row">SAR {vat.toLocaleString()}</PriceDisplay>
                </div>
              </div>

              <div className="mt-[12px] flex items-baseline justify-between border-t border-border-divider pt-[12px]">
                <span className="text-[16px] font-semibold text-ink-primary">
                  {t('checkout.totalDue')}
                </span>
                <PriceDisplay context="stat" className="text-[26px] font-extrabold">
                  SAR {total.toLocaleString()}
                </PriceDisplay>
              </div>
              <p className="mt-[8px] text-[13px] font-semibold text-ink-brand">
                {t('checkout.payToday', { amount: Math.round(total / 4).toLocaleString() })}
              </p>
            </div>

            <Button
              type="button"
              size="lg"
              loading={paying}
              className="mt-[18px] h-[54px] w-full rounded-[27px] text-[16px] font-semibold"
              onClick={() => void handlePay()}
            >
              {paying ? t('checkout.paying') : payLabel}
            </Button>
            <p className="mt-[10px] text-center text-[12px] leading-[1.5] text-ink-muted">
              {t('checkout.cashbackNote')}
            </p>
          </div>
        </div>

        <div className="rounded-[18px] border border-border-default bg-bg-warm px-[18px] py-lg">
          <ul className="flex flex-col gap-[10px]">
            {assurances.map((line) => (
              <li key={line} className="flex items-start gap-[10px]">
                <CheckIcon size={13} className="mt-[2px] shrink-0 text-ink-brand" />
                <span className="text-[13px] leading-[1.45] text-ink-body">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

function PaymentCard({
  value,
  selected,
  title,
  subtitle,
  leading,
  trailing,
  children,
}: {
  value: PaymentMethod
  selected: boolean
  title: string
  subtitle?: string
  leading?: ReactNode
  trailing?: ReactNode
  children?: ReactNode
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer flex-col rounded-[15px] border px-[18px] py-lg',
        selected
          ? 'border-[1.5px] border-ink-brand bg-payment-selected'
          : 'border-[1.5px] border-border-default bg-surface-default',
      )}
    >
      <div className="flex items-center gap-[14px]">
        <Radio value={value} aria-label={title} />
        {leading}
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-ink-primary">{title}</p>
          {subtitle && (
            <p className="mt-[2px] text-[13px] text-ink-secondary">{subtitle}</p>
          )}
        </div>
        {trailing}
      </div>
      {children}
    </label>
  )
}
