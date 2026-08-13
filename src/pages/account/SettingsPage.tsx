import { useState, type ReactNode } from 'react'
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
import { Button, Checkbox, Field, Select, TextInput, Toggle } from '@/components/ui'
import { PageSection } from '@/layouts'
import { ACCOUNT_USER } from '@/pages/_account/fixtures'
import { cn } from '@/lib/cn'

type SettingsSection =
  | 'personal'
  | 'security'
  | 'language'
  | 'payments'
  | 'wallet'
  | 'notifications'
  | 'privacy'

const NAV: {
  group: string
  items: { id: SettingsSection; label: string; icon: ReactNode; tag?: string }[]
}[] = [
  {
    group: 'ACCOUNT',
    items: [
      { id: 'personal', label: 'Personal details', icon: <UserIcon size={14} /> },
      {
        id: 'security',
        label: 'Security & sign-in',
        icon: <LockIcon size={14} />,
        tag: '2FA on',
      },
      { id: 'language', label: 'Language & region', icon: <GlobeEastIcon size={14} /> },
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
      },
      { id: 'wallet', label: 'Wallet & payouts', icon: <WalletIcon size={14} /> },
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
      },
    ],
  },
  {
    group: 'PRIVACY',
    items: [{ id: 'privacy', label: 'Privacy & data', icon: <ShieldIcon size={14} /> }],
  },
]

function PaneShell({
  title,
  subtitle,
  children,
  footerNote = 'Last saved 22 July 2026 · changes apply straight away',
}: {
  title: string
  subtitle: string
  children: ReactNode
  footerNote?: string
}) {
  return (
    <section className="rounded-[20px] border border-border-default bg-surface-default p-[26px]">
      <h2 className="text-[19px] font-semibold text-ink-primary">{title}</h2>
      <p className="mt-xs text-[14px] text-ink-secondary">{subtitle}</p>
      <div className="mt-[22px]">{children}</div>
      <div className="mt-xl flex flex-wrap items-center justify-between gap-sm border-t border-border-divider pt-lg">
        <p className="text-[13px] text-ink-muted">{footerNote}</p>
        <div className="flex gap-sm">
          <Button variant="secondary" size="md">
            Discard
          </Button>
          <Button size="md">Save changes</Button>
        </div>
      </div>
    </section>
  )
}

function ContactRow({
  label,
  value,
  hint,
  badge,
  badgeTone = 'success',
  action,
}: {
  label: string
  value: string
  hint: string
  badge: string
  badgeTone?: 'success' | 'warning'
  action: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-[14px] border-b border-border-divider py-[16px] last:border-b-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink-primary">{label}</p>
        <p className="mt-[2px] text-[14px] text-ink-primary">{value}</p>
        <p className="mt-[2px] text-[13px] text-ink-secondary">{hint}</p>
      </div>
      <span
        className={cn(
          'rounded-[9px] px-[8px] py-[3px] text-[11px] font-bold',
          badgeTone === 'success'
            ? 'bg-[#e8f6ee] text-[#1f7a45]'
            : 'bg-[#fff1e9] text-[#c45a1a]',
        )}
      >
        {badge}
      </span>
      <Button variant="secondary" size="sm" className="bg-bg-page">
        {action}
      </Button>
    </div>
  )
}

function PersonalPane() {
  return (
    <PaneShell
      title="Personal details"
      subtitle="Your name must match the ID you bring to age-restricted events."
    >
      <div className="flex flex-wrap items-center gap-[18px]">
        <Avatar
          initials={ACCOUNT_USER.initials}
          size="lg"
          className="!size-[66px] !rounded-[33px] !bg-surface-inverse !text-[25px] !text-bg-page"
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
          <TextInput id="full-name" defaultValue={ACCOUNT_USER.name} />
        </Field>
        <Field label="Display name" htmlFor="display-name">
          <TextInput id="display-name" defaultValue={ACCOUNT_USER.displayName} />
        </Field>
        <div>
          <Field label="Date of birth" htmlFor="dob">
            <TextInput id="dob" defaultValue={ACCOUNT_USER.dateOfBirth} />
          </Field>
          <p className="mt-[6px] text-[12px] text-ink-muted">Used for age limits</p>
        </div>
        <Field label="City" htmlFor="city">
          <TextInput id="city" defaultValue={ACCOUNT_USER.city} />
        </Field>
        <Field label="National ID / Iqama" htmlFor="nid">
          <TextInput id="nid" defaultValue={ACCOUNT_USER.nationalId} disabled />
        </Field>
        <Field label="Member since" htmlFor="member">
          <TextInput id="member" defaultValue={ACCOUNT_USER.memberSince} disabled />
        </Field>
      </div>

      <div className="mt-xl">
        <h3 className="text-[16px] font-semibold text-ink-primary">Email & phone</h3>
        <p className="mt-xs text-[13px] text-ink-secondary">
          Tickets, receipts and door alerts go here.
        </p>
        <div className="mt-sm">
          <ContactRow
            label="Primary email"
            value={ACCOUNT_USER.email}
            hint="Tickets, receipts and account emails"
            badge="Verified"
            action="Change"
          />
          <ContactRow
            label="Phone number"
            value={ACCOUNT_USER.mobile}
            hint="Door alerts and SMS ticket delivery"
            badge="Verified"
            action="Change"
          />
          <ContactRow
            label="Backup email"
            value="sara.work@example.com"
            hint="Backup email"
            badge="Unconfirmed"
            badgeTone="warning"
            action="Resend"
          />
        </div>
      </div>
    </PaneShell>
  )
}

function SecurityPane() {
  const [twoFactor, setTwoFactor] = useState(true)
  const [loginAlerts, setLoginAlerts] = useState(true)

  return (
    <PaneShell
      title="Security & sign-in"
      subtitle="Password, two-factor authentication and active sessions."
    >
      <div className="grid gap-lg sm:grid-cols-2">
        <Field label="Current password" htmlFor="current-password">
          <TextInput id="current-password" type="password" defaultValue="••••••••••••" />
        </Field>
        <div />
        <Field label="New password" htmlFor="new-password">
          <TextInput id="new-password" type="password" placeholder="At least 10 characters" />
        </Field>
        <Field label="Confirm new password" htmlFor="confirm-password">
          <TextInput id="confirm-password" type="password" placeholder="Repeat new password" />
        </Field>
      </div>

      <div className="my-[22px] h-px bg-border-divider" />

      <div className="flex flex-col gap-lg">
        <Toggle
          id="two-factor"
          checked={twoFactor}
          onCheckedChange={setTwoFactor}
          label="Two-factor authentication (SMS)"
        />
        <Toggle
          id="login-alerts"
          checked={loginAlerts}
          onCheckedChange={setLoginAlerts}
          label="Email me when a new device signs in"
        />
      </div>

      <div className="mt-xl rounded-[14px] border border-border-default bg-bg-page px-[18px] py-[16px]">
        <p className="text-[14px] font-semibold text-ink-primary">Active sessions</p>
        <p className="mt-[4px] text-[13px] text-ink-secondary">
          iPhone 15 · Riyadh · Current session
        </p>
        <p className="mt-[2px] text-[13px] text-ink-secondary">
          Chrome on Windows · Jeddah · Last active 3 days ago
        </p>
        <Button variant="secondary" size="sm" className="mt-md bg-surface-default">
          Sign out other devices
        </Button>
      </div>
    </PaneShell>
  )
}

function LanguagePane() {
  return (
    <PaneShell
      title="Language & region"
      subtitle="How MyTicket is labelled and which city we surface first."
    >
      <div className="grid gap-lg sm:grid-cols-2">
        <Field label="Interface language" htmlFor="ui-lang">
          <Select id="ui-lang" defaultValue="en">
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </Select>
        </Field>
        <Field label="Region" htmlFor="region">
          <Select id="region" defaultValue="riyadh">
            <option value="riyadh">Riyadh</option>
            <option value="jeddah">Jeddah</option>
            <option value="dammam">Dammam</option>
            <option value="alula">AlUla</option>
          </Select>
        </Field>
        <Field label="Time zone" htmlFor="tz">
          <Select id="tz" defaultValue="asia-riyadh">
            <option value="asia-riyadh">Asia/Riyadh (GMT+3)</option>
          </Select>
        </Field>
        <Field label="Currency display" htmlFor="currency">
          <Select id="currency" defaultValue="sar">
            <option value="sar">Saudi Riyal (SAR)</option>
          </Select>
        </Field>
      </div>
      <div className="mt-xl">
        <Checkbox
          id="rtl-prefer"
          label="Prefer Arabic layout when available"
          defaultChecked={false}
        />
      </div>
    </PaneShell>
  )
}

function PaymentsPane() {
  return (
    <PaneShell
      title="Payment methods"
      subtitle="Cards and wallets used at checkout. CVV is never stored."
    >
      <div className="flex flex-col gap-sm">
        {[
          { brand: 'Visa', last4: '4242', expiry: '08/28', primary: true },
          { brand: 'Mada', last4: '1881', expiry: '01/27', primary: false },
          { brand: 'Apple Pay', last4: "Sara's iPhone", expiry: 'Device', primary: false },
        ].map((card) => (
          <div
            key={card.last4}
            className="flex flex-wrap items-center gap-[14px] rounded-[14px] border border-border-default px-[18px] py-[14px]"
          >
            <div className="flex size-[40px] items-center justify-center rounded-[10px] bg-bg-page text-[12px] font-bold text-ink-secondary">
              {card.brand.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-ink-primary">
                {card.brand} ···· {card.last4}
              </p>
              <p className="mt-[2px] text-[13px] text-ink-secondary">Expires {card.expiry}</p>
            </div>
            {card.primary && (
              <span className="rounded-[9px] bg-border-divider px-[8px] py-[3px] text-[11px] font-bold text-ink-secondary">
                Default
              </span>
            )}
            <Button variant="secondary" size="sm">
              Edit
            </Button>
            <Button variant="secondary" size="sm">
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="my-[22px] h-px bg-border-divider" />

      <div className="grid gap-lg sm:grid-cols-2">
        <Field label="Cardholder name" htmlFor="card-name">
          <TextInput id="card-name" defaultValue={ACCOUNT_USER.name} />
        </Field>
        <Field label="Card number" htmlFor="card-number">
          <TextInput id="card-number" placeholder="•••• •••• •••• ••••" />
        </Field>
        <Field label="Expiry" htmlFor="card-expiry">
          <TextInput id="card-expiry" placeholder="MM/YY" />
        </Field>
        <Field label="CVV" htmlFor="card-cvv">
          <TextInput id="card-cvv" placeholder="•••" />
        </Field>
      </div>
      <div className="mt-lg">
        <Checkbox id="set-default-card" label="Set as default payment method" defaultChecked />
      </div>
      <Button variant="secondary" size="md" className="mt-lg">
        Add payment method
      </Button>
    </PaneShell>
  )
}

function WalletPane() {
  return (
    <PaneShell
      title="Wallet & payouts"
      subtitle="Balance, cashback and the bank account we pay auction sales into."
      footerNote={`Available balance ${ACCOUNT_USER.walletBalance} · pending ${ACCOUNT_USER.walletPending}`}
    >
      <div className="grid gap-lg sm:grid-cols-3">
        <div className="rounded-[14px] border border-border-default bg-bg-page px-[18px] py-[16px]">
          <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
            Available
          </p>
          <p className="mt-[6px] text-[22px] font-bold text-ink-primary">
            {ACCOUNT_USER.walletBalance}
          </p>
        </div>
        <div className="rounded-[14px] border border-border-default bg-bg-page px-[18px] py-[16px]">
          <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
            Pending
          </p>
          <p className="mt-[6px] text-[22px] font-bold text-ink-primary">
            {ACCOUNT_USER.walletPending}
          </p>
        </div>
        <div className="rounded-[14px] border border-border-default bg-bg-page px-[18px] py-[16px]">
          <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
            Earned this year
          </p>
          <p className="mt-[6px] text-[22px] font-bold text-ink-primary">
            {ACCOUNT_USER.walletEarnedYear}
          </p>
        </div>
      </div>

      <div className="my-[22px] h-px bg-border-divider" />

      <div className="grid gap-lg sm:grid-cols-2">
        <Field label="Bank name" htmlFor="bank-name">
          <TextInput id="bank-name" defaultValue="Saudi National Bank" />
        </Field>
        <Field label="Account holder" htmlFor="bank-holder">
          <TextInput id="bank-holder" defaultValue={ACCOUNT_USER.name} />
        </Field>
        <Field label="IBAN" htmlFor="iban">
          <TextInput id="iban" defaultValue="SA03 8000 0000 6080 1016 7519" />
        </Field>
        <Field label="Payout schedule" htmlFor="payout-schedule">
          <Select id="payout-schedule" defaultValue="weekly">
            <option value="weekly">Weekly (Fridays)</option>
            <option value="instant">After each sale</option>
            <option value="manual">Manual only</option>
          </Select>
        </Field>
      </div>
      <Checkbox
        id="auto-apply-wallet"
        className="mt-lg"
        label="Auto-apply wallet balance at checkout"
        defaultChecked
      />
    </PaneShell>
  )
}

function NotificationsPane() {
  const [pushTickets, setPushTickets] = useState(true)
  const [pushWaitlists, setPushWaitlists] = useState(true)
  const [emailMarketing, setEmailMarketing] = useState(false)
  const [emailPrices, setEmailPrices] = useState(true)
  const [smsDoor, setSmsDoor] = useState(true)

  return (
    <PaneShell
      title="Notifications"
      subtitle="Choose what reaches you by push, email and SMS."
    >
      <div className="flex flex-col gap-[18px]">
        <div>
          <p className="text-[13px] font-bold tracking-[0.84px] text-ink-muted uppercase">
            Push
          </p>
          <div className="mt-md flex flex-col gap-md">
            <Toggle
              id="push-tickets"
              checked={pushTickets}
              onCheckedChange={setPushTickets}
              label="Ticket reminders and door alerts"
            />
            <Toggle
              id="push-waitlists"
              checked={pushWaitlists}
              onCheckedChange={setPushWaitlists}
              label="Waitlist claims and price drops"
            />
          </div>
        </div>

        <div className="h-px bg-border-divider" />

        <div>
          <p className="text-[13px] font-bold tracking-[0.84px] text-ink-muted uppercase">
            Email
          </p>
          <div className="mt-md flex flex-col gap-md">
            <Toggle
              id="email-prices"
              checked={emailPrices}
              onCheckedChange={setEmailPrices}
              label="Favourites price drops"
            />
            <Toggle
              id="email-marketing"
              checked={emailMarketing}
              onCheckedChange={setEmailMarketing}
              label="Weekly picks and promotions"
            />
          </div>
        </div>

        <div className="h-px bg-border-divider" />

        <div>
          <p className="text-[13px] font-bold tracking-[0.84px] text-ink-muted uppercase">SMS</p>
          <div className="mt-md flex flex-col gap-md">
            <Toggle
              id="sms-door"
              checked={smsDoor}
              onCheckedChange={setSmsDoor}
              label="Door codes and last-minute gate changes"
            />
          </div>
        </div>

        <div className="h-px bg-border-divider" />

        <div className="flex flex-col gap-md">
          <Checkbox id="quiet-hours" label="Quiet hours 22:00–08:00 (Riyadh time)" defaultChecked />
          <Checkbox id="digest" label="Send a Sunday digest instead of daily emails" />
        </div>
      </div>
    </PaneShell>
  )
}

function PrivacyPane() {
  const [publicProfile, setPublicProfile] = useState(false)
  const [showActivity, setShowActivity] = useState(true)

  return (
    <PaneShell
      title="Privacy & data"
      subtitle="What others can see, and how we use your account data."
    >
      <div className="flex flex-col gap-md">
        <Toggle
          id="public-profile"
          checked={publicProfile}
          onCheckedChange={setPublicProfile}
          label="Show my display name on public reviews"
        />
        <Toggle
          id="show-activity"
          checked={showActivity}
          onCheckedChange={setShowActivity}
          label="Let organizers see that I attended their event"
        />
      </div>

      <div className="my-[22px] h-px bg-border-divider" />

      <div className="flex flex-col gap-md">
        <Checkbox
          id="analytics"
          label="Allow analytics cookies to improve recommendations"
          defaultChecked
        />
        <Checkbox id="personalization" label="Personalize the home feed from my bookings" defaultChecked />
        <Checkbox id="third-party" label="Share anonymized attendance stats with organizers" />
      </div>

      <div className="mt-xl flex flex-wrap gap-sm">
        <Button variant="secondary" size="md">
          Download my data
        </Button>
        <Button variant="secondary" size="md" className="text-[#c4261b]">
          Delete account
        </Button>
      </div>
    </PaneShell>
  )
}

/** Settings — Figma `207:10247`. Sidebar nav switches panes in-place. */
export function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>('personal')
  const activeLabel =
    NAV.flatMap((g) => g.items).find((item) => item.id === section)?.label ?? 'Personal details'

  return (
    <>
      <PageSection padTop={30} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Account', href: '/profile' },
            { label: 'Settings' },
            { label: activeLabel },
          ]}
        />
        <h1 className="mt-[10px] text-[46px] leading-[1.03] font-extrabold tracking-[-1.61px] text-ink-primary">
          Settings
        </h1>
        <p className="mt-[6px] text-[16px] text-ink-secondary">
          Your details, how you pay, and what we&apos;re allowed to send you.
        </p>
      </PageSection>

      <PageSection padTop={24} padBottom={70}>
        <div className="flex flex-col gap-[34px] lg:flex-row lg:items-start">
          <nav className="w-full shrink-0 rounded-[20px] border border-border-default bg-surface-default p-[10px] lg:w-[268px]">
            {NAV.map((group) => (
              <div key={group.group} className="px-[10px] pt-[10px] pb-[6px]">
                <p className="text-[11px] font-bold tracking-[0.08em] text-ink-muted uppercase">
                  {group.group}
                </p>
                <ul className="mt-[6px] flex flex-col gap-[2px]">
                  {group.items.map((item) => {
                    const active = item.id === section
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => setSection(item.id)}
                          className={cn(
                            'flex h-[40px] w-full items-center gap-[11px] rounded-[12px] px-[11px] text-left text-[14px]',
                            active
                              ? 'bg-border-divider font-semibold text-ink-brand'
                              : 'font-medium text-ink-secondary hover:bg-bg-page',
                          )}
                        >
                          <span className="shrink-0">{item.icon}</span>
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.tag && (
                            <span className="rounded-[9px] bg-border-divider px-[7px] py-[3px] text-[11px] font-bold text-ink-secondary">
                              {item.tag}
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
            <div className="mt-sm px-[10px]">
              <div className="h-px bg-border-divider" />
              <button
                type="button"
                className="mt-md flex h-[40px] w-full items-center gap-[11px] rounded-[12px] px-[11px] text-[14px] font-semibold text-[#c4261b] hover:bg-bg-page"
              >
                <PowerIcon size={14} />
                Sign out
              </button>
            </div>
          </nav>

          <div className="min-w-0 flex-1">
            {section === 'personal' && <PersonalPane />}
            {section === 'security' && <SecurityPane />}
            {section === 'language' && <LanguagePane />}
            {section === 'payments' && <PaymentsPane />}
            {section === 'wallet' && <WalletPane />}
            {section === 'notifications' && <NotificationsPane />}
            {section === 'privacy' && <PrivacyPane />}
          </div>
        </div>
      </PageSection>
    </>
  )
}
