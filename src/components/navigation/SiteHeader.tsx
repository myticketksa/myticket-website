import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, CountBadge } from '@/components/data-display'
import { BellIcon, HeartGlyphIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { useLocale } from '@/i18n/locale'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'
import { NavItem } from './NavItem'
import { SearchPill } from './SearchPill'

/**
 * Figma `SiteHeader` — node 207:2936, State=Signed out `207:2937` / Signed in `207:2954`.
 *
 * An 80px shell (`--size-header`) on `--bg-page` under a 1px `--border-default` rule, with
 * a 1400 inner band and 40 gutters — the same shell `SiteFooter` uses. Inside: the logo at
 * 73×40, the nav at a 24 gap, a flex spacer, the search slot, then the auth or account
 * cluster at a 14 gap. The 38px gap on the content row is what separates the logo from the
 * nav.
 *
 * The blur is the one measurement that needs converting rather than copying. The attached
 * effect style is `Blur/Header`, a background blur of radius 14, and `--blur-header` holds
 * that Figma value; CSS `backdrop-filter` takes a standard deviation, which is half the
 * Figma radius, so the class is `backdrop-blur-[7px]` — exactly what Figma's own codegen
 * emits. The token is not used directly here because doing so would double the blur.
 *
 * **The search slot flexes.** Figma gives it `flex 1 1 auto` between a 200 minimum and a
 * 300 maximum, which is the entire reason `SearchPill` exists alongside `SearchField`.
 *
 * **All five nav items are real `NavItem` instances,** which Figma is emphatic about:
 * *"Select the header instance and set the relevant nav item to State=Active — do NOT
 * restyle the label by hand."* Hence `activeItem`, matched against the item label, rather
 * than a colour prop. Figma also records which pages have no active item at all (Home,
 * Event Details, Search Results, Auction) and that detail pages use `section` on their
 * parent's item, so both are expressible.
 *
 * Three places this header draws its own version of an atom rather than instancing it, all
 * near misses:
 *
 * - The **language pill** is h36 / padding 13 / 13px, where the DS `LanguagePill`
 *   (`207:1793`) is h32 / padding 12 / 12px. Three mismatches, so it is local. Both are
 *   Cairo, and the header's has a fill where the atom's is transparent.
 * - The **count badge** is 17 tall with a 17 minimum and 10px/800 type, where `CountBadge`
 *   web is 16/16 at 9.5px/800. One pixel and half a point out, which is exactly the kind of
 *   drift that argues for the atom — so `CountBadge` is used with the size overridden, and
 *   the offset is −5.5 rather than the atom's documented −4.
 * - The **notifications button** is a 36 box at radius 18, where `Button variant="icon"`
 *   size S is 36 at radius 18 — a match on both, but it also carries the 1.5px border and
 *   white ground, so it is a genuine instance and is built as one.
 *
 * The avatar chip is where the header contradicted the design system: `Avatar` documents
 * that no 32px size exists, and `207:2974` draws one at radius 16 with 13px/700 initials.
 * The atom gained an `md` size for it.
 *
 * One thing kept against my instinct: the **Sign in button carries a 16px heart**
 * (`I207:2952;207:1666`). A heart on a sign-in action reads like the `Button` component's
 * default icon slot left in place rather than intent. It is drawn in the source, so it is
 * drawn here, and `signInIcon` exists to switch it off in one place if the design agrees it
 * is a leftover.
 *
 * **Not built:** any mobile or condensed arrangement, a nav overflow, a search-expanded
 * state, and the account dropdown the avatar chip implies — the source draws the chip but
 * no menu.
 */
export interface HeaderNavLink {
  label: string
  href: string
}

export interface SiteHeaderProps {
  state?: 'signedOut' | 'signedIn'
  nav?: HeaderNavLink[]
  /**
   * The label of the nav item to mark. `active` is a listing page on its own item;
   * `section` is a detail page marking its parent. Omit on pages with no active item.
   */
  activeItem?: string
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

const DEFAULT_NAV: HeaderNavLink[] = [
  { label: 'Events', href: '/events' },
  { label: 'Talents', href: '/talents' },
  { label: 'Experiences', href: '/experiences' },
]

/**
 * h36, padding `0 13`, 1.5px border, pill radius, 13px/700 Cairo. Not the DS
 * `LanguagePill`, which is h32 / 12 / 12px. Toggles en ↔ ar and document dir.
 */
function HeaderLanguagePill() {
  const { locale, toggleLocale } = useLocale()
  const nextLabel = locale === 'en' ? 'العربية' : 'English'

  return (
    <button
      type="button"
      lang={locale === 'en' ? 'ar' : 'en'}
      dir="auto"
      onClick={toggleLocale}
      aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
      className="font-arabic inline-flex h-[36px] shrink-0 items-center justify-center rounded-pill border-[1.5px] border-border-default bg-surface-default px-[13px] text-[13px] font-bold whitespace-nowrap text-ink-secondary transition-[color,border-color,opacity] duration-micro ease-micro hover:border-border-brand hover:text-ink-primary"
    >
      {nextLabel}
    </button>
  )
}

export function SiteHeader({
  state = 'signedOut',
  nav = DEFAULT_NAV,
  activeItem,
  activeItemState = 'active',
  showSearch = true,
  account,
  signInIcon = true,
  className,
}: SiteHeaderProps) {
  const navigate = useNavigate()

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const q = String(data.get('q') ?? '').trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <header
      className={cn(
        'flex h-header w-full items-center justify-center border-b border-border-default bg-bg-page backdrop-blur-[7px]',
        className,
      )}
    >
      <div className="flex h-full w-full max-w-[1400px] items-center gap-[38px] px-gutter-desktop">
        <Link to="/" aria-label="MyTicket home" className="shrink-0">
          <Logo height={40} alt="" />
        </Link>

        <nav aria-label="Main" className="flex shrink-0 items-center gap-2xl">
          {nav.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              href={item.href}
              state={item.label === activeItem ? activeItemState : 'default'}
            />
          ))}
        </nav>

        <div className="h-px flex-1" />

        {showSearch && (
          <form
            onSubmit={onSearch}
            className="min-w-[200px] max-w-[300px] flex-1 shrink-0 transition-[max-width] duration-normal ease-standard focus-within:max-w-[320px]"
          >
            <SearchPill name="q" className="w-full" />
          </form>
        )}

        {state === 'signedOut' ? (
          <div className="flex shrink-0 items-center gap-[14px]">
            <HeaderLanguagePill />
            <Button
              variant="secondary"
              size="md"
              icon={signInIcon ? <HeartGlyphIcon size={16} /> : undefined}
              onClick={() => navigate('/sign-in')}
            >
              Sign in
            </Button>
            <Button size="md" onClick={() => navigate('/register')}>
              Create account
            </Button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-[14px]">
            <HeaderLanguagePill />

            <span className="relative shrink-0">
              <Button
                variant="icon"
                size="sm"
                aria-label="Notifications"
                onClick={() => navigate('/notifications')}
              >
                <BellIcon size={16} />
              </Button>
              {account?.notifications !== undefined && (
                <span className="absolute -top-[5.5px] -right-[5.5px]">
                  <CountBadge
                    count={account.notifications}
                    className="h-[17px] min-w-[17px] rounded-[9px] text-[10px]"
                  />
                </span>
              )}
            </span>

            <Link
              to="/my-tickets"
              className="text-[15px] font-bold whitespace-nowrap text-ink-primary transition-[color,opacity] duration-micro ease-micro hover:text-ink-secondary"
            >
              My tickets
            </Link>

            <Link
              to="/profile"
              className="flex shrink-0 items-center gap-control-gap rounded-search border-[1.5px] border-border-default bg-surface-default py-[5px] pr-[14px] pl-[5px] transition-[border-color,opacity] duration-micro ease-micro hover:border-border-brand hover:opacity-95"
            >
              <Avatar initials={account?.initials ?? ''} size="md" />
              <span className="text-[14px] font-bold whitespace-nowrap text-ink-primary">
                {account?.name}
              </span>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
