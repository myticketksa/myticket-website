import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { AmountInput, Button, Field, TextInput } from '@/components/ui'
import { FilterChip, MoneyAmount } from '@/components/data-display'
import { SarSymbol } from '@/components/icons'
import { TicketActionHeader } from '@/layouts'
import { MY_TICKETS } from '@/pages/_account/fixtures'
import { cn } from '@/lib/cn'

const END_OPTION_IDS = ['12h', '24h', '2d', 'latest'] as const

/** Resell ticket — Figma `207:9700`. */
export function ResellTicketPage() {
  const { t } = useTranslation('account')
  const { id = 'winter-nights' } = useParams()
  const ticket = MY_TICKETS.find((item) => item.id === id) ?? MY_TICKETS[0]
  const [startingBid, setStartingBid] = useState('250')
  const [buyNow, setBuyNow] = useState('280')
  const [ends, setEnds] = useState<(typeof END_OPTION_IDS)[number]>('24h')

  const bid = Number(startingBid) || 0
  const fee = useMemo(() => Math.round(bid * 0.1 * 100) / 100, [bid])
  const receive = useMemo(() => Math.round((bid - fee) * 100) / 100, [bid, fee])
  const money = (n: number) =>
    n.toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const endLabels: Record<(typeof END_OPTION_IDS)[number], string> = {
    '12h': t('resell.endsIn12h'),
    '24h': t('resell.endsIn24h'),
    '2d': t('resell.endsIn2d'),
    latest: t('resell.endsLatest'),
  }

  return (
    <>
      <TicketActionHeader label={t('resell.header')} />
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-xl px-page-gutter pt-[48px] pb-[96px] lg:flex-row lg:items-start lg:gap-[32px]">
        <div className="min-w-0 flex-1">
          <h1 className="text-heading-h1 text-ink-primary">
            {t('resell.title')}
          </h1>
          <p className="mt-[10px] max-w-[560px] text-[16px] leading-normal text-ink-secondary">
            {t('resell.subtitle')}
          </p>

          <div className="mt-[30px] flex flex-col gap-xl rounded-[20px] border border-border-default bg-surface-default p-[26px]">
            <div className="grid gap-lg sm:grid-cols-2">
              <Field label={t('resell.startingBid')} htmlFor="starting-bid">
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
                    {t('resell.buyNow')}{' '}
                    <span className="font-medium text-ink-muted">{t('resell.buyNowOptional')}</span>
                  </>
                }
                htmlFor="buy-now"
              >
                <TextInput
                  id="buy-now"
                  className="h-[52px] rounded-[13px] text-[20px] font-bold"
                  leading={
                    <span className="text-ink-secondary" aria-hidden>
                      <SarSymbol className="h-[1em] w-auto" />
                    </span>
                  }
                  value={buyNow}
                  onChange={(e) => setBuyNow(e.target.value)}
                />
              </Field>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-ink-primary">{t('resell.auctionEnds')}</p>
              <div className="mt-[8px] flex flex-wrap gap-[8px]">
                {END_OPTION_IDS.map((id) => (
                  <FilterChip
                    key={id}
                    selected={ends === id}
                    onClick={() => setEnds(id)}
                    className="h-[38px] px-lg text-[13.5px] font-semibold"
                  >
                    {endLabels[id]}
                  </FilterChip>
                ))}
              </div>
              <p className="mt-[8px] text-[12.5px] text-ink-muted">{t('resell.closeNote')}</p>
            </div>

            <div className="rounded-[14px] border border-border-default bg-bg-page px-[18px] py-lg">
              <div className="flex flex-col gap-[8px] text-[14px]">
                <div className="flex items-start justify-between gap-md">
                  <span className="min-w-0 flex-1 text-ink-secondary">{t('resell.ifSells')}</span>
                  <MoneyAmount value={money(bid)} className="shrink-0 text-end text-ink-primary" />
                </div>
                <div className="flex items-start justify-between gap-md">
                  <span className="min-w-0 flex-1 text-ink-secondary">{t('resell.commission')}</span>
                  <span className="inline-flex shrink-0 items-center gap-[0.2em] text-end text-ink-primary">
                    − <MoneyAmount value={money(fee)} />
                  </span>
                </div>
                <div className="flex items-start justify-between gap-md border-t border-border-divider pt-[9px] font-bold">
                  <span className="min-w-0 flex-1 text-ink-primary">{t('resell.youReceiveAtLeast')}</span>
                  <MoneyAmount
                    value={money(receive)}
                    className="shrink-0 text-end text-state-success"
                  />
                </div>
              </div>
              <p className="mt-[10px] text-[12.5px] text-ink-muted">
                {t('resell.paidNote', { paid: '280.00' })}
              </p>
            </div>

            <div className="rounded-[14px] border border-border-default bg-surface-default px-[18px] py-lg">
              <p className="text-[13.5px] font-bold text-ink-primary">{t('resell.rulesTitle')}</p>
              <ul className="mt-[8px] flex flex-col gap-[6px] text-[13px] leading-[1.5] text-ink-secondary">
                <li>
                  · {t('resell.ruleCancelBefore')}{' '}
                  <span className="font-bold text-ink-primary">{t('resell.ruleCancelEmphasis')}</span>{' '}
                  {t('resell.ruleCancelAfter')}
                </li>
                <li>· {t('resell.ruleWhileListed')}</li>
                <li>· {t('resell.ruleSold')}</li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-md">
              <Button size="lg">{t('resell.cta')}</Button>
              <Link
                to={`/my-tickets/${ticket.id}`}
                className="inline-flex h-[50px] items-center px-[18px] text-[14px] font-medium text-ink-secondary hover:text-ink-brand"
              >
                {t('resell.keepTicket')}
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
                You&apos;re listing
              </p>
              <p className="mt-[5px] text-[20px] leading-[1.15] font-extrabold tracking-[-0.4px] text-ink-primary">
                {ticket.title}
              </p>
              <p className="mt-[6px] text-[13.5px] text-ink-secondary">Thu 8 Oct · 20:00 · Riyadh</p>
              <dl className="mt-[14px] flex flex-col gap-[7px] text-[13.5px]">
                <div className="flex items-start justify-between gap-md">
                  <dt className="shrink-0 text-ink-secondary">Ticket</dt>
                  <dd className="min-w-0 max-w-[65%] text-end font-bold break-words text-ink-primary">
                    Gold · Floor A · Row C · Seat 12
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-md">
                  <dt className="shrink-0 text-ink-secondary">{t('resell.faceValue')}</dt>
                  <dd className="min-w-0 text-end font-bold text-ink-primary">
                    <MoneyAmount value="280.00" />
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-md">
                  <dt className="shrink-0 text-ink-secondary">{t('resell.soldOut')}</dt>
                  <dd className="min-w-0 text-end font-bold text-ink-brand-strong">3 weeks ago</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
            <p className="text-[15px] font-semibold text-ink-primary">{t('resell.demandTitle')}</p>
            <dl className="mt-[10px] flex flex-col gap-[8px] text-[13.5px]">
                {[
                  [t('resell.waitlistPeople'), '312'],
                  [t('resell.similarSold'), '⃁ 300–360'],
                  [t('resell.activeListings'), '7'],
                ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-md">
                  <dt className="min-w-0 flex-1 text-ink-secondary">{label}</dt>
                  <dd className="shrink-0 text-end font-bold text-ink-primary">{value}</dd>
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
                className={cn(
                  'inline-flex items-center gap-[0.2em] text-ink-brand hover:text-ink-brand-mid',
                )}
              >
                <MoneyAmount value="266.00" /> back to your wallet
              </Link>
              , no waiting for a buyer.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
