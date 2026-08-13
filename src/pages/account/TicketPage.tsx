import { Link, useParams } from 'react-router-dom'
import { QrCodeIcon } from '@/components/icons'
import { StatusBadge } from '@/components/data-display'
import { Button } from '@/components/ui'
import { AccountSplit } from '@/layouts'
import { MY_TICKETS } from '@/pages/_account/fixtures'

const RULES = [
  { title: 'Arrive by 19:30', body: 'Doors open 60 minutes before showtime.' },
  { title: 'Cashless venue', body: 'Cards and Apple Pay only inside the park.' },
  { title: 'One QR per person', body: 'Each ticket scans once — keep phones charged.' },
  { title: 'No professional cameras', body: 'Phones are fine; detachable lenses are not.' },
] as const

/**
 * Ticket detail — Figma `207:9024`.
 * Under AccountLayout (SiteHeader). Content uses a 900/380-ish split via AccountSplit.
 */
export function TicketPage() {
  const { id = 'winter-nights' } = useParams()
  const ticket = MY_TICKETS.find((item) => item.id === id) ?? MY_TICKETS[0]

  return (
    <AccountSplit
      className="!gap-xl lg:!gap-[40px]"
      aside={
        <div className="flex flex-col gap-lg">
          <div className="overflow-hidden rounded-[20px] border border-border-default">
            <div className="relative h-[140px]">
              <img src={ticket.cover} alt="" className="absolute inset-0 size-full object-cover" />
            </div>
          </div>

          <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
            <p className="text-[16px] font-bold text-ink-primary">Order information</p>
            <dl className="mt-lg flex flex-col gap-md text-[14px]">
              {[
                ['Order reference', ticket.orderId],
                ['Purchased', '12 Sep 2026'],
                ['Price paid (2 seats, incl. VAT)', 'SAR 392'],
                ['Platform fee (included)', 'SAR 24'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-md">
                  <dt className="text-ink-secondary">{label}</dt>
                  <dd className="font-semibold text-ink-primary">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-lg flex items-center gap-md border-t border-border-divider pt-lg">
              <span className="rounded-[8px] bg-bg-warm px-[10px] py-[6px] text-[12px] font-bold uppercase">
                tabby
              </span>
              <p className="text-[13px] text-ink-secondary">4 payments · next due 8 Oct</p>
            </div>
            <Button variant="secondary" size="md" className="mt-lg w-full">
              Download invoice (VAT)
            </Button>
          </div>

          <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
            <p className="text-[16px] font-bold text-ink-primary">Refund policy</p>
            <p className="mt-md text-[14px] leading-[1.55] text-ink-secondary">
              Free refund until 5 Oct 2026. After that, transfer or list on the auction.
            </p>
          </div>

          <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
            <p className="text-[18px] font-extrabold text-ink-primary">
              Get the app for offline QR
            </p>
            <p className="mt-sm text-[14px] text-ink-secondary">
              Your codes keep working even without signal at the gate.
            </p>
            <div className="mt-lg flex gap-sm">
              <Button variant="secondary" size="md" className="flex-1">
                iOS
              </Button>
              <Button variant="secondary" size="md" className="flex-1">
                Android
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-lg">
        <div className="flex flex-wrap items-center justify-between gap-md">
          <div>
            <p className="text-[12px] font-bold tracking-[0.08em] text-ink-muted uppercase">
              Your tickets
            </p>
            <p className="mt-xs text-[16px] font-semibold text-ink-primary">2 tickets</p>
          </div>
          <div className="flex gap-sm">
            <Button variant="secondary" size="sm">
              Add to Apple Wallet
            </Button>
            <Button variant="secondary" size="sm">
              Download PDF
            </Button>
          </div>
        </div>

        {[0, 1].map((seatIndex) => (
          <article
            key={seatIndex}
            className="flex overflow-hidden rounded-[20px] border border-border-default bg-surface-default"
          >
            <div className="min-w-0 flex-1 p-xl">
              <div className="flex flex-wrap items-center gap-[9px]">
                <StatusBadge tone="brandTint">Gold · Floor A</StatusBadge>
                <StatusBadge tone="successTint">Valid</StatusBadge>
                <span className="text-[12px] text-ink-muted">
                  {ticket.orderId}-{seatIndex + 1}
                </span>
              </div>
              <h1 className="mt-md text-[28px] leading-[1.1] font-extrabold tracking-[-0.6px] text-ink-primary">
                {ticket.title}
              </h1>
              <p className="mt-sm text-[14px] text-ink-secondary">{ticket.meta}</p>
              <div className="mt-xl grid grid-cols-2 gap-md sm:grid-cols-5">
                {[
                  ['HOLDER', 'Sara Al-Harbi'],
                  ['GATE', 'Gate 3'],
                  ['BLOCK', 'Floor A'],
                  ['ROW', 'C'],
                  ['SEAT', String(11 + seatIndex)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] font-bold tracking-[0.07em] text-ink-muted uppercase">
                      {label}
                    </p>
                    <p className="mt-xs text-[15px] font-semibold text-ink-primary">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-xl flex flex-wrap gap-sm border-t border-border-divider pt-lg">
                <Link to={`/my-tickets/${ticket.id}/gift`}>
                  <Button variant="secondary" size="sm" className="bg-bg-page">
                    Transfer to a guest
                  </Button>
                </Link>
                <Link to={`/my-tickets/${ticket.id}/refund`}>
                  <Button variant="secondary" size="sm" className="bg-bg-page">
                    Request a refund
                  </Button>
                </Link>
                <Link to={`/my-tickets/${ticket.id}/resell`}>
                  <Button variant="secondary" size="sm" className="bg-bg-page">
                    List for resale
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex w-[200px] shrink-0 flex-col items-center justify-center border-l border-dashed border-border-default bg-bg-warm px-lg py-xl sm:w-[232px]">
              <div className="flex size-[146px] items-center justify-center rounded-[12px] bg-surface-default">
                <QrCodeIcon size={96} className="text-ink-primary" />
              </div>
              <p className="mt-md text-center text-[12px] font-semibold text-ink-primary">
                Show at Gate 3
              </p>
              <p className="text-center text-[12px] text-ink-muted">Works offline in the app</p>
            </div>
          </article>
        ))}

        <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
          <p className="text-[16px] font-bold text-ink-primary">Entry rules</p>
          <div className="mt-lg grid gap-md sm:grid-cols-2">
            {RULES.map((rule) => (
              <div key={rule.title} className="flex gap-md rounded-[14px] bg-bg-page px-lg py-md">
                <span className="mt-[7px] size-[7px] shrink-0 rounded-pill bg-brand-primary" />
                <div>
                  <p className="text-[14px] font-semibold text-ink-primary">{rule.title}</p>
                  <p className="text-[13px] text-ink-secondary">{rule.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-lg text-[12px] text-ink-muted">
            Full house rules are on the event page. Organizer may refuse late entry.
          </p>
        </div>

        <Link
          to="/my-tickets"
          className="mx-auto text-[14px] font-semibold text-ink-secondary hover:text-ink-brand"
        >
          ← Back to my tickets
        </Link>
      </div>
    </AccountSplit>
  )
}
