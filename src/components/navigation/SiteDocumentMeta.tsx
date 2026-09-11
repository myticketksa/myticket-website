import { useEffect } from 'react'
import { useLocation, matchPath } from 'react-router-dom'
import {
  absoluteUrl,
  formatDocumentTitle,
  SITE_DESCRIPTION,
} from '@/lib/site'

/**
 * Route → browser-tab title. Patterns are checked in order; first match wins.
 * Detail routes keep a stable section title (slug-specific titles can be set later).
 */
const TITLE_RULES: { pattern: string; title: string }[] = [
  { pattern: '/', title: 'MyTicket' },
  { pattern: '/events', title: 'Events' },
  { pattern: '/events/:slug/seats', title: 'Choose seats' },
  { pattern: '/events/:slug', title: 'Event' },
  { pattern: '/search', title: 'Search' },
  { pattern: '/talents', title: 'Talents' },
  { pattern: '/talents/:slug', title: 'Talent' },
  { pattern: '/experiences', title: 'Experiences' },
  { pattern: '/experiences/:slug', title: 'Experience' },
  { pattern: '/auctions', title: 'Auctions' },
  { pattern: '/auctions/:slug', title: 'Auction' },
  { pattern: '/checkout', title: 'Checkout' },
  { pattern: '/order-confirmation', title: 'Order confirmed' },
  { pattern: '/sign-in', title: 'Sign in' },
  { pattern: '/register', title: 'Create account' },
  { pattern: '/reset-password', title: 'Reset password' },
  { pattern: '/profile', title: 'Profile' },
  { pattern: '/settings', title: 'Settings' },
  { pattern: '/my-tickets', title: 'My tickets' },
  { pattern: '/my-tickets/:id/gift', title: 'Gift ticket' },
  { pattern: '/my-tickets/:id/resell', title: 'Resell ticket' },
  { pattern: '/my-tickets/:id/refund', title: 'Request refund' },
  { pattern: '/my-tickets/:id', title: 'Ticket' },
  { pattern: '/gift/claim/:giftTicketId', title: 'Claim gift' },
  { pattern: '/saved', title: 'Saved' },
  { pattern: '/notifications', title: 'Notifications' },
  { pattern: '/wallet', title: 'Wallet' },
  { pattern: '/my-reviews', title: 'My reviews' },
  { pattern: '/my-submissions', title: 'My submissions' },
  { pattern: '/my-vendor-application', title: 'Vendor application' },
  { pattern: '/my-talent-application', title: 'Talent application' },
  { pattern: '/my-auction-activity', title: 'Auction activity' },
  { pattern: '/submit-experience', title: 'Submit experience' },
  { pattern: '/become-business', title: 'Become a business' },
  { pattern: '/apply/vendor', title: 'Apply as vendor' },
  { pattern: '/apply/organizer', title: 'Organizer partnership' },
  { pattern: '/apply/talent', title: 'Apply as talent' },
  { pattern: '/application-submitted', title: 'Application submitted' },
  { pattern: '/support', title: 'Support' },
  { pattern: '/support/new', title: 'New support case' },
  { pattern: '/support/chat', title: 'Support chat' },
  { pattern: '/about', title: 'About' },
  { pattern: '/help', title: 'Help' },
  { pattern: '/legal', title: 'Legal' },
  { pattern: '/for-vendors', title: 'For vendors' },
  { pattern: '/for-organizers', title: 'For organizers' },
  { pattern: '/for-talents', title: 'For talents' },
  { pattern: '/maintenance', title: 'Maintenance' },
  { pattern: '/probe', title: 'Component probe' },
]

function titleForPath(pathname: string): string {
  for (const rule of TITLE_RULES) {
    if (matchPath({ path: rule.pattern, end: true }, pathname)) {
      return rule.title
    }
  }
  return 'Page not found'
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

/**
 * Keeps the browser tab title (and share meta) in sync with the route.
 * Favicon / default OG tags live in `index.html`; this refreshes absolute URLs
 * from `VITE_SITE_URL` when set.
 */
export function SiteDocumentMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const pageTitle = titleForPath(pathname)
    document.title = formatDocumentTitle(pageTitle === 'MyTicket' ? null : pageTitle)
    setMetaTag('name', 'description', SITE_DESCRIPTION)

    const pageUrl = absoluteUrl(pathname === '/' ? '/' : pathname)
    const imageUrl = absoluteUrl('/og-image.png')

    setMetaTag('property', 'og:title', document.title)
    setMetaTag('property', 'og:description', SITE_DESCRIPTION)
    setMetaTag('property', 'og:url', pageUrl)
    setMetaTag('property', 'og:image', imageUrl)
    setMetaTag('name', 'twitter:title', document.title)
    setMetaTag('name', 'twitter:description', SITE_DESCRIPTION)
    setMetaTag('name', 'twitter:image', imageUrl)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = pageUrl
  }, [pathname])

  return null
}
