import { useTranslation } from 'react-i18next'
import appStoreBadge from '@/assets/store/app-store-badge.svg'
import googlePlayBadge from '@/assets/store/google-play-badge.png'
import { Logo } from '@/components/navigation'
import { SOCIAL_LINKS } from '@/components/navigation/socialLinks'
import { useLocale } from '@/i18n/locale'
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/site'

/**
 * myticket.sa/links — the page for the Instagram bio: the two store buttons,
 * the website and the social accounts. Standalone (no site header or
 * footer), routed outside MainLayout. The phone's own store comes first.
 */
export function LinksPage() {
  const { t } = useTranslation(['marketing', 'common'])
  const { locale, toggleLocale } = useLocale()

  const agent = typeof navigator === 'undefined' ? '' : navigator.userAgent
  const isAndroid = /Android/i.test(agent)
  const stores = [
    { name: 'App Store', href: APP_STORE_URL, badge: appStoreBadge },
    { name: 'Google Play', href: PLAY_STORE_URL, badge: googlePlayBadge },
  ]
  if (isAndroid) stores.reverse()

  return (
    <div
      className="flex min-h-dvh flex-col items-center px-page-gutter pt-[56px] pb-[40px] text-white"
      style={{
        background:
          'radial-gradient(120% 60% at 50% 0%, rgba(255,122,36,0.28) 0%, rgba(255,122,36,0) 60%), #121420',
      }}
    >
      <div className="flex w-full max-w-[400px] flex-1 flex-col items-center text-center">
        <Logo variant="white" height={72} />

        <h1 className="mt-[28px] text-[22px] leading-[1.35] font-extrabold">
          {t('links.title')}
        </h1>

        <div className="mt-[32px] flex w-full flex-col items-center gap-[12px]">
          {stores.map((store) => (
            <a
              key={store.name}
              href={store.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={store.name}
              className="transition-transform duration-micro ease-micro active:scale-[0.97]"
            >
              <img src={store.badge} alt={store.name} className="h-[56px] w-auto" />
            </a>
          ))}
        </div>

        <a
          href="/"
          className="mt-[16px] flex h-[52px] w-full max-w-[260px] items-center justify-center rounded-[14px] border border-white/25 text-[15px] font-semibold text-white transition-colors duration-micro ease-micro hover:border-[#ff7a24] hover:text-[#ff914d]"
        >
          {t('links.website')}
        </a>

        <div className="mt-[40px] flex flex-wrap justify-center gap-[12px]">
          {SOCIAL_LINKS.map(({ name, href, icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              title={name}
              className="inline-flex size-[48px] items-center justify-center rounded-[14px] bg-white transition-transform duration-micro ease-micro active:scale-[0.95]"
            >
              <img src={icon} alt="" width={22} height={22} className="size-[22px]" />
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleLocale}
          aria-label={locale === 'en' ? t('common:language.switchToArabic') : t('common:language.switchToEnglish')}
          className="mt-auto pt-[40px] text-[14px] font-semibold text-white/60 hover:text-white"
        >
          {locale === 'en' ? 'العربية' : 'English'}
        </button>
      </div>
    </div>
  )
}
