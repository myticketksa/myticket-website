import {
  RoleBenefitsSection,
  RoleClosingCta,
  RoleFaqSection,
  RoleLandingHero,
  RoleMoneyAndNeeds,
  RoleStepsSection,
} from '@/pages/_account/MarketingShell'
import { ROLE_ORGANIZER_HERO } from '@/pages/_account/role-media'

/** For organizers — Figma `207:12611`. */
export function ForOrganizersPage() {
  return (
    <>
      <RoleLandingHero
        eyebrow="MyTicket for organizers"
        title="You make the night. We'll fill it."
        subtitle="Sell tickets to the audience already browsing MyTicket every day, hire your lineup and crew in one marketplace, and let us handle the money, the QR codes and the gate."
        primaryCta={{ label: 'Apply — about 15 minutes', to: '/apply/organizer' }}
        secondaryCta={{ label: 'See organizers on MyTicket', to: '/organizers' }}
        stats={[
          { value: '1,400+', label: 'events sold this year' },
          { value: '2.1M', label: 'guests buying on MyTicket' },
          { value: '2–5 days', label: 'application review' },
        ]}
        imageryLabel="Imagery — organizer at a sold-out show"
        imagerySrc={ROLE_ORGANIZER_HERO}
      />
      <RoleBenefitsSection
        items={[
          {
            title: "An audience that's already here",
            body: 'Your events surface in search, categories, favourites and waitlist alerts across the busiest live-events platform in the Kingdom — no ad budget required to be found.',
          },
          {
            title: 'Ticketing without the headache',
            body: 'Seated maps or free seating, purchase limits, QR entry, gifting, refunds and resale — all built, all handled, all under your own refund policy.',
          },
          {
            title: 'Your lineup and crew, one marketplace',
            body: 'Browse verified talents and vendors, see their reviews from other organizers, and hire through one conversation thread.',
          },
        ]}
      />
      <RoleStepsSection
        steps={[
          {
            title: 'Apply',
            body: 'Five parts, ~15 minutes. Progress saves as you go.',
          },
          {
            title: 'Get reviewed',
            body: 'Our team verifies your ID and registration in 2–5 working days.',
          },
          {
            title: 'Build your event',
            body: 'Venue, tickets, seat plan, lineup, refund policy — in the business workspace.',
          },
          {
            title: 'We approve, you sell',
            body: "Each event is checked, then it's live to millions of guests.",
          },
          {
            title: 'Run the night, get paid',
            body: 'QR scanning at the gate, sales live on your phone, payouts weekly.',
          },
        ]}
      />
      <RoleMoneyAndNeeds
        moneyRows={[
          { label: 'Listing an event', value: 'Free' },
          {
            label: 'Platform fee',
            value: '5% per ticket — paid by the buyer, shown separately',
          },
          { label: 'Payouts', value: 'Weekly, to your bank' },
          { label: 'Refunds', value: 'Your policy, executed by us' },
        ]}
        moneyFootnote="All ticket money flows through MyTicket — buyers never pay you directly, and every riyal is accounted for in your dashboard."
        needItems={[
          'Government ID — national ID, iqama or passport',
          'Commercial registration or event licence',
          "Your public name, logo and a producer's biography",
          'Operating region and business contact details',
        ]}
        needNoteBody="Every application is checked by our team in 2–5 working days — that vetting is why guests trust the events they find here."
      />
      <RoleFaqSection
        items={[
          {
            question: 'Do I need a registered company?',
            answer:
              "No — individuals can organize too. A company needs its commercial registration; an individual applies with their own ID and, where the event type requires it, a permit. Our review team tells you exactly what's missing rather than declining outright.",
          },
          {
            question: 'Who sets ticket prices and the refund policy?',
            answer:
              'You do. Prices, tiers and refund rules are yours to set per event — shown on the event page, at checkout, and on every ticket.',
          },
          {
            question: 'When does the money reach me?',
            answer:
              'Payouts run weekly to your registered Saudi bank account. Sales, refunds and fees are itemised in your dashboard before each transfer.',
          },
          {
            question: 'Can I still buy tickets as a guest?',
            answer:
              'Yes. Becoming an organizer adds a business workspace to the same account — your tickets, wallet and favourites stay exactly as they are.',
          },
        ]}
      />
      <RoleClosingCta
        title="Your first event could be on sale next week."
        subtitle="Fifteen minutes to apply, 2–5 days to review, then the stage is yours."
        buttonLabel="Start your application"
        buttonTo="/apply/organizer"
      />
    </>
  )
}
