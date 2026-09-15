import { Outlet, useLocation } from 'react-router-dom'
import { SiteFooter, SiteHeader } from '@/components/navigation'
import { PageFade } from '@/components/motion'
import { useAppSelector } from '@/app/hooks'
import { selectIsAuthenticated } from '@/features/auth/authSlice'
import { useHeaderAccount } from '@/lib/auth/accountChip'

/**
 * Pattern A — MainLayout. Verified on Home `207:4362`.
 *
 * SiteHeader + Outlet + SiteFooter. Sections inside the outlet are full-bleed and use
 * `PageSection` for the 1320 band. Active nav is derived from the path's first segment.
 *
 * Pages with no active item (Home, Event Details, Search) leave the header
 * unmarked; detail pages under a listing section use `section` state on the parent item.
 */
const LISTING_ACTIVE: Record<string, string> = {
  events: 'Events',
  talents: 'Talents',
  experiences: 'Experiences',
}

const DETAIL_SECTION: Record<string, string> = {
  events: 'Events',
  talents: 'Talents',
  experiences: 'Experiences',
}

function resolveNav(pathname: string): {
  activeItem?: string
  activeItemState?: 'active' | 'section'
} {
  const segments = pathname.split('/').filter(Boolean)
  const root = segments[0]
  if (!root) return {}

  if (root === 'search') return {}
  // Vendors nav opens the apply funnel — mark active on that path.
  if (pathname.startsWith('/apply/vendor')) {
    return { activeItem: 'Vendors', activeItemState: 'active' }
  }

  if (root in LISTING_ACTIVE) {
    if (segments.length === 1) {
      return { activeItem: LISTING_ACTIVE[root], activeItemState: 'active' }
    }
    if (root in DETAIL_SECTION) {
      return { activeItem: DETAIL_SECTION[root], activeItemState: 'section' }
    }
  }

  return {}
}

export function MainLayout() {
  const { pathname } = useLocation()
  const nav = resolveNav(pathname)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const account = useHeaderAccount()
  const signedIn = isAuthenticated || pathname === '/order-confirmation'

  return (
    <div className="flex min-h-dvh flex-col bg-bg-page">
      <SiteHeader
        state={signedIn ? 'signedIn' : 'signedOut'}
        activeItem={nav.activeItem}
        activeItemState={nav.activeItemState}
        account={signedIn ? account : undefined}
      />
      <main className="flex-1">
        <PageFade>
          <Outlet />
        </PageFade>
      </main>
      <SiteFooter />
    </div>
  )
}
