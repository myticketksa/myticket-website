import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@/components/icons'
import { Logo } from '@/components/navigation'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

export function FormWizardShell({
  eyebrow,
  title,
  subtitle,
  draftSaved,
  notice,
  steps,
  activeStep,
  children,
  partLabel,
  onBack,
  backDisabled,
  onContinue,
  continueLabel,
  continueTo,
  trackHref,
  trackLabel,
  headerRight,
  showFooterLinks = true,
  onClear,
  onSaveExit,
}: {
  eyebrow?: string
  title: string
  subtitle: string
  draftSaved?: boolean
  /** Brand-tint callout under the subtitle (application review notice). */
  notice?: ReactNode
  steps: string[]
  activeStep: number
  children: ReactNode
  partLabel?: string
  onBack?: () => void
  /** When true (default on step 0), Back is disabled like Figma step 1. */
  backDisabled?: boolean
  onContinue?: () => void
  continueLabel?: string
  continueTo?: string
  trackHref?: string
  trackLabel?: string
  headerRight?: ReactNode
  showFooterLinks?: boolean
  onClear?: () => void
  /** Persist draft then leave — replaces the default home Link when set. */
  onSaveExit?: () => void
}) {
  const { t } = useTranslation('common')
  const { t: tNav } = useTranslation('nav')
  const disableBack = backDisabled ?? activeStep === 0
  const resolvedContinue = continueLabel ?? t('actions.continue')
  const resolvedTrack = trackLabel ?? t('wizard.trackSubmissions')
  const defaultContinue = t('actions.continue')

  return (
    <>
      <div className="border-b border-border-default bg-bg-page">
        <div className="mx-auto flex h-[72px] w-full max-w-[var(--container-page)] items-center justify-between gap-md px-page-gutter">
          <Link to="/" className="shrink-0" aria-label={tNav('home')}>
            <Logo height={36} />
          </Link>
          <p className="min-w-0 truncate text-center text-[11px] font-bold tracking-[1.04px] text-ink-muted uppercase sm:text-[13px]">
            {eyebrow ?? t('wizard.eyebrow')}
          </p>
          {headerRight ??
            (onSaveExit ? (
              <button
                type="button"
                onClick={onSaveExit}
                className="shrink-0 text-[13px] font-semibold text-ink-secondary hover:text-ink-brand sm:text-[14px]"
              >
                {t('actions.saveExit')}
              </button>
            ) : (
              <Link
                to="/"
                className="shrink-0 text-[13px] font-semibold text-ink-secondary hover:text-ink-brand sm:text-[14px]"
              >
                {t('actions.saveExit')}
              </Link>
            ))}
        </div>
      </div>

      <PageSection padTop={44} padBottom={96}>
        <div className="mx-auto w-full max-w-[720px]">
          <h1 className="text-[28px] leading-[1.04] font-extrabold tracking-[-1.47px] text-ink-primary sm:text-[36px] lg:text-[42px]">
            {title}
          </h1>
          <p className="mt-[10px] max-w-[620px] text-[16px] text-ink-secondary">{subtitle}</p>

          {notice && (
            <div className="mt-[14px] flex gap-[10px] rounded-[14px] border border-border-default bg-bg-tint-brand px-[16px] py-[12px] text-[13.5px] text-ink-secondary">
              <span className="font-extrabold text-ink-brand-strong">ⓘ</span>
              <div className="min-w-0 flex-1">{notice}</div>
            </div>
          )}

          {draftSaved && (
            <div className="mt-lg inline-flex items-center gap-sm rounded-[12px] bg-state-success-tint px-md py-[6px] text-[12.5px] font-semibold text-state-success">
              <CheckIcon size={12} weight="bold" />
              {t('draft.saved')}
            </div>
          )}

          <div className="mt-[26px] flex gap-sm overflow-x-auto pb-xs">
            {steps.map((step, index) => {
              const active = index === activeStep
              const done = index < activeStep
              return (
                <div key={step} className="min-w-[4.5rem] flex-1 sm:min-w-0">
                  <div
                    className={cn(
                      'h-[5px] rounded-[3px]',
                      active || done ? 'bg-brand-gradient' : 'bg-border-default',
                    )}
                  />
                  <p
                    className={cn(
                      'mt-sm text-[12px] font-bold',
                      active ? 'text-ink-primary' : 'text-ink-disabled',
                    )}
                  >
                    <span className="sm:hidden">{index + 1}</span>
                    <span className="hidden sm:inline">
                      {index + 1} · {step}
                    </span>
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-[30px] rounded-[22px] border border-border-default bg-surface-default p-lg sm:p-[30px]">
            {children}
            <div className="mt-[26px] flex flex-col-reverse items-stretch gap-md border-t border-border-divider pt-xl sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="secondary"
                size="md"
                disabled={disableBack}
                onClick={onBack}
                icon={<ArrowLeftIcon size={12} className="rtl:rotate-180" />}
                className="w-full sm:w-auto"
              >
                {t('actions.back')}
              </Button>
              <p className="text-center text-[12.5px] font-medium text-ink-muted">
                {partLabel ??
                  t('wizard.partOf', {
                    current: activeStep + 1,
                    total: steps.length,
                  })}
              </p>
              {continueTo ? (
                <Link
                  to={continueTo}
                  className="inline-flex h-btn-md w-full items-center justify-center gap-control-gap rounded-btn-md bg-brand-gradient px-btn-pad-md text-[14px] font-semibold text-ink-inverse sm:w-auto"
                >
                  {resolvedContinue}
                  <ArrowRightIcon size={12} className="rtl:rotate-180" />
                </Link>
              ) : (
                <Button size="md" onClick={onContinue} className="w-full sm:w-auto">
                  {resolvedContinue}
                  {resolvedContinue === defaultContinue && (
                    <ArrowRightIcon size={12} className="rtl:rotate-180" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {showFooterLinks && (
            <div className="mt-lg flex flex-col gap-md px-xs text-[13px] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-ink-muted">
                {t('wizard.alreadySent')}{' '}
                {trackHref ? (
                  <Link to={trackHref} className="font-semibold text-ink-brand">
                    {resolvedTrack}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink-brand">{resolvedTrack}</span>
                )}
              </p>
              <button
                type="button"
                className="self-start font-semibold text-state-danger sm:self-auto"
                onClick={onClear}
              >
                {t('wizard.clearAndStartOver')}
              </button>
            </div>
          )}
        </div>
      </PageSection>
    </>
  )
}
