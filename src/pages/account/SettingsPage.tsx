import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Breadcrumbs } from '@/components/navigation'
import {
  BellRingingIcon,
  HeartIcon,
  PowerIcon,
  UserIcon,
  WalletIcon,
} from '@/components/icons'
import { Divider } from '@/components/data-display'
import { Avatar } from '@/components/data-display'
import { Button, Field, TextInput } from '@/components/ui'
import { PageSection } from '@/layouts'
import { ACCOUNT_USER } from '@/pages/_account/fixtures'
import { cn } from '@/lib/cn'
import { useDeleteAccountMutation, useUpdateGuestProfileMutation } from '@/app/api/accountApis'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  credentialsCleared,
  normalizeAuthUser,
  selectAuthUser,
  userUpdated,
} from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { useSignOut } from '@/lib/auth/useSignOut'
import { normalizeSaudiPhone } from '@/lib/api/formPayload'
import { apiErrorMessage } from '@/lib/api/unwrap'

type ProfileFormValues = {
  name: string
  email: string
  phone: string
  currentPassword: string
  password: string
}

function phoneForInput(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('966')) return digits.slice(3)
  if (digits.startsWith('0')) return digits.slice(1)
  return digits
}

function profileFromUser(
  user: { name?: string; email?: string; phone?: string } | null | undefined,
): ProfileFormValues {
  return {
    name: user?.name?.trim() ?? ACCOUNT_USER.name,
    email: user?.email?.trim() ?? ACCOUNT_USER.email,
    phone: phoneForInput(user?.phone?.trim() ?? ACCOUNT_USER.mobile),
    currentPassword: '',
    password: '',
  }
}

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

type NavGroupId = 'account' | 'money' | 'communication'

const NAV_STRUCTURE: {
  group: NavGroupId
  items: Omit<NavItem, 'label'>[]
}[] = [
  {
    group: 'account',
    items: [
      { id: 'personal', icon: <UserIcon size={14} /> },
      {
        id: 'favorites',
        icon: <HeartIcon size={14} />,
        href: '/favorites',
      },
    ],
  },
  {
    group: 'money',
    items: [
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
]

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
  const { t } = useTranslation(['account', 'auth'])
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const { signOut, isLoading: logoutLoading } = useSignOut()
  const [deleteAccount, deleteState] = useDeleteAccountMutation()
  const [updateGuest, updateState] = useUpdateGuestProfileMutation()
  const [deletePassword, setDeletePassword] = useState('')
  const [profile, setProfile] = useState<ProfileFormValues>(() => profileFromUser(user))
  const [savedProfile, setSavedProfile] = useState<ProfileFormValues>(() => profileFromUser(user))

  useEffect(() => {
    const next = profileFromUser(user)
    setProfile((prev) => ({
      ...next,
      currentPassword: prev.currentPassword,
      password: prev.password,
    }))
    setSavedProfile(next)
  }, [user?.name, user?.email, user?.phone])

  const initials = user?.name ? initialsFromName(user.name) : ACCOUNT_USER.initials

  function patchProfile(partial: Partial<ProfileFormValues>) {
    setProfile((prev) => ({ ...prev, ...partial }))
  }

  function handleDiscardProfile() {
    setProfile({
      ...savedProfile,
      currentPassword: '',
      password: '',
    })
  }

  async function handleSaveProfile() {
    if (!profile.name.trim()) {
      dispatch(toastPushed('error', t('settings.validation.name')))
      return
    }
    if (!profile.email.trim()) {
      dispatch(toastPushed('error', t('settings.validation.email')))
      return
    }
    if (!profile.currentPassword.trim()) {
      dispatch(toastPushed('error', t('settings.validation.currentPassword')))
      return
    }

    const phone = profile.phone.trim() ? normalizeSaudiPhone(profile.phone) : ''
    const body: {
      name: string
      email: string
      phone: string
      current_password: string
      password?: string
    } = {
      name: profile.name.trim(),
      email: profile.email.trim(),
      phone,
      current_password: profile.currentPassword.trim(),
    }
    if (profile.password.trim()) {
      body.password = profile.password.trim()
    }

    try {
      const response = await updateGuest(body).unwrap()
      const nestedUser =
        response.user && typeof response.user === 'object'
          ? (response.user as Record<string, unknown>)
          : response
      const nextUser =
        normalizeAuthUser(nestedUser) ??
        normalizeAuthUser({
          ...(user ?? {}),
          id: user?.id ?? 0,
          name: body.name,
          email: body.email,
          phone: body.phone,
          role: user?.role ?? 'guest',
        })

      if (nextUser) {
        dispatch(userUpdated(nextUser))
      }

      const clearedPasswords = { currentPassword: '', password: '' }
      setSavedProfile({
        name: nextUser?.name ?? body.name,
        email: nextUser?.email ?? body.email,
        phone: phoneForInput(nextUser?.phone ?? body.phone),
        ...clearedPasswords,
      })
      setProfile((prev) => ({
        ...prev,
        name: nextUser?.name ?? body.name,
        email: nextUser?.email ?? body.email,
        phone: phoneForInput(nextUser?.phone ?? body.phone),
        ...clearedPasswords,
      }))
      dispatch(toastPushed('success', t('settings.saveSuccess')))
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('settings.saveError'))))
    }
  }

  const nav = NAV_STRUCTURE.map((group) => ({
    group: t(`settings.groups.${group.group}`),
    items: group.items.map((item) => {
      const label =
        item.id === 'personal' ? t('settings.personal') : t(`settings.nav.${item.id}`)
      let tag = item.tag
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
                  <Avatar
                    initials={initials}
                    size="lg"
                    className="!size-[66px] !rounded-[33px] !bg-surface-inverse !text-[25px] !tracking-[-0.75px] !text-bg-page"
                  />
                </div>
              </div>

              <div className="my-[22px] h-px bg-border-divider" />

              <div className="flex flex-col gap-lg">
                <Field label={t('auth:register.name')} htmlFor="profile-name">
                  <TextInput
                    id="profile-name"
                    type="text"
                    value={profile.name}
                    onChange={(event) => patchProfile({ name: event.target.value })}
                    placeholder={t('auth:register.namePlaceholder')}
                    autoComplete="name"
                    className="h-[46px]"
                  />
                </Field>
                <Field label={t('auth:register.email')} htmlFor="profile-email">
                  <TextInput
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    onChange={(event) => patchProfile({ email: event.target.value })}
                    placeholder={t('auth:register.emailPlaceholder')}
                    autoComplete="email"
                    className="h-[46px]"
                  />
                </Field>
                <Field label={t('auth:register.phoneOptional')} htmlFor="profile-phone">
                  <TextInput
                    id="profile-phone"
                    type="tel"
                    inputMode="tel"
                    value={profile.phone}
                    onChange={(event) => patchProfile({ phone: event.target.value })}
                    placeholder={t('auth:register.phonePlaceholder')}
                    autoComplete="tel"
                    className="h-[46px]"
                    leading={
                      <>
                        <span className="shrink-0 text-[14px] font-medium text-ink-secondary">
                          +966
                        </span>
                        <Divider orientation="vertical" tone="border" className="h-5" />
                      </>
                    }
                  />
                </Field>
                <Field
                  label={t('settings.currentPassword')}
                  htmlFor="profile-current-password"
                >
                  <TextInput
                    id="profile-current-password"
                    type="password"
                    value={profile.currentPassword}
                    onChange={(event) => patchProfile({ currentPassword: event.target.value })}
                    autoComplete="current-password"
                    className="h-[46px]"
                  />
                </Field>
                <Field label={t('settings.newPassword')} htmlFor="profile-new-password">
                  <TextInput
                    id="profile-new-password"
                    type="password"
                    value={profile.password}
                    onChange={(event) => patchProfile({ password: event.target.value })}
                    placeholder={t('settings.newPasswordPlaceholder')}
                    autoComplete="new-password"
                    className="h-[46px]"
                  />
                </Field>
              </div>
            </section>

            <div className="mt-[2px] flex flex-wrap items-center justify-between gap-sm rounded-[18px] border border-border-default bg-surface-default px-[22px] py-lg">
              <p className="text-[13px] text-ink-muted">
                {t('settings.lastSaved', { date: '22 July 2026' })}
              </p>
              <div className="flex gap-[9px]">
                <Button
                  variant="secondary"
                  size="md"
                  className="bg-bg-page"
                  onClick={handleDiscardProfile}
                >
                  {t('settings.discard')}
                </Button>
                <Button
                  size="md"
                  loading={updateState.isLoading}
                  onClick={() => void handleSaveProfile()}
                >
                  {t('settings.saveChanges')}
                </Button>
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
