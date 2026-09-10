import { Link } from 'react-router-dom'
import {
  MarketingCardGrid,
  MarketingCta,
  MarketingHero,
  MarketingStats,
} from '@/pages/_account/MarketingShell'

/** About — Figma `207:11984`. */
export function AboutPage() {
  return (
    <>
      <MarketingHero
        narrow
        eyebrow="About MyTicket"
        title="Saudi Arabia is going out. We hold the tickets."
        subtitle="MyTicket is where people across the Kingdom find live experiences — concerts, sports, festivals, theatre, family days, and places worth the drive — and buy their way in with one tap. Behind the curtain we partner with organizers through our office, and review vendor and talent requests from guest accounts."
      />
      <MarketingStats
        stats={[
          { value: '2.1M', label: 'guests with an account' },
          { value: '1,400+', label: 'events ticketed this year' },
          { value: '13', label: 'regions with live events' },
          { value: '5,000+', label: 'talents reviewed' },
        ]}
      />
      <MarketingCardGrid
        items={[
          {
            title: 'For the people going out',
            body: (
              <p>
                Every ticket is a real, verified QR code. Refunds follow rules you can read before
                you pay. Sold-out shows have honest waitlists and a legitimate resale auction
                instead of a parking-lot scalper. And your wallet keeps cashback, refunds and
                resale money in one place — spendable tonight or withdrawable to your bank.
              </p>
            ),
          },
          {
            title: 'For the people making the nights',
            body: (
              <p>
                Organizers partner with us through an office contract — we create their account after
                agreement. Performers and service businesses submit a request from a guest account;
                our team reviews it, and contact happens outside the platform when there is a fit.
              </p>
            ),
          },
          {
            title: 'How we make money',
            body: (
              <p>
                A platform fee on each ticket — always shown as its own line, never hidden in the
                price — and a commission when a ticket resells at auction. That&apos;s it.
              </p>
            ),
          },
          {
            title: 'Where we are',
            body: (
              <p>
                Built in Riyadh, operating across all of Saudi Arabia, in Arabic and English.
                Prices in Saudi Riyals, support every day from 9:00 to 01:00 AST.
              </p>
            ),
            links: [
              { label: 'Help centre', href: '/help' },
              { label: 'Talk to us', href: '/support/new' },
              { label: 'Terms & privacy', href: '/legal' },
            ],
          },
        ]}
      />
      <MarketingCta
        text="The best way to understand MyTicket is to find your next night out."
        buttonLabel="Browse what's on"
        buttonTo="/events"
      />
      <p className="pb-4xl text-center text-[14px] text-ink-secondary">
        Building something?{' '}
        <Link to="/become-business" className="font-semibold text-ink-brand">
          Become a business
        </Link>
      </p>
    </>
  )
}
