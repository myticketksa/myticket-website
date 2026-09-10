import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ArrowLeftIcon } from '@/components/icons'
import { Logo } from '@/components/navigation'
import { Button, Field, TextInput } from '@/components/ui'
import { cn } from '@/lib/cn'
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '@/app/api/authApi'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from '@/lib/validation/authSchemas'

/**
 * Reset Password — Figma `207:11297`. Wired to forgot + reset password APIs.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [step, setStep] = useState<1 | 2>(1)
  const [forgot, forgotState] = useForgotPasswordMutation()
  const [reset, resetState] = useResetPasswordMutation()

  const forgotForm = useForm<ForgotPasswordValues>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const resetForm = useForm<ResetPasswordValues>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
      code: '',
      password: '',
      password_confirmation: '',
    },
  })

  async function onForgot(values: ForgotPasswordValues) {
    try {
      await forgot(values).unwrap()
      resetForm.setValue('email', values.email)
      setStep(2)
      dispatch(toastPushed('success', 'If that email exists, a code is on its way'))
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not start reset')))
    }
  }

  async function onReset(values: ResetPasswordValues) {
    try {
      await reset(values).unwrap()
      dispatch(toastPushed('success', 'Password updated — sign in'))
      navigate('/sign-in')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not reset password')))
    }
  }

  const busy = forgotState.isLoading || resetState.isLoading

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
                Tell us your email and we&apos;ll send a code to set a new one.
              </p>

              <form
                className={cn(
                  'mt-2xl rounded-[20px] border border-border-default',
                  'bg-surface-default p-[26px]',
                )}
                onSubmit={forgotForm.handleSubmit(onForgot)}
              >
                <Field
                  label="Email address"
                  htmlFor="reset-email"
                  error={forgotForm.formState.errors.email?.message}
                >
                  <TextInput
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    {...forgotForm.register('email')}
                  />
                </Field>

                <Button
                  type="submit"
                  size="lg"
                  loading={busy}
                  className="mt-lg h-[50px] w-full rounded-[25px] text-[15px] font-bold"
                >
                  Email me the code
                </Button>

                <p className="mt-[14px] text-[12.5px] leading-[1.5] text-ink-muted">
                  For your privacy we say the same thing whether or not an account exists at that
                  address.
                </p>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-[22px] text-[34px] leading-[1.05] font-extrabold tracking-[-1.02px] text-ink-primary">
                Set a new password
              </h1>
              <p className="mt-[10px] text-[15px] leading-[1.55] text-ink-secondary">
                Enter the code from your email, then choose a new password (at least 8 characters).
              </p>

              <form
                className={cn(
                  'mt-2xl rounded-[20px] border border-border-default',
                  'bg-surface-default p-[26px]',
                )}
                onSubmit={resetForm.handleSubmit(onReset)}
              >
                <div className="flex flex-col gap-[14px]">
                  <Field
                    label="Reset code"
                    htmlFor="reset-code"
                    error={resetForm.formState.errors.code?.message}
                  >
                    <TextInput
                      id="reset-code"
                      type="text"
                      inputMode="numeric"
                      className="h-[48px]"
                      {...resetForm.register('code')}
                    />
                  </Field>
                  <Field
                    label="New password"
                    htmlFor="reset-new-password"
                    error={resetForm.formState.errors.password?.message}
                  >
                    <TextInput
                      id="reset-new-password"
                      type="password"
                      autoComplete="new-password"
                      className="h-[48px]"
                      {...resetForm.register('password')}
                    />
                  </Field>
                  <Field
                    label="Confirm password"
                    htmlFor="reset-confirm-password"
                    error={resetForm.formState.errors.password_confirmation?.message}
                  >
                    <TextInput
                      id="reset-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      className="h-[48px]"
                      {...resetForm.register('password_confirmation')}
                    />
                  </Field>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  loading={busy}
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
