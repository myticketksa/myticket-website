import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import coverAlula from '@/assets/marketing/404-alula.png'
import coverComedy from '@/assets/marketing/404-comedy.jpg'
import coverOud from '@/assets/marketing/404-oud.jpg'
import { MagnifyingGlassIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'

const QUICK = [
  { label: 'All events', href: '/events' },
  { label: 'Tonight in Riyadh', href: '/search?q=riyadh+tonight' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'My tickets', href: '/my-tickets' },
  { label: 'Help centre', href: '/help' },
] as const

const TONIGHT = [
  {
    title: 'AlUla Sky Lantern Evening',
    meta: 'TODAY · 19:30',
    place: 'AlUla Old Town',
    price: 'SAR 150',
    cover: coverAlula,
  },
  {
    title: 'Stand-up Night: Riyadh Comedy Club',
    meta: 'TODAY · 21:30',
    place: 'Boulevard City, Riyadh',
    price: 'SAR 95',
    cover: coverComedy,
  },
  {
    title: 'Oud Night with Omar Farouk',
    meta: 'TODAY · 20:00',
    place: 'Bayt AlOud, Jeddah',
    price: 'SAR 120',
    cover: coverOud,
  },
] as const

/** 404 Not Found — Figma `207:12542`. Under MainLayout. */
export function NotFoundPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function onSearch(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <PageSection padTop={84} padBottom={72}>
      <div className="grid items-center gap-[60px] lg:grid-cols-[minmax(0,645px)_minmax(0,615px)]">
        <div>
          <p className="bg-brand-gradient bg-clip-text text-[96px] leading-[0.86] font-extrabold tracking-[-5px] text-transparent sm:text-[132px] sm:tracking-[-7.92px]">
            404
          </p>
          <h1 className="mt-[20px] text-[40px] leading-[1.04] font-extrabold tracking-[-1.4px] text-ink-primary sm:text-[46px] sm:tracking-[-1.61px]">
            This page has left the venue.
          </h1>
          <p className="mt-[14px] max-w-[480px] text-[17px] leading-[1.6] font-medium text-ink-secondary">
            The link may be old, the event may have finished, or we&apos;ve simply moved it. Search
            for what you were after, or start again from the home page.
          </p>

          <form
            onSubmit={onSearch}
            className="mt-[30px] flex max-w-[520px] items-center gap-[10px] rounded-[18px] border border-border-default bg-surface-default p-[7px] shadow-[0px_20px_44px_-26px_rgba(242,95,44,0.5),0px_2px_4px_0px_rgba(25,16,8,0.04)]"
          >
            <div className="flex h-[52px] min-w-0 flex-1 items-center gap-[12px] px-[14px]">
              <MagnifyingGlassIcon size={18} className="shrink-0 text-ink-brand" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, experiences, talents…"
                className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-ink-primary outline-none placeholder:text-ink-muted"
              />
            </div>
            <Button size="lg" type="submit" className="!h-[52px] !rounded-[12px] !px-[26px]">
              Search
            </Button>
          </form>

          <div className="mt-[22px] flex flex-wrap items-center gap-[8px]">
            <span className="pr-[4px] text-[13px] font-semibold text-ink-muted">Try</span>
            {QUICK.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="rounded-[16px] border-[1.5px] border-border-default bg-surface-default px-[14px] py-[7px] text-[13px] font-semibold text-ink-secondary hover:border-border-brand hover:text-ink-brand"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-[14px]">
          <p className="text-[12px] font-extrabold tracking-[1.2px] text-ink-brand-mid uppercase">
            On tonight instead
          </p>
          <ul className="flex flex-col gap-[14px]">
            {TONIGHT.map((event) => (
              <li key={event.title}>
                <Link
                  to="/events"
                  className="flex items-center gap-[18px] rounded-[20px] border border-border-default bg-surface-default p-[14px] hover:border-border-brand"
                >
                  <img
                    src={event.cover}
                    alt=""
                    className="h-[74px] w-[104px] shrink-0 rounded-[14px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-extrabold tracking-[0.6px] text-ink-brand uppercase">
                      {event.meta}
                    </p>
                    <p className="mt-[4px] text-[17px] font-bold tracking-[-0.255px] text-ink-primary">
                      {event.title}
                    </p>
                    <p className="mt-[3px] text-[13px] font-medium text-ink-secondary">
                      {event.place}
                    </p>
                  </div>
                  <p className="shrink-0 pr-[6px] text-[18px] font-extrabold text-brand-identity-end">
                    {event.price}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/support/new"
            className="mt-[2px] text-[14px] font-semibold text-ink-brand hover:text-ink-brand-mid"
          >
            Something&apos;s broken? Tell support →
          </Link>
        </aside>
      </div>
    </PageSection>
  )
}
