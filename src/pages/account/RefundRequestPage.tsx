import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HourglassIcon } from '@/components/icons'
import { Button, Field, Textarea } from '@/components/ui'
import { TicketActionHeader } from '@/layouts'
import { MY_TICKETS } from '@/pages/_account/fixtures'
import { cn } from '@/lib/cn'

const STEPS = [
  { titleKey: 'refund.steps.submittedTitle', bodyKey: 'refund.steps.submittedBody', active: true },
  { titleKey: 'refund.steps.reviewTitle', bodyKey: 'refund.steps.reviewBody', active: false },
  { titleKey: 'refund.steps.walletTitle', bodyKey: 'refund.steps.walletBody', active: false },
] as const

/** Refund request — Figma `207:9879`. */
export function RefundRequestPage() {
  const { t } = useTranslation('account')
  const { id = 'winter-nights' } = useParams()
  const ticket = MY_TICKETS.find((item) => item.id === id) ?? MY_TICKETS[0]

  return (
    <>
      <TicketActionHeader label={t('refund.header')} />
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-xl px-page-gutter pt-[48px] pb-[96px] lg:flex-row lg:items-start lg:gap-[32px]">
        <div className="min-w-0 flex-1">
          <h1 className="text-heading-h1 text-ink-primary">
            {t('refund.title')}
          </h1>
          <p className="mt-[10px] max-w-[560px] text-[16px] leading-normal text-ink-secondary">
            {t('refund.subtitle')}
          </p>

          <div className="mt-[30px] flex flex-col gap-sm rounded-[16px] border border-border-default bg-bg-tint-brand px-[18px] py-[14px] sm:flex-row sm:items-center sm:gap-md">
            <HourglassIcon size={16} weight="bold" className="shrink-0 text-ink-brand-strong" />
            <p className="min-w-0 flex-1 text-[13.5px] text-ink-secondary">
              <span className="font-bold text-ink-brand-strong">
                {t('refund.windowCloses', { when: 'Mon 5 Oct, 18:30' })}
              </span>{' '}
              {t('refund.windowByOrganizer')}
            </p>
            <p className="self-start text-[15px] font-extrabold text-ink-brand-strong sm:shrink-0">
              {t('refund.timeLeft', { time: '1d 21:16' })}
            </p>
          </div>

          <div className="mt-lg flex flex-col gap-xl rounded-[20px] border border-border-default bg-surface-default p-[26px]">
            <div>
              <p className="text-[15px] font-bold text-ink-primary">{t('refund.policyTitle')}</p>
              <p className="mt-[10px] text-[14px] leading-[1.6] text-ink-secondary">
                {t('refund.policyBody')}
              </p>
            </div>

            <div className="rounded-[14px] border border-border-default bg-bg-page px-[18px] py-lg text-[14px]">
              <div className="flex items-center justify-between gap-md">
                <span className="text-ink-secondary">{t('refund.ticketPrice')}</span>
                <span className="text-ink-primary">SAR 280.00</span>
              </div>
              <div className="mt-[8px] flex items-center justify-between gap-md">
                <span className="text-ink-secondary">{t('refund.platformFee')}</span>
                <span className="text-ink-primary">− SAR 14.00</span>
              </div>
              <div className="mt-[8px] flex items-center justify-between gap-md border-t border-border-divider pt-[9px] font-bold">
                <span className="text-ink-primary">{t('refund.backToWallet')}</span>
                <span className="text-state-success">SAR 266.00</span>
              </div>
            </div>

            <Field
              label={
                <>
                  {t('refund.reasonLabel')}{' '}
                  <span className="font-medium text-ink-muted">{t('refund.reasonOptional')}</span>
                </>
              }
              htmlFor="refund-reason"
            >
              <Textarea
                id="refund-reason"
                rows={3}
                className="min-h-[80px]"
                placeholder={t('refund.reasonPlaceholder')}
              />
            </Field>

            <p className="text-[13px] leading-[1.55] text-ink-secondary">
              {t('refund.handleNoteBefore')}{' '}
              <span className="font-bold text-ink-primary">{t('refund.handleNoteEmphasis')}</span>
              {t('refund.handleNoteAfter')}
            </p>

            <div className="flex flex-wrap items-center gap-md">
              <Button size="lg">{t('refund.cta', { amount: '266.00' })}</Button>
              <Link
                to={`/my-tickets/${ticket.id}`}
                className="inline-flex h-[50px] items-center px-[18px] text-[14px] font-medium text-ink-secondary hover:text-ink-brand"
              >
                {t('refund.keepTicket')}
              </Link>
            </div>
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-[14px] lg:w-[380px]">
          <div className="overflow-hidden rounded-[20px] border border-border-default bg-surface-default">
            <div className="relative h-[189px] bg-placeholder-gradient">
              <img
                src={ticket.cover}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </div>
            <div className="px-xl py-[18px]">
              <p className="text-[12px] font-bold tracking-[0.96px] text-ink-brand-mid uppercase">
                {t('refund.refundingEyebrow')}
              </p>
              <p className="mt-[5px] text-[20px] leading-[1.15] font-extrabold tracking-[-0.4px] text-ink-primary">
                {ticket.title}
              </p>
              <p className="mt-[6px] text-[13.5px] text-ink-secondary">Thu 8 Oct · 20:00 · Riyadh</p>
              <dl className="mt-[14px] flex flex-col gap-[7px] text-[13.5px]">
                <div className="flex items-center justify-between gap-md">
                  <dt className="text-ink-secondary">Ticket</dt>
                  <dd className="font-bold text-ink-primary">Gold · Floor A · Row C · Seat 12</dd>
                </div>
                <div className="flex items-center justify-between gap-md">
                  <dt className="text-ink-secondary">Order</dt>
                  <dd className="font-bold text-ink-primary">{ticket.orderId}</dd>
                </div>
                <div className="flex items-center justify-between gap-md">
                  <dt className="text-ink-secondary">{t('refund.paidWith')}</dt>
                  <dd className="font-bold text-ink-primary">Wallet + Visa ••4417</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-[20px] border border-border-default bg-surface-default p-xl">
            <p className="text-[15px] font-semibold text-ink-primary">
              {t('refund.whatHappens')}
            </p>
            <ol className="mt-md flex flex-col">
              {STEPS.map((step, index) => (
                <li key={step.titleKey} className="flex gap-md">
                  <div className="flex w-[10px] shrink-0 flex-col items-center pt-[4px]">
                    <span
                      className={cn(
                        'size-[10px] shrink-0 rounded-[5px] border-2',
                        step.active
                          ? 'border-border-brand-wash bg-ink-brand'
                          : 'border-border-default bg-surface-default',
                      )}
                    />
                    {index < STEPS.length - 1 && (
                      <span className="mt-0 min-h-[40px] w-[2px] flex-1 bg-border-default" />
                    )}
                  </div>
                  <div className={cn('min-w-0 pb-lg', index === STEPS.length - 1 && 'pb-0')}>
                    <p className="text-[13.5px] font-bold text-ink-primary">
                      {t(step.titleKey, { amount: '266.00' })}
                    </p>
                    <p className="mt-[2px] text-[12.5px] leading-[1.5] text-ink-secondary">
                      {t(step.bodyKey)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[16px] border border-border-default bg-bg-page px-[18px] py-lg">
            <p className="text-[13px] leading-[1.55] text-ink-secondary">
              <span className="font-bold text-ink-primary">{t('refund.ratherTitle')}</span>{' '}
              {t('refund.ratherBefore')}{' '}
              <Link
                to={`/my-tickets/${ticket.id}/resell`}
                className="text-ink-brand hover:text-ink-brand-mid"
              >
                {t('refund.ratherLink')}
              </Link>{' '}
              {t('refund.ratherAfter')}
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
