import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

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

/** Eager-load locale JSON so `t()` works on first paint (no async race with useSuspense: false). */
const localeModules = import.meta.glob('./locales/*/*.json', { eager: true })

function buildResources(): Record<string, Record<string, object>> {
  const resources: Record<string, Record<string, object>> = {}

  for (const [path, mod] of Object.entries(localeModules)) {
    // Vite uses POSIX keys; normalize anyway for Windows tooling.
    const normalized = path.replace(/\\/g, '/')
    const match = /\/locales\/([^/]+)\/([^/]+)\.json$/.exec(normalized)
    if (!match) continue

    const [, lng, ns] = match
    const data =
      mod && typeof mod === 'object' && 'default' in mod
        ? (mod as { default: object }).default
        : (mod as object)

    ;(resources[lng] ??= {})[ns] = data
  }

  return resources
}

void i18n.use(initReactI18next).init({
  resources: buildResources(),
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

/** Active UI locale — prefers i18n over localStorage so toggles apply immediately. */
export function getActiveLocale(): Locale {
  const lng = i18n.resolvedLanguage || i18n.language || readStoredLocale()
  return lng.startsWith('ar') ? 'ar' : 'en'
}

// Apply dir/lang before first paint when possible.
if (typeof document !== 'undefined') {
  const initial = readStoredLocale()
  document.documentElement.lang = initial
  document.documentElement.dir = initial === 'ar' ? 'rtl' : 'ltr'
}

export default i18n
