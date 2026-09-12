import { Link, useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '@/app/api/authApi'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { credentialsCleared, selectAuthUser } from '@/features/auth/authSlice'
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
  AUCTION_ACTIVITY,
  PROFILE_NIGHTS,
  SAVED_ITEMS,
  WALLET_TXNS,
} from '@/pages/_account/fixtures'

const SETTINGS_TILES = [
  {
    title: 'Personal details',
    desc: 'Name, photo, city',
    tag: 'Verified',
    href: '/settings',
    icon: UserIcon,
  },
  {
    title: 'Email & phone',
    desc: 'Login contacts',
    tag: '2 confirmed',
    href: '/settings',
    icon: MailIcon,
  },
  {
    title: 'Payment methods',
    desc: 'Cards and Tabby',
    tag: '3 saved',
    href: '/settings',
    icon: CreditCardIcon,
  },
  {
    title: 'Wallet & payouts',
    desc: 'Balance and bank',
    tag: 'Open',
    href: '/wallet',
    icon: WalletIcon,
  },
  {
    title: 'Notifications',
    desc: 'Push, email, SMS',
    tag: '6 on',
    href: '/notifications',
    icon: BellRingingIcon,
  },
  {
    title: 'Security & sign-in',
    desc: 'Password and 2FA',
    tag: '2FA on',
    href: '/settings',
    icon: LockIcon,
  },
  {
    title: 'Language & region',
    desc: 'Display and currency',
    tag: 'English · SAR',
    href: '/settings',
    icon: GlobeEastIcon,
  },
  {
    title: 'Privacy & data',
    desc: 'Downloads and delete',
    tag: 'Manage',
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
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const [logout, logoutState] = useLogoutMutation()
  const displayName = user?.name ?? ACCOUNT_USER.name
  const initials = user?.name ? initialsFromName(user.name) : ACCOUNT_USER.initials
  const walletLabel =
    user?.walletBalance != null
      ? `SAR ${Number(user.walletBalance).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`
      : ACCOUNT_USER.wallet

  async function handleSignOut() {
    try {
      await logout().unwrap()
    } catch {
      /* Clear local session even if the API call fails */
    }
    dispatch(credentialsCleared())
    navigate('/sign-in')
  }

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
                {ACCOUNT_USER.city} · Member since {ACCOUNT_USER.memberSince} ·{' '}
                {ACCOUNT_USER.eventsAttended} events attended
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-xl">
            <div className="text-center">
              <p className="text-[22px] font-extrabold text-ink-primary">{ACCOUNT_USER.upcoming}</p>
              <p className="text-[12px] text-ink-muted">Upcoming</p>
            </div>
            <div className="text-center">
              <p className="text-[22px] font-extrabold text-ink-primary">
                {ACCOUNT_USER.eventsAttended}
              </p>
              <p className="text-[12px] text-ink-muted">Attended</p>
            </div>
            <div className="text-center">
              <p className="text-[22px] font-extrabold text-ink-primary">{walletLabel}</p>
              <p className="text-[12px] text-ink-muted">Wallet</p>
            </div>
            <Link to="/settings">
              <Button variant="secondary" size="md">
                Edit profile
              </Button>
            </Link>
          </div>
        </div>
      </PageSection>

      <PageSection padTop={40} padBottom={0}>
        <div className="mb-lg flex flex-wrap items-end justify-between gap-lg">
          <div>
            <h2 className="text-[24px] font-extrabold text-ink-primary">Your next nights out</h2>
            <p className="mt-xs text-[14px] text-ink-secondary">
              3 tickets waiting · the nearest one is in 12 days
            </p>
          </div>
          <Link to="/my-tickets" className="text-[14px] font-semibold text-ink-brand">
            See all tickets →
          </Link>
        </div>
        <div className="grid gap-lg md:grid-cols-3">
          {PROFILE_NIGHTS.map((ticket, index) => (
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
                {ticket.countdown && (
                  <span className="absolute top-md left-md rounded-[12px] bg-surface-inverse px-[10px] py-[5px] text-[11px] font-bold text-bg-page uppercase">
                    {ticket.countdown}
                  </span>
                )}
              </div>
              <div className="p-lg">
                <StatusBadge tone={ticket.statusTone}>{ticket.status}</StatusBadge>
                <p className="mt-md text-[16px] font-bold text-ink-primary">{ticket.title}</p>
                <p className="mt-xs text-[13px] text-ink-secondary">{ticket.meta}</p>
                <p className="mt-xs text-[13px] font-medium text-ink-muted">{ticket.seat}</p>
                <div className="mt-lg flex gap-sm">
                  <Link to={`/my-tickets/${ticket.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      Show QR
                    </Button>
                  </Link>
                  <Link to={`/my-tickets/${ticket.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full bg-bg-page">
                      Manage
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection padTop={40} padBottom={0}>
        <div className="grid gap-lg lg:grid-cols-2">
          <div className="rounded-[20px] bg-surface-inverse p-xl text-bg-page">
            <p className="text-[12px] font-bold tracking-[0.08em] text-bg-page/70 uppercase">
              Wallet
            </p>
            <p className="mt-sm text-[36px] font-extrabold">{walletLabel}</p>
            <p className="mt-xs text-[13px] text-bg-page/65">SAR 21 pending</p>
            <ul className="mt-xl flex flex-col gap-md">
              {WALLET_TXNS.slice(0, 3).map((txn) => (
                <li key={txn.label} className="flex justify-between gap-md text-[14px]">
                  <span className="text-bg-page/80">{txn.label}</span>
                  <span className={txn.tone === 'credit' ? 'text-brand-primary' : ''}>
                    {txn.amount}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/wallet"
              className="mt-xl flex h-[42px] items-center justify-center rounded-btn-md bg-surface-default text-[14px] font-semibold text-ink-primary"
            >
              Open wallet
            </Link>
          </div>
          <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
            <div className="mb-lg flex items-center justify-between">
              <p className="text-[18px] font-extrabold text-ink-primary">Auction activity</p>
              <Link to="/my-auction-activity" className="text-[13px] font-semibold text-ink-brand">
                See all
              </Link>
            </div>
            <ul className="flex flex-col gap-lg">
              {AUCTION_ACTIVITY.map((item) => (
                <li key={item.title}>
                  <StatusBadge tone="brandTint">{item.status}</StatusBadge>
                  <p className="mt-sm text-[15px] font-bold text-ink-primary">{item.title}</p>
                  <p className="text-[13px] text-ink-secondary">{item.meta}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageSection>

      <PageSection padTop={40} padBottom={0}>
        <div className="mb-lg flex items-end justify-between">
          <h2 className="text-[24px] font-extrabold text-ink-primary">Saved for later</h2>
          <Link to="/saved" className="text-[14px] font-semibold text-ink-brand">
            See all 14 saved →
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
                  {item.kind} · {item.place}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </PageSection>

      <PageSection padTop={40} padBottom={0}>
        <div className="mb-lg flex flex-wrap items-end justify-between gap-md">
          <div>
            <h2 className="text-[24px] font-extrabold text-ink-primary">Account & settings</h2>
            <p className="mt-xs text-[14px] text-ink-secondary">
              Everything about how you sign in, pay and get notified.
            </p>
          </div>
          <Link to="/settings" className="text-[14px] font-semibold text-ink-brand">
            Open settings →
          </Link>
        </div>
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {SETTINGS_TILES.map((tile) => {
            const Icon = tile.icon
            return (
              <Link
                key={tile.title}
                to={tile.href}
                className="rounded-[18px] border border-border-default bg-surface-default p-xl hover:border-border-brand"
              >
                <div className="flex items-start justify-between gap-md">
                  <Icon size={15} className="text-ink-brand" />
                  <ArrowRightIcon size={14} className="text-ink-muted" />
                </div>
                <p className="mt-md text-[16px] font-bold text-ink-primary">{tile.title}</p>
                <p className="mt-sm text-[13px] text-ink-secondary">{tile.desc}</p>
                <div className="mt-lg">
                  <StatusBadge tone="successTint">
                    {tile.href === '/wallet' ? walletLabel : tile.tag}
                  </StatusBadge>
                </div>
              </Link>
            )
          })}
          <Link
            to="/become-business"
            className="flex flex-col justify-between rounded-[18px] border border-border-default bg-surface-default p-xl hover:border-border-brand sm:col-span-2 lg:col-span-4"
          >
            <div className="flex items-start justify-between gap-md">
              <div className="flex items-center gap-md">
                <BriefcaseIcon size={15} className="text-ink-brand" />
                <div>
                  <p className="text-[16px] font-bold text-ink-primary">Become a business</p>
                  <p className="mt-xs text-[13px] text-ink-secondary">
                    Vendor or talent request — submit once, track admin review. Organizer partnership
                    is arranged through our office.
                  </p>
                </div>
              </div>
              <Button size="sm">Apply</Button>
            </div>
          </Link>
        </div>
      </PageSection>

      <PageSection padTop={32} padBottom={96}>
        <div className="flex flex-wrap items-center justify-between gap-lg rounded-[16px] border border-border-default bg-surface-default px-xl py-lg">
          <p className="text-[13px] text-ink-secondary">
            Signed in on this device since 12 July · iPhone 15, Riyadh
          </p>
          <div className="flex gap-md">
            <Button variant="secondary" size="sm">
              Manage devices
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={logoutState.isLoading}
              onClick={() => void handleSignOut()}
            >
              Sign out
            </Button>
          </div>
        </div>
      </PageSection>
    </>
  )
}
