import { useEffect, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Avatar, CountBadge, FlagSaudiArabia, FlagUnitedStates } from '@/components/data-display'
import { BellIcon, CloseIcon, HeartGlyphIcon, MenuIcon, PowerIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { mobileNavToggled, selectMobileNavOpen } from '@/features/ui/uiSlice'
import { useLocale } from '@/i18n/locale'
import { useSignOut } from '@/lib/auth/useSignOut'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'
import { NavItem } from './NavItem'
import { SearchPill } from './SearchPill'

/**
 * Figma `SiteHeader` — node 207:2936, State=Signed out `207:2937` / Signed in `207:2954`.
 *
 * Desktop (`lg+`) matches the Figma 1400 band layout. Below `lg`, nav collapses into an
 * accessible drawer driven by `ui.mobileNavOpen` — the desktop row is otherwise unchanged.
 */
export type NavId = 'Events' | 'Talents' | 'Experiences' | 'Vendors'

export interface HeaderNavLink {
  /** Stable id for active matching (English). Display text comes from `label`. */
  id?: NavId | string
  label: string
  href: string
}

export interface SiteHeaderProps {
  state?: 'signedOut' | 'signedIn'
  nav?: HeaderNavLink[]
  /**
   * Nav item id to mark. `active` is a listing page on its own item;
   * `section` is a detail page marking its parent. Omit on pages with no active item.
   * Callers (e.g. MainLayout) pass English ids: `Events` | `Talents` | `Experiences` | `Vendors`.
   */
  activeItem?: NavId | string
  activeItemState?: 'active' | 'section'
  showSearch?: boolean
  /** Signed-in only. */
  account?: {
    name: string
    initials: string
    notifications?: number
  }
  signInIcon?: boolean
  className?: string
}

const DEFAULT_NAV: { id: NavId; href: string }[] = [
  { id: 'Events', href: '/events' },
  { id: 'Talents', href: '/talents' },
  { id: 'Experiences', href: '/experiences' },
  { id: 'Vendors', href: '/apply/vendor' },
]

function navItemActive(item: HeaderNavLink, activeItem?: string) {
  if (!activeItem) return false
  return (item.id ?? item.label) === activeItem
}

/**
 * Header language switcher - shows flag icon (Saudi Arabia for Arabic, US for English).
 */
function HeaderLanguagePill({ className }: { className?: string }) {
  const { locale, toggleLocale } = useLocale()

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label="Toggle language"
      className={cn(
        'shrink-0 transition-opacity duration-micro ease-micro hover:opacity-80',
        className,
      )}
    >
      {locale === 'en' ? <FlagUnitedStates size={20} /> : <FlagSaudiArabia size={20} />}
    </button>
  )
}

function AuthCluster({
  state,
  account,
  signInIcon,
  onNavigate,
  onClose,
}: {
  state: 'signedOut' | 'signedIn'
  account?: SiteHeaderProps['account']
  signInIcon: boolean
  onNavigate: (path: string) => void
  onClose?: () => void
}) {
  const { t } = useTranslation(['nav', 'common'])

  if (state === 'signedOut') {
    return (
      <div className="flex shrink-0 items-center gap-[14px]">
        <HeaderLanguagePill />
        <Button
          variant="secondary"
          size="md"
          icon={signInIcon ? <HeartGlyphIcon size={16} /> : undefined}
          onClick={() => onNavigate('/sign-in')}
        >
          {t('common:actions.signIn')}
        </Button>
        <Button size="md" onClick={() => onNavigate('/register')}>
          {t('common:actions.createAccount')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-[14px]">
      <HeaderLanguagePill />

      <span className="relative shrink-0">
        <Button
          variant="icon"
          size="sm"
          aria-label={t('nav:notifications')}
          onClick={() => onNavigate('/notifications')}
        >
          <BellIcon size={16} />
        </Button>
        {account?.notifications !== undefined && (
          <span className="absolute -top-[5.5px] -end-[5.5px]">
            <CountBadge
              count={account.notifications}
              className="h-[17px] min-w-[17px] rounded-[9px] text-[10px]"
            />
          </span>
        )}
      </span>

      <Link
        to="/my-tickets"
        onClick={onClose}
        className="text-[15px] font-bold whitespace-nowrap text-ink-primary transition-[color,opacity] duration-micro ease-micro hover:text-ink-secondary"
      >
        {t('nav:myTickets')}
      </Link>

      <Link
        to="/profile"
        onClick={onClose}
        className="flex shrink-0 items-center gap-control-gap rounded-search border-[1.5px] border-border-default bg-surface-default py-[5px] pe-[14px] ps-[5px] transition-[border-color,opacity] duration-micro ease-micro hover:border-border-brand hover:opacity-95"
      >
        <Avatar initials={account?.initials ?? ''} size="md" />
        <span className="text-[14px] font-bold whitespace-nowrap text-ink-primary">
          {account?.name}
        </span>
      </Link>
    </div>
  )
}

/** Mobile drawer auth — language / bell / avatar on one row; tickets + sign out below. */
function MobileDrawerAuth({
  state,
  account,
  signInIcon,
  onNavigate,
  onClose,
}: {
  state: 'signedOut' | 'signedIn'
  account?: SiteHeaderProps['account']
  signInIcon: boolean
  onNavigate: (path: string) => void
  onClose: () => void
}) {
  const { t } = useTranslation(['nav', 'common'])
  const { signOut, isLoading } = useSignOut()

  if (state === 'signedOut') {
    return (
      <div className="mb-xl flex flex-col gap-sm">
        <HeaderLanguagePill className="self-start" />
        <Button
          variant="secondary"
          size="md"
          icon={signInIcon ? <HeartGlyphIcon size={16} /> : undefined}
          onClick={() => onNavigate('/sign-in')}
          className="w-full"
        >
          {t('common:actions.signIn')}
        </Button>
        <Button size="md" onClick={() => onNavigate('/register')} className="w-full">
          {t('common:actions.createAccount')}
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-xl flex flex-col gap-md">
      <div className="flex items-center gap-sm">
        <HeaderLanguagePill />
        <span className="relative shrink-0">
          <Button
            variant="icon"
            size="sm"
            aria-label={t('nav:notifications')}
            onClick={() => onNavigate('/notifications')}
          >
            <BellIcon size={16} />
          </Button>
          {account?.notifications !== undefined && (
            <span className="absolute -top-[5.5px] -end-[5.5px]">
              <CountBadge
                count={account.notifications}
                className="h-[17px] min-w-[17px] rounded-[9px] text-[10px]"
              />
            </span>
          )}
        </span>
        <Link
          to="/profile"
          onClick={onClose}
          className="ms-auto flex shrink-0 items-center gap-control-gap rounded-search border-[1.5px] border-border-default bg-surface-default py-[5px] pe-[12px] ps-[5px] transition-[border-color,opacity] duration-micro ease-micro hover:border-border-brand hover:opacity-95"
          aria-label={
            account?.name
              ? t('nav:profileNamed', { name: account.name })
              : t('nav:profile')
          }
        >
          <Avatar initials={account?.initials ?? ''} size="md" />
          {account?.name ? (
            <span className="max-w-[7rem] truncate text-[13px] font-bold text-ink-primary">
              {account.name}
            </span>
          ) : null}
        </Link>
      </div>

      <Link
        to="/my-tickets"
        onClick={onClose}
        className="text-[15px] font-bold text-ink-primary transition-[color,opacity] duration-micro ease-micro hover:text-ink-secondary"
      >
        {t('nav:myTickets')}
      </Link>

      <button
        type="button"
        className="flex h-[40px] w-full items-center gap-[11px] rounded-[12px] px-[11px] text-[14px] font-semibold text-state-danger hover:bg-bg-page disabled:opacity-60"
        disabled={isLoading}
        onClick={() => {
          onClose()
          void signOut()
        }}
      >
        <PowerIcon size={14} />
        {t('common:actions.signOut')}
      </button>
    </div>
  )
}

export function SiteHeader({
  state = 'signedOut',
  nav,
  activeItem,
  activeItemState = 'active',
  showSearch = true,
  account,
  signInIcon = true,
  className,
}: SiteHeaderProps) {
  const { t } = useTranslation(['nav', 'common'])
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const dispatch = useAppDispatch()
  const mobileNavOpen = useAppSelector(selectMobileNavOpen)

  const resolvedNav: HeaderNavLink[] =
    nav ??
    DEFAULT_NAV.map((item) => ({
      id: item.id,
      href: item.href,
      label: t(`nav:${item.id.toLowerCase()}`),
    }))

  useEffect(() => {
    dispatch(mobileNavToggled(false))
  }, [pathname, dispatch])

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mql.matches) dispatch(mobileNavToggled(false))
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [dispatch])

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const q = String(data.get('q') ?? '').trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
    dispatch(mobileNavToggled(false))
  }

  function go(path: string) {
    dispatch(mobileNavToggled(false))
    navigate(path)
  }

  function closeDrawer() {
    dispatch(mobileNavToggled(false))
  }

  return (
    <header
      className={cn(
        'flex h-header w-full items-center justify-center border-b border-border-default bg-bg-page backdrop-blur-[7px]',
        className,
      )}
    >
      <div className="flex h-full w-full max-w-[1400px] items-center gap-md px-gutter-desktop lg:gap-[38px]">
        <Link to="/" aria-label={t('nav:home')} className="shrink-0">
          <Logo height={40} alt="" />
        </Link>

        <nav aria-label={t('nav:main')} className="hidden shrink-0 items-center gap-2xl lg:flex">
          {resolvedNav.map((item) => (
            <NavItem
              key={item.id ?? item.href}
              label={item.label}
              href={item.href}
              state={navItemActive(item, activeItem) ? activeItemState : 'default'}
            />
          ))}
        </nav>

        <div className="h-px flex-1" />

        {showSearch && (
          <form
            onSubmit={onSearch}
            className="hidden min-w-0 max-w-[300px] flex-1 sm:block lg:min-w-[200px] lg:shrink-0 lg:transition-[max-width] lg:duration-normal lg:ease-standard lg:focus-within:max-w-[320px]"
          >
            <SearchPill name="q" className="w-full" placeholder={t('nav:searchPlaceholder')} />
          </form>
        )}

        <div className="hidden lg:block">
          <AuthCluster
            state={state}
            account={account}
            signInIcon={signInIcon}
            onNavigate={go}
          />
        </div>

        <div className="flex shrink-0 items-center gap-sm lg:hidden">
          {state === 'signedIn' && (
            <Button
              variant="icon"
              size="sm"
              aria-label={t('nav:notifications')}
              onClick={() => go('/notifications')}
            >
              <BellIcon size={16} />
            </Button>
          )}
          <Button
            variant="icon"
            size="sm"
            aria-label={mobileNavOpen ? t('nav:closeMenu') : t('nav:openMenu')}
            aria-expanded={mobileNavOpen}
            aria-controls="site-mobile-nav"
            onClick={() => dispatch(mobileNavToggled())}
          >
            {mobileNavOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
          </Button>
        </div>
      </div>

      <DialogPrimitive.Root
        open={mobileNavOpen}
        onOpenChange={(open) => dispatch(mobileNavToggled(open))}
      >
        {mobileNavOpen ? (
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-surface-inverse/55 backdrop-blur-[1.5px] lg:hidden" />
            <DialogPrimitive.Content
              id="site-mobile-nav"
              aria-describedby={undefined}
              className="fixed inset-y-0 end-0 z-50 flex w-[min(100vw-2.5rem,360px)] flex-col overflow-y-auto border-s border-border-default bg-bg-page p-xl shadow-overlay outline-none lg:hidden"
            >
              <div className="mb-xl flex items-center justify-between gap-md">
                <DialogPrimitive.Title className="text-[16px] font-bold text-ink-primary">
                  {t('nav:menu')}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close asChild>
                  <Button variant="icon" size="sm" aria-label={t('nav:closeMenu')}>
                    <CloseIcon size={18} />
                  </Button>
                </DialogPrimitive.Close>
              </div>

              <MobileDrawerAuth
                state={state}
                account={account}
                signInIcon={signInIcon}
                onNavigate={go}
                onClose={closeDrawer}
              />

              <div className="mb-xl h-px w-full bg-border-divider" />

              <nav aria-label={t('nav:main')} className="flex flex-col gap-md">
                {resolvedNav.map((item) => (
                  <NavItem
                    key={item.id ?? item.href}
                    label={item.label}
                    href={item.href}
                    state={navItemActive(item, activeItem) ? activeItemState : 'default'}
                    className="min-h-[44px] items-center"
                    onClick={(event) => {
                      event.preventDefault()
                      go(item.href)
                    }}
                  />
                ))}
              </nav>

              {showSearch && (
                <form onSubmit={onSearch} className="mt-xl sm:hidden">
                  <SearchPill name="q" className="w-full" placeholder={t('nav:searchPlaceholder')} />
                </form>
              )}
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </DialogPrimitive.Root>
    </header>
  )
}
