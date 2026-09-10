import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusIcon } from '@/components/icons'
import { Button, Field, Select, Textarea, TextInput } from '@/components/ui'
import { FunnelHeader, PageSection } from '@/layouts'
import { cn } from '@/lib/cn'
import { useSendChatMessageMutation } from '@/app/api/accountApis'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'

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

/** New support case — Figma `207:11781`. Opens support chat (no cases CRUD API). */
export function NewSupportCasePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [sendMessage, sendState] = useSendChatMessageMutation()
  const [kind, setKind] = useState<(typeof KINDS)[number]['id']>('working')
  const [urgency, setUrgency] = useState<(typeof URGENCY)[number]>('Normal')
  const [subject, setSubject] = useState('')
  const [details, setDetails] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const message = [
      `[${kind === 'working' ? 'Issue' : 'Complaint'} · ${urgency}]`,
      subject.trim() || 'Support request',
      details.trim(),
    ]
      .filter(Boolean)
      .join('\n\n')

    try {
      await sendMessage({ channel: 'support', message }).unwrap()
      dispatch(toastPushed('success', 'Sent to support — continue in chat'))
      navigate('/support/chat')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not reach support')))
      navigate('/support/chat')
    }
  }

  return (
    <>
      <FunnelHeader
        label="Raise something with us"
        backHref="/support"
        backLabel="My support cases"
      />

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
            onSubmit={(event) => void handleSubmit(event)}
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
              <TextInput
                id="subject"
                placeholder="e.g. Paid twice for the same order"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
            </Field>

            <Field label="What happened?" htmlFor="details">
              <Textarea
                id="details"
                rows={5}
                placeholder="The more detail, the faster we can help — what you did, what you expected, what happened instead."
                value={details}
                onChange={(event) => setDetails(event.target.value)}
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
                  className="flex h-[46px] w-full items-center justify-center gap-[6px] rounded-[12px] border-[1.5px] border-dashed border-border-dashed bg-bg-page text-[13.5px] font-semibold text-ink-secondary"
                >
                  <PlusIcon size={14} weight="bold" />
                  Add a screenshot or file
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-[12px]">
              <Button type="submit" size="lg" loading={sendState.isLoading}>
                Submit the case
              </Button>
              <p className="text-[13px] text-ink-muted">We usually reply within one working day.</p>
            </div>
          </form>
        </div>
      </PageSection>
    </>
  )
}
