import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Checkbox, Field, TextInput } from '@/components/ui'
import { PageSection } from '@/layouts'
import { useLocale } from '@/i18n/locale'

type DeletionOutcome =
  | { kind: 'success' }
  | { kind: 'invalid_credentials' }
  | { kind: 'blocked'; blockers: string[] }
  | { kind: 'error' }

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000') as string

/**
 * `POST /account-deletion/no-auth` { email, password }. Plain `fetch`, not
 * the RTK Query client: a wrong email/password gets a same-origin redirect
 * back from the API instead of a JSON 4xx, and default follow-redirect
 * fetch would land on the API's 200 HTML root and read that as success.
 * `redirect: 'manual'` surfaces it as an opaque response instead.
 */
async function requestAccountDeletion(email: string, password: string): Promise<DeletionOutcome> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}/account-deletion/no-auth`, {
      method: 'POST',
      redirect: 'manual',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    return { kind: 'error' }
  }

  if (response.type === 'opaqueredirect' || response.status === 0) {
    return { kind: 'invalid_credentials' }
  }

  if (response.status === 400) {
    const body = (await response.json().catch(() => null)) as { data?: unknown } | null
    const blockers = Array.isArray(body?.data) ? (body.data as string[]) : []
    return { kind: 'blocked', blockers }
  }

  if (response.ok) return { kind: 'success' }

  return { kind: 'error' }
}

/**
 * Public account-deletion page — required by Google Play's User Data
 * policy. No sign-in: email + password go straight to the no-auth
 * deletion endpoint above.
 *
 * Always English: this exact URL is what Google reviews. `setLocale('en')`
 * flips the whole app (header/footer included) since they read the same
 * global i18n instance — `{ lng: 'en' }` on this page's own `t()` calls
 * additionally avoids a one-frame flash of Arabic before that effect
 * commits.
 */
export function DeleteAccountPage() {
  const { t } = useTranslation('marketing')
  const { setLocale } = useLocale()
  useEffect(() => {
    setLocale('en')
  }, [setLocale])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [outcome, setOutcome] = useState<DeletionOutcome | null>(null)

  const canSubmit = email.trim() !== '' && password !== '' && confirmed && !submitting

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setOutcome(null)
    const result = await requestAccountDeletion(email.trim(), password)
    setSubmitting(false)
    setOutcome(result)
    if (result.kind === 'success') {
      setPassword('')
      setConfirmed(false)
    }
  }

  return (
    <div dir="ltr" lang="en">
      <PageSection padTop={64} padBottom={96}>
        <div className="mx-auto max-w-[480px]">
          <h1 className="text-[28px] leading-[1.1] font-extrabold tracking-[-1px] text-ink-primary">
            {t('deleteAccount.title', { lng: 'en' })}
          </h1>

          {outcome?.kind === 'success' ? (
            <div className="mt-[24px] rounded-[14px] border border-border-default bg-bg-tint-brand px-[18px] py-[16px]">
              <p className="text-[14.5px] font-bold text-ink-primary">
                {t('deleteAccount.form.successTitle', { lng: 'en' })}
              </p>
              <p className="mt-[4px] text-[13.5px] leading-[1.6] text-ink-secondary">
                {t('deleteAccount.form.successBody', { lng: 'en' })}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-[24px] flex flex-col gap-[14px]">
              <Field label={t('deleteAccount.form.emailLabel', { lng: 'en' })} htmlFor="delete-email">
                <TextInput
                  id="delete-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('deleteAccount.form.emailPlaceholder', { lng: 'en' }) ?? undefined}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>

              <Field
                label={t('deleteAccount.form.passwordLabel', { lng: 'en' })}
                htmlFor="delete-password"
              >
                <TextInput
                  id="delete-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('deleteAccount.form.passwordPlaceholder', { lng: 'en' }) ?? undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Field>

              <Checkbox
                id="delete-confirm"
                label={t('deleteAccount.form.confirmLabel', { lng: 'en' })}
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked === true)}
              />

              {outcome?.kind === 'invalid_credentials' && (
                <p className="rounded-[12px] border border-state-danger-border bg-state-danger-tint px-[14px] py-[11px] text-[13.5px] font-medium text-state-danger-deep">
                  {t('deleteAccount.form.invalidCredentials', { lng: 'en' })}
                </p>
              )}

              {outcome?.kind === 'blocked' && (
                <div className="rounded-[12px] border border-state-danger-border bg-state-danger-tint px-[14px] py-[12px]">
                  <p className="text-[13.5px] font-bold text-state-danger-deep">
                    {t('deleteAccount.form.blockedTitle', { lng: 'en' })}
                  </p>
                  <ul className="mt-[6px] list-disc ps-[18px]">
                    {outcome.blockers.map((code) => (
                      <li key={code} className="text-[13px] leading-[1.6] text-ink-secondary">
                        {t(`deleteAccount.form.blockers.${code}`, {
                          lng: 'en',
                          defaultValue: code,
                        })}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {outcome?.kind === 'error' && (
                <p className="rounded-[12px] border border-state-danger-border bg-state-danger-tint px-[14px] py-[11px] text-[13.5px] font-medium text-state-danger-deep">
                  {t('deleteAccount.form.genericError', { lng: 'en' })}
                </p>
              )}

              <Button type="submit" size="lg" loading={submitting} disabled={!canSubmit}>
                {submitting
                  ? t('deleteAccount.form.submitting', { lng: 'en' })
                  : t('deleteAccount.form.submit', { lng: 'en' })}
              </Button>
            </form>
          )}
        </div>
      </PageSection>
    </div>
  )
}
