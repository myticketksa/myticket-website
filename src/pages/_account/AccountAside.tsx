import { Link } from 'react-router-dom'
import { ACCOUNT_NAV_LINKS, ACCOUNT_USER, SIDEBAR_RECS } from './fixtures'

function Panel({
  title,
  children,
  className = '',
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-[20px] border border-border-default bg-surface-default p-xl ${className}`}
    >
      {title && <p className="mb-[13px] text-[15px] font-semibold text-ink-primary">{title}</p>}
      {children}
    </div>
  )
}

export function AccountWalletCard({
  balance = ACCOUNT_USER.walletBalance,
}: {
  balance?: string
}) {
  return (
    <div className="rounded-[20px] border border-border-default bg-surface-inverse p-xl text-bg-page">
      <p className="text-[12px] font-bold tracking-[0.08em] text-bg-page uppercase">Wallet</p>
      <p className="mt-sm text-[38px] leading-none font-extrabold tracking-[-1.14px]">{balance}</p>
      <p className="mt-[6px] text-[13px] text-bg-page">
        SAR 21 cashback pending until after Winter Nights.
      </p>
      <Link
        to="/wallet"
        className="mt-lg flex h-[40px] w-full items-center justify-center rounded-[20px] bg-bg-page text-[14px] font-semibold text-ink-primary hover:text-ink-brand"
      >
        Open wallet
      </Link>
    </div>
  )
}

export function AccountNavCard() {
  return (
    <Panel title="Also in your account">
      <ul className="flex flex-col">
        {ACCOUNT_NAV_LINKS.map((item) => (
          <li
            key={item.label}
            className="border-b border-border-divider py-[11px] last:border-b-0 last:pb-0 first:pt-0"
          >
            <Link
              to={item.href}
              className="flex items-center justify-between gap-md text-[14px] text-ink-primary hover:text-ink-brand"
            >
              <span className="font-medium">{item.label}</span>
              <span className="text-[13px] font-normal text-ink-muted">{item.meta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export function AccountRecsCard() {
  return (
    <Panel title="Because you're going to Winter Nights">
      <ul className="flex flex-col gap-md">
        {SIDEBAR_RECS.map((item) => (
          <li key={item.title}>
            <Link to={item.href} className="flex items-center gap-md hover:opacity-90">
              <img
                src={item.cover}
                alt=""
                className="size-[54px] shrink-0 rounded-[10px] object-cover"
              />
              <div className="min-w-0">
                <p className="text-[14px] leading-[1.25] font-semibold text-ink-primary">
                  {item.title}
                </p>
                <p className="mt-[2px] text-[12px] text-ink-secondary">{item.meta}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export function AccountSupportCard() {
  return (
    <Panel>
      <p className="text-[15px] font-semibold text-ink-primary">Something wrong with an order?</p>
      <p className="mt-[6px] text-[13px] leading-[1.5] text-ink-secondary">
        Raise a case and our support team picks it up within a day.
      </p>
      <Link
        to="/support/new"
        className="mt-[14px] flex h-[40px] w-full items-center justify-center rounded-[20px] border border-border-default bg-bg-page text-[14px] font-semibold text-ink-primary hover:border-border-brand hover:text-ink-brand"
      >
        Get help with a ticket
      </Link>
    </Panel>
  )
}

/** Default aside stack used by My Tickets and sibling list screens. */
export function DefaultAccountAside() {
  return (
    <div className="flex flex-col gap-[14px]">
      <AccountWalletCard />
      <AccountNavCard />
      <AccountRecsCard />
      <AccountSupportCard />
    </div>
  )
}
