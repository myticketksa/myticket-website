import { useState, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  BuildingsIcon,
  MinusIcon,
  SearchIcon,
  StarIcon,
  TicketIcon,
  UserCircleIcon,
  WalletIcon,
  type IconProps,
} from '@/components/icons'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

const TOPIC_META: { id: string; Icon: ComponentType<IconProps> }[] = [
  { id: 'tickets', Icon: TicketIcon },
  { id: 'refunds', Icon: ArrowCounterClockwiseIcon },
  { id: 'payments', Icon: WalletIcon },
  { id: 'waitlists', Icon: StarIcon },
  { id: 'account', Icon: UserCircleIcon },
  { id: 'business', Icon: BuildingsIcon },
]

type HelpFaq = { q: string; a: string }
type QuickLink = { label: string; href: string }

/** Help centre — Figma `207:12147`. */
export function HelpPage() {
  const { t } = useTranslation(['marketing', 'common'])
  const [topicId, setTopicId] = useState(TOPIC_META[0].id)
  const [openFaq, setOpenFaq] = useState(0)
  const [query, setQuery] = useState('')

  const topics = TOPIC_META.map(({ id, Icon }) => {
    const faqs = t(`marketing:help.topics.${id}.faqs`, {
      returnObjects: true,
    }) as HelpFaq[]
    return {
      id,
      Icon,
      title: t(`marketing:help.topics.${id}.title`),
      blurb: t(`marketing:help.topics.${id}.blurb`),
      faqs: Array.isArray(faqs) ? faqs : [],
    }
  })

  const quickLinks = t('marketing:help.quickLinkItems', {
    returnObjects: true,
  }) as QuickLink[]

  const topic = topics.find((item) => item.id === topicId) ?? topics[0]

  return (
    <>
      <section className="relative w-full overflow-hidden bg-bg-page px-page-gutter pt-[64px] pb-[56px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 90% 46% at 12% 0%, rgba(242,95,44,0.2), transparent 62%)',
          }}
        />
        <div className="relative mx-auto flex w-full max-w-[820px] flex-col items-center text-center">
          <h1 className="text-[34px] leading-[1.04] font-extrabold tracking-[-1.82px] text-ink-primary sm:text-[44px] lg:text-[52px]">
            {t('marketing:help.title')}
          </h1>
          <p className="mt-[12px] text-[17px] font-medium text-ink-secondary">
            {t('marketing:help.lede')}
          </p>
          <form
            className="mt-[28px] flex w-full flex-col items-stretch gap-[10px] rounded-[20px] border border-border-default bg-surface-default p-[8px] shadow-help-search sm:flex-row sm:items-center"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="flex min-w-0 flex-1 items-center gap-[12px] px-lg">
              <SearchIcon size={19} className="shrink-0 text-ink-muted" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('marketing:help.searchPlaceholder')}
                className="h-[56px] min-w-0 flex-1 bg-transparent text-[16px] font-medium text-ink-primary outline-none placeholder:text-ink-muted"
              />
            </label>
            <Button type="submit" size="lg" className="h-[56px] w-full shrink-0 rounded-[14px] px-[28px] sm:w-auto">
              {t('common:actions.search')}
            </Button>
          </form>
        </div>
      </section>

      <PageSection padTop={0} padBottom={0}>
        <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {topics.map((item) => {
            const active = item.id === topic.id
            const Icon = item.Icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTopicId(item.id)
                  setOpenFaq(0)
                }}
                className={cn(
                  'flex flex-col items-start rounded-[20px] border-[1.5px] p-[22px] text-start transition-colors',
                  active
                    ? 'border-ink-brand bg-bg-tint-brand'
                    : 'border-border-default bg-surface-default hover:border-border-brand',
                )}
              >
                <span
                  className={cn(
                    'flex size-[42px] items-center justify-center rounded-[14px]',
                    active
                      ? 'bg-brand-gradient text-ink-inverse'
                      : 'bg-bg-tint-brand text-ink-brand',
                  )}
                >
                  <Icon size={17} />
                </span>
                <span className="mt-[14px] text-[17px] font-bold tracking-[-0.34px] text-ink-primary">
                  {item.title}
                </span>
                <span className="mt-[4px] text-[13px] font-medium text-ink-secondary">
                  {t('marketing:help.articlesCount', { count: item.faqs.length })}
                </span>
              </button>
            )
          })}
        </div>
      </PageSection>

      <PageSection padTop={60} padBottom={96}>
        <div className="flex flex-col gap-[44px] lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <h2 className="text-[34px] font-extrabold tracking-[-1.19px] text-ink-primary">
              {topic.title}
            </h2>
            <p className="mt-[6px] text-[15px] font-medium text-ink-secondary">{topic.blurb}</p>
            <div className="mt-[22px] flex flex-col gap-[10px]">
              {topic.faqs.map((faq, index) => {
                const open = openFaq === index
                return (
                  <div
                    key={faq.q}
                    className={cn(
                      'overflow-hidden rounded-[18px] border bg-surface-default',
                      open ? 'border-border-brand-soft' : 'border-border-default',
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-lg px-[22px] py-[20px] text-start"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? -1 : index)}
                    >
                      <span className="text-[16px] font-bold tracking-[-0.24px] text-ink-primary">
                        {faq.q}
                      </span>
                      <span
                        className={cn(
                          'flex size-[28px] shrink-0 items-center justify-center rounded-[14px]',
                          open
                            ? 'bg-brand-gradient text-ink-inverse'
                            : 'bg-bg-tint-brand text-[15px] font-bold text-brand-gradient-end',
                        )}
                      >
                        {open ? <MinusIcon size={15} /> : <span aria-hidden>+</span>}
                      </span>
                    </button>
                    {open && (
                      <div className="px-[22px] pb-[22px]">
                        <p className="max-w-[700px] text-[15px] leading-[1.65] font-medium text-ink-secondary">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-lg lg:w-[380px]">
            <div className="rounded-[22px] border border-border-default bg-surface-inverse p-[26px]">
              <p className="text-[12px] font-bold tracking-[0.96px] text-ink-warm-on-dark uppercase">
                {t('marketing:help.stillStuck')}
              </p>
              <p className="mt-[10px] text-[22px] font-extrabold tracking-[-0.55px] text-bg-page">
                {t('marketing:help.talkToHuman')}
              </p>
              <p className="mt-[8px] text-[14px] leading-[1.6] font-medium text-bg-page">
                {t('marketing:help.supportHours')}
              </p>
              <Link to="/support/new" className="mt-[20px] block">
                <Button size="md" className="h-[48px] w-full rounded-[24px]">
                  {t('marketing:help.startChat')}
                </Button>
              </Link>
              <Link to="/support/new" className="mt-[10px] block">
                <Button
                  variant="secondary"
                  size="md"
                  className="h-[48px] w-full rounded-[24px] border-[1.5px] border-bg-page/28 bg-transparent text-bg-page hover:border-bg-page hover:bg-transparent hover:text-bg-page"
                >
                  {t('marketing:help.emailSupport')}
                </Button>
              </Link>
            </div>

            <div className="rounded-[20px] border border-border-default bg-surface-default p-[22px]">
              <p className="text-[12px] font-extrabold tracking-[1.2px] text-brand-gradient-end uppercase">
                {t('marketing:help.quickLinks')}
              </p>
              <ul className="mt-[14px] flex flex-col gap-[11px]">
                {(Array.isArray(quickLinks) ? quickLinks : []).map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="inline-flex items-center gap-[5px] text-[15px] font-semibold text-ink-primary hover:text-ink-brand"
                    >
                      {link.label}
                      <ArrowRightIcon size={15} className="rtl:rotate-180" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[20px] border border-border-default bg-help-report p-[22px]">
              <p className="text-[17px] font-extrabold tracking-[-0.34px] text-ink-primary">
                {t('marketing:help.reportTitle')}
              </p>
              <p className="mt-[6px] text-[14px] leading-[1.55] font-medium text-ink-secondary">
                {t('marketing:help.reportBody')}
              </p>
              <Link to="/support/new" className="mt-lg block">
                <Button variant="secondary" size="md" className="h-[44px] w-full rounded-[22px]">
                  {t('marketing:help.reportCta')}
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </PageSection>
    </>
  )
}
