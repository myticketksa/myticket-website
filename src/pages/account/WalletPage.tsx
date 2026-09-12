import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownIcon, ArrowUpIcon, ClockIcon } from '@/components/icons'
import { FilterChip } from '@/components/data-display'
import { Button, Field, TextInput } from '@/components/ui'
import { AccountPageHead, AccountSplit } from '@/layouts'
import { ACCOUNT_USER, WALLET_TXNS, type WalletTxnFixture } from '@/pages/_account/fixtures'
import { useGetWalletQuery, useTopUpWalletMutation } from '@/app/api/accountApis'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAuthUser } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'

function formatMoney(value: unknown, fallback: string) {
  if (value == null || value === '') return fallback
  const raw = String(value)
  if (/sar/i.test(raw)) return raw
  const num = Number(value)
  if (!Number.isNaN(num)) return `SAR ${num.toFixed(2)}`
  return raw
}

function mapWalletTxn(record: Record<string, unknown>, index: number): WalletTxnFixture {
  const fallback = WALLET_TXNS[index % WALLET_TXNS.length]
  const amountRaw = record.amount ?? record.value
  const typeRaw = String(
    record.transaction_type ?? record.tone ?? record.type ?? record.direction ?? '',
  ).toLowerCase()
  const tone: WalletTxnFixture['tone'] =
    typeRaw.includes('pending') || record.pending
      ? 'pending'
      : typeRaw.includes('purchase') ||
          typeRaw.includes('debit') ||
          typeRaw.includes('withdraw') ||
          typeRaw.includes('out') ||
          Number(amountRaw) < 0
        ? 'debit'
        : 'credit'

  let amount = fallback.amount
  if (amountRaw != null) {
    const num = Number(amountRaw)
    const signed = tone === 'debit' ? -Math.abs(num) : Math.abs(num)
    amount = Number.isNaN(num)
      ? String(amountRaw)
      : `${signed >= 0 ? '+' : '−'} SAR ${Math.abs(num).toFixed(2)}`
  }

  const typeLabel = typeRaw
    ? typeRaw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : fallback.label

  return {
    label: String(record.label ?? record.title ?? record.description ?? typeLabel),
    detail: String(record.detail ?? record.reference ?? record.order_id ?? fallback.detail),
    date: String(record.date ?? record.created_at ?? fallback.date),
    amount,
    status: String(record.status ?? (tone === 'pending' ? 'Pending' : 'Cleared')),
    tone,
  }
}

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

/** Wallet — Figma `207:11086`. Top-up body matches Postman `{ amount, paymentMethod }`. */
export function WalletPage() {
  const [filter, setFilter] = useState(0)
  const [topUpAmount, setTopUpAmount] = useState('100')
  const [showTopUp, setShowTopUp] = useState(false)
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const { data: wallet } = useGetWalletQuery()
  const [topUp, topUpState] = useTopUpWalletMutation()

  const balances = useMemo(
    () => ({
      available: formatMoney(user?.walletBalance, ACCOUNT_USER.walletBalance),
      pending: ACCOUNT_USER.walletPending,
      earnedYear: ACCOUNT_USER.walletEarnedYear,
    }),
    [user?.walletBalance],
  )

  const transactions = useMemo(() => {
    const list = wallet?.transactions
    if (Array.isArray(list) && list.length > 0) {
      return list.map(mapWalletTxn)
    }
    return WALLET_TXNS
  }, [wallet])

  const filteredTxns = useMemo(() => {
    if (filter === 0) return transactions
    if (filter === 1) return transactions.filter((txn) => txn.tone === 'credit')
    if (filter === 2) return transactions.filter((txn) => txn.tone === 'debit')
    return transactions.filter((txn) => txn.tone === 'pending')
  }, [filter, transactions])

  async function handleTopUp() {
    const amount = Number(topUpAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      dispatch(toastPushed('error', 'Enter a valid top-up amount'))
      return
    }
    try {
      await topUp({ amount, paymentMethod: 'CREDIT' }).unwrap()
      dispatch(toastPushed('success', 'Top-up submitted'))
      setShowTopUp(false)
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Top-up failed')))
    }
  }

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
                {balances.available}
              </p>
              <div className="mt-[18px] flex flex-wrap gap-[9px]">
                <Button
                  size="md"
                  className="h-[42px] rounded-[21px] bg-bg-page px-[18px] text-ink-primary hover:bg-bg-page hover:text-ink-brand"
                  onClick={() => setShowTopUp((open) => !open)}
                  disabled={topUpState.isLoading}
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
              {showTopUp && (
                <div className="mt-[16px] rounded-[14px] border border-bg-page/20 bg-bg-page/10 p-[14px]">
                  <p className="text-[12px] font-bold tracking-[0.06em] text-bg-page/70 uppercase">
                    Top-up amount (SAR)
                  </p>
                  <div className="mt-[10px] flex flex-wrap gap-[8px]">
                    {['50', '100', '200', '500'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTopUpAmount(preset)}
                        className={`h-[34px] rounded-[17px] px-[14px] text-[13px] font-semibold ${
                          topUpAmount === preset
                            ? 'bg-bg-page text-ink-primary'
                            : 'border border-bg-page/30 text-bg-page'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <Field className="mt-[12px]" label="Custom amount" htmlFor="topup-amount">
                    <TextInput
                      id="topup-amount"
                      type="number"
                      min={1}
                      value={topUpAmount}
                      onChange={(event) => setTopUpAmount(event.target.value)}
                      className="h-[42px] border-bg-page/30 bg-bg-page text-ink-primary"
                    />
                  </Field>
                  <Button
                    size="md"
                    className="mt-[12px] h-[40px] rounded-[20px] bg-bg-page px-[18px] text-ink-primary"
                    loading={topUpState.isLoading}
                    onClick={() => void handleTopUp()}
                  >
                    Confirm top-up · SAR {topUpAmount || '0'}
                  </Button>
                </div>
              )}
            </div>
            <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
              <p className="text-[12px] font-bold tracking-[0.07em] text-ink-muted uppercase">
                Pending
              </p>
              <p className="mt-[10px] text-[32px] leading-none font-extrabold tracking-[-0.96px] text-ink-primary">
                {balances.pending}
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
                {balances.earnedYear}
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
              {filteredTxns.map((txn) => (
                <li
                  key={`${txn.label}-${txn.date}`}
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
