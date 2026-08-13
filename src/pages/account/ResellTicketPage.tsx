import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AmountInput, Button, Field, TextInput } from '@/components/ui'
import { FilterChip } from '@/components/data-display'
import { TicketActionHeader } from '@/layouts'
import { MY_TICKETS } from '@/pages/_account/fixtures'
import { cn } from '@/lib/cn'

const END_OPTIONS = [
  { id: '12h', label: 'In 12 hours' },
  { id: '24h', label: 'In 24 hours' },
  { id: '2d', label: 'In 2 days' },
  { id: 'latest', label: 'Mon 5 Oct · latest' },
] as const

/** Resell ticket — Figma `207:9700`. */
export function ResellTicketPage() {
  const { id = 'winter-nights' } = useParams()
  const ticket = MY_TICKETS.find((item) => item.id === id) ?? MY_TICKETS[0]
  const [startingBid, setStartingBid] = useState('250')
  const [buyNow, setBuyNow] = useState('280')
  const [ends, setEnds] = useState<(typeof END_OPTIONS)[number]['id']>('24h')

  const bid = Number(startingBid) || 0
  const fee = useMemo(() => Math.round(bid * 0.1 * 100) / 100, [bid])
  const receive = useMemo(() => Math.round((bid - fee) * 100) / 100, [bid, fee])
  const money = (n: number) =>
    n.toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <>
      <TicketActionHeader label="List for resale" />
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-xl px-page-gutter pt-[48px] pb-[96px] lg:flex-row lg:items-start lg:gap-[32px]">
        <div className="min-w-0 flex-1">
          <h1 className="text-[36px] leading-[1.03] font-extrabold tracking-[-1.26px] text-ink-primary sm:text-[44px] sm:tracking-[-1.54px]">
            Let someone else take your seat.
          </h1>
          <p className="mt-[10px] max-w-[560px] text-[16px] leading-normal text-ink-secondary">
            Your ticket goes up on the MyTicket auction. Buyers bid or buy instantly, the transfer
            is handled for you, and the money lands in your wallet.
          </p>

          <div className="mt-[30px] flex flex-col gap-xl rounded-[20px] border border-border-default bg-surface-default p-[26px]">
            <div className="grid gap-lg sm:grid-cols-2">
              <Field label="Starting bid" htmlFor="starting-bid">
                <AmountInput
                  id="starting-bid"
                  className="h-[52px] w-full rounded-[13px] px-[14px]"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                />
              </Field>
              <Field
                label={
                  <>
                    Buy-now price{' '}
                    <span className="font-medium text-ink-muted">— optional</span>
                  </>
                }
                htmlFor="buy-now"
              >
                <TextInput
                  id="buy-now"
                  className="h-[52px] rounded-[13px] text-[20px] font-bold"
                  leading={<span className="text-[14px] font-semibold text-ink-secondary">SAR</span>}
                  value={buyNow}
                  onChange={(e) => setBuyNow(e.target.value)}
                />
              </Field>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-ink-primary">Auction ends</p>
              <div className="mt-[8px] flex flex-wrap gap-[8px]">
                {END_OPTIONS.map((opt) => (
                  <FilterChip
                    key={opt.id}
                    selected={ends === opt.id}
                    onClick={() => setEnds(opt.id)}
                    className="h-[38px] px-lg text-[13.5px] font-semibold"
                  >
                    {opt.label}
                  </FilterChip>
                ))}
              </div>
              <p className="mt-[8px] text-[12.5px] text-ink-muted">
                Listings always close at least 6 hours before doors, so the buyer can plan their
                night.
              </p>
            </div>

            <div className="rounded-[14px] border border-border-default bg-bg-page px-[18px] py-lg">
              <div className="flex flex-col gap-[8px] text-[14px]">
                <div className="flex items-start justify-between gap-md">
                  <span className="text-ink-secondary">If it sells at your starting bid</span>
                  <span className="text-ink-primary">SAR {money(bid)}</span>
                </div>
                <div className="flex items-start justify-between gap-md">
                  <span className="text-ink-secondary">MyTicket commission · 10%</span>
                  <span className="text-ink-primary">− SAR {money(fee)}</span>
                </div>
                <div className="flex items-start justify-between gap-md border-t border-border-divider pt-[9px] font-bold">
                  <span className="text-ink-primary">You receive at least</span>
                  <span className="text-state-success">SAR {money(receive)}</span>
                </div>
              </div>
              <p className="mt-[10px] text-[12.5px] text-ink-muted">
                You paid SAR 280.00 for this ticket. Bids can&apos;t climb past your starting price
                — you keep 90% of wherever it lands.
              </p>
            </div>

            <div className="rounded-[14px] border border-border-default bg-surface-default px-[18px] py-lg">
              <p className="text-[13.5px] font-bold text-ink-primary">The rules, plainly</p>
              <ul className="mt-[8px] flex flex-col gap-[6px] text-[13px] leading-[1.5] text-ink-secondary">
                <li>
                  · You can cancel the listing any time{' '}
                  <span className="font-bold text-ink-primary">until the first bid lands</span> —
                  after that it must run its course.
                </li>
                <li>· While listed, the ticket can&apos;t be used, gifted, or refunded.</li>
                <li>
                  · Sold: it transfers to the buyer and your QR stops working. Unsold: it comes back
                  to you, still valid for the night.
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-md">
              <Button size="lg">List it on the auction</Button>
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
            <div className="relative h-[189px] bg-gradient-to-br from-[#e8ddd6] to-[#d8ccc4]">
              <img
                src={ticket.cover}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </div>
            <div className="px-xl py-[18px]">
              <p className="text-[12px] font-bold tracking-[0.96px] text-ink-brand-mid uppercase">
                You&apos;re listing
              </p>
              <p className="mt-[5px] text-[20px] leading-[1.15] font-extrabold tracking-[-0.4px] text-ink-primary">
                {ticket.title}
              </p>
              <p className="mt-[6px] text-[13.5px] text-ink-secondary">Thu 8 Oct · 20:00 · Riyadh</p>
              <dl className="mt-[14px] flex flex-col gap-[7px] text-[13.5px]">
                <div className="flex items-start justify-between gap-md">
                  <dt className="text-ink-secondary">Ticket</dt>
                  <dd className="font-bold text-ink-primary">Gold · Floor A · Row C · Seat 12</dd>
                </div>
                <div className="flex items-start justify-between gap-md">
                  <dt className="text-ink-secondary">Face value</dt>
                  <dd className="font-bold text-ink-primary">SAR 280.00</dd>
                </div>
                <div className="flex items-start justify-between gap-md">
                  <dt className="text-ink-secondary">This event sold out</dt>
                  <dd className="font-bold text-ink-brand-strong">3 weeks ago</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
            <p className="text-[15px] font-semibold text-ink-primary">Demand right now</p>
            <dl className="mt-[10px] flex flex-col gap-[8px] text-[13.5px]">
              {[
                ['People on the waitlist', '312'],
                ['Similar seats sold this week', 'SAR 300–360'],
                ['Active listings for this event', '7'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-md">
                  <dt className="text-ink-secondary">{label}</dt>
                  <dd className="font-bold text-ink-primary">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-md text-[12.5px] leading-[1.5] text-ink-muted">
              Waitlisted fans are notified the moment your listing goes live.
            </p>
          </div>

          <div className="rounded-[16px] border border-border-default bg-bg-page px-[18px] py-lg">
            <p className="text-[13px] leading-[1.55] text-ink-secondary">
              <span className="font-bold text-ink-primary">Or get a straight refund:</span> the free
              cancellation window is open until Mon 5 Oct, 18:30 —{' '}
              <Link
                to={`/my-tickets/${ticket.id}/refund`}
                className={cn('text-ink-brand hover:text-ink-brand-mid')}
              >
                SAR 266.00 back to your wallet
              </Link>
              , no waiting for a buyer.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
