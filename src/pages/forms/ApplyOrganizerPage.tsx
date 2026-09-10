import { Link } from 'react-router-dom'
import { CheckIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { useLocale } from '@/i18n/locale'
import { FunnelHeader, PageSection } from '@/layouts'

/**
 * Organizer partnership — office contract, not a self-serve apply wizard.
 * Route `/apply/organizer` kept for existing links; content is contact-first.
 */
export function ApplyOrganizerPage() {
  const { roleLabel } = useLocale()
  const organizer = roleLabel('organizer')

  const steps = [
    {
      title: 'Meet at the office',
      body: 'Partnership starts with a real conversation and a signed contract — not an online form.',
    },
    {
      title: 'Agreement in place',
      body: 'Once terms are set, our team prepares your organizer workspace behind the scenes.',
    },
    {
      title: 'Admin creates your account',
      body: 'You do not self-register as an organizer. We create the account after the office agreement.',
    },
  ]

  return (
    <>
      <FunnelHeader
        label={`${organizer} partnership`}
        backHref="/for-organizers"
        backLabel="Back to for organizers"
      />

      <PageSection padTop={48} padBottom={96}>
        <div className="mx-auto max-w-[720px]">
          <p className="text-[12px] font-bold tracking-[1.08px] text-ink-brand-mid uppercase">
            Office partnership
          </p>
          <h1 className="mt-[10px] text-[42px] leading-[1.04] font-extrabold tracking-[-1.47px] text-ink-primary">
            Become a {organizer} through our office.
          </h1>
          <p className="mt-[12px] text-[16.5px] leading-[1.6] text-ink-secondary">
            There is no self-serve application. Organizer accounts are created by MyTicket after a
            contract is signed at our office. Guests keep buying tickets as usual until then.
          </p>

          <ol className="mt-[32px] flex flex-col gap-[14px]">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="flex gap-[14px] rounded-[18px] border border-border-default bg-surface-default px-[22px] py-[18px]"
              >
                <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[12px] bg-bg-tint-brand text-[14px] font-extrabold text-ink-brand">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[16px] font-bold text-ink-primary">{step.title}</p>
                  <p className="mt-[4px] text-[14px] leading-[1.55] text-ink-secondary">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-[28px] rounded-[18px] border border-border-default bg-bg-warm px-[22px] py-[20px]">
            <p className="flex gap-[10px] text-[14px] leading-[1.55] text-ink-secondary">
              <CheckIcon size={16} weight="bold" className="mt-[2px] shrink-0 text-ink-brand" />
              <span>
                Ready to talk? Open a support case or email the partnerships desk — we&apos;ll
                schedule the office visit.
              </span>
            </p>
          </div>

          <div className="mt-[24px] flex flex-col gap-[10px] sm:flex-row">
            <Link to="/support/new" className="flex-1">
              <Button size="lg" className="w-full">
                Contact partnerships
              </Button>
            </Link>
            <a href="mailto:partnerships@myticket.sa" className="flex-1">
              <Button size="lg" variant="secondary" className="w-full">
                Email partnerships@myticket.sa
              </Button>
            </a>
          </div>

          <p className="mt-[20px] text-center text-[14px] text-ink-secondary">
            Learn more on{' '}
            <Link to="/for-organizers" className="font-semibold text-ink-brand">
              For {organizer}
            </Link>
            .
          </p>
        </div>
      </PageSection>
    </>
  )
}
