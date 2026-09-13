import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
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
  createForgotPasswordSchema,
  createResetPasswordSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from '@/lib/validation/authSchemas'

/**
 * Reset Password — Figma `207:11297`. Wired to forgot + reset password APIs.
 */
export function ResetPasswordPage() {
  const { t } = useTranslation(['auth', 'validation', 'common'])
  const { t: tv } = useTranslation('validation')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [step, setStep] = useState<1 | 2>(1)
  const [forgot, forgotState] = useForgotPasswordMutation()
  const [reset, resetState] = useResetPasswordMutation()

  const forgotResolver = useMemo(
    () => yupResolver(createForgotPasswordSchema((key) => tv(key))),
    [tv],
  )
  const resetResolver = useMemo(
    () => yupResolver(createResetPasswordSchema((key) => tv(key))),
    [tv],
  )

  const forgotForm = useForm<ForgotPasswordValues>({
    resolver: forgotResolver,
    defaultValues: { email: '' },
  })

  const resetForm = useForm<ResetPasswordValues>({
    resolver: resetResolver,
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
      dispatch(toastPushed('success', t('auth:reset.codeSent')))
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('auth:reset.forgotError'))))
    }
  }

  async function onReset(values: ResetPasswordValues) {
    try {
      await reset(values).unwrap()
      dispatch(toastPushed('success', t('auth:reset.success')))
      navigate('/sign-in')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('auth:reset.error'))))
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
          {t('auth:reset.backToSignIn')}
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
                {t('auth:reset.step1')}
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
                {t('auth:reset.step2')}
              </p>
            </div>
          </div>

          {step === 1 ? (
            <>
              <h1 className="mt-[22px] text-[28px] leading-[1.05] font-extrabold tracking-[-1.02px] text-ink-primary sm:text-[34px] lg:text-[42px]">
                {t('auth:reset.forgotTitle')}
              </h1>
              <p className="mt-[10px] text-[15px] leading-[1.55] text-ink-secondary">
                {t('auth:reset.forgotSubtitle')}
              </p>

              <form
                className={cn(
                  'mt-2xl rounded-[20px] border border-border-default',
                  'bg-surface-default p-[26px]',
                )}
                onSubmit={forgotForm.handleSubmit(onForgot)}
              >
                <Field
                  label={t('auth:reset.email')}
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
                  {t('auth:reset.sendCode')}
                </Button>

                <p className="mt-[14px] text-[12.5px] leading-[1.5] text-ink-muted">
                  {t('auth:reset.privacyNote')}
                </p>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-[22px] text-[28px] leading-[1.05] font-extrabold tracking-[-1.02px] text-ink-primary sm:text-[34px] lg:text-[42px]">
                {t('auth:reset.title')}
              </h1>
              <p className="mt-[10px] text-[15px] leading-[1.55] text-ink-secondary">
                {t('auth:reset.subtitle')}
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
                    label={t('auth:reset.code')}
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
                    label={t('auth:reset.password')}
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
                    label={t('auth:reset.confirm')}
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
                  {t('auth:reset.submit')}
                </Button>

                <p className="mt-[14px] text-[12.5px] leading-[1.5] text-ink-muted">
                  {t('auth:reset.afterSave')}
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
