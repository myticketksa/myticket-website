import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/i18n/locale'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'

/**
 * Figma `SiteFooter` — node 207:2977. Two sizes: `full` and `minimal`.
 *
 * `--bg-warm` ground, inner band capped at 1400 with 40 gutters — the same shell the
 * header uses. The columns row is padded `56 40 32`, the bottom bar `20 40 40`.
 *
 * **The grid is expressed as a grid.** Figma pins the brand column at 300.741px because
 * auto-layout has no fractional flex-grow, and its own note derives that number from a
 * stated `1.4fr 1fr 1fr 1fr 1fr` track list with a 40 gap: inside `1400 − 80`, four 40
 * gaps leave 1160, and `1.4 × (1160 / 5.4)` is 300.74. CSS can express the intent
 * directly, so the track list is used and the pinned pixel value is dropped. This is the
 * one place in the build where a Figma measurement is deliberately *not* reproduced, and
 * it is because the measurement is a workaround for a tool limitation the target does not
 * have.
 *
 * `minimal` is the bottom bar alone. Figma marks it **not sourced** — a lead-specified
 * reduction rather than something drawn upstream. It carries no top border on the shell,
 * so the bar's own 1px rule is not doubled 20px below a second one.
 *
 * Figma also records that this supersedes the much smaller footer in the older
 * design-system documentation, which described a single 24/40 bar.
 *
 * Column headings are `#D8431A` — the primitive `brand/600` with no semantic text alias,
 * which is why they resolve to `--ink-brand-mid`. Their type is `Label/Overline` exactly.
 */
const SOCIAL = ['Instagram', 'X', 'TikTok', 'YouTube'] as const

export interface SiteFooterProps {
  size?: 'full' | 'minimal'
  className?: string
}

export function SiteFooter({ size = 'full', className }: SiteFooterProps) {
  const { t } = useTranslation('nav')
  const { roleLabel } = useLocale()
  const organizer = roleLabel('organizer')
  const vendor = roleLabel('vendor')
  const talent = roleLabel('talent')

  const columns = [
    {
      heading: t('footer.platform'),
      links: [
        { label: t('events'), href: '/events' },
        { label: t('experiences'), href: '/experiences' },
        { label: t('talents'), href: '/talents' },
        { label: t('footer.auction'), href: '/auctions' },
      ],
    },
    {
      heading: t('footer.account'),
      links: [
        { label: t('myTickets'), href: '/my-tickets' },
        { label: t('footer.favouritesWaitlists'), href: '/saved' },
        { label: t('footer.wallet'), href: '/wallet' },
        { label: t('footer.myReviews'), href: '/my-reviews' },
        { label: t('footer.mySubmissions'), href: '/my-submissions' },
        { label: t('footer.settings'), href: '/settings' },
      ],
    },
    {
      heading: t('footer.support'),
      links: [
        { label: t('footer.aboutMyTicket'), href: '/about' },
        { label: t('footer.helpCentre'), href: '/help' },
        { label: t('footer.contactUs'), href: '/support/new' },
        { label: t('footer.terms'), href: '/legal' },
        { label: t('footer.privacy'), href: '/legal' },
        { label: t('footer.cookies'), href: '/legal' },
      ],
    },
    {
      heading: t('footer.business'),
      links: [
        { label: t('footer.forOrganizers', { role: organizer }), href: '/for-organizers' },
        { label: t('footer.becomeTalent', { role: talent }), href: '/apply/talent' },
        { label: t('footer.becomeVendor', { role: vendor }), href: '/apply/vendor' },
        { label: t('footer.businessPaths'), href: '/become-business' },
      ],
    },
  ] as const

  return (
    <footer
      className={cn(
        'flex w-full flex-col items-center bg-bg-warm',
        size === 'full' && 'border-t border-border-default',
        className,
      )}
    >
      {size === 'full' && (
        <div className="grid w-full max-w-[1400px] grid-cols-1 items-start gap-3xl px-gutter-desktop pt-5xl-min pb-3xl sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:gap-4xl">
          <div className="flex flex-col items-start sm:col-span-2 lg:col-span-1">
            <Link to="/" aria-label={t('home')}>
              <Logo height={44} className="mb-[14px]" />
            </Link>

            <p className="mb-xl max-w-[300px] text-body-small text-ink-secondary">
              {t('footer.blurb')}
            </p>

            <div className="mb-[18px] flex flex-wrap items-start gap-sm">
              {(
                [
                  { key: 'ios', label: t('footer.iosApp') },
                  { key: 'android', label: t('footer.androidApp') },
                ] as const
              ).map(({ key, label }) => (
                <a
                  key={key}
                  href="#"
                  className="rounded-input border-[1.5px] border-border-default bg-surface-default px-[14px] py-[9px] text-[13px] font-semibold whitespace-nowrap text-ink-primary transition-[color,border-color] duration-micro ease-micro hover:border-border-brand hover:text-ink-brand-mid"
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="flex flex-wrap items-start gap-[14px]">
              {SOCIAL.map((label) => (
                <a
                  key={label}
                  href="#"
                  className="text-[13px] font-semibold whitespace-nowrap text-ink-secondary transition-colors duration-micro ease-micro hover:text-ink-brand-mid"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading} className="flex flex-col items-start">
              <p className="text-label-overline mb-[14px] text-ink-brand-mid">{column.heading}</p>
              <ul className="flex w-full flex-col items-start gap-[9px]">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      to={link.href}
                      className="text-body-small text-ink-primary transition-colors duration-micro ease-micro hover:text-ink-brand-mid"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      )}

      <div className="flex w-full max-w-[1400px] flex-col gap-sm border-t border-border-default px-gutter-desktop pt-xl pb-4xl text-body-caption text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:gap-lg">
        <p>{t('footer.copyright', { year: 2026 })}</p>
        <p>{t('footer.madeInKsa')}</p>
      </div>
    </footer>
  )
}
