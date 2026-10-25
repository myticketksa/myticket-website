import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PageSection } from '@/layouts'
import { useLocale } from '@/i18n/locale'

type LegalSection = { title: string; body: string }

/**
 * Standalone terms of service — the twin of the privacy page
 * (`/Privacy_Policy_My_Ticket`): a plain document at a fixed path
 * (`/Terms_of_Service_My_Ticket`), for the Google sign-in branding page and
 * the store listings (owner, 25 Oct 2026). Same content as the "Terms" tab
 * on `/legal` — `legal.docs.terms`. Always English, for the same reason as
 * the privacy page: this exact URL is what Google reviews.
 */
export function TermsOfServicePage() {
  const { t } = useTranslation('marketing')
  const { setLocale } = useLocale()
  useEffect(() => {
    setLocale('en')
  }, [setLocale])
  const sections = t('legal.docs.terms.sections', {
    returnObjects: true,
    lng: 'en',
  }) as LegalSection[]

  return (
    <PageSection padTop={64} padBottom={96} dir="ltr" lang="en">
      <div className="mx-auto max-w-[720px]">
        <h1 className="text-[32px] leading-[1.05] font-extrabold tracking-[-1.5px] text-ink-primary sm:text-[40px]">
          {t('legal.docs.terms.label', { lng: 'en' })}
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
