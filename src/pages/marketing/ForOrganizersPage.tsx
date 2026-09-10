import { useLocale } from '@/i18n/locale'
import {
  RoleBenefitsSection,
  RoleClosingCta,
  RoleFaqSection,
  RoleLandingHero,
  RoleMoneyAndNeeds,
  RoleStepsSection,
} from '@/pages/_account/MarketingShell'

/** For organizers — office partnership; no self-serve apply wizard. */
export function ForOrganizersPage() {
  const { roleLabel } = useLocale()
  const organizer = roleLabel('organizer')

  return (
    <>
      <RoleLandingHero
        eyebrow={`MyTicket for ${organizer}`}
        title="You make the night. We'll fill it."
        subtitle={`Sell tickets to the audience already browsing MyTicket. ${organizer} accounts are created after an office contract — not through a self-serve form.`}
        primaryCta={{ label: 'Contact partnerships', to: '/support/new' }}
        secondaryCta={{ label: 'How onboarding works', to: '/apply/organizer' }}
        stats={[
          { value: '1,400+', label: 'events sold this year' },
          { value: '2.1M', label: 'guests buying on MyTicket' },
          { value: 'Office', label: 'contract then account' },
        ]}
        imageryLabel="Imagery — organizer at a sold-out show"
      />
      <RoleBenefitsSection
        items={[
          {
            title: "An audience that's already here",
            body: 'Your events surface in search, categories, favourites and waitlist alerts across the busiest live-events platform in the Kingdom.',
          },
          {
            title: 'Ticketing without the headache',
            body: 'Seated maps or free seating, purchase limits, QR entry, gifting, refunds and resale — all built, all handled, all under your own refund policy.',
          },
          {
            title: 'Partnership, not a directory',
            body: 'Lineup and crew are arranged with MyTicket outside the guest app. Guests never browse organizer or vendor directories to book services.',
          },
        ]}
      />
      <RoleStepsSection
        steps={[
          {
            title: 'Talk to us',
            body: 'Reach partnerships — office visit and contract come first.',
          },
          {
            title: 'Sign the agreement',
            body: 'Terms are set in person with our team.',
          },
          {
            title: 'We create your account',
            body: 'Admin provisions the organizer workspace after the contract.',
          },
          {
            title: 'Build your event',
            body: 'Venue, tickets, seat plan, refund policy — in your workspace.',
          },
          {
            title: 'Run the night, get paid',
            body: 'QR at the gate, sales on your phone, payouts on schedule.',
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
          'Office meeting and signed partnership contract',
          'Government ID — national ID, iqama or passport',
          'Commercial registration or event licence where required',
          'Operating region and business contact details',
        ]}
        needNoteBody="There is no online organizer application. Accounts are created by admin after the office agreement."
      />
      <RoleFaqSection
        items={[
          {
            question: 'Can I apply online as an organizer?',
            answer:
              'No self-serve form. Contact partnerships, complete the office contract, then our admin team creates your account.',
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
            question: 'Is there a talent or vendor directory for organizers?',
            answer:
              'No. Matching and contact for talent and vendors are handled by MyTicket outside the guest app — not by organizers browsing directories.',
          },
        ]}
      />
      <RoleClosingCta
        title="Ready to partner?"
        subtitle="Start with a conversation — office contract first, account next."
        buttonLabel="Contact partnerships"
        buttonTo="/support/new"
      />
    </>
  )
}
