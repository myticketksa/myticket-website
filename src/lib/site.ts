/**
 * Site identity for document title, Open Graph, and absolute asset URLs.
 * Logo / mark assets ship from Figma node `207:3096` (see `public/brand/`).
 */

export const SITE_NAME = 'MyTicket'

export const SITE_TAGLINE = 'Live events & tickets in Saudi Arabia'

export const SITE_DESCRIPTION =
  'Find concerts, sports, festivals, theatre, and experiences across Saudi Arabia. Buy verified tickets on MyTicket.'

/** Public origin used for absolute og:url / share links. Override with VITE_SITE_URL. */
export const SITE_ORIGIN = (
  import.meta.env.VITE_SITE_URL ||
  'https://myticket.sa'
).replace(/\/$/, '')

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_ORIGIN}${normalized}`
}

/** Browser tab title: `Page · MyTicket` (home uses the marketing title). */
export function formatDocumentTitle(pageTitle?: string | null): string {
  const page = pageTitle?.trim()
  if (!page) return `${SITE_NAME} — ${SITE_TAGLINE}`
  if (page === SITE_NAME) return `${SITE_NAME} — ${SITE_TAGLINE}`
  return `${page} · ${SITE_NAME}`
}
