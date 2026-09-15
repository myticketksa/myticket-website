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

/** Horizontal footer: logo · social · legal · store badges, then copyright bar. */
export function SiteFooter({ size = 'full', className }: SiteFooterProps) {
  const { t } = useTranslation('nav')

  return (
    <footer
      className={cn(
        'flex w-full flex-col items-center bg-bg-warm mt-16',
        size === 'full' && 'border-t border-border-default',
        className,
      )}
    >
      {size === 'full' && (
        <div className="flex w-full max-w-[1400px] flex-col gap-xl px-gutter-desktop pt-3xl pb-xl lg:flex-row lg:items-center lg:justify-between lg:gap-3xl">
          <Link to="/" aria-label={t('home')} className="shrink-0">
            <Logo height={36} />
          </Link>

          <nav
            aria-label={t('footer.social', { defaultValue: 'Follow us' })}
            className="flex flex-wrap items-center gap-x-lg gap-y-md"
          >
            {SOCIAL.map(({ name, href, icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-[8px] text-[13px] font-semibold text-ink-primary transition-colors duration-micro ease-micro hover:text-ink-brand-mid"
              >
                <img src={icon} alt="" width={18} height={18} className="size-[18px]" />
                <span>{name}</span>
              </a>
            ))}
          </nav>

          <nav
            aria-label={t('footer.legal')}
            className="flex flex-wrap items-center gap-x-lg gap-y-sm"
          >
            {LEGAL.map((link) => (
              <Link
                key={link.key}
                to={link.href}
                className="text-[13px] font-semibold text-ink-primary transition-colors duration-micro ease-micro hover:text-ink-brand-mid"
              >
                {t(`footer.${link.key}`)}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 flex-wrap items-center gap-sm">
            <a href="#" aria-label={t('footer.iosApp')} className="inline-flex h-[40px]">
              <img
                src={appStoreBadge}
                alt={t('footer.iosApp')}
                className="h-full w-auto max-w-[120px] object-contain"
              />
            </a>
            <a href="#" aria-label={t('footer.androidApp')} className="inline-flex h-[40px]">
              <img
                src={googlePlayBadge}
                alt={t('footer.androidApp')}
                className="h-full w-auto max-w-[135px] object-contain"
              />
            </a>
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
