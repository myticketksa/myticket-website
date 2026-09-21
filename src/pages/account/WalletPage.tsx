import { useMemo, useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { ArrowDownIcon, ArrowUpIcon, ClockIcon } from '@/components/icons'
import { FilterChip, MoneyAmount } from '@/components/data-display'
import { Button, Field, TextInput } from '@/components/ui'
import { AccountPageHead, AccountSplit } from '@/layouts'
import { ACCOUNT_USER, WALLET_TXNS, type WalletTxnFixture } from '@/pages/_account/fixtures'
import { useGetWalletQuery, useTopUpWalletMutation } from '@/app/api/accountApis'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { formatAuthWalletBalance, selectAuthUser } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'

type TxnTone = WalletTxnFixture['tone']
type AccountT = TFunction<'account'>

function normalizeStatusKey(raw: string): string {
  const value = raw.trim().toLowerCase()
  if (!value || value === 'pending') return 'pending'
  if (value === 'cleared' || value === 'completed' || value === 'success') return 'cleared'
  if (value === 'available' || value === 'ready') return 'available'
  if (value.includes('spent') || value.includes('checkout')) return 'spent'
  return value
}

function translateWalletStatus(t: AccountT, raw: string, tone: TxnTone): string {
  const key = normalizeStatusKey(raw || (tone === 'pending' ? 'pending' : 'cleared'))
  if (key === 'pending') return t('wallet.statusPending')
  if (key === 'cleared') return t('wallet.statusCleared')
  if (key === 'available') return t('wallet.statusAvailable')
  if (key === 'spent') return t('wallet.statusSpent')
  return raw
}

function translateWalletType(t: AccountT, typeRaw: string): string {
  const key = typeRaw.trim().toLowerCase().replace(/\s+/g, '_')
  if (!key) return ''
  const known = t(`wallet.types.${key}`, { defaultValue: '' })
  if (known) return known
  return typeRaw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function mapWalletTxn(
  record: Record<string, unknown>,
  index: number,
  t: AccountT,
): WalletTxnFixture {
  const fallback = WALLET_TXNS[index % WALLET_TXNS.length]!
  const amountRaw = record.amount ?? record.value
  const typeRaw = String(
    record.transaction_type ?? record.tone ?? record.type ?? record.direction ?? '',
  ).toLowerCase()
  const tone: TxnTone =
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
      : `${signed >= 0 ? '+' : '−'} ${Math.abs(num).toFixed(2)}`
  }

  const orderId = record.order_id ?? record.orderId ?? record.reference
  const typeLabel = translateWalletType(t, typeRaw)
  const title = String(record.label ?? record.title ?? record.description ?? '').trim()
  const detailRaw = String(record.detail ?? '').trim()
  const detail =
    detailRaw ||
    (orderId != null && String(orderId)
      ? t('wallet.orderRef', { id: String(orderId) })
      : fallback.detail)

  const statusRaw = String(
    record.status ?? (tone === 'pending' ? 'Pending' : 'Cleared'),
  )

  return {
    label: title || typeLabel || fallback.label,
    detail,
    date: String(record.date ?? record.created_at ?? fallback.date),
    amount,
    status: translateWalletStatus(t, statusRaw, tone),
    tone,
  }
}

function localizeFixtureTxn(txn: WalletTxnFixture, t: AccountT): WalletTxnFixture {
  if (!txn.id) {
    return {
      ...txn,
      status: translateWalletStatus(t, txn.status, txn.tone),
    }
  }
  return {
    ...txn,
    label: t(`wallet.txns.${txn.id}.label`),
    detail: t(`wallet.txns.${txn.id}.detail`),
    date: t(`wallet.txns.${txn.id}.date`),
    status: translateWalletStatus(t, txn.status, txn.tone),
  }
}

const FILTER_IDS = ['all', 'moneyIn', 'moneyOut', 'pending'] as const

/** Wallet — available balance + top-up, pending/earned tiles, activity list. */
export function WalletPage() {
  const { t } = useTranslation('account')
  const [filter, setFilter] = useState(0)
  const [topUpAmount, setTopUpAmount] = useState('100')
  const [showTopUp, setShowTopUp] = useState(false)
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const { data: wallet } = useGetWalletQuery()
  const [topUp, topUpState] = useTopUpWalletMutation()

  const balances = useMemo(
    () => ({
      available: formatAuthWalletBalance(user?.walletBalance, ACCOUNT_USER.walletBalance),
      pending: ACCOUNT_USER.walletPending,
      earnedYear: ACCOUNT_USER.walletEarnedYear,
    }),
    [user?.walletBalance],
  )

  const transactions = useMemo(() => {
    const list = wallet?.transactions
    if (Array.isArray(list) && list.length > 0) {
      return list.map((row, index) => mapWalletTxn(row, index, t))
    }
    return WALLET_TXNS.map((txn) => localizeFixtureTxn(txn, t))
  }, [t, wallet])

  const filteredTxns = useMemo(() => {
    if (filter === 0) return transactions
    if (filter === 1) return transactions.filter((txn) => txn.tone === 'credit')
    if (filter === 2) return transactions.filter((txn) => txn.tone === 'debit')
    return transactions.filter((txn) => txn.tone === 'pending')
  }, [filter, transactions])

  async function handleTopUp() {
    const amount = Number(topUpAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      dispatch(toastPushed('error', t('wallet.invalidAmount')))
      return
    }
    try {
      await topUp({ amount, paymentMethod: 'CREDIT' }).unwrap()
      dispatch(toastPushed('success', t('wallet.topUpSuccess')))
      setShowTopUp(false)
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('wallet.topUpFailed'))))
    }
  }

  return (
    <>
      <AccountPageHead
        eyebrow={t('eyebrow')}
        title={t('wallet.title')}
        subtitle={t('wallet.subtitle')}
      />
      <AccountSplit>
        <div className="flex flex-col gap-[22px]">
          <div className="grid gap-lg md:grid-cols-1">
            <div className="rounded-[20px] bg-surface-inverse p-3xl text-bg-page">
              <p className="text-[12px] font-bold tracking-[0.08em] text-bg-page/60 uppercase">
                {t('wallet.available')}
              </p>
              <p className="mt-[10px] text-[36px] leading-none font-extrabold tracking-[-1.56px] sm:text-[44px] lg:text-[52px]">
                <MoneyAmount value={balances.available} />
              </p>
              <div className="mt-[18px]">
                <Button
                  size="md"
                  className="h-[42px] rounded-[21px] bg-bg-page px-[18px] text-ink-primary hover:bg-bg-page hover:text-ink-brand"
                  onClick={() => setShowTopUp((open) => !open)}
                  disabled={topUpState.isLoading}
                >
                  {t('wallet.addFunds')}
                </Button>
              </div>
              {showTopUp && (
                <div className="mt-[16px] rounded-[14px] border border-bg-page/20 bg-bg-page/10 p-[14px]">
                  <p className="text-[12px] font-bold tracking-[0.06em] text-bg-page/70 uppercase">
                    {t('wallet.topUpAmount')}
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
                  <Field className="mt-[12px]" label={t('wallet.customAmount')} htmlFor="topup-amount">
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
                    {t('wallet.confirmTopUp', { amount: topUpAmount || '0' })}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <section className="overflow-hidden rounded-[20px] border border-border-default bg-surface-default">
            <div className="flex flex-wrap items-center justify-between gap-md px-[22px] py-[18px]">
              <h2 className="text-[17px] font-semibold text-ink-primary">{t('wallet.activity')}</h2>
              <div className="flex flex-wrap items-center gap-[7px]">
                {FILTER_IDS.map((id, index) => (
                  <FilterChip
                    key={id}
                    selected={filter === index}
                    onClick={() => setFilter(index)}
                    className="h-[32px] rounded-[16px] px-md text-[13px] font-semibold"
                  >
                    {t(`wallet.filters.${id}`)}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div className="h-px bg-border-divider" />
            {filteredTxns.length === 0 ? (
              <p className="px-[22px] py-[28px] text-[14px] text-ink-secondary">
                {t('wallet.emptyActivity')}
              </p>
            ) : (
              <ul>
                {filteredTxns.map((txn) => (
                  <li
                    key={`${txn.label}-${txn.date}-${txn.amount}`}
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
                    <div className="w-[116px] text-end">
                      <MoneyAmount
                        value={txn.amount}
                        className={`text-[15px] font-bold ${
                          txn.tone === 'credit'
                            ? 'text-ink-link-hover'
                            : txn.tone === 'pending'
                              ? 'text-ink-muted'
                              : 'text-ink-primary'
                        }`}
                      />
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
            )}
          </section>
        </div>
      </AccountSplit>
    </>
  )
}
