import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'

export type Locale = 'en' | 'ar'

export const I18N_NAMESPACES = [
  'common',
  'nav',
  'auth',
  'account',
  'catalog',
  'checkout',
  'forms',
  'marketing',
  'validation',
  'meta',
] as const

export type I18nNamespace = (typeof I18N_NAMESPACES)[number]

export const STORAGE_KEY = 'myticket.locale'

export function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'ar' || raw === 'en') return raw
  } catch {
    /* ignore */
  }
  return 'en'
}

void i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    lng: readStoredLocale(),
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    ns: [...I18N_NAMESPACES],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    returnNull: false,
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: import.meta.env.DEV
      ? (_lngs, ns, key) => {
          console.warn(`[i18n] missing key: ${ns}:${key}`)
        }
      : undefined,
  })

export default i18n
