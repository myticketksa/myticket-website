import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRightIcon, SuccessIcon } from '@/components/icons'
import { useLocale, type RoleKey } from '@/i18n/locale'
import { FunnelHeader, PageSection } from '@/layouts'

function resolveRole(raw: string | null): 'vendor' | 'talent' {
  return raw === 'talent' ? 'talent' : 'vendor'
}

/** Application submitted — Figma `207:11329`. */
export function ApplicationSubmittedPage() {
  const { t } = useTranslation('forms')
  const [params] = useSearchParams()
  const roleKey = resolveRole(params.get('role'))
  const { roleLabel } = useLocale()
  const role = roleLabel(roleKey as RoleKey)
  const statusHref =
    roleKey === 'talent' ? '/my-talent-application' : '/my-facilities-application'

  return (
    <>
      <FunnelHeader
        label={t('submitted.header')}
        backHref="/"
        backLabel={t('submitted.backHome')}
      />

      <PageSection padTop={64} padBottom={96}>
        <div className="mx-auto flex max-w-[600px] flex-col items-center text-center">
          <div className="flex size-[64px] items-center justify-center rounded-[32px] bg-state-success-tint text-state-success">
            <SuccessIcon size={26} weight="bold" />
          </div>
          <h1 className="mt-[18px] text-[28px] leading-[1.03] font-extrabold tracking-[-1.54px] text-ink-primary sm:text-[36px] lg:text-[44px]">
            {t('submitted.title')}
          </h1>
          <p className="mt-[12px] text-[16.5px] leading-[1.6] text-ink-secondary">
            {t('submitted.body', { role })}
          </p>
          <p className="mt-[10px] text-[13.5px] font-bold text-ink-muted">
            {t('submitted.reference')}{' '}
            <span className="text-ink-primary">APP-2026-1187</span>
          </p>

          <div className="mt-[32px] w-full rounded-[20px] border border-border-default bg-surface-default px-[26px] py-[24px] text-start">
            <p className="text-[15px] font-bold text-ink-primary">{t('submitted.whileYouWait')}</p>
            <ul className="mt-[14px] flex flex-col gap-[12px] text-[14px] text-ink-secondary">
              <li className="flex gap-[12px]">
                <span className="font-extrabold text-ink-brand">·</span>
                <span>{t('submitted.waitGuest')}</span>
              </li>
              <li className="flex gap-[12px]">
                <span className="font-extrabold text-ink-brand">·</span>
                <span>{t('submitted.waitStatus')}</span>
              </li>
              <li className="flex gap-[12px]">
                <span className="font-extrabold text-ink-brand">·</span>
                <span>{t('submitted.waitContact')}</span>
              </li>
            </ul>
          </div>

          <div className="mt-[20px] flex w-full max-w-[420px] flex-col gap-[10px]">
            <Link
              to={statusHref}
              className="inline-flex h-btn-lg w-full items-center justify-center gap-control-gap rounded-btn-lg bg-brand-gradient px-btn-pad-lg text-[15px] font-bold text-ink-inverse"
            >
              {t('submitted.trackCta', { role })}
              <ArrowUpRightIcon size={15} />
            </Link>
            <Link
              to="/events"
              className="inline-flex h-[46px] w-full items-center justify-center rounded-[23px] border-[1.5px] border-border-default bg-surface-default text-[14px] font-semibold text-ink-primary"
            >
              {t('submitted.browseEvents')}
            </Link>
          </div>
        </div>
      </PageSection>
    </>
  )
}
