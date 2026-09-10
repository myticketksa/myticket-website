import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownIcon, ArrowUpIcon, ClockIcon } from '@/components/icons'
import { FilterChip } from '@/components/data-display'
import { Button } from '@/components/ui'
import { AccountPageHead, AccountSplit } from '@/layouts'
import { ACCOUNT_USER, WALLET_TXNS } from '@/pages/_account/fixtures'

const FILTERS = ['All', 'Money in', 'Money out', 'Pending'] as const

function WalletAside() {
  return (
    <div className="flex flex-col gap-[14px]">
      <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
        <p className="text-[15px] font-semibold text-ink-primary">Withdraw to your bank</p>
        <p className="mt-xs text-[13px] leading-[1.5] text-ink-secondary">
          Payouts land in 2–3 working days. Minimum SAR 50.
        </p>
        <div className="mt-[14px] rounded-[14px] border border-border-default bg-bg-page p-[14px]">
          <p className="text-[12px] font-bold tracking-[0.06em] text-ink-muted uppercase">
            Verified account
          </p>
          <p className="mt-[5px] text-[14px] font-semibold text-ink-primary">
            Al Rajhi Bank · Sara Alharbi
          </p>
          <p className="mt-[2px] text-[13px] text-ink-secondary">SA •••• •••• •••• 4821</p>
        </div>
        <Button size="md" className="mt-[13px] w-full">
          Request a withdrawal
        </Button>
      </div>
      <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
        <p className="text-[15px] font-semibold text-ink-primary">Payment methods</p>
        <ul className="mt-md flex flex-col gap-[10px]">
          <li className="flex items-center gap-md rounded-[14px] border border-border-default px-[14px] py-md">
            <span className="rounded-[6px] bg-payment-visa px-[9px] py-[5px] text-[11px] font-bold text-ink-inverse">
              VISA
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ink-primary">Visa •••• 4417</p>
              <p className="text-[12px] text-ink-secondary">Default · expires 09/28</p>
            </div>
          </li>
          <li className="flex items-center gap-md rounded-[14px] border border-border-default px-[14px] py-md">
            <span className="rounded-[6px] bg-brand-identity-end px-[9px] py-[5px] text-[11px] font-bold text-ink-inverse">
              mada
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ink-primary">mada •••• 9032</p>
              <p className="text-[12px] text-ink-secondary">Expires 02/29</p>
            </div>
          </li>
        </ul>
        <Button variant="secondary" size="md" className="mt-[13px] h-[40px] w-full rounded-[20px] bg-bg-page">
          Add a card
        </Button>
      </div>
      <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
        <p className="text-[15px] font-semibold text-ink-primary">How cashback works</p>
        <p className="mt-sm text-[13px] leading-[1.5] text-ink-secondary">
          Earn on eligible nights. Pending amounts clear the day after the event.
        </p>
        <Link to="/help" className="mt-lg inline-flex text-[14px] font-semibold text-ink-brand">
          Read the guide →
        </Link>
      </div>
    </div>
  )
}

/** Wallet — Figma `207:11086`. */
export function WalletPage() {
  const [filter, setFilter] = useState(0)

  return (
    <>
      <AccountPageHead
        eyebrow="Your account"
        title="Wallet"
        subtitle="Cashback from nights you've been to, refunds, and money from tickets you've resold. Spend it at checkout or withdraw it to your bank."
      />
      <AccountSplit aside={<WalletAside />}>
        <div className="flex flex-col gap-[22px]">
          <div className="grid gap-lg md:grid-cols-[1.4fr_1fr_1fr]">
            <div className="rounded-[20px] bg-surface-inverse p-3xl text-bg-page">
              <p className="text-[12px] font-bold tracking-[0.08em] text-bg-page/60 uppercase">
                Available to spend
              </p>
              <p className="mt-[10px] text-[52px] leading-none font-extrabold tracking-[-1.56px]">
                {ACCOUNT_USER.walletBalance}
              </p>
              <div className="mt-[18px] flex flex-wrap gap-[9px]">
                <Button
                  size="md"
                  className="h-[42px] rounded-[21px] bg-bg-page px-[18px] text-ink-primary hover:bg-bg-page hover:text-ink-brand"
                >
                  Add funds
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="h-[42px] rounded-[21px] border-bg-page/32 bg-transparent px-[18px] text-bg-page hover:border-bg-page hover:text-bg-page"
                >
                  Withdraw
                </Button>
              </div>
            </div>
            <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
              <p className="text-[12px] font-bold tracking-[0.07em] text-ink-muted uppercase">
                Pending
              </p>
              <p className="mt-[10px] text-[32px] leading-none font-extrabold tracking-[-0.96px] text-ink-primary">
                {ACCOUNT_USER.walletPending}
              </p>
              <p className="mt-auto pt-lg text-[13px] leading-[1.45] text-ink-secondary">
                Cashback clears the day after Winter Nights.
              </p>
            </div>
            <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
              <p className="text-[12px] font-bold tracking-[0.07em] text-ink-muted uppercase">
                Earned this year
              </p>
              <p className="mt-[10px] text-[32px] leading-none font-extrabold tracking-[-0.96px] text-ink-primary">
                {ACCOUNT_USER.walletEarnedYear}
              </p>
              <p className="mt-auto pt-lg text-[13px] leading-[1.45] text-ink-secondary">
                Cashback and resale, across 6 nights out.
              </p>
            </div>
          </div>

          <section className="overflow-hidden rounded-[20px] border border-border-default bg-surface-default">
            <div className="flex flex-wrap items-center justify-between gap-md px-[22px] py-[18px]">
              <h2 className="text-[17px] font-semibold text-ink-primary">Activity</h2>
              <div className="flex flex-wrap items-center gap-[7px]">
                {FILTERS.map((label, index) => (
                  <FilterChip
                    key={label}
                    selected={filter === index}
                    onClick={() => setFilter(index)}
                    className="h-[32px] rounded-[16px] px-md text-[13px] font-semibold"
                  >
                    {label}
                  </FilterChip>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  className="ml-[6px] h-[32px] rounded-[16px] px-md text-[13px] text-ink-secondary"
                >
                  Export CSV
                </Button>
              </div>
            </div>
            <div className="h-px bg-border-divider" />
            <ul>
              {WALLET_TXNS.map((txn) => (
                <li
                  key={txn.label}
                  className="flex flex-wrap items-center gap-lg border-b border-border-divider px-[22px] py-[15px] last:border-0"
                >
                  <div
                    className={`flex size-[34px] items-center justify-center rounded-[17px] ${
                      txn.tone === 'debit' ? 'bg-border-divider' : 'bg-bg-tint-brand'
                    }`}
                  >
                    {txn.tone === 'pending' ? (
                      <ClockIcon size={14} className="text-ink-brand" />
                    ) : txn.tone === 'debit' ? (
                      <ArrowUpIcon size={14} className="text-ink-secondary" />
                    ) : (
                      <ArrowDownIcon size={14} className="text-ink-brand" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 basis-[240px]">
                    <p className="text-[15px] font-semibold text-ink-primary">{txn.label}</p>
                    <p className="mt-[2px] text-[13px] text-ink-secondary">{txn.detail}</p>
                  </div>
                  <p className="w-[120px] text-[13px] text-ink-secondary">{txn.date}</p>
                  <div className="w-[116px] text-right">
                    <p
                      className={`text-[15px] font-bold ${
                        txn.tone === 'credit'
                          ? 'text-ink-link-hover'
                          : txn.tone === 'pending'
                            ? 'text-ink-muted'
                            : 'text-ink-primary'
                      }`}
                    >
                      {txn.amount}
                    </p>
                    <p
                      className={`text-[12px] ${
                        txn.tone === 'pending' ? 'text-ink-brand-strong' : 'text-ink-muted'
                      }`}
                    >
                      {txn.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </AccountSplit>
    </>
  )
}
