import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import i18n, { STORAGE_KEY, readStoredLocale, type Locale } from './config'

export type { Locale }
export type RoleKey = 'vendor' | 'organizer' | 'talent'

function applyDocumentLocale(locale: Locale) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  const og = document.head.querySelector<HTMLMetaElement>('meta[property="og:locale"]')
  if (og) og.content = locale === 'ar' ? 'ar_SA' : 'en_SA'
}

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  roleLabel: (role: RoleKey) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale())
  const { t } = useTranslation('common')

  useEffect(() => {
    applyDocumentLocale(locale)
    try {
      window.localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      /* ignore */
    }
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale)
    }
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
  }, [])

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'en' ? 'ar' : 'en'))
  }, [])

  const roleLabel = useCallback(
    (role: RoleKey) => t(`roles.${role}`),
    [t],
  )

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, roleLabel }),
    [locale, setLocale, toggleLocale, roleLabel],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return ctx
}

/** Standalone helper when a component cannot use the hook (e.g. static maps). */
export function roleLabelFor(role: RoleKey, locale: Locale = 'en') {
  return i18n.getFixedT(locale, 'common')(`roles.${role}`)
}

export { readStoredLocale, STORAGE_KEY }
