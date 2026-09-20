import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useGetFavoritesQuery } from '@/app/api/accountApis'
import { useAppSelector } from '@/app/hooks'
import { formatAuthWalletBalance, selectAuthUser } from '@/features/auth/authSlice'
import {
  ArrowRightIcon,
  BellRingingIcon,
  HeartIcon,
  UserIcon,
  WalletIcon,
} from '@/components/icons'
import { Avatar, StatusBadge } from '@/components/data-display'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { PROFILE_TICKET_COVERS } from '@/pages/_account/account-media'
import { ACCOUNT_USER, PROFILE_NIGHTS } from '@/pages/_account/fixtures'
import { AccountWalletCard } from '@/pages/_account/AccountAside'
import { mapFavoriteRecord } from '@/lib/favorites/mapFavoriteRecord'
import { useSignOut } from '@/lib/auth/useSignOut'

const SETTINGS_TILE_KEYS = [
  {
    key: 'personal',
    href: '/settings',
    icon: UserIcon,
  },
  {
    key: 'wallet',
    href: '/wallet',
    icon: WalletIcon,
  },
  {
    key: 'favorites',
    href: '/favorites',
    icon: HeartIcon,
  },
  {
    key: 'notifications',
    href: '/notifications',
    icon: BellRingingIcon,
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
  const { data: favorites } = useGetFavoritesQuery()
  const displayName = user?.name ?? ACCOUNT_USER.name
  const initials = user?.name ? initialsFromName(user.name) : ACCOUNT_USER.initials
  const walletLabel = formatAuthWalletBalance(user?.walletBalance, ACCOUNT_USER.wallet)

  const savedItems = useMemo(() => {
    if (!favorites?.length) return []
    return favorites
      .map((row) => mapFavoriteRecord(row))
      .filter((row): row is NonNullable<typeof row> => row != null)
      .slice(0, 4)
  }, [favorites])
  const savedCount = favorites?.length ?? savedItems.length

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
            <Button
              variant="destructive"
              size="md"
              loading={logoutLoading}
              onClick={() => void signOut()}
            >
              {t('profile.signOut')}
            </Button>
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
          <Link to="/favorites" className="text-[14px] font-semibold text-ink-brand">
            {t('profile.seeAllSaved', { count: savedCount })}
          </Link>
        </div>
        {savedItems.length === 0 ? (
          <p className="rounded-[16px] border border-border-default bg-surface-default px-xl py-lg text-[14px] text-ink-secondary">
            {t('favorites.emptyTitle')}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-md md:grid-cols-4">
            {savedItems.map((item) => (
              <Link
                key={`${item.source}-${item.itemId}`}
                to={item.href}
                className="overflow-hidden rounded-[16px] border border-border-default bg-surface-default hover:border-border-brand"
              >
                <div className="relative aspect-[4/3]">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-bg-tint-brand" />
                  )}
                </div>
                <div className="p-md">
                  <p className="text-[14px] font-bold text-ink-primary">{item.title}</p>
                  <p className="text-[12px] text-ink-muted">
                    {t(`catalog:pages.kind${item.kind}`)}
                    {item.place ? ` · ${item.place}` : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </PageSection>

      <PageSection padTop={40} padBottom={96}>
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
                    {tile.href === '/wallet'
                      ? walletLabel
                      : tile.key === 'favorites'
                        ? String(savedCount)
                        : tag}
                  </StatusBadge>
                </div>
              </Link>
            )
          })}
        </div>
      </PageSection>
    </>
  )
}
