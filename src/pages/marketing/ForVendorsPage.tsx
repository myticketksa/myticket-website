import {
  RoleBenefitsSection,
  RoleClosingCta,
  RoleFaqSection,
  RoleLandingHero,
  RoleMoneyAndNeeds,
  RoleStepCheckLine,
  RoleStepsSection,
} from '@/pages/_account/MarketingShell'
import { ROLE_VENDOR_HERO } from '@/pages/_account/role-media'

/** For vendors — Figma `207:12388`. */
export function ForVendorsPage() {
  return (
    <>
      <RoleLandingHero
        eyebrow="MyTicket for vendors"
        title="Every event needs what you do."
        subtitle="Sound, light, catering, security, staging — organizers on MyTicket hire for hundreds of events a month. A verified storefront puts your business in the room where those decisions happen."
        primaryCta={{ label: 'Apply — about 10 minutes', to: '/apply/vendor' }}
        secondaryCta={{ label: 'See vendors on MyTicket', to: '/vendors' }}
        stats={[
          { value: '1,200+', label: 'vendors listed' },
          { value: '340', label: 'events hiring this month' },
          { value: '0%', label: 'commission on your contracts' },
        ]}
        imageryLabel="Imagery — crew rigging a stage"
        imagerySrc={ROLE_VENDOR_HERO}
      />
      <RoleBenefitsSection
        items={[
          {
            title: 'Organizers come to you',
            body: 'They filter by service, coverage area and rating while planning real, dated events — so every enquiry arrives with a venue, a date and a genuine budget behind it.',
          },
          {
            title: 'Proof beats promises',
            body: "Your storefront carries verified credentials, photos of past setups, the events you've worked, and reviews from the organizers who hired you.",
          },
          {
            title: 'One thread per job',
            body: 'Briefs, questions, quotes and attachments stay in one conversation — and completed work converts into a public review that wins the next one.',
          },
        ]}
      />
      <RoleStepsSection
        steps={[
          {
            title: 'Apply',
            body: 'Five parts, ~10 minutes. Licence and work photos carry it.',
          },
          {
            title: 'Get verified',
            body: (
              <>
                Credentials checked,{' '}
                <RoleStepCheckLine>badge earned — 2–5 working days.</RoleStepCheckLine>
              </>
            ),
          },
          {
            title: 'Go live',
            body: 'Your storefront appears in the vendors directory, filterable by service and area.',
          },
          {
            title: 'Quote the work',
            body: 'Enquiries arrive with the event brief. Accept what fits, on your terms.',
          },
          {
            title: 'Deliver & grow',
            body: 'Completed jobs unlock organizer reviews and show on your event history.',
          },
        ]}
      />
      <RoleMoneyAndNeeds
        moneyRows={[
          { label: 'Your storefront', value: 'Free, always' },
          {
            label: 'Your contracts',
            value: '100% yours — agreed directly with the organizer',
          },
          { label: "MyTicket's cut", value: 'None on marketplace work' },
        ]}
        moneyFootnote="MyTicket introduces you and hosts the conversation. Quotes, invoicing and payment stay between you and the organizer — we're upfront about that boundary on every enquiry."
        needItems={[
          'Business licence or credentials — verified for the badge',
          'Government ID of the person responsible',
          'At least one photo of real previous work',
          'Your services, coverage area and business story',
        ]}
        needNoteBody="Every vendor is checked in 2–5 working days — organizers book you faster because the vetting is already done."
      />
      <RoleFaqSection
        items={[
          {
            question: 'Does MyTicket take a commission on my contracts?',
            answer:
              'No. Marketplace work is commission-free — you agree scope and price directly with the organizer and invoice them directly. MyTicket earns from ticket sales, not your contracts.',
          },
          {
            question: "My service isn't in the category list.",
            answer:
              'Pick the closest category and describe what you actually offer in your storefront. If we need a new category for your craft, our review team will add it during verification.',
          },
          {
            question: 'How large does my business need to be?',
            answer:
              "There's no minimum size. Solo operators and full crews both list — what matters is real credentials and photos of work you've actually delivered.",
          },
          {
            question: 'Can I use the same account to buy tickets?',
            answer:
              'Yes. Your guest account carries the vendor role. Tickets, wallet and reviews stay untouched when you apply.',
          },
        ]}
      />
      <RoleClosingCta
        title="Somewhere, an organizer needs exactly your kit."
        subtitle="Ten minutes to apply, 2–5 days to review — then they can find you."
        buttonLabel="Start your application"
        buttonTo="/apply/vendor"
      />
    </>
  )
}
