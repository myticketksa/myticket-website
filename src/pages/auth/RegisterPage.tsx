import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Divider } from '@/components/data-display'
import { Button, Checkbox, Field, TextInput } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useRegisterMutation, useVerifyEmailMutation } from '@/app/api/authApi'
import { useAppDispatch } from '@/app/hooks'
import { credentialsSet } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'
import {
  otpVerifySchema,
  registerSchema,
  splitIdentity,
  type OtpVerifyValues,
  type RegisterValues,
} from '@/lib/validation/authSchemas'

/**
 * Register — customer-only signup. Wired to register + verify-email APIs.
 */
export function RegisterPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [registerUser, registerState] = useRegisterMutation()
  const [verifyEmail, verifyState] = useVerifyEmailMutation()

  const form = useForm<RegisterValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      identity: '',
      password: '',
      acceptedTerms: false,
    },
  })

  const verifyForm = useForm<OtpVerifyValues>({
    resolver: yupResolver(otpVerifySchema),
    defaultValues: { identifier: '', code: '' },
  })

  async function onRegister(values: RegisterValues) {
    const { email, phone } = splitIdentity(values.identity)
    try {
      await registerUser({
        name: values.name.trim(),
        email: email ?? (phone ? `${phone}@phone.myticket.local` : undefined),
        phone: phone ?? email,
        password: values.password,
      }).unwrap()
      verifyForm.setValue('identifier', email ?? values.identity.trim())
      setStep('verify')
      dispatch(toastPushed('success', 'Check your email for a verification code'))
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not create account')))
    }
  }

  async function onVerify(values: OtpVerifyValues) {
    try {
      const session = await verifyEmail({
        email: values.identifier.includes('@')
          ? values.identifier
          : form.getValues('identity'),
        code: values.code,
      }).unwrap()
      dispatch(
        credentialsSet({
          token: session.access_token,
          user: session.user,
          persist: true,
        }),
      )
      dispatch(toastPushed('success', 'Account verified'))
      navigate('/')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not verify email')))
    }
  }

  const busy = registerState.isLoading || verifyState.isLoading

  return (
    <div className="flex w-full flex-col">
      <div className="mt-0 flex gap-[4px] rounded-[22px] border border-border-default bg-surface-default p-[5px]">
        <Link
          to="/sign-in"
          className="flex h-[36px] flex-1 items-center justify-center rounded-[18px] text-[14px] font-semibold text-ink-secondary"
        >
          Sign in
        </Link>
        <span className="flex h-[36px] flex-1 items-center justify-center rounded-[18px] bg-brand-gradient text-[14px] font-semibold text-ink-inverse">
          Create account
        </span>
      </div>

      <h1 className="mt-2xl text-[42px] leading-[1.05] font-extrabold tracking-[-1.47px] text-ink-primary">
        {step === 'form' ? 'Create your account' : 'Verify your email'}
      </h1>
      <p className="mt-sm text-[15px] leading-[1.45] text-ink-secondary">
        {step === 'form' ? (
          <>
            Guest accounts buy tickets, save favourites and use the wallet. Business requests come
            after you sign in.{' '}
            <Link to="/sign-in" className="font-bold text-ink-brand">
              Sign in instead
            </Link>
            .
          </>
        ) : (
          <>Enter the code we sent to finish creating your guest account.</>
        )}
      </p>

      {step === 'form' ? (
        <form className="mt-[28px] flex flex-col" onSubmit={form.handleSubmit(onRegister)}>
          <div className="flex flex-col gap-[14px]">
            <Field
              label="Full name"
              htmlFor="register-name"
              error={form.formState.errors.name?.message}
            >
              <TextInput
                id="register-name"
                type="text"
                placeholder="Sara Alghamdi"
                autoComplete="name"
                className="h-[50px]"
                {...form.register('name')}
              />
            </Field>

            <Field
              label="Mobile number or email"
              htmlFor="register-identity"
              error={form.formState.errors.identity?.message}
            >
              <TextInput
                id="register-identity"
                type="text"
                placeholder="5X XXX XXXX"
                autoComplete="username"
                className="h-[50px]"
                {...form.register('identity')}
                leading={
                  <>
                    <span className="shrink-0 text-[14px] font-medium text-ink-secondary">
                      +966
                    </span>
                    <Divider orientation="vertical" tone="border" className="h-5" />
                  </>
                }
              />
            </Field>

            <Field
              label="Password"
              htmlFor="register-password"
              error={form.formState.errors.password?.message}
            >
              <TextInput
                id="register-password"
                type="password"
                autoComplete="new-password"
                className="h-[50px]"
                {...form.register('password')}
              />
            </Field>
          </div>

          <Checkbox
            id="register-terms"
            className="mt-[18px]"
            checked={form.watch('acceptedTerms')}
            onCheckedChange={(value) => form.setValue('acceptedTerms', value === true)}
            label={
              <span>
                I agree to the{' '}
                <Link to="/legal" className="font-semibold text-ink-brand">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/legal" className="font-semibold text-ink-brand">
                  Privacy Policy
                </Link>
              </span>
            }
          />
          {form.formState.errors.acceptedTerms?.message && (
            <p className="mt-sm text-[13px] text-state-danger">
              {form.formState.errors.acceptedTerms.message}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            loading={busy}
            className="mt-[22px] h-[52px] w-full rounded-[26px] text-[16px] font-semibold"
          >
            Create account
          </Button>
        </form>
      ) : (
        <form className="mt-[28px] flex flex-col" onSubmit={verifyForm.handleSubmit(onVerify)}>
          <Field
            label="Verification code"
            htmlFor="register-code"
            error={verifyForm.formState.errors.code?.message}
          >
            <TextInput
              id="register-code"
              type="text"
              inputMode="numeric"
              className="h-[50px]"
              {...verifyForm.register('code')}
            />
          </Field>
          <Button
            type="submit"
            size="lg"
            loading={busy}
            className="mt-[22px] h-[52px] w-full rounded-[26px] text-[16px] font-semibold"
          >
            Verify and continue
          </Button>
        </form>
      )}

      <div className="mt-[26px] flex items-center gap-[14px]">
        <Divider tone="border" className="flex-1" />
        <span className="shrink-0 text-[13px] text-ink-muted">or continue with</span>
        <Divider tone="border" className="flex-1" />
      </div>

      <div className="mt-[14px] flex gap-[10px]">
        {(['Apple', 'Google', 'Nafath'] as const).map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="secondary"
            size="md"
            className="h-12 flex-1 rounded-[24px] border border-border-default bg-surface-default font-semibold"
            onClick={(event) => event.preventDefault()}
          >
            {provider}
          </Button>
        ))}
      </div>

      <div className="mt-[28px] rounded-[14px] border border-border-default bg-bg-warm px-lg py-[14px]">
        <p className={cn('text-[13px] leading-[1.5] text-ink-body')}>
          Applying as a business?{' '}
          <Link to="/become-business" className="text-ink-brand underline-offset-2 hover:underline">
            Submit a vendor or talent request
          </Link>{' '}
          after you create a guest account — or{' '}
          <Link to="/for-organizers" className="text-ink-brand underline-offset-2 hover:underline">
            contact us about organizer partnership
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
