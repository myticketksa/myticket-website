import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@/components/icons'
import { Logo } from '@/components/navigation'
import { Button, Field, TextInput } from '@/components/ui'
import { cn } from '@/lib/cn'

/**
 * Reset Password — Figma `207:11297`.
 *
 * Full-bleed centred form (not the 702/738 split). AuthLayout detects this route
 * and skips the hero panel. Step 1 emails a link; step 2 sets the new password.
 */
export function ResetPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1)

  return (
    <>
      <header className="flex h-[72px] w-full items-center justify-between border-b border-border-default bg-bg-page px-page-gutter lg:px-[200px]">
        <Link to="/">
          <Logo height={36} />
        </Link>
        <Link
          to="/sign-in"
          className="flex items-center gap-[5px] text-[14px] font-semibold text-ink-secondary"
        >
          <ArrowLeftIcon size={14} />
          Back to sign in
        </Link>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-page-gutter py-4xl">
        <div className="w-full max-w-[460px]">
          <div className="flex gap-sm">
            <div className="flex min-w-0 flex-1 flex-col">
              <div
                className={cn(
                  'h-[5px] w-full rounded-[3px]',
                  step === 1 ? 'bg-brand-gradient' : 'bg-brand-primary',
                )}
              />
              <p
                className={cn(
                  'mt-[7px] text-[12px] font-bold',
                  step === 1 ? 'text-ink-primary' : 'text-ink-secondary',
                )}
              >
                1 · Request the link
              </p>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div
                className={cn(
                  'h-[5px] w-full rounded-[3px]',
                  step === 2 ? 'bg-brand-gradient' : 'bg-border-default',
                )}
              />
              <p
                className={cn(
                  'mt-[7px] text-[12px] font-bold',
                  step === 2 ? 'text-ink-primary' : 'text-ink-disabled',
                )}
              >
                2 · New password
              </p>
            </div>
          </div>

          {step === 1 ? (
            <>
              <h1 className="mt-[22px] text-[34px] leading-[1.05] font-extrabold tracking-[-1.02px] text-ink-primary">
                Forgot your password? Happens.
              </h1>
              <p className="mt-[10px] text-[15px] leading-[1.55] text-ink-secondary">
                Tell us your email and we&apos;ll send a link to set a new one. The link
                works for 30 minutes.
              </p>

              <form
                className={cn(
                  'mt-2xl rounded-[20px] border border-border-default',
                  'bg-surface-default p-[26px]',
                )}
                onSubmit={(event) => {
                  event.preventDefault()
                  setStep(2)
                }}
              >
                <Field label="Email address" htmlFor="reset-email">
                  <TextInput
                    id="reset-email"
                    name="email"
                    type="email"
                    defaultValue="sara@email.com"
                    autoComplete="email"
                  />
                </Field>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-lg h-[50px] w-full rounded-[25px] text-[15px] font-bold"
                >
                  Email me the link
                </Button>

                <p className="mt-[14px] text-[12.5px] leading-[1.5] text-ink-muted">
                  For your privacy we say the same thing whether or not an account exists
                  at that address.
                </p>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-[22px] text-[34px] leading-[1.05] font-extrabold tracking-[-1.02px] text-ink-primary">
                Set a new password
              </h1>
              <p className="mt-[10px] text-[15px] leading-[1.55] text-ink-secondary">
                Choose something you haven&apos;t used on MyTicket before. At least 8
                characters.
              </p>

              <form
                className={cn(
                  'mt-2xl rounded-[20px] border border-border-default',
                  'bg-surface-default p-[26px]',
                )}
                onSubmit={(event) => event.preventDefault()}
              >
                <div className="flex flex-col gap-[14px]">
                  <Field label="New password" htmlFor="reset-new-password">
                    <TextInput
                      id="reset-new-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      className="h-[48px]"
                    />
                  </Field>

                  <Field label="Confirm password" htmlFor="reset-confirm-password">
                    <TextInput
                      id="reset-confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className="h-[48px]"
                    />
                  </Field>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-lg h-[50px] w-full rounded-[25px] text-[15px] font-bold"
                >
                  Save new password
                </Button>

                <p className="mt-[14px] text-[12.5px] leading-[1.5] text-ink-muted">
                  After you save, you&apos;ll sign in with the new password on every device.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
