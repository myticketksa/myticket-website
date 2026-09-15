import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/app/hooks'
import { formatAuthWalletBalance, selectAuthUser } from '@/features/auth/authSlice'
import {
  ArrowRightIcon,
  BellRingingIcon,
  BriefcaseIcon,
  CreditCardIcon,
  GlobeEastIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
  VerifiedIcon,
  WalletIcon,
} from '@/components/icons'
import { Avatar, StatusBadge } from '@/components/data-display'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { PROFILE_TICKET_COVERS } from '@/pages/_account/account-media'
import {
  ACCOUNT_USER,
  PROFILE_NIGHTS,
  SAVED_ITEMS,
} from '@/pages/_account/fixtures'
import { AccountWalletCard } from '@/pages/_account/AccountAside'
import { useSignOut } from '@/lib/auth/useSignOut'

const SETTINGS_TILE_KEYS = [
  {
    key: 'personal',
    href: '/settings',
    icon: UserIcon,
  },
  {
    key: 'email',
    href: '/settings',
    icon: MailIcon,
  },
  {
    key: 'payment',
    href: '/settings',
    icon: CreditCardIcon,
  },
  {
    key: 'wallet',
    href: '/wallet',
    icon: WalletIcon,
  },
  {
    key: 'notifications',
    href: '/notifications',
    icon: BellRingingIcon,
  },
  {
    key: 'security',
    href: '/settings',
    icon: LockIcon,
  },
  {
    key: 'language',
    href: '/settings',
    icon: GlobeEastIcon,
  },
  {
    key: 'privacy',
    href: '/settings',
    icon: ShieldIcon,
  },
] as const

/**
 * Profile / account home — Figma `207:10412`.
 * Full-bleed under AccountLayout (no 964/320 split).
 */
function initialsFromName(name: string): string {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || ACCOUNT_USER.initials
  )
}

export function ProfilePage() {
  const { t } = useTranslation(['account', 'catalog'])
  const user = useAppSelector(selectAuthUser)
  const { signOut, isLoading: logoutLoading } = useSignOut()
  const displayName = user?.name ?? ACCOUNT_USER.name
  const initials = user?.name ? initialsFromName(user.name) : ACCOUNT_USER.initials
  const walletLabel = formatAuthWalletBalance(user?.walletBalance, ACCOUNT_USER.wallet)

  return (
    <>
      <PageSection padTop={40} padBottom={0}>
        <div className="flex flex-wrap items-center justify-between gap-xl rounded-[24px] border border-border-default bg-surface-default px-3xl py-3xl">
          <div className="flex items-center gap-xl">
            <Avatar
              initials={initials}
              size="lg"
              className="!size-[84px] !bg-surface-inverse !text-[26px] !text-bg-page"
            />
            <div>
              <div className="flex items-center gap-sm">
                <h1 className="text-[32px] font-extrabold tracking-[-0.8px] text-ink-primary">
                  {displayName}
                </h1>
                <VerifiedIcon size={20} className="text-state-success" />
              </div>
              <p className="mt-sm text-[14px] text-ink-secondary">
                {t('profile.memberMeta', {
                  city: ACCOUNT_USER.city,
                  since: ACCOUNT_USER.memberSince,
                  count: ACCOUNT_USER.eventsAttended,
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-xl">
            <div className="text-center">
              <p className="text-[22px] font-extrabold text-ink-primary">{ACCOUNT_USER.upcoming}</p>
              <p className="text-[12px] text-ink-muted">{t('profile.upcoming')}</p>
            </div>
            <div className="text-center">
              <p className="text-[22px] font-extrabold text-ink-primary">
                {ACCOUNT_USER.eventsAttended}
              </p>
              <p className="text-[12px] text-ink-muted">{t('profile.attended')}</p>
            </div>
            <div className="text-center">
              <p className="text-[22px] font-extrabold text-ink-primary">{walletLabel}</p>
              <p className="text-[12px] text-ink-muted">{t('profile.wallet')}</p>
            </div>
            <Link to="/settings">
              <Button variant="secondary" size="md">
                {t('profile.editProfile')}
              </Button>
            </Link>
          </div>
        </div>
      </PageSection>

      <PageSection padTop={40} padBottom={0}>
        <div className="mb-lg flex flex-wrap items-end justify-between gap-lg">
          <div>
            <h2 className="text-[24px] font-extrabold text-ink-primary">{t('profile.nextNights')}</h2>
            <p className="mt-xs text-[14px] text-ink-secondary">
              {t('profile.nextNightsMeta', { count: 3, days: 12 })}
            </p>
          </div>
          <Link to="/my-tickets" className="text-[14px] font-semibold text-ink-brand">
            {t('profile.seeAllTickets')}
          </Link>
        </div>
        <div className="grid gap-lg md:grid-cols-3">
          {PROFILE_NIGHTS.map((ticket, index) => {
            const days = Number.parseInt(ticket.countdown.replace(/\D/g, ''), 10)
            const statusKey = `tickets.status.${ticket.status}`
            const statusText = t(statusKey)
            return (
            <article
              key={ticket.id}
              className="overflow-hidden rounded-[20px] border border-border-default bg-surface-default"
            >
              <div className="relative h-[140px]">
                <img
                  src={PROFILE_TICKET_COVERS[index] ?? PROFILE_TICKET_COVERS[0]}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
                {ticket.countdown && Number.isFinite(days) && (
                  <span className="absolute top-md start-md rounded-[12px] bg-surface-inverse px-[10px] py-[5px] text-[11px] font-bold text-bg-page uppercase">
                    {t('profile.inDays', { count: days })}
                  </span>
                )}
              </div>
              <div className="p-lg">
                <StatusBadge tone={ticket.statusTone}>
                  {statusText === statusKey ? ticket.status : statusText}
                </StatusBadge>
                <p className="mt-md text-[16px] font-bold text-ink-primary">{ticket.title}</p>
                <p className="mt-xs text-[13px] text-ink-secondary">{ticket.meta}</p>
                <p className="mt-xs text-[13px] font-medium text-ink-muted">{ticket.seat}</p>
                <div className="mt-lg flex gap-sm">
                  <Link to={`/my-tickets/${ticket.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      {t('profile.showQr')}
                    </Button>
                  </Link>
                  <Link to={`/my-tickets/${ticket.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full bg-bg-page">
                      {t('profile.manage')}
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
            )
          })}
        </div>
      </PageSection>

      <PageSection padTop={40} padBottom={0}>
        <AccountWalletCard />
      </PageSection>

      <PageSection padTop={40} padBottom={0}>
        <div className="mb-lg flex flex-wrap items-end justify-between gap-md">
          <h2 className="text-[24px] font-extrabold text-ink-primary">{t('profile.savedForLater')}</h2>
          <Link to="/saved" className="text-[14px] font-semibold text-ink-brand">
            {t('profile.seeAllSaved', { count: 14 })}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-md md:grid-cols-4">
          {SAVED_ITEMS.slice(0, 4).map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="overflow-hidden rounded-[16px] border border-border-default bg-surface-default hover:border-border-brand"
            >
              <div className="relative aspect-[4/3]">
                <img src={item.cover} alt="" className="absolute inset-0 size-full object-cover" />
              </div>
              <div className="p-md">
                <p className="text-[14px] font-bold text-ink-primary">{item.title}</p>
                <p className="text-[12px] text-ink-muted">
                  {t(`catalog:pages.kind${item.kind}`)} · {item.place}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </PageSection>

      <PageSection padTop={40} padBottom={0}>
        <div className="mb-lg flex flex-wrap items-end justify-between gap-md">
          <div>
            <h2 className="text-[24px] font-extrabold text-ink-primary">
              {t('profile.settingsTitle')}
            </h2>
            <p className="mt-xs text-[14px] text-ink-secondary">{t('profile.settingsSubtitle')}</p>
          </div>
          <Link to="/settings" className="text-[14px] font-semibold text-ink-brand">
            {t('profile.openSettings')}
          </Link>
        </div>
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {SETTINGS_TILE_KEYS.map((tile) => {
            const Icon = tile.icon
            const title = t(`profile.settingsTiles.${tile.key}.title`)
            const desc = t(`profile.settingsTiles.${tile.key}.desc`)
            const tag = t(`profile.settingsTiles.${tile.key}.tag`)
            return (
              <Link
                key={tile.key}
                to={tile.href}
                className="rounded-[18px] border border-border-default bg-surface-default p-xl hover:border-border-brand"
              >
                <div className="flex items-start justify-between gap-md">
                  <Icon size={15} className="text-ink-brand" />
                  <ArrowRightIcon size={14} className="text-ink-muted" />
                </div>
                <p className="mt-md text-[16px] font-bold text-ink-primary">{title}</p>
                <p className="mt-sm text-[13px] text-ink-secondary">{desc}</p>
                <div className="mt-lg">
                  <StatusBadge tone="successTint">
                    {tile.href === '/wallet' ? walletLabel : tag}
                  </StatusBadge>
                </div>
              </Link>
            )
          })}
          <Link
            to="/become-business"
            className="flex flex-col justify-between rounded-[18px] border border-border-default bg-surface-default p-xl hover:border-border-brand sm:col-span-2 lg:col-span-4"
          >
            <div className="flex flex-col items-stretch gap-md sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-md">
                <BriefcaseIcon size={15} className="mt-[2px] shrink-0 text-ink-brand" />
                <div>
                  <p className="text-[16px] font-bold text-ink-primary">{t('profile.becomeBusiness')}</p>
                  <p className="mt-xs text-[13px] text-ink-secondary">
                    {t('profile.becomeBusinessBody')}
                  </p>
                </div>
              </div>
              <Button size="sm" className="w-full sm:w-auto">
                {t('profile.apply')}
              </Button>
            </div>
          </Link>
        </div>
      </PageSection>

      <PageSection padTop={32} padBottom={96}>
        <div className="flex flex-wrap items-center justify-between gap-lg rounded-[16px] border border-border-default bg-surface-default px-xl py-lg">
          <p className="text-[13px] text-ink-secondary">
            {t('profile.signedInDevice', { when: '12 July', device: 'iPhone 15, Riyadh' })}
          </p>
          <div className="flex gap-md">
            <Button variant="secondary" size="sm">
              {t('profile.manageDevices')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={logoutLoading}
              onClick={() => void signOut()}
            >
              {t('profile.signOut')}
            </Button>
          </div>
        </div>
      </PageSection>
    </>
  )
}
