import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@/components/icons'
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
  continueLabel = 'Continue',
  continueTo,
  trackHref,
  trackLabel = 'Track your submissions',
  headerRight,
  showFooterLinks = true,
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
}) {
  const disableBack = backDisabled ?? activeStep === 0

  return (
    <>
      {(eyebrow || headerRight) && (
        <div className="border-b border-border-default">
          <div className="mx-auto flex h-[72px] w-full max-w-[1120px] items-center justify-between px-[40px]">
            <p className="text-[13px] font-bold tracking-[1.04px] text-ink-muted uppercase">
              {eyebrow}
            </p>
            {headerRight ?? (
              <button type="button" className="text-[14px] font-semibold text-ink-secondary">
                Save & exit
              </button>
            )}
          </div>
        </div>
      )}

      <PageSection padTop={44} padBottom={96}>
        <div className="mx-auto w-full max-w-[720px]">
          <h1 className="text-[42px] leading-[1.04] font-extrabold tracking-[-1.47px] text-ink-primary">
            {title}
          </h1>
          <p className="mt-[10px] max-w-[620px] text-[16px] text-ink-secondary">{subtitle}</p>

          {notice && (
            <div className="mt-[14px] flex gap-[10px] rounded-[14px] border border-border-default bg-bg-tint-brand px-[16px] py-[12px] text-[13.5px] text-ink-secondary">
              <span className="font-extrabold text-ink-brand-strong">ⓘ</span>
              <div className="min-w-0 flex-1">{notice}</div>
            </div>
          )}

          {draftSaved && !notice && (
            <div className="mt-lg inline-flex items-center gap-sm rounded-[12px] bg-state-success-tint px-md py-[6px] text-[12.5px] font-semibold text-state-success">
              <CheckIcon size={12} weight="bold" />
              Draft saved just now — you can leave and pick this up any time
            </div>
          )}

          <div className="mt-[26px] flex gap-sm">
            {steps.map((step, index) => {
              const active = index === activeStep
              const done = index < activeStep
              return (
                <div key={step} className="min-w-0 flex-1">
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
                    {index + 1} · {step}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-[30px] rounded-[22px] border border-border-default bg-surface-default p-[30px]">
            {children}
            <div className="mt-[26px] flex items-center justify-between border-t border-border-divider pt-xl">
              <Button
                variant="secondary"
                size="md"
                disabled={disableBack}
                onClick={onBack}
                icon={<ArrowLeftIcon size={12} />}
              >
                Back
              </Button>
              <p className="text-[12.5px] font-medium text-ink-muted">
                {partLabel ?? `Part ${activeStep + 1} of ${steps.length}`}
              </p>
              {continueTo ? (
                <Link
                  to={continueTo}
                  className="inline-flex h-btn-md items-center gap-control-gap rounded-btn-md bg-brand-gradient px-btn-pad-md text-[14px] font-semibold text-ink-inverse"
                >
                  {continueLabel}
                  <ArrowRightIcon size={12} />
                </Link>
              ) : (
                <Button size="md" onClick={onContinue}>
                  {continueLabel}
                  {continueLabel === 'Continue' && <ArrowRightIcon size={12} />}
                </Button>
              )}
            </div>
          </div>

          {showFooterLinks && (
            <div className="mt-lg flex items-center justify-between px-xs text-[13px]">
              <p className="text-ink-muted">
                Already sent one?{' '}
                {trackHref ? (
                  <Link to={trackHref} className="font-semibold text-ink-brand">
                    {trackLabel}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink-brand">{trackLabel}</span>
                )}
              </p>
              <button type="button" className="font-semibold text-state-danger">
                Clear and start over
              </button>
            </div>
          )}
        </div>
      </PageSection>
    </>
  )
}
