import {
  RoleBenefitsSection,
  RoleClosingCta,
  RoleFaqSection,
  RoleLandingHero,
  RoleMoneyAndNeeds,
  RoleStepCheckLine,
  RoleStepsSection,
} from '@/pages/_account/MarketingShell'
import { ROLE_TALENT_HERO } from '@/pages/_account/role-media'

/** For talents — Figma `207:12768`. */
export function ForTalentsPage() {
  return (
    <>
      <RoleLandingHero
        eyebrow="MyTicket for talents"
        title="Get booked for the stages you deserve."
        subtitle="One profile puts you in front of every organizer planning an event in Saudi Arabia — with your portfolio, your reviews, and enquiries that come straight to you."
        primaryCta={{ label: 'Apply — about 10 minutes', to: '/apply/talent' }}
        secondaryCta={{ label: 'See talents on MyTicket', to: '/talents' }}
        stats={[
          { value: '3,800+', label: 'performers listed' },
          { value: '900+', label: 'organizers hiring' },
          { value: '0%', label: 'commission on your fee' },
        ]}
        imageryLabel="Imagery — performer on stage"
        imagerySrc={ROLE_TALENT_HERO}
      />
      <RoleBenefitsSection
        items={[
          {
            title: 'Found by the right people',
            body: 'Organizers filter by category, city, rating and availability. Your profile — portfolio, reviews, verified badge — is your pitch, working around the clock.',
          },
          {
            title: 'Enquiries on your terms',
            body: "Requests come to you with the event, dates and brief. Accept, decline, or talk it through — you're never auto-booked, and you set your own fee.",
          },
          {
            title: 'A track record that compounds',
            body: 'Every completed engagement adds a review from a real organizer, and every lineup you join links back to your profile from the event page.',
          },
        ]}
      />
      <RoleStepsSection
        steps={[
          {
            title: 'Apply',
            body: 'Five parts, ~10 minutes. Your portfolio is the heart of it.',
          },
          {
            title: 'Get verified',
            body: (
              <>
                ID checked, profile reviewed,{' '}
                <RoleStepCheckLine>badge earned — 2–5 working days.</RoleStepCheckLine>
              </>
            ),
          },
          {
            title: 'Go live',
            body: 'Your profile appears in the talents directory, filterable by what you do.',
          },
          {
            title: 'Talk to organizers',
            body: 'Enquiries arrive with the brief. Accept the ones that fit.',
          },
          {
            title: 'Perform & grow',
            body: 'Work marked complete unlocks a review, building your name for the next booking.',
          },
        ]}
      />
      <RoleMoneyAndNeeds
        moneyRows={[
          { label: 'Your profile', value: 'Free, always' },
          {
            label: 'Your performance fee',
            value: '100% yours — agreed directly with the organizer',
          },
          { label: "MyTicket's cut", value: 'None on marketplace work' },
        ]}
        moneyFootnote="MyTicket introduces you and hosts the conversation. Contracts, pricing and payment are between you and the organizer — we're upfront about that boundary on every enquiry."
        needItems={[
          'Government ID — for the verified badge',
          'At least one portfolio piece — a live video works hardest',
          'Stage name, photo and a biography worth booking',
          'Your performance categories, city and travel preference',
        ]}
        needNoteBody="Every profile is checked in 2–5 working days — organizers hire with confidence because everyone here is real."
      />
      <RoleFaqSection
        items={[
          {
            question: 'Does MyTicket take a cut of my performance fee?',
            answer:
              'No. Marketplace introductions are free — your fee is agreed directly with the organizer and paid directly by them. MyTicket earns from ticket sales, not from your work.',
          },
          {
            question: 'What if my profile is thin at the start?',
            answer:
              'One strong portfolio piece and a clear bio are enough to go live. Reviews compound after each completed booking — thin profiles get hired when the work is real.',
          },
          {
            question: 'Can I control where I appear?',
            answer:
              'Yes. Set your cities, travel preference and availability so organizers only see you when the brief fits.',
          },
          {
            question: 'I already buy tickets on MyTicket. Do I need a new account?',
            answer:
              'No. Apply with the same account — your guest history stays, and the talent role is added on top.',
          },
        ]}
      />
      <RoleClosingCta
        title="The next lineup is being booked right now."
        subtitle="Ten minutes to apply, 2–5 days to review — then organizers can find you."
        buttonLabel="Start your application"
        buttonTo="/apply/talent"
      />
    </>
  )
}
