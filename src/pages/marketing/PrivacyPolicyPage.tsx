import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PageSection } from '@/layouts'
import { useLocale } from '@/i18n/locale'

type LegalSection = { title: string; body: string }

/**
 * Standalone privacy policy — a plain document page, not the tabbed
 * terms/privacy/cookies switcher on `/legal`. Exists at this specific path
 * (`/Privacy_Policy_My_Ticket`) so it's a stable, single-purpose link for
 * the Play Console privacy-policy field. Same underlying content as the
 * "Privacy policy" tab on `/legal` — `legal.docs.privacy` — just without
 * the tab chrome around it.
 *
 * Always English: this exact URL is what Google reviews, so it can't render
 * in Arabic from a stored locale preference. `setLocale('en')` flips the
 * whole app (header/footer included, not just this page's own text) since
 * those read the same global i18n instance — `{ lng: 'en' }` on this page's
 * own `t()` calls additionally avoids a one-frame flash of Arabic before
 * that effect commits.
 */
export function PrivacyPolicyPage() {
  const { t } = useTranslation('marketing')
  const { setLocale } = useLocale()
  useEffect(() => {
    setLocale('en')
  }, [setLocale])
  const sections = t('legal.docs.privacy.sections', {
    returnObjects: true,
    lng: 'en',
  }) as LegalSection[]

  return (
    <PageSection padTop={64} padBottom={96} dir="ltr" lang="en">
      <div className="mx-auto max-w-[720px]">
        <h1 className="text-[32px] leading-[1.05] font-extrabold tracking-[-1.5px] text-ink-primary sm:text-[40px]">
          {t('legal.docs.privacy.label', { lng: 'en' })}
        </h1>
        <p className="mt-[8px] text-[13.5px] font-semibold text-ink-muted">
          {t('legal.lastUpdated', { lng: 'en' })}
        </p>

        <div className="mt-[32px] flex flex-col gap-[28px]">
          {(Array.isArray(sections) ? sections : []).map((section) => (
            <div key={section.title}>
              <h2 className="text-[18px] font-bold text-ink-primary">{section.title}</h2>
              <p className="mt-[8px] text-[15px] leading-[1.75] whitespace-pre-line text-ink-secondary">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageSection>
  )
}
