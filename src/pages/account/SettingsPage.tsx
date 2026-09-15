import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Breadcrumbs } from '@/components/navigation'
import {
  BellRingingIcon,
  CreditCardIcon,
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
import { useDeleteAccountMutation } from '@/app/api/accountApis'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { credentialsCleared, selectAuthUser } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { useSignOut } from '@/lib/auth/useSignOut'
import { apiErrorMessage } from '@/lib/api/unwrap'

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

type NavGroupId = 'account' | 'money' | 'communication' | 'privacy'

const NAV_STRUCTURE: {
  group: NavGroupId
  items: Omit<NavItem, 'label'>[]
}[] = [
  {
    group: 'account',
    items: [
      { id: 'personal', icon: <UserIcon size={14} /> },
      {
        id: 'security',
        icon: <LockIcon size={14} />,
        tag: 'twoFaOn',
        undrawn: true,
      },
    ],
  },
  {
    group: 'money',
    items: [
      {
        id: 'payments',
        icon: <CreditCardIcon size={14} />,
        tag: '3',
        undrawn: true,
      },
      {
        id: 'wallet',
        icon: <WalletIcon size={14} />,
        href: '/wallet',
      },
    ],
  },
  {
    group: 'communication',
    items: [
      {
        id: 'notifications',
        icon: <BellRingingIcon size={14} />,
        tag: 'notificationsOn',
        href: '/notifications',
      },
    ],
  },
  {
    group: 'privacy',
    items: [
      {
        id: 'privacy',
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

function NavRow({
  item,
  active,
  comingSoon,
}: {
  item: NavItem
  active: boolean
  comingSoon: string
}) {
  const className = cn(
    'flex h-[40px] w-full items-center gap-[11px] rounded-[12px] px-[11px] text-start text-[14px]',
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
      title={item.undrawn ? comingSoon : undefined}
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
function initialsFromName(name: string): string {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || ACCOUNT_USER.initials
  )
}

export function SettingsPage() {
  const { t } = useTranslation('account')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const { signOut, isLoading: logoutLoading } = useSignOut()
  const [deleteAccount, deleteState] = useDeleteAccountMutation()
  const [deletePassword, setDeletePassword] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  function handlePhotoUpload(file: File | undefined) {
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      dispatch(toastPushed('error', t('settings.photoTooLarge')))
      return
    }
    setPhotoUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
  }

  const displayName = user?.name ?? ACCOUNT_USER.name
  const displayEmail = user?.email ?? ACCOUNT_USER.email
  const displayPhone = user?.phone ?? ACCOUNT_USER.mobile
  const initials = user?.name ? initialsFromName(user.name) : ACCOUNT_USER.initials

  const nav = NAV_STRUCTURE.map((group) => ({
    group: t(`settings.groups.${group.group}`),
    items: group.items.map((item) => {
      const label =
        item.id === 'personal' ? t('settings.personal') : t(`settings.nav.${item.id}`)
      let tag = item.tag
      if (item.tag === 'twoFaOn') tag = t('settings.tags.twoFaOn')
      if (item.tag === 'notificationsOn') tag = t('settings.tags.notificationsOn', { count: 4 })
      return { ...item, label, tag }
    }),
  }))

  async function handleDeleteAccount() {
    if (!deletePassword.trim()) {
      dispatch(toastPushed('error', t('settings.deleteNeedPassword')))
      return
    }
    try {
      await deleteAccount({ password: deletePassword.trim() }).unwrap()
      dispatch(credentialsCleared())
      dispatch(toastPushed('success', t('settings.deleteSuccess')))
      navigate('/')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('settings.deleteError'))))
    }
  }

  return (
    <>
      <PageSection padTop={30} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: t('settings.breadcrumbAccount'), href: '/profile' },
            { label: t('settings.title') },
            { label: t('settings.personal') },
          ]}
        />
        <h1 className="mt-[10px] text-[28px] leading-[1.03] font-extrabold tracking-[-1.61px] text-ink-primary sm:text-[36px] lg:text-[46px]">
          {t('settings.title')}
        </h1>
        <p className="mt-[6px] text-[16px] text-ink-secondary">{t('settings.subtitle')}</p>
      </PageSection>

      <PageSection padTop={24} padBottom={96}>
        <div className="flex flex-col gap-[34px] lg:flex-row lg:items-start">
          <nav className="w-full shrink-0 rounded-[20px] border border-border-default bg-surface-default p-[10px] lg:w-[268px]">
            {nav.map((group) => (
              <div key={group.group} className="px-[10px] pt-[10px] pb-[6px]">
                <p className="text-[11px] font-bold tracking-[0.08em] text-ink-muted uppercase">
                  {group.group}
                </p>
                <ul className="mt-[6px] flex flex-col gap-[2px]">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <NavRow
                        item={item}
                        active={item.id === 'personal'}
                        comingSoon={t('settings.comingSoon')}
                      />
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
                onClick={() => void signOut()}
                disabled={logoutLoading}
              >
                <PowerIcon size={14} />
                {t('settings.signOut')}
              </button>
            </div>
          </nav>

          <div className="flex min-w-0 flex-1 flex-col gap-lg">
            <section className="rounded-[20px] border border-border-default bg-surface-default p-[26px]">
              <h2 className="text-[19px] font-semibold text-ink-primary">{t('settings.personal')}</h2>
              <p className="mt-xs text-[14px] text-ink-secondary">{t('settings.personalHint')}</p>

              <div className="mt-[22px] flex flex-wrap items-center gap-[18px]">
                <div className="relative size-[66px] shrink-0 overflow-hidden rounded-[33px]">
                  {photoUrl ? (
                    <img src={photoUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <Avatar
                      initials={initials}
                      size="lg"
                      className="!size-[66px] !rounded-[33px] !bg-surface-inverse !text-[25px] !tracking-[-0.75px] !text-bg-page"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-ink-primary">{t('settings.photoTitle')}</p>
                  <p className="mt-[3px] text-[13px] text-ink-secondary">{t('settings.photoHint')}</p>
                </div>
                <div className="flex gap-sm">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="sr-only"
                    onChange={(event) => {
                      handlePhotoUpload(event.target.files?.[0])
                      event.target.value = ''
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-bg-page"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {t('settings.upload')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setPhotoUrl((current) => {
                        if (current) URL.revokeObjectURL(current)
                        return null
                      })
                    }}
                  >
                    {t('settings.remove')}
                  </Button>
                </div>
              </div>

              <div className="my-[22px] h-px bg-border-divider" />

              <div className="grid gap-lg sm:grid-cols-2">
                <Field label={t('settings.fullName')} htmlFor="full-name">
                  <TextInput id="full-name" defaultValue={displayName} className="h-[46px]" />
                </Field>
                <Field label={t('settings.displayName')} htmlFor="display-name">
                  <TextInput
                    id="display-name"
                    defaultValue={displayName.split(' ')[0] ?? ACCOUNT_USER.displayName}
                    className="h-[46px]"
                  />
                </Field>
                <Field label={t('settings.dateOfBirth')} htmlFor="dob">
                  <TextInput
                    id="dob"
                    defaultValue={ACCOUNT_USER.dateOfBirth}
                    className="h-[46px]"
                    trailing={
                      <span className="shrink-0 text-[12px] text-ink-muted">
                        {t('settings.ageLimits')}
                      </span>
                    }
                  />
                </Field>
                <Field label={t('settings.city')} htmlFor="city">
                  <TextInput id="city" defaultValue={ACCOUNT_USER.city} className="h-[46px]" />
                </Field>
                <Field label={t('settings.nationalId')} htmlFor="nid">
                  <TextInput
                    id="nid"
                    defaultValue={ACCOUNT_USER.nationalId}
                    readOnly
                    className="h-[46px] bg-bg-page"
                    trailing={
                      <span className="shrink-0 text-[12px] text-ink-muted">
                        {t('settings.verified')}
                      </span>
                    }
                  />
                </Field>
                <Field label={t('settings.memberSince')} htmlFor="member">
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
              <h2 className="text-[19px] font-semibold text-ink-primary">{t('settings.emailPhone')}</h2>
              <p className="mt-xs text-[14px] text-ink-secondary">{t('settings.emailPhoneHint')}</p>
              <div className="mt-xl flex flex-col gap-md">
                <ContactRow
                  value={displayEmail}
                  hint={t('settings.hintEmail')}
                  badge={t('settings.verified')}
                  action={t('settings.change')}
                />
                <ContactRow
                  value={displayPhone}
                  hint={t('settings.hintPhone')}
                  badge={t('settings.verified')}
                  action={t('settings.change')}
                />
                <ContactRow
                  value="sara.work@example.com"
                  hint={t('settings.hintBackup')}
                  badge={t('settings.unconfirmed')}
                  badgeTone="warning"
                  action={t('settings.resend')}
                />
              </div>
            </section>

            <div className="mt-[2px] flex flex-wrap items-center justify-between gap-sm rounded-[18px] border border-border-default bg-surface-default px-[22px] py-lg">
              <p className="text-[13px] text-ink-muted">
                {t('settings.lastSaved', { date: '22 July 2026' })}
              </p>
              <div className="flex gap-[9px]">
                <Button variant="secondary" size="md" className="bg-bg-page">
                  {t('settings.discard')}
                </Button>
                <Button size="md">{t('settings.saveChanges')}</Button>
              </div>
            </div>

            <section className="rounded-[20px] border border-border-default bg-surface-default p-[26px]">
              <h2 className="text-[19px] font-semibold text-ink-primary">{t('settings.deleteTitle')}</h2>
              <p className="mt-xs text-[14px] text-ink-secondary">{t('settings.deleteBody')}</p>
              <div className="mt-[18px] flex flex-wrap items-end gap-md">
                <Field
                  label={t('settings.confirmPassword')}
                  htmlFor="delete-password"
                  className="min-w-[220px] flex-1"
                >
                  <TextInput
                    id="delete-password"
                    type="password"
                    autoComplete="current-password"
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                    className="h-[46px]"
                  />
                </Field>
                <Button
                  variant="destructive"
                  size="md"
                  loading={deleteState.isLoading}
                  onClick={() => void handleDeleteAccount()}
                >
                  {t('settings.deleteAccount')}
                </Button>
              </div>
            </section>
          </div>
        </div>
      </PageSection>
    </>
  )
}
