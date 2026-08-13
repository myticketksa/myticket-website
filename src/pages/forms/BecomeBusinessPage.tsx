import { Link } from 'react-router-dom'
import {
  CheckIcon,
  MagnifyingGlassIcon,
  StorefrontIcon,
  TicketIcon,
  UserIcon,
} from '@/components/icons'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import type { ReactNode } from 'react'

const PATHS: {
  title: string
  body: string
  points: string[]
  need: string
  href: string
  cta: string
  icon: ReactNode
}[] = [
  {
    title: 'Organizer',
    body: 'Put on the nights everyone else queues for — concerts, matches, festivals, workshops.',
    points: [
      'Create events and sell tickets with seated or free-seating plans',
      'Ticket money collected for you, paid out on schedule',
      'Find and hire talents & vendors in the marketplace',
    ],
    need: 'ID, business registration or licence, and your story as a producer.',
    href: '/apply/organizer',
    cta: 'Apply as an organizer',
    icon: <TicketIcon size={24} />,
  },
  {
    title: 'Talent',
    body: 'Singer, band, comedian, speaker, DJ — get discovered and booked by real organizers.',
    points: [
      'A public profile with your portfolio, reviews and availability',
      'Enquiries come to you — you accept, decline, and set your terms',
      'Appear on event lineups across Saudi Arabia',
    ],
    need: 'ID, at least one portfolio piece, and a bio worth booking.',
    href: '/apply/talent',
    cta: 'Apply as a talent',
    icon: <UserIcon size={24} />,
  },
  {
    title: 'Vendor',
    body: 'Sound, light, catering, security, staging — the services every event is built on.',
    points: [
      'A storefront for your services, coverage area and past work',
      'Direct enquiries from organizers planning real events',
      'Verified credentials badge once our team checks your licence',
    ],
    need: 'ID, business licence, and photos of previous work.',
    href: '/apply/vendor',
    cta: 'Apply as a vendor',
    icon: <StorefrontIcon size={24} />,
  },
]

/** Become a business chooser — Figma `207:10047`. */
export function BecomeBusinessPage() {
  return (
    <>
      <PageSection padTop={48} padBottom={0} className="text-center">
        <p className="text-[12px] font-bold tracking-[1.08px] text-ink-brand-mid uppercase">
          Your account · Go professional
        </p>
        <h1 className="mx-auto mt-[10px] max-w-[720px] text-[44px] leading-[1.03] font-extrabold tracking-[-1.75px] text-ink-primary sm:text-[50px]">
          You&apos;ve been in the crowd. Ready for the other side?
        </h1>
        <p className="mx-auto mt-[14px] max-w-[620px] text-[17px] text-ink-secondary">
          Your MyTicket account can carry one business role alongside everything you already do as a
          guest. Every application is reviewed by our team — typically 2–5 working days — and
          you&apos;ll hear back either way.
        </p>
      </PageSection>

      <PageSection padTop={36} padBottom={96}>
        <div className="mx-auto grid max-w-[1040px] gap-[18px] md:grid-cols-3">
          {PATHS.map((path) => (
            <div
              key={path.title}
              className="flex flex-col rounded-[22px] border border-border-default bg-surface-default p-[28px]"
            >
              <div className="flex size-[52px] items-center justify-center rounded-[16px] bg-bg-tint-brand text-ink-brand">
                {path.icon}
              </div>
              <h2 className="mt-[16px] text-[22px] font-extrabold tracking-[-0.44px] text-ink-primary">
                {path.title}
              </h2>
              <p className="mt-[6px] text-[14px] leading-[1.55] text-ink-secondary">{path.body}</p>
              <ul className="mt-[16px] flex flex-col gap-[7px]">
                {path.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-[9px] text-[13px] leading-[1.45] text-ink-secondary"
                  >
                    <CheckIcon size={13} weight="bold" className="mt-[2px] shrink-0 text-ink-muted" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-[18px]">
                <div className="h-px bg-border-divider" />
                <p className="mt-[14px] text-[12px] leading-normal text-ink-muted">
                  <span className="font-bold text-ink-primary">You&apos;ll need:</span> {path.need}
                </p>
                <Link to={path.href} className="mt-[12px] block">
                  <Button size="md" className="w-full">
                    {path.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-[20px] max-w-[1040px] rounded-[18px] border border-border-default bg-surface-default px-[26px] py-[22px]">
          <div className="flex flex-col gap-[16px] md:flex-row md:gap-[26px]">
            <p className="flex flex-1 gap-[12px] text-[13px] leading-[1.55] text-ink-secondary">
              <MagnifyingGlassIcon size={17} className="mt-[2px] shrink-0 text-ink-brand" />
              <span>
                <span className="font-bold text-ink-primary">Reviewed first, always.</span> Every
                application is checked by a person on our team before any profile goes live.
              </span>
            </p>
            <p className="flex flex-1 gap-[12px] text-[13px] leading-[1.55] text-ink-secondary">
              <CheckIcon size={17} weight="bold" className="mt-[2px] shrink-0 text-ink-brand" />
              <span>
                <span className="font-bold text-ink-primary">One role per account.</span> You keep
                buying tickets as a guest — the business workspace is added alongside.
              </span>
            </p>
          </div>
        </div>

        <p className="mt-3xl text-center text-[14px] text-ink-secondary">
          Already have a business account?{' '}
          <Link to="/sign-in" className="font-semibold text-ink-brand">
            Sign in
          </Link>
        </p>
      </PageSection>
    </>
  )
}
