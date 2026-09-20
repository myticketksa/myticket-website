import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetFavoritesQuery } from '@/app/api/accountApis'
import { useAppSelector } from '@/app/hooks'
import { formatAuthWalletBalance, selectAuthUser } from '@/features/auth/authSlice'
import { ACCOUNT_NAV_LINKS, SIDEBAR_RECS } from './fixtures'
import { cn } from '@/lib/cn'

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

/**
 * Shared wallet credit card — Figma aside on My Tickets and siblings.
 * Always reads `user.walletBalance` from the saved login session.
 */
export function AccountWalletCard({ className }: { className?: string } = {}) {
  const { t } = useTranslation('account')
  const user = useAppSelector(selectAuthUser)
  const display = formatAuthWalletBalance(user?.walletBalance)

  return (
    <div
      className={cn(
        'rounded-[20px] border border-border-default bg-surface-inverse p-xl text-bg-page',
        className,
      )}
    >
      <p className="text-[12px] font-bold tracking-[0.08em] text-bg-page uppercase">
        {t('wallet.title')}
      </p>
      <p className="mt-sm text-[38px] leading-none font-extrabold tracking-[-1.14px]">{display}</p>
      <p className="mt-[6px] text-[13px] text-bg-page">{t('wallet.lede')}</p>
      <Link
        to="/wallet"
        className="mt-lg flex h-[40px] w-full items-center justify-center rounded-[20px] bg-bg-page text-[14px] font-semibold text-ink-primary hover:text-ink-brand"
      >
        {t('wallet.open')}
      </Link>
    </div>
  )
}

function useAccountNavLinks(savedCount?: number) {
  const { t } = useTranslation('account')

  return ACCOUNT_NAV_LINKS.map((item) => {
    const label = t(`aside.links.${item.id}.label`)
    const meta =
      item.id === 'favourites' && savedCount != null
        ? t('nav.savedMeta', { count: savedCount })
        : t(`aside.links.${item.id}.meta`)
    return { id: item.id, href: item.href, label, meta }
  })
}

export function AccountNavCard() {
  const { t } = useTranslation('account')
  const navLinks = useAccountNavLinks()

  return (
    <Panel title={t('aside.alsoInAccount')}>
      <ul className="flex flex-col">
        {navLinks.map((item) => (
          <li
            key={item.id}
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
  const { t } = useTranslation('account')
  return (
    <Panel title={t('aside.recsTitle')}>
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
  const { t } = useTranslation('account')
  return (
    <Panel>
      <p className="text-[15px] font-semibold text-ink-primary">{t('aside.supportTitle')}</p>
      <p className="mt-[6px] text-[13px] leading-[1.5] text-ink-secondary">
        {t('aside.supportBody')}
      </p>
      <Link
        to="/support/new"
        className="mt-[14px] flex h-[40px] w-full items-center justify-center rounded-[20px] border border-border-default bg-bg-page text-[14px] font-semibold text-ink-primary hover:border-border-brand hover:text-ink-brand"
      >
        {t('aside.supportCta')}
      </Link>
    </Panel>
  )
}

/** Default aside stack used by My Tickets and sibling list screens. */
export function DefaultAccountAside() {
  const { t } = useTranslation('account')
  const { data: favorites } = useGetFavoritesQuery()
  const savedCount = Array.isArray(favorites) ? favorites.length : undefined
  const navLinks = useAccountNavLinks(savedCount)

  return (
    <div className="flex flex-col gap-[14px]">
      <AccountWalletCard />
      <Panel title={t('aside.alsoInAccount')}>
        <ul className="flex flex-col">
          {navLinks.map((item) => (
            <li
              key={item.id}
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
      <AccountRecsCard />
      <AccountSupportCard />
    </div>
  )
}
