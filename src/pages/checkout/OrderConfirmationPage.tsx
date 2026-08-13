import { Link } from 'react-router-dom'
import checkIcon from '@/assets/checkout/check-26.svg'
import { DownloadIcon, ShareIcon } from '@/components/icons'
import { Divider, PriceDisplay } from '@/components/data-display'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

const TICKETS = [
  {
    id: 'MT-84193-1',
    seat: 'Floor A · Row H · Seat 12',
    gate: 'Scan at Gate 3',
  },
  {
    id: 'MT-84193-2',
    seat: 'Floor A · Row H · Seat 13',
    gate: 'Scan at Gate 3',
  },
] as const

const NEXT_STEPS = [
  'Your tickets live in My tickets — offline QR codes work even without signal.',
  'Share a ticket with a friend and they get their own QR the moment they accept.',
  "We'll remind you an hour before doors with the gate and bag-policy notes.",
] as const

/** Decorative QR stand-in — Figma draws a dense matrix; a seeded grid keeps the stub readable. */
function TicketQr({ seed }: { seed: number }) {
  const cells = Array.from({ length: 21 * 21 }, (_, index) => {
    const x = index % 21
    const y = Math.floor(index / 21)
    const finder =
      (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
    const on = finder
      ? x === 0 ||
        y === 0 ||
        x === 6 ||
        y === 6 ||
        (x > 13 && (x === 14 || x === 20 || y === 0 || y === 6)) ||
        (y > 13 && (y === 14 || y === 20 || x === 0 || x === 6)) ||
        (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
        (x >= 16 && x <= 18 && y >= 2 && y <= 4) ||
        (x >= 2 && x <= 4 && y >= 16 && y <= 18)
      : ((x * 17 + y * 13 + seed * 7) % 5) > 1
    return on
  })

  return (
    <div className="grid size-[105px] grid-cols-[repeat(21,minmax(0,1fr))] gap-px bg-surface-default p-[2px]">
      {cells.map((on, index) => (
        <span
          key={index}
          className={cn('size-full', on ? 'bg-surface-inverse' : 'bg-surface-default')}
        />
      ))}
    </div>
  )
}

/**
 * Order Confirmation — Figma `207:8462`. Uses `MainLayout` (SiteHeader + SiteFooter).
 */
export function OrderConfirmationPage() {
  return (
    <PageSection padTop={52} padBottom={96}>
      <div className="mx-auto flex max-w-[1040px] flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-[32px] bg-state-success-tint">
          <img src={checkIcon} alt="" className="size-[26px]" />
        </div>
        <h1 className="mt-[18px] text-[50px] leading-[1.02] font-extrabold tracking-[-1.75px] text-ink-primary">
          You&apos;re going.
        </h1>
        <p className="mt-[10px] max-w-[640px] text-[17px] text-ink-secondary">
          Payment went through and your 2 tickets are ready. We&apos;ve emailed them to
          sara@email.com too.
        </p>
        <p className="mt-sm text-[13.5px] font-bold">
          <span className="text-ink-muted">Order reference</span>{' '}
          <span className="text-ink-primary">MT-2026-84193</span>{' '}
          <span className="text-ink-muted">· 4 Aug 2026, 21:14</span>
        </p>
      </div>

      <div className="mx-auto mt-[40px] flex max-w-[1040px] flex-col gap-[32px] lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-lg">
          {TICKETS.map((ticket, index) => (
            <article
              key={ticket.id}
              className="flex overflow-hidden rounded-[20px] border border-border-default bg-surface-default"
            >
              <div className="min-w-0 flex-1 px-[26px] py-[22px]">
                <p className="text-[12px] font-bold tracking-[0.96px] text-brand-gradient-end">
                  GOLD · SEATED
                </p>
                <h2 className="mt-[6px] text-[24px] leading-[1.1] font-extrabold tracking-[-0.6px] text-ink-primary">
                  Winter Nights: Live at King Abdullah Park
                </h2>
                <p className="mt-[6px] text-[14px] text-ink-secondary">
                  Thu 8 Oct 2026 · 20:00 · King Abdullah Park, Riyadh
                </p>
                <div className="mt-lg grid gap-[26px] sm:grid-cols-3">
                  <div>
                    <p className="text-[11.5px] font-bold tracking-[0.69px] text-ink-muted">
                      SEAT
                    </p>
                    <p className="text-[15px] font-bold text-ink-primary">{ticket.seat}</p>
                  </div>
                  <div>
                    <p className="text-[11.5px] font-bold tracking-[0.69px] text-ink-muted">
                      HOLDER
                    </p>
                    <p className="text-[15px] font-bold text-ink-primary">Sara Alghamdi</p>
                  </div>
                  <div>
                    <p className="text-[11.5px] font-bold tracking-[0.69px] text-ink-muted">
                      TICKET NO.
                    </p>
                    <p className="text-[15px] font-bold text-ink-primary">{ticket.id}</p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-center justify-center gap-sm border-l-[1.5px] border-dashed border-border-default bg-bg-page px-[22px] py-[18px]">
                <div className="rounded-[10px] border border-border-default bg-surface-default p-sm">
                  <TicketQr seed={index + 1} />
                </div>
                <p className="text-[12px] font-semibold text-ink-secondary">{ticket.gate}</p>
              </div>
            </article>
          ))}

          <section className="rounded-[18px] border border-border-default bg-surface-default p-[22px]">
            <h3 className="text-[17px] font-semibold text-ink-primary">What happens next</h3>
            <ol className="mt-lg flex flex-col gap-md">
              {NEXT_STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-[12px]">
                  <span className="flex size-[28px] shrink-0 items-center justify-center rounded-pill bg-bg-tint-brand text-[13px] font-bold text-ink-brand">
                    {index + 1}
                  </span>
                  <p className="text-[14px] leading-[1.5] text-ink-primary">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-md lg:w-[340px]">
          <div className="rounded-[20px] border border-border-default bg-surface-default p-[24px]">
            <h3 className="text-[15px] font-semibold text-ink-primary">What you paid</h3>
            <div className="mt-md flex flex-col gap-sm text-[14px]">
              <div className="flex justify-between gap-md">
                <span className="text-ink-secondary">2 × Gold · Floor A</span>
                <PriceDisplay context="row">SAR 560.00</PriceDisplay>
              </div>
              <div className="flex justify-between gap-md">
                <span className="text-ink-secondary">Service fee</span>
                <PriceDisplay context="row">SAR 28.00</PriceDisplay>
              </div>
              <div className="flex justify-between gap-md">
                <span className="text-ink-secondary">VAT 15%</span>
                <PriceDisplay context="row">SAR 0.00</PriceDisplay>
              </div>
            </div>
            <Divider tone="divider" className="my-md" />
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-semibold text-ink-primary">Total</span>
              <PriceDisplay context="amount">SAR 588.00</PriceDisplay>
            </div>
            <div className="mt-md flex flex-col gap-[6px] text-[13px] text-ink-secondary">
              <div className="flex justify-between">
                <span>Wallet balance</span>
                <span>SAR 120.00</span>
              </div>
              <div className="flex justify-between">
                <span>Visa ···· 4417</span>
                <span>SAR 468.00</span>
              </div>
            </div>
            <div className="mt-md flex items-center justify-between rounded-[14px] bg-bg-tint-brand px-lg py-[14px] text-[13px] font-semibold text-ink-brand-strong">
              <span>Cashback earned</span>
              <span>+ SAR 21.00</span>
            </div>
          </div>

          <Link
            to="/my-tickets"
            className={cn(
              'inline-flex h-[50px] w-full items-center justify-center rounded-[25px]',
              'bg-brand-gradient text-[15px] font-bold text-ink-inverse',
              'hover:bg-none hover:bg-brand-primary',
            )}
          >
            Go to my tickets
          </Link>

          <div className="grid grid-cols-2 gap-sm">
            <Button type="button" variant="secondary" size="sm" icon={<DownloadIcon size={14} />}>
              Download all
            </Button>
            <Button type="button" variant="secondary" size="sm">
              Add to phone wallet
            </Button>
            <Button type="button" variant="secondary" size="sm" icon={<ShareIcon size={14} />}>
              Share the night
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
              Keep browsing
            </Link>
          </div>

          <p className="text-[12px] leading-[1.55] text-ink-muted">
            Full refund until 72 hours before doors. After that, list unused tickets on the{' '}
            <Link to="/auctions" className="font-semibold text-ink-brand">
              resale auction
            </Link>
            .
          </p>
        </aside>
      </div>
    </PageSection>
  )
}
