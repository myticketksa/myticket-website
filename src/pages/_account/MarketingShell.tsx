import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CheckIcon, MinusIcon, PlusIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

export function MarketingHero({
  eyebrow,
  title,
  subtitle,
  actions,
  narrow = false,
}: {
  eyebrow: string
  title: string
  subtitle: string
  actions?: ReactNode
  /** About uses ~820px title column. */
  narrow?: boolean
}) {
  return (
    <PageSection padTop={72} padBottom={0} className="text-center">
      <p className="text-[12px] font-bold tracking-[1.08px] text-ink-brand-mid uppercase">
        {eyebrow}
      </p>
      <h1
        className={`mx-auto mt-md text-[48px] leading-[1.03] font-extrabold tracking-[-1.6px] text-ink-primary sm:text-[56px] sm:tracking-[-1.96px] ${
          narrow ? 'max-w-[820px]' : 'max-w-[900px]'
        }`}
      >
        {title}
      </h1>
      <p
        className={`mx-auto mt-[18px] text-[17px] leading-[1.65] text-ink-secondary ${
          narrow ? 'max-w-[660px]' : 'max-w-[640px]'
        }`}
      >
        {subtitle}
      </p>
      {actions && (
        <div className="mt-xl flex flex-wrap items-center justify-center gap-sm">{actions}</div>
      )}
    </PageSection>
  )
}

export function MarketingCardGrid({
  items,
  maxWidth = 1040,
}: {
  items: { title: string; body: ReactNode; links?: { label: string; href: string }[] }[]
  maxWidth?: number
}) {
  return (
    <PageSection padTop={64} padBottom={48}>
      <div className="mx-auto" style={{ maxWidth }}>
        <div className="grid gap-[18px] md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-[20px] border border-border-default bg-surface-default p-[28px]"
            >
              <h2 className="text-[18px] font-bold text-ink-primary">{item.title}</h2>
              <div className="mt-sm text-[14.5px] leading-[1.65] text-ink-secondary">
                {item.body}
              </div>
              {item.links && (
                <div className="mt-lg flex flex-wrap gap-md">
                  {item.links.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="text-[14px] font-semibold text-ink-brand hover:text-ink-brand-mid"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageSection>
  )
}

export function MarketingCta({
  text,
  buttonLabel,
  buttonTo,
}: {
  text: string
  buttonLabel: string
  buttonTo: string
}) {
  return (
    <PageSection padTop={24} padBottom={96} className="text-center">
      <p className="mx-auto max-w-[560px] text-[18px] font-medium text-ink-primary">{text}</p>
      <div className="mt-xl flex justify-center">
        <Link to={buttonTo}>
          <Button size="lg">{buttonLabel}</Button>
        </Link>
      </div>
    </PageSection>
  )
}

export function MarketingStats({
  stats,
}: {
  stats: { value: string; label: string }[]
}) {
  return (
    <PageSection padTop={44} padBottom={0}>
      <div className="mx-auto max-w-[1040px]">
        <div className="grid grid-cols-2 gap-xl rounded-[24px] bg-surface-inverse px-[44px] py-[36px] text-bg-page md:grid-cols-4 md:gap-[32px]">
          {stats.map((stat) => (
            <div key={stat.label} className="text-left">
              <p className="text-[32px] font-extrabold tracking-[-0.64px]">{stat.value}</p>
              <p className="mt-xs text-[13px] text-bg-page/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </PageSection>
  )
}

/* ── Role landing (For Vendors / Organizers / Talents) ───────────────────── */

export type RoleLandingStat = { value: string; label: string }
export type RoleBenefit = { title: string; body: string }
export type RoleStep = { title: string; body: ReactNode }
export type RoleMoneyRow = { label: string; value: string }
export type RoleFaq = { question: string; answer: string }

export function RoleLandingHero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  stats,
  imageryLabel,
  imagerySrc,
}: {
  eyebrow: string
  title: string
  subtitle: string
  primaryCta: { label: string; to: string }
  secondaryCta: { label: string; to: string }
  stats: RoleLandingStat[]
  imageryLabel: string
  imagerySrc?: string
}) {
  return (
    <PageSection padTop={64} padBottom={0}>
      <div className="flex flex-col items-center gap-[48px] lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1 lg:max-w-[666px]">
          <p className="text-[12px] font-bold tracking-[1.08px] text-ink-brand-mid uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-[12px] text-[44px] leading-[1.02] font-extrabold tracking-[-1.8px] text-ink-primary sm:text-[58px] sm:tracking-[-2.03px]">
            {title}
          </h1>
          <p className="mt-[18px] max-w-[540px] text-[17px] leading-[1.6] text-ink-secondary">
            {subtitle}
          </p>
          <div className="mt-[26px] flex flex-wrap gap-[12px]">
            <Link to={primaryCta.to}>
              <Button size="lg">{primaryCta.label}</Button>
            </Link>
            <Link to={secondaryCta.to}>
              <Button variant="secondary" size="lg">
                {secondaryCta.label}
              </Button>
            </Link>
          </div>
          <div className="mt-[28px] flex flex-wrap gap-[28px]">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-[26px] font-extrabold tracking-[-0.52px] text-ink-primary">
                  {stat.value}
                </p>
                <p className="text-[12.5px] text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div
          className="relative flex h-[320px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[24px] lg:h-[454px] lg:w-[606px]"
          style={
            imagerySrc
              ? undefined
              : {
                  backgroundImage:
                    'linear-gradient(165deg, var(--color-neutral-placeholder-start) 11%, var(--color-neutral-placeholder-end) 89%)',
                }
          }
        >
          {imagerySrc ? (
            <img
              src={imagerySrc}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <p className="text-[13px] font-semibold text-ink-muted">{imageryLabel}</p>
          )}
        </div>
      </div>
    </PageSection>
  )
}

export function RoleBenefitsSection({
  title = 'What the role unlocks',
  items,
}: {
  title?: string
  items: RoleBenefit[]
}) {
  return (
    <PageSection padTop={72} padBottom={0}>
      <h2 className="text-[34px] font-extrabold tracking-[-1.02px] text-ink-primary">{title}</h2>
      <div className="mt-[22px] grid gap-[18px] md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-[20px] border border-border-default bg-surface-default p-[26px]"
          >
            <h3 className="text-[17px] font-bold text-ink-primary">{item.title}</h3>
            <p className="mt-[8px] text-[14px] leading-[1.6] text-ink-secondary">{item.body}</p>
          </div>
        ))}
      </div>
    </PageSection>
  )
}

export function RoleStepsSection({
  title = 'Start to finish',
  steps,
}: {
  title?: string
  steps: RoleStep[]
}) {
  return (
    <PageSection padTop={72} padBottom={0}>
      <h2 className="text-[34px] font-extrabold tracking-[-1.02px] text-ink-primary">{title}</h2>
      <div className="mt-[22px] grid gap-[14px] sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex min-h-[162px] flex-col rounded-[18px] border border-border-default bg-surface-default p-[20px]"
          >
            <p className="text-[22px] font-extrabold text-ink-brand">{index + 1}</p>
            <h3 className="mt-[10px] text-[14.5px] font-bold text-ink-primary">{step.title}</h3>
            <div className="mt-[5px] text-[12.5px] leading-[1.55] text-ink-secondary">
              {step.body}
            </div>
          </div>
        ))}
      </div>
    </PageSection>
  )
}

export function RoleMoneyPanel({
  rows,
  footnote,
}: {
  rows: RoleMoneyRow[]
  footnote: string
}) {
  return (
    <div className="rounded-[22px] bg-surface-inverse p-[32px] text-bg-page">
      <h3 className="text-[26px] font-extrabold tracking-[-0.78px]">The money, plainly</h3>
      <div className="mt-[18px] flex flex-col gap-[12px] text-[14.5px] leading-[1.55]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-xs sm:flex-row sm:items-start sm:justify-between sm:gap-md"
          >
            <span className="shrink-0">{row.label}</span>
            <span className="font-bold sm:text-right">{row.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-[16px] text-[12.5px] leading-[1.55] text-bg-page/90">{footnote}</p>
    </div>
  )
}

export function RoleRequirementsPanel({
  items,
  noteLead = 'Review comes first.',
  noteBody,
}: {
  items: string[]
  noteLead?: string
  noteBody: string
}) {
  return (
    <div className="rounded-[22px] border border-border-default bg-surface-default p-[32px]">
      <h3 className="text-[26px] font-extrabold tracking-[-0.78px] text-ink-primary">
        What the application needs
      </h3>
      <ul className="mt-[18px] flex flex-col gap-[11px]">
        {items.map((item) => (
          <li key={item} className="flex gap-[10px] text-[14.5px] leading-[1.5] text-ink-secondary">
            <CheckIcon size={15} weight="bold" className="mt-[2px] shrink-0 text-ink-muted" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-[18px] h-px bg-border-divider" />
      <p className="mt-[16px] text-[13.5px] leading-[1.55] text-ink-secondary">
        <span className="font-bold text-ink-primary">{noteLead}</span> {noteBody}
      </p>
    </div>
  )
}

export function RoleMoneyAndNeeds({
  moneyRows,
  moneyFootnote,
  needItems,
  needNoteBody,
}: {
  moneyRows: RoleMoneyRow[]
  moneyFootnote: string
  needItems: string[]
  needNoteBody: string
}) {
  return (
    <PageSection padTop={72} padBottom={0}>
      <div className="grid gap-[24px] lg:grid-cols-2">
        <RoleMoneyPanel rows={moneyRows} footnote={moneyFootnote} />
        <RoleRequirementsPanel items={needItems} noteBody={needNoteBody} />
      </div>
    </PageSection>
  )
}

export function RoleFaqSection({
  title = 'Asked most often',
  items,
}: {
  title?: string
  items: RoleFaq[]
}) {
  const [open, setOpen] = useState(0)

  return (
    <PageSection padTop={72} padBottom={0}>
      <h2 className="text-[34px] font-extrabold tracking-[-1.02px] text-ink-primary">{title}</h2>
      <div className="mt-[22px] flex max-w-[860px] flex-col gap-[10px]">
        {items.map((item, index) => {
          const isOpen = open === index
          return (
            <div
              key={item.question}
              className="overflow-hidden rounded-[16px] border border-border-default bg-surface-default"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : index)}
                className="flex w-full items-center justify-between gap-md px-[22px] py-[18px] text-left"
              >
                <span className="text-[15.5px] font-bold text-ink-primary">{item.question}</span>
                {isOpen ? (
                  <MinusIcon size={18} className="shrink-0 text-ink-brand" />
                ) : (
                  <PlusIcon size={18} weight="bold" className="shrink-0 text-ink-brand" />
                )}
              </button>
              {isOpen && (
                <div className="px-[22px] pb-[18px]">
                  <p className="max-w-[720px] text-[14px] leading-[1.6] text-ink-secondary">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </PageSection>
  )
}

export function RoleClosingCta({
  title,
  subtitle,
  buttonLabel,
  buttonTo,
}: {
  title: string
  subtitle: string
  buttonLabel: string
  buttonTo: string
}) {
  return (
    <PageSection padTop={72} padBottom={96}>
      <div className="flex flex-col items-start justify-between gap-xl rounded-[24px] bg-brand-gradient px-[48px] py-[44px] lg:flex-row lg:items-center">
        <div className="min-w-0">
          <p className="text-[28px] leading-[1.1] font-extrabold tracking-[-0.96px] text-ink-inverse sm:text-[32px]">
            {title}
          </p>
          <p className="mt-[6px] text-[15px] text-ink-inverse/95">{subtitle}</p>
        </div>
        <Link
          to={buttonTo}
          className={cn(
            'inline-flex h-[54px] shrink-0 items-center justify-center rounded-[27px]',
            'bg-bg-page px-[30px] text-[15px] font-extrabold text-ink-primary',
          )}
        >
          {buttonLabel}
        </Link>
      </div>
    </PageSection>
  )
}

export function RoleStepCheckLine({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-[6px]">
      <CheckIcon size={13} weight="bold" className="shrink-0 text-ink-muted" />
      <span>{children}</span>
    </span>
  )
}
