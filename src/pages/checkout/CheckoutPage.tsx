import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import eventThumb from '@/assets/checkout/event-thumb.png'
import { CheckIcon } from '@/components/icons'
import { PriceDisplay } from '@/components/data-display'
import { Button, Checkbox, Field, Radio, RadioGroup, TextInput } from '@/components/ui'
import { cn } from '@/lib/cn'

type PaymentMethod = 'card' | 'apple' | 'tabby' | 'tamara' | 'wallet' | 'sadad'

const SEATS = [
  { row: 'C', label: 'Row C, seat 11', meta: 'Gold · Floor Block A', price: 520 },
  { row: 'C', label: 'Row C, seat 12', meta: 'Gold · Floor Block A', price: 520 },
] as const

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
  const [method, setMethod] = useState<PaymentMethod>('tabby')
  const [assignGuests, setAssignGuests] = useState(false)
  const [acceptRefund, setAcceptRefund] = useState(true)
  const [sendReminders, setSendReminders] = useState(true)
  const [marketing, setMarketing] = useState(false)

  const payLabels: Record<PaymentMethod, string> = {
    card: 'Pay now',
    apple: 'Pay with Apple Pay',
    tabby: 'Pay with Tabby',
    tamara: 'Pay with Tamara',
    wallet: 'Pay with wallet',
    sadad: 'Confirm SADAD reservation',
  }
  const payLabel = payLabels[method]

  return (
    <div className="flex flex-col gap-[40px] lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <h1 className="text-[46px] leading-[1.04] font-extrabold tracking-[-1.61px] text-ink-primary">
          Checkout
        </h1>

        <section className="mt-[30px] rounded-[18px] border border-border-default bg-surface-default p-[22px]">
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <h2 className="text-[17px] font-semibold text-ink-primary">Ticket holder</h2>
            <p className="text-[13px] text-ink-secondary">Signed in as Sara Al-Harbi</p>
          </div>

          <div className="mt-lg flex flex-col gap-[14px]">
            <div className="grid gap-[14px] md:grid-cols-2">
              <Field label="Full name" htmlFor="checkout-name">
                <TextInput
                  id="checkout-name"
                  name="name"
                  defaultValue="Sara Al-Harbi"
                  className="bg-bg-page"
                />
              </Field>
              <Field label="Mobile number" htmlFor="checkout-mobile">
                <TextInput
                  id="checkout-mobile"
                  name="mobile"
                  defaultValue="+966 55 214 4417"
                  className="bg-bg-page"
                />
              </Field>
            </div>
            <Field label="Email for the e-tickets" htmlFor="checkout-email">
              <TextInput
                id="checkout-email"
                name="email"
                type="email"
                defaultValue="sara.alharbi@example.com"
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
              {SEATS.map((seat) => (
                <li key={seat.label} className="flex items-center gap-[11px]">
                  <span className="flex size-[30px] items-center justify-center rounded-[8px] bg-brand-identity-end text-[11px] font-bold text-ink-inverse">
                    {seat.row}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-ink-primary">{seat.label}</p>
                    <p className="text-[12px] text-ink-secondary">{seat.meta}</p>
                  </div>
                  <PriceDisplay context="row" className="font-semibold">
                    SAR {seat.price}
                  </PriceDisplay>
                </li>
              ))}
            </ul>

            <div className="mt-lg flex gap-sm">
              <TextInput
                placeholder="Promo code"
                className="h-11 flex-1 rounded-[11px] bg-bg-page text-[14px]"
              />
              <Button
                type="button"
                variant="secondary"
                className="h-11 rounded-[11px] border border-border-default px-[18px] text-[14px]"
              >
                Apply
              </Button>
            </div>

            <div className="mt-lg border-t border-border-divider pt-[14px]">
              <div className="flex flex-col gap-[8px] text-[14px]">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">2 seats</span>
                  <PriceDisplay context="row">SAR 1,040</PriceDisplay>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Promo code</span>
                  <span className="text-ink-muted">None</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Service fee</span>
                  <PriceDisplay context="row">SAR 52</PriceDisplay>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">VAT 15%</span>
                  <PriceDisplay context="row">SAR 164</PriceDisplay>
                </div>
              </div>

              <div className="mt-[12px] flex items-baseline justify-between border-t border-border-divider pt-[12px]">
                <span className="text-[16px] font-semibold text-ink-primary">Total due</span>
                <PriceDisplay context="stat" className="text-[26px] font-extrabold">
                  SAR 1,256
                </PriceDisplay>
              </div>
              <p className="mt-[8px] text-[13px] font-semibold text-ink-brand">
                Pay SAR 314 today, then 3 monthly payments
              </p>
            </div>

            <Button
              type="button"
              size="lg"
              className="mt-[18px] h-[54px] w-full rounded-[27px] text-[16px] font-semibold"
              onClick={() => navigate('/order-confirmation')}
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
