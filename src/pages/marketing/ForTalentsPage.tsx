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

/** For talents — submit request, admin review, contact outside platform. */
export function ForTalentsPage() {
  const { roleLabel } = useLocale()
  const talent = roleLabel('talent')

  return (
    <>
      <RoleLandingHero
        eyebrow={`MyTicket for ${talent}`}
        title="Share your craft with our team."
        subtitle={`Submit a ${talent} request for admin review. Guests can still see a limited public profile (avatar, name, craft, rate) — booking and contact happen outside the platform.`}
        primaryCta={{ label: 'Submit a request', to: '/apply/talent' }}
        secondaryCta={{ label: 'See all business paths', to: '/become-business' }}
        stats={[
          { value: '2–5 days', label: 'typical admin review' },
          { value: 'Guest', label: 'login stays unchanged' },
          { value: 'Off-platform', label: 'contact after accept' },
        ]}
        imageryLabel="Imagery — performer on stage"
      />
      <RoleBenefitsSection
        items={[
          {
            title: 'A request, not a booking inbox',
            body: 'You submit details for our team. There is no organizer booking flow or messaging thread inside the guest app.',
          },
          {
            title: 'Admin decides',
            body: 'We accept or reject each request. Track pending, accepted, or rejected from your guest account.',
          },
          {
            title: 'Limited public presence',
            body: 'Guests may see a slim profile. Matching and contracts are handled by MyTicket outside the platform.',
          },
        ]}
      />
      <RoleStepsSection
        steps={[
          {
            title: 'Submit',
            body: 'Short form — portfolio is the heart of it.',
          },
          {
            title: 'Get reviewed',
            body: (
              <>
                ID checked, profile reviewed,{' '}
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
            body: 'If accepted, contact happens outside MyTicket when needed.',
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
        moneyFootnote="MyTicket reviews your request for our own roster. Fees and contracts after contact are agreed off-platform."
        needItems={[
          'Government ID',
          'At least one portfolio piece — a live video works hardest',
          'Stage name, photo and a short biography',
          'Your performance categories and city',
        ]}
        needNoteBody="Every request is checked in 2–5 working days. Acceptance does not create a talent login."
      />
      <RoleFaqSection
        items={[
          {
            question: 'Do I get a talent account after acceptance?',
            answer:
              'No. You keep the same guest login. Acceptance means our team may contact you outside MyTicket when there is a fit.',
          },
          {
            question: 'Can organizers book me from MyTicket?',
            answer:
              'No. There is no in-app booking flow. Guests may see a limited profile; booking contact is handled by MyTicket off-platform.',
          },
          {
            question: 'What if my portfolio is thin at the start?',
            answer:
              'One strong piece and a clear bio are enough to submit. Our team will tell you if more is needed.',
          },
          {
            question: 'I already buy tickets. Do I need a new account?',
            answer:
              'No. Submit with the same guest account — history stays, and no extra role login is added.',
          },
        ]}
      />
      <RoleClosingCta
        title="Ready to submit?"
        subtitle="A few minutes to apply, 2–5 days to review — then we contact you if there's a fit."
        buttonLabel="Submit your request"
        buttonTo="/apply/talent"
      />
    </>
  )
}
