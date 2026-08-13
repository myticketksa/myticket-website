import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type AccountRoute = 'customer' | 'organizer' | 'talent' | 'vendor'

const ROUTES: {
  id: AccountRoute
  title: string
  description: string
  badge: string
  badgeTone: 'success' | 'brand'
  href?: string
}[] = [
  {
    id: 'customer',
    title: "I'm here for the nights out",
    description:
      'Buy tickets, save favourites, join waitlists, earn cashback. Takes three minutes.',
    badge: 'Ready immediately',
    badgeTone: 'success',
  },
  {
    id: 'organizer',
    title: 'I organize events',
    description: 'Create and sell events. Needs ID and business documents.',
    badge: 'Reviewed first · 2–5 days',
    badgeTone: 'brand',
    href: '/apply/organizer',
  },
  {
    id: 'talent',
    title: 'I perform',
    description: 'Get discovered and booked. Needs ID and a portfolio piece.',
    badge: 'Reviewed first · 2–5 days',
    badgeTone: 'brand',
    href: '/apply/talent',
  },
  {
    id: 'vendor',
    title: 'I provide event services',
    description: 'Sound, catering, security and more. Needs ID and a business licence.',
    badge: 'Reviewed first · 2–5 days',
    badgeTone: 'brand',
    href: '/apply/vendor',
  },
]

/**
 * Register — Figma `207:11849`. Account-type picker; hero lives in `AuthLayout`.
 */
export function RegisterPage() {
  const [selected, setSelected] = useState<AccountRoute>('customer')

  return (
    <div className="flex w-full flex-col">
      <h1 className="text-[42px] leading-[1.05] font-extrabold tracking-[-1.47px] text-ink-primary">
        First — what brings you here?
      </h1>
      <p className="mt-sm text-[15px] leading-[1.45] text-ink-secondary">
        Already have an account?{' '}
        <Link to="/sign-in" className="font-bold text-ink-brand">
          Sign in instead
        </Link>
        .
      </p>

      <div className="mt-[26px] flex flex-col gap-[10px]" role="radiogroup" aria-label="Account type">
        {ROUTES.map((route) => {
          const active = selected === route.id
          const content = (
            <>
              <div className="flex flex-wrap items-center gap-[10px]">
                <span
                  className={cn(
                    'font-bold text-ink-primary',
                    active ? 'text-[16px] leading-[1.45]' : 'text-[15px] leading-[1.45]',
                  )}
                >
                  {route.title}
                </span>
                <span
                  className={cn(
                    'rounded-[9px] px-[9px] py-[3px] text-[11.5px] leading-[1.45] font-bold',
                    route.badgeTone === 'success' &&
                      'bg-state-success-tint text-state-success',
                    route.badgeTone === 'brand' &&
                      'bg-bg-tint-brand text-ink-brand-strong',
                  )}
                >
                  {route.badge}
                </span>
              </div>
              <p className="mt-[3px] text-[13px] leading-[1.5] text-ink-secondary">
                {route.description}
              </p>
            </>
          )

          const className = cn(
            'w-full rounded-[18px] border-[1.5px] px-[20px] text-left transition-colors',
            active
              ? 'border-ink-brand bg-bg-tint-brand py-[18px]'
              : 'border-border-default bg-surface-default py-lg hover:border-border-brand',
          )

          if (route.href) {
            return (
              <Link
                key={route.id}
                to={route.href}
                role="radio"
                aria-checked={active}
                className={className}
                onClick={() => setSelected(route.id)}
              >
                {content}
              </Link>
            )
          }

          return (
            <button
              key={route.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={className}
              onClick={() => setSelected(route.id)}
            >
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )
}
