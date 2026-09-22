import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { useLocale } from '@/i18n/locale'

type DeleteStep = { title: string; body: string }

/**
 * Public account/data deletion page — required by Google Play's User Data
 * policy: a web page, reachable without installing the app, describing how
 * to delete an account and what happens to the data. No login is needed to
 * read this page; the deletion itself still happens through Settings
 * (`useDeleteAccountMutation`) since that's the real, working mechanism —
 * this page exists to be linkable, not to duplicate it.
 *
 * Always English: this exact URL is what Google reviews, so it can't render
 * in Arabic from a stored locale preference. `setLocale('en')` flips the
 * whole app (header/footer included, not just this page's own text) since
 * those read the same global i18n instance — `{ lng: 'en' }` on this page's
 * own `t()` calls additionally avoids a one-frame flash of Arabic before
 * that effect commits.
 */
export function DeleteAccountPage() {
  const { t } = useTranslation('marketing')
  const { setLocale } = useLocale()
  useEffect(() => {
    setLocale('en')
  }, [setLocale])
  const steps = t('deleteAccount.steps', { returnObjects: true, lng: 'en' }) as DeleteStep[]

  return (
    <div dir="ltr" lang="en">
      <PageSection padTop={64} padBottom={0}>
        <h1 className="max-w-[720px] text-[32px] leading-[1.05] font-extrabold tracking-[-1.5px] text-ink-primary sm:text-[42px]">
          {t('deleteAccount.title', { lng: 'en' })}
        </h1>
        <p className="mt-[12px] max-w-[640px] text-[16px] leading-[1.6] text-ink-secondary">
          {t('deleteAccount.lede', { lng: 'en' })}
        </p>
      </PageSection>

      <PageSection padTop={36} padBottom={40}>
        <div className="flex flex-col gap-[14px] sm:max-w-[640px]">
          {(Array.isArray(steps) ? steps : []).map((step, index) => (
            <div
              key={step.title}
              className="flex gap-[16px] rounded-[16px] border border-border-default bg-surface-default px-[22px] py-[18px]"
            >
              <span className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-bg-tint-brand text-[13px] font-bold text-ink-brand">
                {index + 1}
              </span>
              <div>
                <h2 className="text-[15.5px] font-bold text-ink-primary">{step.title}</h2>
                <p className="mt-[4px] text-[14px] leading-[1.6] text-ink-secondary">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <Link to="/settings" className="mt-[22px] inline-block">
          <Button size="lg">{t('deleteAccount.cta', { lng: 'en' })}</Button>
        </Link>
      </PageSection>

      <PageSection padTop={0} padBottom={96}>
        <div className="max-w-[640px] rounded-[18px] border border-border-default bg-bg-page px-[24px] py-[20px]">
          <h2 className="text-[15.5px] font-bold text-ink-primary">
            {t('deleteAccount.whatGoesTitle', { lng: 'en' })}
          </h2>
          <p className="mt-[6px] text-[14px] leading-[1.7] text-ink-secondary">
            {t('deleteAccount.whatGoesBody', { lng: 'en' })}
          </p>
        </div>

        <div className="mt-[14px] max-w-[640px] rounded-[18px] border border-border-default bg-bg-page px-[24px] py-[20px]">
          <h2 className="text-[15.5px] font-bold text-ink-primary">
            {t('deleteAccount.noAccessTitle', { lng: 'en' })}
          </h2>
          <p className="mt-[6px] text-[14px] leading-[1.7] text-ink-secondary">
            {t('deleteAccount.noAccessBody', { lng: 'en' })}{' '}
            <a href="mailto:privacy@myticket.sa" className="font-semibold text-ink-brand">
              privacy@myticket.sa
            </a>
          </p>
        </div>
      </PageSection>
    </div>
  )
}
