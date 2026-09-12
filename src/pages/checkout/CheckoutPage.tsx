import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import eventThumb from '@/assets/checkout/event-thumb.png'
import { CheckIcon } from '@/components/icons'
import { PriceDisplay } from '@/components/data-display'
import { Button, Checkbox, Field, Radio, RadioGroup, TextInput } from '@/components/ui'
import { cn } from '@/lib/cn'
import { usePayOrderMutation, useCreateOrderMutation, useApplyPromoCodeMutation } from '@/app/api/ordersApi'
import { useReleaseHoldMutation } from '@/app/api/seatsApi'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAuthUser } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { parsePureNumericIds } from '@/lib/api/formPayload'
import { apiErrorMessage } from '@/lib/api/unwrap'

type PaymentMethod = 'card' | 'apple' | 'tabby' | 'tamara' | 'wallet' | 'sadad'

type HeldSeat = {
  id?: string
  label: string
  category?: string
  meta?: string
  price: number
  row?: string
}

const FALLBACK_SEATS: HeldSeat[] = [
  { row: 'C', label: 'Row C, seat 11', meta: 'Gold · Floor Block A', price: 520 },
  { row: 'C', label: 'Row C, seat 12', meta: 'Gold · Floor Block A', price: 520 },
]

function readHold() {
  try {
    return JSON.parse(sessionStorage.getItem('myticket.mockHold') || 'null') as {
      seatIds?: unknown[]
      seats?: HeldSeat[]
      holdId?: string
      ticketId?: number | string
      eventId?: string
      total?: number
      subtotal?: number
      serviceFee?: number
      vat?: number
    } | null
  } catch {
    return null
  }
}

const ASSURANCES = [
  'Tickets are issued by the organizer and verified by MyTicket.',
  'Your money is held safely until the event has taken place.',
  "Can't make it? Resell through the MyTicket auction in two taps.",
] as const

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
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const [payOrder, payState] = usePayOrderMutation()
  const [createOrder, createState] = useCreateOrderMutation()
  const [applyPromo, promoState] = useApplyPromoCodeMutation()
  const [releaseHold] = useReleaseHoldMutation()
  const paidRef = useRef(false)
  const [method, setMethod] = useState<PaymentMethod>('tabby')
  const [assignGuests, setAssignGuests] = useState(false)
  const [acceptRefund, setAcceptRefund] = useState(true)

  const hold = useMemo(() => readHold(), [])
  const seats = useMemo(() => {
    if (hold?.seats && hold.seats.length > 0) return hold.seats
    return FALLBACK_SEATS
  }, [hold])
  const subtotal =
    hold?.subtotal ?? seats.reduce((sum, seat) => sum + Number(seat.price || 0), 0)
  const serviceFee = hold?.serviceFee ?? Math.round(subtotal * 0.05)
  const vat = hold?.vat ?? Math.round((subtotal + serviceFee) * 0.15)
  const total = hold?.total ?? subtotal + serviceFee + vat

  useEffect(() => {
    return () => {
      if (paidRef.current) return
      const current = readHold()
      if (current?.holdId && current.eventId) {
        void releaseHold({ eventId: current.eventId, holdId: String(current.holdId) })
        sessionStorage.removeItem('myticket.mockHold')
      }
    }
  }, [releaseHold])
  const [sendReminders, setSendReminders] = useState(true)
  const [marketing, setMarketing] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [guestNames, setGuestNames] = useState(['', ''])

  const payLabels: Record<PaymentMethod, string> = {
    card: 'Pay now',
    apple: 'Pay with Apple Pay',
    tabby: 'Pay with Tabby',
    tamara: 'Pay with Tamara',
    wallet: 'Pay with wallet',
    sadad: 'Confirm SADAD reservation',
  }
  const payLabel = payLabels[method]
  const paying = payState.isLoading || createState.isLoading

  async function ensureOrderId(): Promise<number | null> {
    const existing = Number(sessionStorage.getItem('myticket.pendingOrderId') || '')
    if (existing) return existing

    const eventId =
      sessionStorage.getItem('myticket.eventId') ||
      sessionStorage.getItem('myticket.checkoutEventId')
    if (!eventId) return null

    let selectedCount = 2
    let seatIds: number[] = []
    let holdId: string | undefined
    let ticketId: number | undefined

    try {
      const mock = JSON.parse(sessionStorage.getItem('myticket.mockHold') || 'null') as {
        seatIds?: unknown[]
        holdId?: string
        ticketId?: number | string
        total?: number
      } | null
      selectedCount = Math.max(1, mock?.seatIds?.length ?? 2)
      // Only forward API numeric seat ids — never parse fixture labels like "C11".
      seatIds = parsePureNumericIds(mock?.seatIds)
      if (mock?.holdId) holdId = String(mock.holdId)
      if (mock?.ticketId != null && /^\d+$/.test(String(mock.ticketId))) {
        ticketId = Number(mock.ticketId)
      }
    } catch {
      selectedCount = 2
    }

    const storedTicketId = sessionStorage.getItem('myticket.ticketId')
    if (!ticketId && storedTicketId && /^\d+$/.test(storedTicketId)) {
      ticketId = Number(storedTicketId)
    }

    const body: {
      items?: { ticketId: number; quantity: number }[]
      beneficiaries?: { quantity_id: number; name: string }[]
      seatIds?: number[]
      holdId?: string
      ticketId?: number
      quantity?: number
    } = {
      quantity: selectedCount,
    }

    if (ticketId) {
      body.ticketId = ticketId
      body.items = [{ ticketId, quantity: selectedCount }]
    }
    if (seatIds.length > 0) body.seatIds = seatIds
    if (holdId) body.holdId = holdId

    if (assignGuests) {
      const beneficiaries = guestNames
        .map((name, index) => ({
          quantity_id: index + 1,
          name: name.trim() || user?.name || `Guest ${index + 1}`,
        }))
        .slice(0, selectedCount)
      if (beneficiaries.length > 0) body.beneficiaries = beneficiaries
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
      dispatch(toastPushed('error', 'Enter a promo code'))
      return
    }
    try {
      const orderId = await ensureOrderId()
      if (!orderId) {
        dispatch(toastPushed('error', 'Create seats first so we can apply a promo'))
        return
      }
      await applyPromo({ orderId, promoCode: code }).unwrap()
      setPromoApplied(true)
      dispatch(toastPushed('success', 'Promo applied'))
    } catch (error) {
      setPromoApplied(false)
      dispatch(toastPushed('error', apiErrorMessage(error, 'Promo could not be applied')))
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
        sessionStorage.removeItem('myticket.mockHold')
        paidRef.current = true
        dispatch(toastPushed('success', 'Payment submitted'))
        navigate(`/order-confirmation?orderId=${pendingOrderId}`)
        return
      }
      navigate('/order-confirmation')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Payment failed')))
    }
  }

  return (
    <div className="flex flex-col gap-[40px] lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <h1 className="text-[46px] leading-[1.04] font-extrabold tracking-[-1.61px] text-ink-primary">
          Checkout
        </h1>

        <section className="mt-[30px] rounded-[18px] border border-border-default bg-surface-default p-[22px]">
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <h2 className="text-[17px] font-semibold text-ink-primary">Ticket holder</h2>
            <p className="text-[13px] text-ink-secondary">
              Signed in as {user?.name ?? 'Sara Al-Harbi'}
            </p>
          </div>

          <div className="mt-lg flex flex-col gap-[14px]">
            <div className="grid gap-[14px] md:grid-cols-2">
              <Field label="Full name" htmlFor="checkout-name">
                <TextInput
                  id="checkout-name"
                  name="name"
                  defaultValue={user?.name ?? 'Sara Al-Harbi'}
                  className="bg-bg-page"
                />
              </Field>
              <Field label="Mobile number" htmlFor="checkout-mobile">
                <TextInput
                  id="checkout-mobile"
                  name="mobile"
                  defaultValue={user?.phone ?? '+966 55 214 4417'}
                  className="bg-bg-page"
                />
              </Field>
            </div>
            <Field label="Email for the e-tickets" htmlFor="checkout-email">
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
            label="Assign each seat to a different guest (they get their own QR code)"
          />
          {assignGuests && (
            <div className="mt-[14px] grid gap-[14px] md:grid-cols-2">
              {guestNames.map((name, index) => (
                <Field key={index} label={`Guest ${index + 1}`} htmlFor={`guest-${index}`}>
                  <TextInput
                    id={`guest-${index}`}
                    value={name}
                    onChange={(event) => {
                      const next = [...guestNames]
                      next[index] = event.target.value
                      setGuestNames(next)
                    }}
                    placeholder={user?.name ?? 'Guest full name'}
                    className="bg-bg-page"
                  />
                </Field>
              ))}
            </div>
          )}
        </section>

        <section className="mt-[18px] rounded-[18px] border border-border-default bg-surface-default p-[22px]">
          <h2 className="text-[17px] font-semibold text-ink-primary">Payment method</h2>
          <p className="mt-[6px] text-[14px] text-ink-secondary">
            All payments are processed in Saudi Riyals and held until the event has taken
            place.
          </p>

          <RadioGroup
            value={method}
            onValueChange={(value) => setMethod(value as PaymentMethod)}
            className="mt-[18px] flex flex-col gap-[10px]"
          >
            <PaymentCard
              value="card"
              selected={method === 'card'}
              title="Debit or credit card"
              subtitle="Mada, Visa, Mastercard, Amex"
              leading={
                <MethodMark className="w-[62px] bg-surface-inverse text-bg-page">
                  CARD
                </MethodMark>
              }
            />

            <PaymentCard
              value="apple"
              selected={method === 'apple'}
              title="Apple Pay"
              subtitle="Pay with Face ID on this device"
              leading={
                <MethodMark className="w-[62px] bg-surface-inverse text-bg-page">
                  Pay
                </MethodMark>
              }
            />

            <PaymentCard
              value="tabby"
              selected={method === 'tabby'}
              title="Tabby"
              subtitle="Split into 4 interest-free payments"
              leading={
                <MethodMark className="bg-brand-gradient-start text-ink-body">
                  tabby
                </MethodMark>
              }
              trailing={
                <span className="rounded-[13px] bg-bg-tint-brand px-[10px] py-[5px] text-[12px] font-semibold text-ink-brand-strong">
                  0% interest
                </span>
              }
            >
              {method === 'tabby' && (
                <div className="mt-lg w-full border-t border-border-divider pt-lg">
                  <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-4">
                    {['TODAY', 'IN 1 MONTH', 'IN 2 MONTHS', 'IN 3 MONTHS'].map((label) => (
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
                    No fees, no interest. A soft check runs when you confirm — it won&apos;t
                    affect your credit score.
                  </p>
                </div>
              )}
            </PaymentCard>

            <PaymentCard
              value="tamara"
              selected={method === 'tamara'}
              title="Tamara"
              subtitle="Pay in 3, or pay in full in 30 days"
              leading={
                <MethodMark className="bg-payment-tamara text-payment-tamara-ink">
                  tamara
                </MethodMark>
              }
              trailing={
                <span className="rounded-[13px] bg-payment-tamara-badge px-[10px] py-[5px] text-[12px] font-semibold text-payment-tamara-badge-ink">
                  Sharia compliant
                </span>
              }
            />

            <PaymentCard
              value="wallet"
              selected={method === 'wallet'}
              title="MyTicket wallet"
              subtitle="Balance SAR 340 · cashback included"
              leading={
                <MethodMark className="bg-bg-tint-brand text-ink-link-hover">
                  SAR 340
                </MethodMark>
              }
            />

            <PaymentCard
              value="sadad"
              selected={method === 'sadad'}
              title="Bank transfer (SADAD)"
              subtitle="Reserved for 6 hours until payment clears"
              leading={
                <MethodMark className="bg-border-divider text-ink-body">SADAD</MethodMark>
              }
            />
          </RadioGroup>
        </section>

        <section className="mt-[18px] rounded-[18px] border border-border-default bg-surface-default p-[22px]">
          <h2 className="text-[17px] font-semibold text-ink-primary">Before you pay</h2>
          <div className="mt-[14px] flex flex-col gap-md">
            <Checkbox
              id="accept-refund"
              checked={acceptRefund}
              onCheckedChange={(value) => setAcceptRefund(value === true)}
              label="I accept the event's refund policy — full refund up to 72 hours before doors."
            />
            <Checkbox
              id="send-reminders"
              checked={sendReminders}
              onCheckedChange={(value) => setSendReminders(value === true)}
              label="Send my e-tickets and entry reminders by SMS and email."
            />
            <Checkbox
              id="marketing"
              checked={marketing}
              onCheckedChange={(value) => setMarketing(value === true)}
              label="Tell me about similar concerts in Riyadh (you can turn this off any time)."
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
              YOUR SEATS
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
                        {seat.meta ?? seat.category ?? 'Selected seat'}
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
                placeholder="Promo code"
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
                Apply
              </Button>
            </div>

            <div className="mt-lg border-t border-border-divider pt-[14px]">
              <div className="flex flex-col gap-[8px] text-[14px]">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">
                    {seats.length} seat{seats.length === 1 ? '' : 's'}
                  </span>
                  <PriceDisplay context="row">SAR {subtotal.toLocaleString()}</PriceDisplay>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Promo code</span>
                  <span className={promoApplied ? 'font-semibold text-ink-brand' : 'text-ink-muted'}>
                    {promoApplied ? promoCode.trim().toUpperCase() : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Service fee</span>
                  <PriceDisplay context="row">SAR {serviceFee.toLocaleString()}</PriceDisplay>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">VAT 15%</span>
                  <PriceDisplay context="row">SAR {vat.toLocaleString()}</PriceDisplay>
                </div>
              </div>

              <div className="mt-[12px] flex items-baseline justify-between border-t border-border-divider pt-[12px]">
                <span className="text-[16px] font-semibold text-ink-primary">Total due</span>
                <PriceDisplay context="stat" className="text-[26px] font-extrabold">
                  SAR {total.toLocaleString()}
                </PriceDisplay>
              </div>
              <p className="mt-[8px] text-[13px] font-semibold text-ink-brand">
                Pay SAR {Math.round(total / 4).toLocaleString()} today, then 3 monthly payments
              </p>
            </div>

            <Button
              type="button"
              size="lg"
              loading={paying}
              className="mt-[18px] h-[54px] w-full rounded-[27px] text-[16px] font-semibold"
              onClick={() => void handlePay()}
            >
              {payLabel}
            </Button>
            <p className="mt-[10px] text-center text-[12px] leading-[1.5] text-ink-muted">
              You&apos;ll earn SAR 21 cashback into your MyTicket wallet after the event.
            </p>
          </div>
        </div>

        <div className="rounded-[18px] border border-border-default bg-bg-warm px-[18px] py-lg">
          <ul className="flex flex-col gap-[10px]">
            {ASSURANCES.map((line) => (
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
