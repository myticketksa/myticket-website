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
      <PageSection padTop={24} padBottom={0}>
        <div className="flex flex-col gap-lg lg:flex-row lg:items-start">
          {/* Profile identity card — stacks cleanly under ~1024px */}
          <div className="flex min-w-0 flex-1 flex-col gap-lg rounded-[20px] border border-border-default bg-surface-default p-lg sm:gap-xl sm:rounded-[24px] sm:p-3xl">
            <div className="flex items-start gap-lg sm:items-center sm:gap-xl">
              <Avatar
                initials={initials}
                size="lg"
                className="!size-[64px] shrink-0 !bg-surface-inverse !text-[20px] !text-bg-page sm:!size-[84px] sm:!text-[26px]"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-[24px] leading-[1.15] font-extrabold tracking-[-0.6px] text-balance break-words text-ink-primary sm:text-[32px] sm:tracking-[-0.8px]">
                  {displayName}
                </h1>
                <p className="mt-sm text-[13px] text-pretty text-ink-secondary sm:text-[14px]">
                  {t('profile.memberMeta', {
                    city: ACCOUNT_USER.city,
                    since: ACCOUNT_USER.memberSince,
                    count: ACCOUNT_USER.eventsAttended,
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-sm border-t border-border-divider pt-lg sm:flex sm:flex-wrap sm:items-center sm:gap-xl sm:border-0 sm:pt-0">
              <div className="min-w-0 text-center sm:text-start">
                <p className="text-[18px] font-extrabold tabular-nums text-ink-primary sm:text-[22px]">
                  {ACCOUNT_USER.upcoming}
                </p>
                <p className="mt-[2px] text-[11px] text-ink-muted sm:text-[12px]">
                  {t('profile.upcoming')}
                </p>
              </div>
              <div className="min-w-0 text-center sm:text-start">
                <p className="text-[18px] font-extrabold tabular-nums text-ink-primary sm:text-[22px]">
                  {ACCOUNT_USER.eventsAttended}
                </p>
                <p className="mt-[2px] text-[11px] text-ink-muted sm:text-[12px]">
                  {t('profile.attended')}
                </p>
              </div>
              <div className="min-w-0 text-center sm:text-start">
                <p className="truncate text-[18px] font-extrabold tabular-nums text-ink-primary sm:text-[22px]">
                  {walletLabel}
                </p>
                <p className="mt-[2px] text-[11px] text-ink-muted sm:text-[12px]">
                  {t('profile.wallet')}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-md">
              <Link to="/settings" className="w-full sm:w-auto">
                <Button variant="secondary" size="md" className="w-full min-h-[44px] sm:w-auto">
                  {t('profile.editProfile')}
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="md"
                className="w-full min-h-[44px] sm:w-auto"
                loading={logoutLoading}
                onClick={() => void signOut()}
              >
                {t('profile.signOut')}
              </Button>
            </div>
          </div>

          <div className="w-full shrink-0 lg:max-w-[320px] lg:w-[320px]">
            <AccountWalletCard />
          </div>
        </div>
      </PageSection>

      <PageSection padTop={32} padBottom={0}>
        <div className="mb-lg flex flex-col gap-sm sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-md">
          <div className="min-w-0">
            <h2 className="text-[22px] font-extrabold text-balance text-ink-primary sm:text-[24px]">
              {t('profile.settingsTitle')}
            </h2>
            <p className="mt-xs text-[13px] text-pretty text-ink-secondary sm:text-[14px]">
              {t('profile.settingsSubtitle')}
            </p>
          </div>
          <Link
            to="/settings"
            className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-ink-brand sm:min-h-0"
          >
            {t('profile.openSettings')}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
          {SETTINGS_TILE_KEYS.map((tile) => {
            const Icon = tile.icon
            const title = t(`profile.settingsTiles.${tile.key}.title`)
            const desc = t(`profile.settingsTiles.${tile.key}.desc`)
            const tag = t(`profile.settingsTiles.${tile.key}.tag`)
            return (
              <Link
                key={tile.key}
                to={tile.href}
                className="flex min-h-[44px] flex-col rounded-[18px] border border-border-default bg-surface-default p-lg transition-colors hover:border-border-brand sm:p-xl"
              >
                <div className="flex items-start justify-between gap-md">
                  <Icon size={15} className="text-ink-brand" />
                  <ArrowRightIcon size={14} className="text-ink-muted" />
                </div>
                <p className="mt-md text-[16px] font-bold text-ink-primary">{title}</p>
                <p className="mt-sm text-[13px] text-pretty text-ink-secondary">{desc}</p>
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

      <PageSection padTop={32} padBottom={0}>
        <div className="mb-lg flex flex-col gap-sm sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-lg">
          <div className="min-w-0">
            <h2 className="text-[22px] font-extrabold text-balance text-ink-primary sm:text-[24px]">
              {t('profile.nextNights')}
            </h2>
            <p className="mt-xs text-[13px] text-pretty text-ink-secondary sm:text-[14px]">
              {t('profile.nextNightsMeta', { count: 3, days: 12 })}
            </p>
          </div>
          <Link
            to="/my-tickets"
            className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-ink-brand sm:min-h-0"
          >
            {t('profile.seeAllTickets')}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
          {PROFILE_NIGHTS.map((ticket, index) => {
            const days = Number.parseInt(ticket.countdown.replace(/\D/g, ''), 10)
            const statusKey = `tickets.status.${ticket.status}`
            const statusText = t(statusKey)
            return (
              <article
                key={ticket.id}
                className="overflow-hidden rounded-[20px] border border-border-default bg-surface-default"
              >
                <div className="relative aspect-[16/9] sm:aspect-auto sm:h-[140px]">
                  <img
                    src={PROFILE_TICKET_COVERS[index] ?? PROFILE_TICKET_COVERS[0]}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    loading="lazy"
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
                  <p className="mt-md text-[16px] font-bold text-balance text-ink-primary">
                    {ticket.title}
                  </p>
                  <p className="mt-xs text-[13px] text-ink-secondary">{ticket.meta}</p>
                  <p className="mt-xs text-[13px] font-medium text-ink-muted">{ticket.seat}</p>
                  <div className="mt-lg flex gap-sm">
                    <Link to={`/my-tickets/${ticket.id}`} className="min-w-0 flex-1">
                      <Button size="sm" className="w-full min-h-[44px]">
                        {t('profile.showQr')}
                      </Button>
                    </Link>
                    <Link to={`/my-tickets/${ticket.id}`} className="min-w-0 flex-1">
                      <Button variant="secondary" size="sm" className="w-full min-h-[44px] bg-bg-page">
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

      <PageSection padTop={32} padBottom={96}>
        <div className="mb-lg flex flex-col gap-sm sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-md">
          <h2 className="text-[22px] font-extrabold text-balance text-ink-primary sm:text-[24px]">
            {t('profile.savedForLater')}
          </h2>
          <Link
            to="/favorites"
            className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-ink-brand sm:min-h-0"
          >
            {t('profile.seeAllSaved', { count: savedCount })}
          </Link>
        </div>
        {savedItems.length === 0 ? (
          <p className="rounded-[16px] border border-border-default bg-surface-default px-lg py-lg text-[14px] text-ink-secondary sm:px-xl">
            {t('favorites.emptyTitle')}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-md md:grid-cols-4">
            {savedItems.map((item) => (
              <Link
                key={`${item.source}-${item.itemId}`}
                to={item.href}
                className="overflow-hidden rounded-[16px] border border-border-default bg-surface-default transition-colors hover:border-border-brand"
              >
                <div className="relative aspect-[4/3]">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-bg-tint-brand" />
                  )}
                </div>
                <div className="p-md">
                  <p className="line-clamp-2 text-[13px] font-bold text-ink-primary sm:text-[14px]">
                    {item.title}
                  </p>
                  <p className="mt-[2px] truncate text-[11px] text-ink-muted sm:text-[12px]">
                    {t(`catalog:pages.kind${item.kind}`)}
                    {item.place ? ` · ${item.place}` : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </PageSection>
    </>
  )
}
