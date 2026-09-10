import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Field, TextInput, Textarea } from '@/components/ui'
import { FilterChip } from '@/components/data-display'
import { TicketActionHeader } from '@/layouts'
import { MY_TICKETS } from '@/pages/_account/fixtures'

/** Gift / transfer ticket — Figma `207:9806`. */
export function GiftTicketPage() {
  const { id = 'winter-nights' } = useParams()
  const ticket = MY_TICKETS.find((item) => item.id === id) ?? MY_TICKETS[0]
  const [mode, setMode] = useState<'email' | 'phone'>('email')

  return (
    <>
      <TicketActionHeader label="Send a ticket" />
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-xl px-page-gutter pt-[48px] pb-[96px] lg:flex-row lg:items-start lg:gap-[32px]">
        <div className="min-w-0 flex-1">
          <h1 className="text-[36px] leading-[1.03] font-extrabold tracking-[-1.26px] text-ink-primary sm:text-[44px] sm:tracking-[-1.54px]">
            Send this ticket to a friend.
          </h1>
          <p className="mt-[10px] max-w-[560px] text-[16px] leading-normal text-ink-secondary">
            They&apos;ll get it instantly and it becomes theirs the moment they claim it — their own
            name, their own QR code.
          </p>

          <div className="mt-[30px] flex flex-col gap-xl rounded-[20px] border border-border-default bg-surface-default p-[26px]">
            <div>
              <p className="text-[13px] font-semibold text-ink-primary">Send it to</p>
              <div className="mt-[8px] flex flex-wrap gap-[8px]">
                <FilterChip
                  selected={mode === 'email'}
                  onClick={() => setMode('email')}
                  className="h-[36px] rounded-[18px] px-lg text-[13.5px] font-semibold"
                >
                  Email address
                </FilterChip>
                <FilterChip
                  selected={mode === 'phone'}
                  onClick={() => setMode('phone')}
                  className="h-[36px] rounded-[18px] px-lg text-[13.5px] font-semibold"
                >
                  Phone number
                </FilterChip>
              </div>
              <TextInput
                id="recipient"
                className="mt-[10px]"
                type={mode === 'email' ? 'email' : 'tel'}
                placeholder={mode === 'email' ? 'friend@email.com' : '+966 5X XXX XXXX'}
              />
              <p className="mt-[7px] text-[12.5px] text-ink-muted">
                If they don&apos;t have a MyTicket account yet, we&apos;ll help them make one in a
                minute.
              </p>
            </div>

            <Field
              label={
                <>
                  A note with it{' '}
                  <span className="font-medium text-ink-muted">— optional</span>
                </>
              }
              htmlFor="gift-note"
            >
              <Textarea
                id="gift-note"
                rows={3}
                className="min-h-[88px]"
                placeholder="Happy birthday! See you at the gate at 19:30"
              />
            </Field>

            <div className="rounded-[14px] border border-border-default bg-bg-page px-[18px] py-lg">
              <p className="text-[13.5px] font-bold text-ink-primary">
                Before you send — how this works
              </p>
              <ul className="mt-[8px] flex flex-col gap-[6px] text-[13px] leading-[1.5] text-ink-secondary">
                <li>
                  · Once they claim it, the ticket is theirs —{' '}
                  <span className="font-bold text-ink-primary">this can&apos;t be undone.</span>
                </li>
                <li>
                  · They have{' '}
                  <span className="font-bold text-ink-primary">until Wed 7 Oct, 20:00</span> to claim.
                  Unclaimed, it comes straight back to you, still valid.
                </li>
                <li>· Your old QR code stops working the moment the transfer completes.</li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-md">
              <Button size="lg">Send the ticket</Button>
              <Link
                to={`/my-tickets/${ticket.id}`}
                className="inline-flex h-[50px] items-center px-[18px] text-[14px] font-medium text-ink-secondary hover:text-ink-brand"
              >
                Cancel
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
                You&apos;re sending
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
                  <dt className="text-ink-secondary">Ticket no.</dt>
                  <dd className="font-bold text-ink-primary">MT-84193-2</dd>
                </div>
                <div className="flex items-center justify-between gap-md">
                  <dt className="text-ink-secondary">You paid</dt>
                  <dd className="font-bold text-ink-primary">SAR 280.00</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-[16px] border border-border-default bg-bg-page px-[18px] py-lg">
            <p className="text-[13px] leading-[1.55] text-ink-secondary">
              <span className="font-bold text-ink-primary">Why not just screenshot it?</span> A
              screenshot can be copied and refused at the gate. Sending it through MyTicket makes
              the transfer official — one valid code, in their name.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
