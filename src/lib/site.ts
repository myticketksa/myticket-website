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

/** Official MyTicket mobile apps. */
export const APP_STORE_URL =
  'https://apps.apple.com/eg/app/%D8%AA%D8%B0%D9%83%D8%B1%D8%AA%D9%8A-my-ticket/id1524202385'

export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.t4l.myticket'

/** Public contact — shown in the site footer. */
export const SITE_PHONE = '+966 51 269 782'
export const SITE_PHONE_HREF = 'tel:+96651269782'
export const SITE_EMAIL = 'business@myticket.sa'
export const SITE_EMAIL_HREF = 'mailto:business@myticket.sa'

export type FormatDocumentTitleOptions = {
  /** Localized home title, e.g. `MyTicket — Live events…`. */
  homeTitle?: string
  /** Localized tagline used when `homeTitle` is omitted. */
  tagline?: string
  /** Template with `{{page}}`, e.g. `{{page}} · MyTicket`. */
  titleFormat?: string
  siteName?: string
}

/** Browser tab title: `Page · MyTicket` (home uses the marketing title). */
export function formatDocumentTitle(
  pageTitle?: string | null,
  options?: FormatDocumentTitleOptions,
): string {
  const page = pageTitle?.trim()
  const siteName = options?.siteName ?? SITE_NAME
  const tagline = options?.tagline ?? SITE_TAGLINE
  const homeTitle = options?.homeTitle ?? `${siteName} — ${tagline}`

  if (!page || page === siteName) return homeTitle

  if (options?.titleFormat) {
    return options.titleFormat.replace(/\{\{\s*page\s*\}\}/g, page)
  }

  return `${page} · ${siteName}`
}
