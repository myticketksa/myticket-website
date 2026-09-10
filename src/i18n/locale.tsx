import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Locale = 'en' | 'ar'

export type RoleKey = 'vendor' | 'organizer' | 'talent'

const STORAGE_KEY = 'myticket.locale'

const ROLE_LABELS: Record<Locale, Record<RoleKey, string>> = {
  en: {
    vendor: 'Vendor',
    organizer: 'Organizer',
    talent: 'Talent',
  },
  ar: {
    vendor: 'المنشأة',
    organizer: 'منظم الفعالية',
    talent: 'الموهبة',
  },
}

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'ar' || raw === 'en') return raw
  } catch {
    /* ignore */
  }
  return 'en'
}

function applyDocumentLocale(locale: Locale) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
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

  useEffect(() => {
    applyDocumentLocale(locale)
    try {
      window.localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      /* ignore */
    }
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
  }, [])

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'en' ? 'ar' : 'en'))
  }, [])

  const roleLabel = useCallback(
    (role: RoleKey) => ROLE_LABELS[locale][role],
    [locale],
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
  return ROLE_LABELS[locale][role]
}
