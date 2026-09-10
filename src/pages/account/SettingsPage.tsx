import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Breadcrumbs } from '@/components/navigation'
import {
  BellRingingIcon,
  CreditCardIcon,
  GlobeEastIcon,
  LockIcon,
  PowerIcon,
  ShieldIcon,
  UserIcon,
  WalletIcon,
} from '@/components/icons'
import { Avatar } from '@/components/data-display'
import { Button, Field, TextInput } from '@/components/ui'
import { PageSection } from '@/layouts'
import { ACCOUNT_USER } from '@/pages/_account/fixtures'
import { cn } from '@/lib/cn'

type NavItem = {
  id: string
  label: string
  icon: ReactNode
  tag?: string
  /** Drawn destination with its own screen — leave Settings for personal only. */
  href?: string
  /**
   * Undrawn pane — looks like a normal inactive row (not washed-out).
   * Click keeps Personal details active (no invented content).
   */
  undrawn?: boolean
}

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'ACCOUNT',
    items: [
      { id: 'personal', label: 'Personal details', icon: <UserIcon size={14} /> },
      {
        id: 'security',
        label: 'Security & sign-in',
        icon: <LockIcon size={14} />,
        tag: '2FA on',
        undrawn: true,
      },
      {
        id: 'language',
        label: 'Language & region',
        icon: <GlobeEastIcon size={14} />,
        undrawn: true,
      },
    ],
  },
  {
    group: 'MONEY',
    items: [
      {
        id: 'payments',
        label: 'Payment methods',
        icon: <CreditCardIcon size={14} />,
        tag: '3',
        undrawn: true,
      },
      {
        id: 'wallet',
        label: 'Wallet & payouts',
        icon: <WalletIcon size={14} />,
        href: '/wallet',
      },
    ],
  },
  {
    group: 'COMMUNICATION',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: <BellRingingIcon size={14} />,
        tag: '4 on',
        href: '/notifications',
      },
    ],
  },
  {
    group: 'PRIVACY',
    items: [
      {
        id: 'privacy',
        label: 'Privacy & data',
        icon: <ShieldIcon size={14} />,
        undrawn: true,
      },
    ],
  },
]

function ContactRow({
  value,
  hint,
  badge,
  badgeTone = 'success',
  action,
}: {
  value: string
  hint: string
  badge: string
  badgeTone?: 'success' | 'warning'
  action: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-lg rounded-[14px] border border-border-default bg-bg-page px-[17px] py-[15px]">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink-primary">{value}</p>
        <p className="mt-[3px] text-[13px] text-ink-secondary">{hint}</p>
      </div>
      <span
        className={cn(
          'rounded-[11px] px-[10px] py-[4px] text-[12px] font-bold',
          badgeTone === 'success'
            ? 'bg-state-success-tint text-state-success'
            : 'bg-bg-tint-brand text-ink-brand-strong',
        )}
      >
        {badge}
      </span>
      <Button variant="secondary" size="sm">
        {action}
      </Button>
    </div>
  )
}

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const className = cn(
    'flex h-[40px] w-full items-center gap-[11px] rounded-[12px] px-[11px] text-left text-[14px]',
    active
      ? 'bg-border-divider font-semibold text-ink-brand'
      : 'font-medium text-ink-secondary hover:bg-bg-page',
  )

  const body = (
    <>
      <span className={cn('shrink-0', active && 'text-ink-brand')}>{item.icon}</span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.tag && (
        <span className="rounded-[9px] bg-border-divider px-[7px] py-[3px] text-[11px] font-bold text-ink-secondary">
          {item.tag}
        </span>
      )}
    </>
  )

  if (item.href) {
    return (
      <Link to={item.href} className={className}>
        {body}
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      title={item.undrawn ? 'Coming soon' : undefined}
      onClick={() => {
        /* Undrawn panes: keep Personal details active — no invented content. */
      }}
      className={className}
    >
      {body}
    </button>
  )
}

/**
 * Settings — Figma `207:10247`.
 * Drawn content is Personal details + Email/phone + save bar only.
 * Undrawn sidebar rows match Figma inactive chrome (not washed-out); links go to drawn screens.
 */
export function SettingsPage() {
  return (
    <>
      <PageSection padTop={30} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Account', href: '/profile' },
            { label: 'Settings' },
            { label: 'Personal details' },
          ]}
        />
        <h1 className="mt-[10px] text-[46px] leading-[1.03] font-extrabold tracking-[-1.61px] text-ink-primary">
          Settings
        </h1>
        <p className="mt-[6px] text-[16px] text-ink-secondary">
          Your details, how you pay, and what we&apos;re allowed to send you.
        </p>
      </PageSection>

      <PageSection padTop={24} padBottom={96}>
        <div className="flex flex-col gap-[34px] lg:flex-row lg:items-start">
          <nav className="w-full shrink-0 rounded-[20px] border border-border-default bg-surface-default p-[10px] lg:w-[268px]">
            {NAV.map((group) => (
              <div key={group.group} className="px-[10px] pt-[10px] pb-[6px]">
                <p className="text-[11px] font-bold tracking-[0.08em] text-ink-muted uppercase">
                  {group.group}
                </p>
                <ul className="mt-[6px] flex flex-col gap-[2px]">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <NavRow item={item} active={item.id === 'personal'} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="mt-sm px-[10px]">
              <div className="h-px bg-border-divider" />
              <button
                type="button"
                className="mt-md flex h-[40px] w-full items-center gap-[11px] rounded-[12px] px-[11px] text-[14px] font-semibold text-state-danger hover:bg-bg-page"
              >
                <PowerIcon size={14} />
                Sign out
              </button>
            </div>
          </nav>

          <div className="flex min-w-0 flex-1 flex-col gap-lg">
            <section className="rounded-[20px] border border-border-default bg-surface-default p-[26px]">
              <h2 className="text-[19px] font-semibold text-ink-primary">Personal details</h2>
              <p className="mt-xs text-[14px] text-ink-secondary">
                Your name must match the ID you bring to age-restricted events.
              </p>

              <div className="mt-[22px] flex flex-wrap items-center gap-[18px]">
                <Avatar
                  initials={ACCOUNT_USER.initials}
                  size="lg"
                  className="!size-[66px] !rounded-[33px] !bg-surface-inverse !text-[25px] !tracking-[-0.75px] !text-bg-page"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-ink-primary">Profile photo</p>
                  <p className="mt-[3px] text-[13px] text-ink-secondary">PNG or JPG, up to 4 MB.</p>
                </div>
                <div className="flex gap-sm">
                  <Button variant="secondary" size="sm" className="bg-bg-page">
                    Upload
                  </Button>
                  <Button variant="secondary" size="sm">
                    Remove
                  </Button>
                </div>
              </div>

              <div className="my-[22px] h-px bg-border-divider" />

              <div className="grid gap-lg sm:grid-cols-2">
                <Field label="Full name" htmlFor="full-name">
                  <TextInput id="full-name" defaultValue={ACCOUNT_USER.name} className="h-[46px]" />
                </Field>
                <Field label="Display name" htmlFor="display-name">
                  <TextInput
                    id="display-name"
                    defaultValue={ACCOUNT_USER.displayName}
                    className="h-[46px]"
                  />
                </Field>
                <Field label="Date of birth" htmlFor="dob">
                  <TextInput
                    id="dob"
                    defaultValue={ACCOUNT_USER.dateOfBirth}
                    className="h-[46px]"
                    trailing={
                      <span className="shrink-0 text-[12px] text-ink-muted">Used for age limits</span>
                    }
                  />
                </Field>
                <Field label="City" htmlFor="city">
                  <TextInput id="city" defaultValue={ACCOUNT_USER.city} className="h-[46px]" />
                </Field>
                <Field label="National ID / Iqama" htmlFor="nid">
                  <TextInput
                    id="nid"
                    defaultValue={ACCOUNT_USER.nationalId}
                    readOnly
                    className="h-[46px] bg-bg-page"
                    trailing={
                      <span className="shrink-0 text-[12px] text-ink-muted">Verified</span>
                    }
                  />
                </Field>
                <Field label="Member since" htmlFor="member">
                  <TextInput
                    id="member"
                    defaultValue={ACCOUNT_USER.memberSince}
                    readOnly
                    className="h-[46px] bg-bg-page text-ink-secondary"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-[20px] border border-border-default bg-surface-default p-[26px]">
              <h2 className="text-[19px] font-semibold text-ink-primary">Email & phone</h2>
              <p className="mt-xs text-[14px] text-ink-secondary">
                Tickets, receipts and door alerts go here.
              </p>
              <div className="mt-xl flex flex-col gap-md">
                <ContactRow
                  value={ACCOUNT_USER.email}
                  hint="Tickets, receipts and account emails"
                  badge="Verified"
                  action="Change"
                />
                <ContactRow
                  value={ACCOUNT_USER.mobile}
                  hint="Door alerts and SMS ticket delivery"
                  badge="Verified"
                  action="Change"
                />
                <ContactRow
                  value="sara.work@example.com"
                  hint="Backup email"
                  badge="Unconfirmed"
                  badgeTone="warning"
                  action="Resend"
                />
              </div>
            </section>

            <div className="mt-[2px] flex flex-wrap items-center justify-between gap-sm rounded-[18px] border border-border-default bg-surface-default px-[22px] py-lg">
              <p className="text-[13px] text-ink-muted">
                Last saved 22 July 2026 · changes apply straight away
              </p>
              <div className="flex gap-[9px]">
                <Button variant="secondary" size="md" className="bg-bg-page">
                  Discard
                </Button>
                <Button size="md">Save changes</Button>
              </div>
            </div>
          </div>
        </div>
      </PageSection>
    </>
  )
}
