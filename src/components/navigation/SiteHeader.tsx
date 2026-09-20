import { useEffect, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog as DialogPrimitive, DropdownMenu } from 'radix-ui'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Avatar, CountBadge, FlagSaudiArabia, FlagUnitedStates } from '@/components/data-display'
import {
  BellIcon,
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
  PowerIcon,
} from '@/components/icons'
import { Button } from '@/components/ui'
import { mobileNavToggled, selectMobileNavOpen } from '@/features/ui/uiSlice'
import { useLocale } from '@/i18n/locale'
import { useSignOut } from '@/lib/auth/useSignOut'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'
import { NavItem } from './NavItem'
import { SearchPill } from './SearchPill'

/**
 * Site header — Logo · nav · search · bell · profile/login · language.
 * Nav: Tickets & offers (dropdown) · Talents · Offers · Institutions.
 */
export type NavId = 'TicketsAndOffers' | 'Talents' | 'Offers' | 'Institutions'

export interface HeaderNavLink {
  id?: NavId | string
  label: string
  href: string
}

export interface SiteHeaderProps {
  state?: 'signedOut' | 'signedIn'
  nav?: HeaderNavLink[]
  activeItem?: NavId | string
  activeItemState?: 'active' | 'section'
  showSearch?: boolean
  account?: {
    name: string
    initials: string
    notifications?: number
  }
  signInIcon?: boolean
  className?: string
}

const TICKETS_OFFERS_LINKS = [
  { key: 'upcoming' as const, href: '/events' },
  { key: 'newlyAdded' as const, href: '/events?sort=newest' },
  { key: 'landmarks' as const, href: '/experiences?type=attraction' },
  { key: 'activities' as const, href: '/experiences?type=activity' },
]

const PROFILE_LINKS = [
  { key: 'profile' as const, href: '/profile' },
  { key: 'reservations' as const, href: '/my-tickets' },
  { key: 'favorites' as const, href: '/favorites' },
]

function navItemActive(id: string | undefined, activeItem?: string) {
  if (!activeItem || !id) return false
  return id === activeItem
}

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

function dropdownContentClassName() {
  return cn(
    'z-[60] min-w-[220px] overflow-hidden rounded-[14px] border border-border-default',
    'bg-surface-default p-sm shadow-[0px_18px_40px_-24px_rgba(25,16,8,0.35)]',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
  )
}

function dropdownItemClassName() {
  return cn(
    'flex cursor-pointer select-none items-center rounded-[10px] px-md py-[10px]',
    'text-[14px] font-semibold text-ink-primary outline-none',
    'data-[highlighted]:bg-bg-page data-[highlighted]:text-ink-brand-mid',
  )
}

function TicketsOffersDropdown({
  active,
  activeItemState,
  onNavigate,
}: {
  active: boolean
  activeItemState: 'active' | 'section'
  onNavigate: (path: string) => void
}) {
  const { t } = useTranslation('nav')

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-[6px] text-[15px] leading-[normal] font-semibold whitespace-nowrap',
            'transition-[color,opacity] duration-micro ease-micro',
            !active && 'text-ink-primary hover:text-ink-secondary',
            active &&
              activeItemState === 'active' &&
              'border-b-2 border-border-focus pb-[4px] text-ink-brand-mid',
            active && activeItemState === 'section' && 'text-brand-primary',
          )}
        >
          {t('ticketsAndOffers')}
          <ChevronDownIcon size={12} className="opacity-70" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={10}
          className={dropdownContentClassName()}
        >
          {TICKETS_OFFERS_LINKS.map((item) => (
            <DropdownMenu.Item
              key={item.key}
              className={dropdownItemClassName()}
              onSelect={() => onNavigate(item.href)}
            >
              {t(`ticketsMenu.${item.key}`)}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function ProfileDropdown({
  account,
  onNavigate,
}: {
  account?: SiteHeaderProps['account']
  onNavigate: (path: string) => void
}) {
  const { t } = useTranslation(['nav', 'common'])
  const { signOut, isLoading } = useSignOut()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex shrink-0 items-center gap-control-gap rounded-search border-[1.5px] border-border-default bg-surface-default py-[5px] pe-[12px] ps-[5px] transition-[border-color,opacity] duration-micro ease-micro hover:border-border-brand hover:opacity-95"
          aria-label={
            account?.name
              ? t('nav:profileNamed', { name: account.name })
              : t('nav:profile')
          }
        >
          <Avatar initials={account?.initials ?? ''} size="md" />
          <span className="hidden max-w-[8rem] truncate text-[14px] font-bold text-ink-primary xl:inline">
            {account?.name}
          </span>
          <ChevronDownIcon size={12} className="opacity-70" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className={dropdownContentClassName()}
        >
          {PROFILE_LINKS.map((item) => (
            <DropdownMenu.Item
              key={item.key}
              className={dropdownItemClassName()}
              onSelect={() => onNavigate(item.href)}
            >
              {t(`nav:accountMenu.${item.key}`)}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-sm h-px bg-border-divider" />
          <DropdownMenu.Item
            className={cn(dropdownItemClassName(), 'text-state-danger data-[highlighted]:text-state-danger')}
            disabled={isLoading}
            onSelect={() => {
              void signOut()
            }}
          >
            <span className="inline-flex items-center gap-[8px]">
              <PowerIcon size={14} />
              {t('common:actions.signOut')}
            </span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function DesktopAuthActions({
  state,
  account,
  onNavigate,
}: {
  state: 'signedOut' | 'signedIn'
  account?: SiteHeaderProps['account']
  onNavigate: (path: string) => void
}) {
  const { t } = useTranslation(['nav', 'common'])

  if (state === 'signedOut') {
    return (
      <Button size="md" onClick={() => onNavigate('/sign-in')}>
        {t('common:actions.login')}
      </Button>
    )
  }

  return (
    <>
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
      <ProfileDropdown account={account} onNavigate={onNavigate} />
    </>
  )
}

function MobileDrawerAuth({
  state,
  account,
  onNavigate,
  onClose,
}: {
  state: 'signedOut' | 'signedIn'
  account?: SiteHeaderProps['account']
  onNavigate: (path: string) => void
  onClose: () => void
}) {
  const { t } = useTranslation(['nav', 'common'])
  const { signOut, isLoading } = useSignOut()

  if (state === 'signedOut') {
    return (
      <div className="mb-xl flex flex-col gap-sm">
        <Button size="md" onClick={() => onNavigate('/sign-in')} className="w-full">
          {t('common:actions.login')}
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-xl flex flex-col gap-md">
      <div className="flex items-center gap-sm">
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
        <div className="ms-auto flex min-w-0 items-center gap-control-gap rounded-search border-[1.5px] border-border-default bg-surface-default py-[5px] pe-[12px] ps-[5px]">
          <Avatar initials={account?.initials ?? ''} size="md" />
          {account?.name ? (
            <span className="max-w-[7rem] truncate text-[13px] font-bold text-ink-primary">
              {account.name}
            </span>
          ) : null}
        </div>
      </div>

      {PROFILE_LINKS.map((item) => (
        <Link
          key={item.key}
          to={item.href}
          onClick={onClose}
          className="text-[15px] font-bold text-ink-primary transition-colors duration-micro ease-micro hover:text-ink-secondary"
        >
          {t(`nav:accountMenu.${item.key}`)}
        </Link>
      ))}

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

function MainNav({
  activeItem,
  activeItemState,
  onNavigate,
  className,
  itemClassName,
  ticketsMode = 'dropdown',
}: {
  activeItem?: string
  activeItemState: 'active' | 'section'
  onNavigate: (path: string) => void
  className?: string
  itemClassName?: string
  ticketsMode?: 'dropdown' | 'flat'
}) {
  const { t } = useTranslation('nav')

  const talentsActive = navItemActive('Talents', activeItem)
  const offersActive = navItemActive('Offers', activeItem)
  const institutionsActive = navItemActive('Institutions', activeItem)
  const ticketsActive = navItemActive('TicketsAndOffers', activeItem)

  return (
    <nav aria-label={t('main')} className={className}>
      {ticketsMode === 'dropdown' ? (
        <TicketsOffersDropdown
          active={ticketsActive}
          activeItemState={activeItemState}
          onNavigate={onNavigate}
        />
      ) : (
        <>
          <p className="text-[12px] font-bold tracking-[0.06em] text-ink-muted uppercase">
            {t('ticketsAndOffers')}
          </p>
          {TICKETS_OFFERS_LINKS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={cn(
                'min-h-[44px] text-start text-[14px] font-semibold text-ink-primary',
                itemClassName,
              )}
              onClick={() => onNavigate(item.href)}
            >
              {t(`ticketsMenu.${item.key}`)}
            </button>
          ))}
        </>
      )}
      <NavItem
        label={t('talents')}
        href="/talents"
        state={talentsActive ? activeItemState : 'default'}
        className={itemClassName}
        onClick={(event) => {
          event.preventDefault()
          onNavigate('/talents')
        }}
      />
      <NavItem
        label={t('offers')}
        href="/events"
        state={offersActive ? activeItemState : 'default'}
        className={itemClassName}
        onClick={(event) => {
          event.preventDefault()
          onNavigate('/events')
        }}
      />
      <NavItem
        label={t('institutions')}
        href="/become-business"
        state={institutionsActive ? activeItemState : 'default'}
        className={itemClassName}
        onClick={(event) => {
          event.preventDefault()
          onNavigate('/become-business')
        }}
      />
    </nav>
  )
}

export function SiteHeader({
  state = 'signedOut',
  activeItem,
  activeItemState = 'active',
  showSearch = true,
  account,
  className,
}: SiteHeaderProps) {
  const { t } = useTranslation(['nav', 'common'])
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const dispatch = useAppDispatch()
  const mobileNavOpen = useAppSelector(selectMobileNavOpen)

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
      <div className="flex h-full w-full max-w-[1400px] items-center gap-md px-gutter-desktop lg:gap-[28px]">
        <Link to="/" aria-label={t('nav:home')} className="shrink-0">
          <Logo height={40} alt="" />
        </Link>

        <MainNav
          activeItem={activeItem}
          activeItemState={activeItemState}
          onNavigate={go}
          className="hidden shrink-0 items-center gap-2xl lg:flex"
        />

        <div className="h-px flex-1" />

        {showSearch && (
          <form
            onSubmit={onSearch}
            className="hidden min-w-0 max-w-[300px] flex-1 sm:block lg:min-w-[200px] lg:shrink-0 lg:transition-[max-width] lg:duration-normal lg:ease-standard lg:focus-within:max-w-[320px]"
          >
            <SearchPill name="q" className="w-full" placeholder={t('nav:searchPlaceholder')} />
          </form>
        )}

        <div className="hidden items-center gap-[14px] lg:flex">
          <DesktopAuthActions state={state} account={account} onNavigate={go} />
          <HeaderLanguagePill />
        </div>

        <div className="flex shrink-0 items-center gap-sm lg:hidden">
          <HeaderLanguagePill />
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
                onNavigate={go}
                onClose={closeDrawer}
              />

              <div className="mb-xl h-px w-full bg-border-divider" />

              <MainNav
                activeItem={activeItem}
                activeItemState={activeItemState}
                onNavigate={go}
                ticketsMode="flat"
                className="flex flex-col items-stretch gap-md"
                itemClassName="min-h-[44px] items-center"
              />

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
