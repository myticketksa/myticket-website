import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import facebookIcon from '@/assets/social/facebook.svg'
import instagramIcon from '@/assets/social/instagram.svg'
import snapchatIcon from '@/assets/social/snapchat.svg'
import tiktokIcon from '@/assets/social/tiktok.svg'
import xIcon from '@/assets/social/x.svg'
import youtubeIcon from '@/assets/social/youtube.svg'
import appStoreBadge from '@/assets/store/app-store-badge.svg'
import googlePlayBadge from '@/assets/store/google-play-badge.png'
import { cn } from '@/lib/cn'
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/site'
import { Logo } from './Logo'

const SOCIAL = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/myticketapp01?igsh=MWs0Y3o0YXBieG1xeQ==',
    icon: instagramIcon,
  },
  {
    name: 'X',
    href: 'https://x.com/myticketapp01?t=m1L48zEBQ67Nlf-YyAvCgg&s=09',
    icon: xIcon,
  },
  {
    name: 'TikTok',
    href: 'https://vm.tiktok.com/ZSFKEFCKp/',
    icon: tiktokIcon,
  },
  {
    name: 'Snapchat',
    href: 'https://www.snapchat.com/add/myticketapp01',
    icon: snapchatIcon,
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/@myticketapp0122?si=6Ykddnhw-ELQHwVL',
    icon: youtubeIcon,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/myticketapp01?mibextid=ZbWKwL',
    icon: facebookIcon,
  },
] as const

const LEGAL = [
  { key: 'terms' as const, href: '/legal' },
  { key: 'privacy' as const, href: '/legal' },
  { key: 'cookies' as const, href: '/legal' },
]

export interface SiteFooterProps {
  size?: 'full' | 'minimal'
  className?: string
}

/**
 * Footer — stacked sections on mobile (logo → stores → social → legal),
 * single horizontal band from lg.
 */
export function SiteFooter({ size = 'full', className }: SiteFooterProps) {
  const { t } = useTranslation('nav')

  return (
    <footer
      className={cn(
        'mt-16 flex w-full flex-col items-center bg-bg-warm',
        size === 'full' && 'border-t border-border-default',
        className,
      )}
    >
      {size === 'full' && (
        <div className="flex w-full max-w-[1400px] flex-col gap-3xl px-gutter-desktop pt-3xl pb-2xl lg:flex-row lg:items-center lg:justify-between lg:gap-3xl lg:pb-xl">
          <Link to="/" aria-label={t('home')} className="shrink-0 self-start">
            <Logo height={36} />
          </Link>

          {/* Mobile order: stores → social → legal. Desktop: social → legal → stores. */}
          <div className="flex flex-col gap-3xl lg:contents">
            <nav
              aria-label={t('footer.social', { defaultValue: 'Follow us' })}
              className="order-2 flex flex-wrap items-center gap-md lg:order-none"
            >
              {SOCIAL.map(({ name, href, icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  title={name}
                  className="inline-flex size-[44px] items-center justify-center rounded-[12px] border border-border-default bg-surface-default text-ink-primary transition-colors duration-micro ease-micro hover:border-border-brand hover:text-ink-brand-mid lg:size-auto lg:gap-[8px] lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0"
                >
                  <img src={icon} alt="" width={18} height={18} className="size-[18px]" />
                  <span className="hidden text-[13px] font-semibold lg:inline">{name}</span>
                </a>
              ))}
            </nav>

            <nav
              aria-label={t('footer.legal')}
              className="order-3 flex flex-col gap-md sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3xl sm:gap-y-md lg:order-none"
            >
              {LEGAL.map((link) => (
                <Link
                  key={link.key}
                  to={link.href}
                  className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-ink-primary transition-colors duration-micro ease-micro hover:text-ink-brand-mid sm:min-h-0 sm:text-[13px]"
                >
                  {t(`footer.${link.key}`)}
                </Link>
              ))}
            </nav>

            <div className="order-1 flex flex-wrap items-center gap-md lg:order-none">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={t('footer.iosApp')}
                className="inline-flex h-[44px] w-[135px] items-center justify-center"
              >
                <img
                  src={appStoreBadge}
                  alt={t('footer.iosApp')}
                  className="h-full w-full object-contain object-center"
                />
              </a>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={t('footer.androidApp')}
                className="inline-flex h-[44px] w-[135px] items-center justify-center"
              >
                <img
                  src={googlePlayBadge}
                  alt={t('footer.androidApp')}
                  className="h-full w-full object-contain object-center"
                />
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="flex w-full max-w-[1400px] flex-col gap-sm border-t border-border-default px-gutter-desktop pt-xl pb-4xl text-body-caption text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:gap-lg">
        <p>{t('footer.copyright', { year: 2026 })}</p>
        <p>{t('footer.madeInKsa')}</p>
      </div>
    </footer>
  )
}
