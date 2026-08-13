import { Link } from 'react-router-dom'
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
 *
 * All twenty link strings, both bottom-bar lines and the blurb are the source's copy,
 * verbatim. The `href`s are the obvious slugs and still need reconciling against the
 * router once the route table lands.
 */
const COLUMNS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Events', href: '/events' },
      { label: 'Experiences', href: '/experiences' },
      { label: 'Talents', href: '/talents' },
      { label: 'Vendors', href: '/vendors' },
      { label: 'Organizers', href: '/organizers' },
      { label: 'Auction', href: '/auctions' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'My tickets', href: '/my-tickets' },
      { label: 'Favourites & waitlists', href: '/saved' },
      { label: 'My enquiries', href: '/my-enquiries' },
      { label: 'Wallet', href: '/wallet' },
      { label: 'My reviews', href: '/my-reviews' },
      { label: 'Settings', href: '/settings' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'About MyTicket', href: '/about' },
      { label: 'Help centre', href: '/help' },
      { label: 'Contact us', href: '/support/new' },
      { label: 'Terms of service', href: '/legal' },
      { label: 'Privacy policy', href: '/legal' },
      { label: 'Cookie policy', href: '/legal' },
    ],
  },
  {
    heading: 'Business',
    links: [
      { label: 'Become an organizer', href: '/apply/organizer' },
      { label: 'Become a talent', href: '/apply/talent' },
      { label: 'Become a vendor', href: '/apply/vendor' },
      { label: 'Business sign in', href: '/sign-in' },
    ],
  },
] as const

const SOCIAL = ['Instagram', 'X', 'TikTok', 'YouTube'] as const

const BLURB =
  'The Saudi platform for live experiences — and the marketplace where the people who make them find each other.'

export interface SiteFooterProps {
  size?: 'full' | 'minimal'
  className?: string
}

export function SiteFooter({ size = 'full', className }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        'flex w-full flex-col items-center bg-bg-warm',
        size === 'full' && 'border-t border-border-default',
        className,
      )}
    >
      {size === 'full' && (
        <div className="grid w-full max-w-[1400px] grid-cols-[1.4fr_1fr_1fr_1fr_1fr] items-start gap-4xl px-gutter-desktop pt-5xl-min pb-3xl">
          <div className="flex flex-col items-start">
            <Link to="/" aria-label="MyTicket home">
              <Logo height={44} className="mb-[14px]" />
            </Link>

            <p className="mb-xl max-w-[300px] text-body-small text-ink-secondary">{BLURB}</p>

            <div className="mb-[18px] flex items-start gap-sm">
              {['iOS app', 'Android app'].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="rounded-input border-[1.5px] border-border-default bg-surface-default px-[14px] py-[9px] text-[13px] font-semibold whitespace-nowrap text-ink-primary"
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-start gap-[14px]">
              {SOCIAL.map((label) => (
                <a
                  key={label}
                  href="#"
                  className="text-[13px] font-semibold whitespace-nowrap text-ink-secondary"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading} className="flex flex-col items-start">
              <p className="text-label-overline mb-[14px] text-ink-brand-mid">{column.heading}</p>
              <ul className="flex w-full flex-col items-start gap-[9px]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-body-small whitespace-nowrap text-ink-primary"
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

      <div className="flex w-full max-w-[1400px] items-center justify-between border-t border-border-default px-gutter-desktop pt-xl pb-4xl text-body-caption text-ink-muted">
        <p className="whitespace-nowrap">© 2026 MyTicket. All prices in Saudi Riyals (SAR).</p>
        <p className="whitespace-nowrap">Riyadh, Kingdom of Saudi Arabia</p>
      </div>
    </footer>
  )
}
