import { useState, useEffect, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Checkbox, Field, TextInput } from '@/components/ui'
import { MoneyAmount } from '@/components/data-display/MoneyAmount'
import { PageSection } from '@/layouts'
import { useLocale } from '@/i18n/locale'

type Step = 'signIn' | 'confirm' | 'success'

type SessionUser = { email: string; walletBalance?: number }

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000') as string

/**
 * Plain `fetch`, not the app's shared RTK Query client: that client treats
 * any 401 response as an expired session and redirects the whole page to
 * `/sign-in` — correct for an already-signed-in user's token expiring
 * mid-session, wrong here, where a 401 just means the password typed into
 * this page's own form was wrong. Bypassing it keeps a bad attempt on
 * screen instead of yanking the visitor away to a different page.
 */
async function signIn(
  email: string,
  password: string,
): Promise<{ ok: true; token: string; user: SessionUser } | { ok: false }> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ identifier: email, password }),
  })
  if (!response.ok) return { ok: false }
  const body = (await response.json().catch(() => null)) as {
    data?: { access_token?: string; user?: { email?: string; walletBalance?: unknown; wallet_balance?: unknown; balance?: unknown } }
  } | null
  const token = body?.data?.access_token
  const rawUser = body?.data?.user
  if (!token || !rawUser) return { ok: false }
  const walletRaw = rawUser.walletBalance ?? rawUser.wallet_balance ?? rawUser.balance
  const walletBalance = walletRaw == null ? undefined : Number(walletRaw)
  return {
    ok: true,
    token,
    user: {
      email: String(rawUser.email ?? email),
      walletBalance: Number.isFinite(walletBalance) ? walletBalance : undefined,
    },
  }
}

type DeleteOutcome = { kind: 'success' } | { kind: 'blocked'; blockers: string[] } | { kind: 'error' }

async function deleteAccount(token: string, password: string): Promise<DeleteOutcome> {
  const response = await fetch(`${API_BASE}/account-deletion`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  })
  if (response.ok) return { kind: 'success' }
  if (response.status === 400) {
    const body = (await response.json().catch(() => null)) as { data?: unknown } | null
    return { kind: 'blocked', blockers: Array.isArray(body?.data) ? (body.data as string[]) : [] }
  }
  return { kind: 'error' }
}

/**
 * Public account-deletion page — required by Google Play's User Data
 * policy. Signs the person in first so the confirm step can show real
 * account context — the wallet-balance warning below — before the
 * irreversible action.
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

  const [step, setStep] = useState<Step>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState(false)
  const [signInFailed, setSignInFailed] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [outcome, setOutcome] = useState<DeleteOutcome | null>(null)

  async function handleSignIn(event: FormEvent) {
    event.preventDefault()
    if (!email.trim() || !password) return
    setSigningIn(true)
    setSignInFailed(false)
    const result = await signIn(email.trim(), password)
    setSigningIn(false)
    if (!result.ok) {
      setSignInFailed(true)
      return
    }
    setToken(result.token)
    setUser(result.user)
    setStep('confirm')
  }

  async function handleDelete() {
    if (!confirmed || !token) return
    setDeleting(true)
    setOutcome(null)
    const result = await deleteAccount(token, password)
    setDeleting(false)
    setOutcome(result)
    if (result.kind === 'success') setStep('success')
  }

  return (
    <div dir="ltr" lang="en">
      <PageSection padTop={64} padBottom={96}>
        <div className="mx-auto max-w-[440px]">
          <h1 className="text-[28px] leading-[1.1] font-extrabold tracking-[-1px] text-ink-primary">
            {t('deleteAccount.title', { lng: 'en' })}
          </h1>

          {step === 'signIn' && (
            <form onSubmit={handleSignIn} className="mt-[24px] flex flex-col gap-[14px]">
              <p className="text-[14px] text-ink-secondary">
                {t('deleteAccount.form.signInLede', { lng: 'en' })}
              </p>

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

              {signInFailed && (
                <p className="rounded-[12px] border border-state-danger-border bg-state-danger-tint px-[14px] py-[11px] text-[13.5px] font-medium text-state-danger-deep">
                  {t('deleteAccount.form.invalidCredentials', { lng: 'en' })}
                </p>
              )}

              <Button type="submit" size="lg" loading={signingIn}>
                {signingIn
                  ? t('deleteAccount.form.continuing', { lng: 'en' })
                  : t('deleteAccount.form.continue', { lng: 'en' })}
              </Button>
            </form>
          )}

          {step === 'confirm' && (
            <div className="mt-[24px] flex flex-col gap-[14px]">
              <p className="text-[14px] text-ink-secondary">{user?.email}</p>

              {!!user?.walletBalance && user.walletBalance > 0 && (
                <div className="rounded-[12px] border border-state-danger-border bg-state-danger-tint px-[14px] py-[11px]">
                  <p className="flex items-center gap-[6px] text-[13.5px] font-bold text-state-danger-deep">
                    {t('deleteAccount.form.walletBalanceLabel', { lng: 'en' })}
                    <MoneyAmount value={user.walletBalance} className="text-state-danger-deep" />
                  </p>
                  <p className="mt-[2px] text-[13px] leading-[1.6] text-state-danger-deep">
                    {t('deleteAccount.form.walletWarningBody', { lng: 'en' })}
                  </p>
                </div>
              )}

              <Checkbox
                id="delete-confirm"
                label={t('deleteAccount.form.confirmLabel', { lng: 'en' })}
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked === true)}
              />

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

              <Button size="lg" loading={deleting} disabled={!confirmed || deleting} onClick={handleDelete}>
                {deleting
                  ? t('deleteAccount.form.submitting', { lng: 'en' })
                  : t('deleteAccount.form.submit', { lng: 'en' })}
              </Button>
            </div>
          )}

          {step === 'success' && (
            <div className="mt-[24px] rounded-[14px] border border-border-default bg-bg-tint-brand px-[18px] py-[16px]">
              <p className="text-[14.5px] font-bold text-ink-primary">
                {t('deleteAccount.form.successTitle', { lng: 'en' })}
              </p>
              <p className="mt-[4px] text-[13.5px] leading-[1.6] text-ink-secondary">
                {t('deleteAccount.form.successBody', { lng: 'en' })}
              </p>
            </div>
          )}
        </div>
      </PageSection>
    </div>
  )
}
