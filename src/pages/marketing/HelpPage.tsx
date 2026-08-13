import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { MarketingHero } from '@/pages/_account/MarketingShell'

const TOPICS = [
  {
    title: 'Tickets & entry',
    items: ['Show QR offline', 'Transfer a ticket', 'Add to Apple Wallet', 'Find your gate'],
  },
  {
    title: 'Refunds & resale',
    items: ['Free refund window', 'List on the auction', 'Buyer protection', 'Gift a ticket'],
  },
  {
    title: 'Account & wallet',
    items: ['Cashback', 'Withdrawals', 'Two-factor sign-in', 'Payment methods'],
  },
  {
    title: 'Business',
    items: ['Apply as organizer', 'Vendor listings', 'Talent portfolios', 'Business sign-in'],
  },
] as const

/** Help centre — Figma `207:12147`. */
export function HelpPage() {
  return (
    <>
      <MarketingHero
        eyebrow="Help centre"
        title="How can we help?"
        subtitle="Guides for tickets, refunds, the wallet and business accounts — or talk to support."
        actions={
          <>
            <Link to="/support/new">
              <Button size="lg">Contact support</Button>
            </Link>
            <Link to="/sign-in">
              <Button variant="secondary" size="lg">
                Sign in
              </Button>
            </Link>
          </>
        }
      />
      <PageSection padTop={48} padBottom={96}>
        <div className="mx-auto grid max-w-[1040px] gap-[18px] md:grid-cols-2">
          {TOPICS.map((topic) => (
            <div
              key={topic.title}
              className="rounded-[20px] border border-border-default bg-surface-default p-[28px]"
            >
              <h2 className="text-[18px] font-bold text-ink-primary">{topic.title}</h2>
              <ul className="mt-lg flex flex-col gap-md">
                {topic.items.map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      className="text-left text-[15px] font-medium text-ink-secondary hover:text-ink-brand"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </PageSection>
    </>
  )
}
