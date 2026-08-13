import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, PlusIcon } from '@/components/icons'
import { Button, Field, Select, Textarea, TextInput } from '@/components/ui'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

const KINDS = [
  {
    id: 'working',
    title: "Something isn't working",
    body: 'A problem with an order, ticket, refund, payment, or the site itself.',
  },
  {
    id: 'right',
    title: "Something wasn't right",
    body: 'A complaint about an organizer, a venue, safety, or how you were treated.',
  },
] as const

const URGENCY = ['Low', 'Normal', 'Urgent'] as const

/** New support case — Figma `207:11781`. */
export function NewSupportCasePage() {
  const [kind, setKind] = useState<(typeof KINDS)[number]['id']>('working')
  const [urgency, setUrgency] = useState<(typeof URGENCY)[number]>('Normal')

  return (
    <>
      <div className="border-b border-border-default">
        <div className="mx-auto flex h-[72px] w-full max-w-[var(--container-page)] items-center justify-between px-page-gutter">
          <p className="text-[13px] font-bold tracking-[1.04px] text-ink-muted uppercase">
            Raise something with us
          </p>
          <Link
            to="/support"
            className="inline-flex items-center gap-[5px] text-[14px] font-semibold text-ink-secondary hover:text-ink-brand"
          >
            <ArrowLeftIcon size={14} />
            My support cases
          </Link>
        </div>
      </div>

      <PageSection padTop={44} padBottom={96}>
        <div className="mx-auto w-full max-w-[720px]">
          <h1 className="text-[42px] leading-[1.04] font-extrabold tracking-[-1.47px] text-ink-primary">
            Tell us what&apos;s wrong.
          </h1>
          <p className="mt-[10px] max-w-[620px] text-[16px] text-ink-secondary">
            You&apos;ll get a reference straight away and can follow every reply from{' '}
            <Link to="/support" className="font-semibold text-ink-brand">
              your support cases
            </Link>
            .
          </p>

          <div className="mt-[26px] grid gap-[12px] sm:grid-cols-2">
            {KINDS.map((item) => {
              const active = kind === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setKind(item.id)}
                  className={cn(
                    'rounded-[18px] border-[1.5px] px-[22px] py-[20px] text-left',
                    active
                      ? 'border-ink-brand bg-bg-tint-brand'
                      : 'border-border-default bg-surface-default',
                  )}
                >
                  <p className="text-[16px] font-bold text-ink-primary">{item.title}</p>
                  <p className="mt-[4px] text-[13px] leading-[1.5] text-ink-secondary">
                    {item.body}
                  </p>
                </button>
              )
            })}
          </div>

          <form
            className="mt-[22px] flex flex-col gap-[20px] rounded-[22px] border border-border-default bg-surface-default p-[30px]"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid gap-[16px] sm:grid-cols-2">
              <Field label="What's it about?" htmlFor="about">
                <Select id="about" defaultValue="orders">
                  <option value="orders">Orders & payments</option>
                  <option value="tickets">Tickets & entry</option>
                  <option value="account">Account & wallet</option>
                  <option value="other">Something else</option>
                </Select>
              </Field>
              <div>
                <p className="mb-[8px] text-[13px] font-semibold text-ink-primary">
                  How urgent is it?
                </p>
                <div className="flex gap-[8px]">
                  {URGENCY.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setUrgency(level)}
                      className={cn(
                        'flex h-[46px] flex-1 items-center justify-center rounded-[12px] text-[13.5px] font-semibold',
                        urgency === level
                          ? 'bg-brand-gradient text-ink-inverse'
                          : 'border border-border-default bg-surface-default text-ink-primary',
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Field label="Subject" htmlFor="subject">
              <TextInput id="subject" placeholder="e.g. Paid twice for the same order" />
            </Field>

            <Field label="What happened?" htmlFor="details">
              <Textarea
                id="details"
                rows={5}
                placeholder="The more detail, the faster we can help — what you did, what you expected, what happened instead."
              />
            </Field>

            <div className="grid gap-[16px] sm:grid-cols-2">
              <Field
                label={
                  <>
                    Link it to something{' '}
                    <span className="font-medium text-ink-muted">— optional</span>
                  </>
                }
                htmlFor="link"
              >
                <Select id="link" defaultValue="">
                  <option value="">Nothing specific</option>
                  <option value="MT-2026-84193">MT-2026-84193 · Winter Nights</option>
                  <option value="MT-2026-84702">MT-2026-84702 · Warehouse Set</option>
                </Select>
              </Field>
              <div>
                <p className="mb-[8px] text-[13px] font-semibold text-ink-primary">
                  Attachment <span className="font-medium text-ink-muted">— optional</span>
                </p>
                <button
                  type="button"
                  className="flex h-[46px] w-full items-center justify-center gap-[6px] rounded-[12px] border-[1.5px] border-dashed border-[#e0c6b4] bg-bg-page text-[13.5px] font-semibold text-ink-secondary"
                >
                  <PlusIcon size={14} weight="bold" />
                  Add a screenshot or file
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-[12px]">
              <Link to="/support/chat">
                <Button size="lg">Submit the case</Button>
              </Link>
              <p className="text-[13px] text-ink-muted">We usually reply within one working day.</p>
            </div>
          </form>
        </div>
      </PageSection>
    </>
  )
}
