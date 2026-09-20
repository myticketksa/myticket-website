import { Outlet, useLocation } from 'react-router-dom'
import { SiteFooter, SiteHeader } from '@/components/navigation'
import { PageFade } from '@/components/motion'
import { useAppSelector } from '@/app/hooks'
import { selectIsAuthenticated } from '@/features/auth/authSlice'
import { useHeaderAccount } from '@/lib/auth/accountChip'

/**
 * Pattern A — MainLayout.
 * Active nav derived from path. Offers marks /events listing;
 * Tickets & offers marks experience filters and newest-events entry points.
 */
function resolveNav(
  pathname: string,
  search: string,
): {
  activeItem?: string
  activeItemState?: 'active' | 'section'
} {
  const segments = pathname.split('/').filter(Boolean)
  const root = segments[0]
  if (!root) return {}

  if (root === 'search') return {}

  // Institutions → public chooser; apply funnels stay marked while in progress.
  if (
    pathname.startsWith('/become-business') ||
    pathname.startsWith('/apply/vendor') ||
    pathname.startsWith('/apply/talent')
  ) {
    return { activeItem: 'Institutions', activeItemState: 'active' }
  }

  if (root === 'talents') {
    return {
      activeItem: 'Talents',
      activeItemState: segments.length === 1 ? 'active' : 'section',
    }
  }

  if (root === 'events') {
    const params = new URLSearchParams(search)
    if (params.get('sort') === 'newest') {
      return {
        activeItem: 'TicketsAndOffers',
        activeItemState: segments.length === 1 ? 'active' : 'section',
      }
    }
    return {
      activeItem: 'Offers',
      activeItemState: segments.length === 1 ? 'active' : 'section',
    }
  }

  if (root === 'experiences') {
    return {
      activeItem: 'TicketsAndOffers',
      activeItemState: segments.length === 1 ? 'active' : 'section',
    }
  }

  return {}
}

export function MainLayout() {
  const { pathname, search } = useLocation()
  const nav = resolveNav(pathname, search)
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
