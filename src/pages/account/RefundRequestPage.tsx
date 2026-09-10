import { Link, useParams } from 'react-router-dom'
import { HourglassIcon } from '@/components/icons'
import { Button, Field, Textarea } from '@/components/ui'
import { TicketActionHeader } from '@/layouts'
import { MY_TICKETS } from '@/pages/_account/fixtures'
import { cn } from '@/lib/cn'

const STEPS = [
  {
    title: 'Request submitted',
    body: "You'll get a confirmation straight away, and your ticket pauses from resale or gifting.",
    active: true,
  },
  {
    title: 'MyTicket reviews it',
    body: "Usually 1–2 working days. We'll notify you either way.",
    active: false,
  },
  {
    title: 'SAR 266.00 lands in your wallet',
    body: 'Withdrawable to your bank, or ready for the next show.',
    active: false,
  },
] as const

/** Refund request — Figma `207:9879`. */
export function RefundRequestPage() {
  const { id = 'winter-nights' } = useParams()
  const ticket = MY_TICKETS.find((item) => item.id === id) ?? MY_TICKETS[0]

  return (
    <>
      <TicketActionHeader label="Request a refund" />
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-xl px-page-gutter pt-[48px] pb-[96px] lg:flex-row lg:items-start lg:gap-[32px]">
        <div className="min-w-0 flex-1">
          <h1 className="text-[36px] leading-[1.03] font-extrabold tracking-[-1.26px] text-ink-primary sm:text-[44px] sm:tracking-[-1.54px]">
            Can&apos;t make it? Get your money back.
          </h1>
          <p className="mt-[10px] max-w-[560px] text-[16px] leading-normal text-ink-secondary">
            You&apos;re inside the free cancellation window. The refund goes to your MyTicket
            wallet, where you can spend it or withdraw it to your bank.
          </p>

          <div className="mt-[30px] flex items-center gap-md rounded-[16px] border border-border-default bg-bg-tint-brand px-[18px] py-[14px]">
            <HourglassIcon size={16} weight="bold" className="shrink-0 text-ink-brand-strong" />
            <p className="min-w-0 flex-1 text-[13.5px] text-ink-secondary">
              <span className="font-bold text-ink-brand-strong">
                Refund window closes Mon 5 Oct, 18:30
              </span>{' '}
              — set by the organizer for this event.
            </p>
            <p className="shrink-0 text-[15px] font-extrabold text-ink-brand-strong">1d 21:16 left</p>
          </div>

          <div className="mt-lg flex flex-col gap-xl rounded-[20px] border border-border-default bg-surface-default p-[26px]">
            <div>
              <p className="text-[15px] font-bold text-ink-primary">This event&apos;s refund policy</p>
              <p className="mt-[10px] text-[14px] leading-[1.6] text-ink-secondary">
                &ldquo;Full refund of the ticket price until 48 hours before doors (Mon 5 Oct,
                18:30). No refunds after that point, except if the event is cancelled or
                rescheduled. The MyTicket platform fee is not refundable.&rdquo; — Nights
                Entertainment Co., the organizer.
              </p>
            </div>

            <div className="rounded-[14px] border border-border-default bg-bg-page px-[18px] py-lg text-[14px]">
              <div className="flex items-center justify-between gap-md">
                <span className="text-ink-secondary">
                  Ticket price · Gold · Floor A · Row C · Seat 12
                </span>
                <span className="text-ink-primary">SAR 280.00</span>
              </div>
              <div className="mt-[8px] flex items-center justify-between gap-md">
                <span className="text-ink-secondary">Platform fee — not refundable</span>
                <span className="text-ink-primary">− SAR 14.00</span>
              </div>
              <div className="mt-[8px] flex items-center justify-between gap-md border-t border-border-divider pt-[9px] font-bold">
                <span className="text-ink-primary">Back to your wallet</span>
                <span className="text-state-success">SAR 266.00</span>
              </div>
            </div>

            <Field
              label={
                <>
                  Tell us why{' '}
                  <span className="font-medium text-ink-muted">— optional, helps the organizer</span>
                </>
              }
              htmlFor="refund-reason"
            >
              <Textarea
                id="refund-reason"
                rows={3}
                className="min-h-[80px]"
                placeholder="e.g. Travel plans changed…"
              />
            </Field>

            <p className="text-[13px] leading-[1.55] text-ink-secondary">
              MyTicket handles the refund, not the organizer. Requests inside the window are usually
              approved within <span className="font-bold text-ink-primary">1–2 working days</span>,
              and the money lands in your wallet as withdrawable balance. Your ticket stays valid
              until the refund is approved.
            </p>

            <div className="flex flex-wrap items-center gap-md">
              <Button size="lg">Request SAR 266.00 back</Button>
              <Link
                to={`/my-tickets/${ticket.id}`}
                className="inline-flex h-[50px] items-center px-[18px] text-[14px] font-medium text-ink-secondary hover:text-ink-brand"
              >
                Keep my ticket
              </Link>
            </div>
          </div>
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
                Refunding
              </p>
              <p className="mt-[5px] text-[20px] leading-[1.15] font-extrabold tracking-[-0.4px] text-ink-primary">
                {ticket.title}
              </p>
              <p className="mt-[6px] text-[13.5px] text-ink-secondary">Thu 8 Oct · 20:00 · Riyadh</p>
              <dl className="mt-[14px] flex flex-col gap-[7px] text-[13.5px]">
                <div className="flex items-center justify-between gap-md">
                  <dt className="text-ink-secondary">Ticket</dt>
                  <dd className="font-bold text-ink-primary">Gold · Floor A · Row C · Seat 12</dd>
                </div>
                <div className="flex items-center justify-between gap-md">
                  <dt className="text-ink-secondary">Order</dt>
                  <dd className="font-bold text-ink-primary">{ticket.orderId}</dd>
                </div>
                <div className="flex items-center justify-between gap-md">
                  <dt className="text-ink-secondary">Paid with</dt>
                  <dd className="font-bold text-ink-primary">Wallet + Visa ••4417</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
            <p className="text-[15px] font-semibold text-ink-primary">
              What happens after you submit
            </p>
            <ol className="mt-md flex flex-col">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-md">
                  <div className="flex w-[10px] shrink-0 flex-col items-center pt-[4px]">
                    <span
                      className={cn(
                        'size-[10px] shrink-0 rounded-[5px] border-2',
                        step.active
                          ? 'border-border-brand-wash bg-ink-brand'
                          : 'border-border-default bg-surface-default',
                      )}
                    />
                    {index < STEPS.length - 1 && (
                      <span className="mt-0 min-h-[40px] w-[2px] flex-1 bg-border-default" />
                    )}
                  </div>
                  <div className={cn('min-w-0 pb-lg', index === STEPS.length - 1 && 'pb-0')}>
                    <p className="text-[13.5px] font-bold text-ink-primary">{step.title}</p>
                    <p className="mt-[2px] text-[12.5px] leading-[1.5] text-ink-secondary">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[16px] border border-border-default bg-bg-page px-[18px] py-lg">
            <p className="text-[13px] leading-[1.55] text-ink-secondary">
              <span className="font-bold text-ink-primary">Rather not lose the fee?</span> If the
              show is in demand, you might get more by{' '}
              <Link
                to={`/my-tickets/${ticket.id}/resell`}
                className="text-ink-brand hover:text-ink-brand-mid"
              >
                listing it on the resale auction
              </Link>{' '}
              — you&apos;d receive 90% of the sale price.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
