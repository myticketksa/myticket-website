import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, matchPath } from 'react-router-dom'
import { useLocale } from '@/i18n/locale'
import { absoluteUrl, formatDocumentTitle } from '@/lib/site'

/**
 * Route → browser-tab title key under `meta:titles.*`.
 * Patterns are checked in order; first match wins.
 * Detail routes keep a stable section title (slug-specific titles can be set later).
 */
const TITLE_RULES: { pattern: string; titleKey: string }[] = [
  { pattern: '/', titleKey: 'titles.home' },
  { pattern: '/events', titleKey: 'titles.events' },
  { pattern: '/events/:slug/seats', titleKey: 'titles.chooseSeats' },
  { pattern: '/events/:slug', titleKey: 'titles.event' },
  { pattern: '/search', titleKey: 'titles.search' },
  { pattern: '/talents', titleKey: 'titles.talents' },
  { pattern: '/talents/:slug', titleKey: 'titles.talent' },
  { pattern: '/experiences', titleKey: 'titles.experiences' },
  { pattern: '/experiences/:slug', titleKey: 'titles.experience' },
  { pattern: '/checkout', titleKey: 'titles.checkout' },
  { pattern: '/order-confirmation', titleKey: 'titles.orderConfirmed' },
  { pattern: '/sign-in', titleKey: 'titles.signIn' },
  { pattern: '/register', titleKey: 'titles.createAccount' },
  { pattern: '/reset-password', titleKey: 'titles.resetPassword' },
  { pattern: '/profile', titleKey: 'titles.profile' },
  { pattern: '/settings', titleKey: 'titles.settings' },
  { pattern: '/my-tickets', titleKey: 'titles.myTickets' },
  { pattern: '/my-tickets/:id/gift', titleKey: 'titles.giftTicket' },
  { pattern: '/my-tickets/:id/refund', titleKey: 'titles.requestRefund' },
  { pattern: '/my-tickets/:id', titleKey: 'titles.ticket' },
  { pattern: '/gift/claim/:giftTicketId', titleKey: 'titles.claimGift' },
  { pattern: '/favorites', titleKey: 'titles.favorites' },
  { pattern: '/saved', titleKey: 'titles.favorites' },
  { pattern: '/notifications', titleKey: 'titles.notifications' },
  { pattern: '/wallet', titleKey: 'titles.wallet' },
  { pattern: '/my-reviews', titleKey: 'titles.myReviews' },
  { pattern: '/my-submissions', titleKey: 'titles.mySubmissions' },
  { pattern: '/my-facilities-application', titleKey: 'titles.vendorApplication' },
  { pattern: '/my-vendor-application', titleKey: 'titles.vendorApplication' },
  { pattern: '/my-talent-application', titleKey: 'titles.talentApplication' },
  { pattern: '/submit-experience', titleKey: 'titles.submitExperience' },
  { pattern: '/become-business', titleKey: 'titles.becomeBusiness' },
  { pattern: '/for-facilities', titleKey: 'titles.forVendors' },
  { pattern: '/for-vendors', titleKey: 'titles.forVendors' },
  { pattern: '/apply/facilities', titleKey: 'titles.applyVendor' },
  { pattern: '/apply/vendor', titleKey: 'titles.applyVendor' },
  { pattern: '/apply/talent', titleKey: 'titles.applyTalent' },
  { pattern: '/application-submitted', titleKey: 'titles.applicationSubmitted' },
  { pattern: '/support', titleKey: 'titles.support' },
  { pattern: '/support/new', titleKey: 'titles.newSupportCase' },
  { pattern: '/support/chat', titleKey: 'titles.supportChat' },
  { pattern: '/about', titleKey: 'titles.about' },
  { pattern: '/help', titleKey: 'titles.help' },
  { pattern: '/legal', titleKey: 'titles.legal' },

  { pattern: '/maintenance', titleKey: 'titles.maintenance' },
  { pattern: '/probe', titleKey: 'titles.probe' },
]

function titleKeyForPath(pathname: string): string | null {
  for (const rule of TITLE_RULES) {
    if (matchPath({ path: rule.pattern, end: true }, pathname)) {
      return rule.titleKey
    }
  }
  return null
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
  const { locale } = useLocale()
  const { t, i18n } = useTranslation('meta')

  useEffect(() => {
    const titleKey = titleKeyForPath(pathname)
    const pageTitle = titleKey ? t(titleKey) : t('notFound')
    const siteName = t('siteName')
    const isHome = !titleKey || titleKey === 'titles.home' || pageTitle === siteName

    document.title = formatDocumentTitle(isHome ? null : pageTitle, {
      homeTitle: t('homeTitle'),
      tagline: t('tagline'),
      titleFormat: t('titleFormat'),
      siteName,
    })

    const description = t('description')
    setMetaTag('name', 'description', description)

    const pageUrl = absoluteUrl(pathname === '/' ? '/' : pathname)
    const imageUrl = absoluteUrl('/og-image.png')
    const ogLocale = locale === 'ar' ? 'ar_SA' : 'en_SA'

    setMetaTag('property', 'og:title', document.title)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:url', pageUrl)
    setMetaTag('property', 'og:image', imageUrl)
    setMetaTag('property', 'og:locale', ogLocale)
    setMetaTag('name', 'twitter:title', document.title)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', imageUrl)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = pageUrl
  }, [pathname, locale, t, i18n.language])

  return null
}
