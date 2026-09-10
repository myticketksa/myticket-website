import { useLocale } from '@/i18n/locale'
import {
  RoleBenefitsSection,
  RoleClosingCta,
  RoleFaqSection,
  RoleLandingHero,
  RoleMoneyAndNeeds,
  RoleStepCheckLine,
  RoleStepsSection,
} from '@/pages/_account/MarketingShell'

/** For vendors — submit request, admin review, contact outside platform. */
export function ForVendorsPage() {
  const { roleLabel } = useLocale()
  const vendor = roleLabel('vendor')

  return (
    <>
      <RoleLandingHero
        eyebrow={`MyTicket for ${vendor}`}
        title="Every event needs what you do."
        subtitle={`Sound, light, catering, security, staging — submit a ${vendor} request for our team to review. If accepted, we reach out outside the platform when a match comes up. You stay a guest on MyTicket.`}
        primaryCta={{ label: 'Submit a request', to: '/apply/vendor' }}
        secondaryCta={{ label: 'See all business paths', to: '/become-business' }}
        stats={[
          { value: '2–5 days', label: 'typical admin review' },
          { value: 'Guest', label: 'login stays unchanged' },
          { value: 'Off-platform', label: 'contact after accept' },
        ]}
        imageryLabel="Imagery — crew rigging a stage"
      />
      <RoleBenefitsSection
        items={[
          {
            title: 'A request, not a storefront',
            body: 'You fill a short form. There is no public vendor directory for organizers to browse inside MyTicket.',
          },
          {
            title: 'Admin decides',
            body: 'Our team accepts or rejects each request. Status stays visible on your guest account — pending, accepted, or rejected.',
          },
          {
            title: 'Contact outside MyTicket',
            body: 'When we need your services, we contact you directly. Quotes and contracts stay between you and our team — not an in-app thread.',
          },
        ]}
      />
      <RoleStepsSection
        steps={[
          {
            title: 'Submit',
            body: 'Short form from your guest account — licence and work photos help.',
          },
          {
            title: 'Get reviewed',
            body: (
              <>
                Credentials checked,{' '}
                <RoleStepCheckLine>decision in 2–5 working days.</RoleStepCheckLine>
              </>
            ),
          },
          {
            title: 'Track status',
            body: 'Follow pending / accepted / rejected on your account.',
          },
          {
            title: 'We reach out',
            body: 'If accepted, contact happens outside the platform when needed.',
          },
          {
            title: 'Keep being a guest',
            body: 'Tickets, wallet and reviews never change with this request.',
          },
        ]}
      />
      <RoleMoneyAndNeeds
        moneyRows={[
          { label: 'Submitting a request', value: 'Free' },
          { label: 'Separate login role', value: 'None — guest only' },
          { label: 'In-app booking', value: 'Not available' },
        ]}
        moneyFootnote="MyTicket reviews your request for our own roster. There is no organizer browse-and-book flow or commission on off-platform work."
        needItems={[
          'Business licence or credentials',
          'Government ID of the person responsible',
          'At least one photo of real previous work',
          'Your services, coverage area and business story',
        ]}
        needNoteBody="Every request is checked in 2–5 working days. Acceptance does not create a vendor login."
      />
      <RoleFaqSection
        items={[
          {
            question: 'Do I get a vendor account after acceptance?',
            answer:
              'No. You keep the same guest login. Acceptance means our team may contact you outside MyTicket when your services are needed.',
          },
          {
            question: 'Can organizers browse and book me here?',
            answer:
              'No. There is no public vendor directory. Matching and contact are handled by MyTicket outside the guest app.',
          },
          {
            question: 'How large does my business need to be?',
            answer:
              "There's no minimum size. Solo operators and full crews both apply — what matters is real credentials and photos of work you've delivered.",
          },
          {
            question: 'Can I still buy tickets?',
            answer:
              'Yes. Submitting a request never changes tickets, wallet or reviews on your guest account.',
          },
        ]}
      />
      <RoleClosingCta
        title="Ready to be on our radar?"
        subtitle="A few minutes to submit, 2–5 days to review — then we contact you if there's a fit."
        buttonLabel="Submit your request"
        buttonTo="/apply/vendor"
      />
    </>
  )
}
