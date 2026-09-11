import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ArrowLeftIcon } from '@/components/icons'
import { Divider } from '@/components/data-display'
import { Button, Checkbox, Field, TextInput } from '@/components/ui'
import { cn } from '@/lib/cn'
import {
  useLoginMutation,
  useRequestLoginCodeMutation,
  useVerifyLoginCodeMutation,
} from '@/app/api/authApi'
import { useAppDispatch } from '@/app/hooks'
import { credentialsSet } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'
import {
  otpVerifySchema,
  signInSchema,
  toLoginIdentifier,
  type OtpVerifyValues,
  type SignInValues,
} from '@/lib/validation/authSchemas'

/**
 * Sign In — Figma `207:11907`. Form column only; hero lives in `AuthLayout`.
 * Wired to Auth RTK endpoints (password + OTP).
 */
export function SignInPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [mode, setMode] = useState<'password' | 'otp-request' | 'otp-verify'>('password')
  const [login, loginState] = useLoginMutation()
  const [requestCode, requestState] = useRequestLoginCodeMutation()
  const [verifyCode, verifyState] = useVerifyLoginCodeMutation()

  const passwordForm = useForm<SignInValues>({
    resolver: yupResolver(signInSchema),
    defaultValues: { identifier: '', password: '', keepSignedIn: true },
  })

  const otpForm = useForm<OtpVerifyValues>({
    resolver: yupResolver(otpVerifySchema),
    defaultValues: { identifier: '', code: '' },
  })

  async function onPasswordSubmit(values: SignInValues) {
    try {
      const session = await login({
        identifier: toLoginIdentifier(values.identifier),
        password: values.password,
      }).unwrap()
      dispatch(
        credentialsSet({
          token: session.access_token,
          user: session.user,
          persist: values.keepSignedIn !== false,
        }),
      )
      dispatch(toastPushed('success', 'Signed in'))
      navigate('/')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not sign in')))
    }
  }

  async function onRequestOtp() {
    const identifier = toLoginIdentifier(passwordForm.getValues('identifier'))
    if (!identifier) {
      passwordForm.setError('identifier', { message: 'Enter your mobile number or email' })
      return
    }
    try {
      await requestCode({ identifier }).unwrap()
      otpForm.setValue('identifier', identifier)
      setMode('otp-verify')
      dispatch(toastPushed('success', 'Code sent — check your messages'))
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not send code')))
    }
  }

  async function onOtpSubmit(values: OtpVerifyValues) {
    try {
      const session = await verifyCode({
        identifier: toLoginIdentifier(values.identifier),
        code: values.code,
      }).unwrap()
      dispatch(
        credentialsSet({
          token: session.access_token,
          user: session.user,
          persist: true,
        }),
      )
      dispatch(toastPushed('success', 'Signed in'))
      navigate('/')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Invalid or expired code')))
    }
  }

  const busy = loginState.isLoading || requestState.isLoading || verifyState.isLoading

  return (
    <div className="flex w-full flex-col">
      <div className="flex gap-[4px] rounded-[22px] border border-border-default bg-surface-default p-[5px]">
        <span className="flex h-[36px] flex-1 items-center justify-center rounded-[18px] bg-brand-gradient text-[14px] font-semibold text-ink-inverse">
          Sign in
        </span>
        <Link
          to="/register"
          className="flex h-[36px] flex-1 items-center justify-center rounded-[18px] text-[14px] font-semibold text-ink-secondary"
        >
          Create account
        </Link>
      </div>

      <h1 className="mt-2xl text-[42px] leading-[1.05] font-extrabold tracking-[-1.47px] text-ink-primary">
        Welcome back
      </h1>
      <p className="mt-sm text-[15px] leading-[1.4] text-ink-secondary">
        Sign in to pick up where you left off.
      </p>

      {mode !== 'otp-verify' ? (
        <form
          className="mt-[28px] flex flex-col"
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
        >
          <div className="flex flex-col gap-[14px]">
            <Field
              label="Mobile number or email"
              htmlFor="sign-in-identity"
              error={passwordForm.formState.errors.identifier?.message}
            >
              <TextInput
                id="sign-in-identity"
                type="text"
                placeholder="5X XXX XXXX"
                autoComplete="username"
                className="h-[50px]"
                invalid={Boolean(passwordForm.formState.errors.identifier)}
                {...passwordForm.register('identifier')}
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

            {mode === 'password' && (
              <Field
                label="Password"
                htmlFor="sign-in-password"
                error={passwordForm.formState.errors.password?.message}
                labelAction={
                  <Link
                    to="/reset-password"
                    className="text-[13px] font-medium text-ink-brand"
                  >
                    Forgot password?
                  </Link>
                }
              >
                <TextInput
                  id="sign-in-password"
                  type="password"
                  autoComplete="current-password"
                  className="h-[50px]"
                  invalid={Boolean(passwordForm.formState.errors.password)}
                  {...passwordForm.register('password')}
                />
              </Field>
            )}
          </div>

          {mode === 'password' && (
            <Checkbox
              id="keep-signed-in"
              className="mt-[18px]"
              checked={passwordForm.watch('keepSignedIn')}
              onCheckedChange={(value) =>
                passwordForm.setValue('keepSignedIn', value === true)
              }
              label="Keep me signed in on this device"
            />
          )}

          {mode === 'password' ? (
            <>
              <Button
                type="submit"
                size="lg"
                loading={busy}
                className="mt-[22px] h-[52px] w-full rounded-[26px] text-[16px] font-semibold"
              >
                Sign in
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                loading={busy}
                className="mt-md h-[52px] w-full rounded-[26px] border border-border-default text-[16px] font-semibold"
                onClick={() => void onRequestOtp()}
              >
                Send me a one-time code instead
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="lg"
              loading={busy}
              className="mt-[22px] h-[52px] w-full rounded-[26px] text-[16px] font-semibold"
              onClick={() => void onRequestOtp()}
            >
              Send one-time code
            </Button>
          )}
        </form>
      ) : (
        <form className="mt-[28px] flex flex-col" onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
          <Field
            label="One-time code"
            htmlFor="sign-in-otp"
            error={otpForm.formState.errors.code?.message}
          >
            <TextInput
              id="sign-in-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="h-[50px]"
              {...otpForm.register('code')}
            />
          </Field>
          <Button
            type="submit"
            size="lg"
            loading={busy}
            className="mt-[22px] h-[52px] w-full rounded-[26px] text-[16px] font-semibold"
          >
            Verify and sign in
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="mt-md h-[52px] w-full rounded-[26px] border border-border-default text-[16px] font-semibold"
            onClick={() => setMode('password')}
          >
            Back to password
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
          >
            {provider}
          </Button>
        ))}
      </div>

      <div className="mt-[28px] rounded-[14px] border border-border-default bg-bg-warm px-lg py-[14px]">
        <p className="text-[13px] leading-[1.5] text-ink-body">
          Looking for business paths?{' '}
          <Link to="/become-business" className="text-ink-brand underline-offset-2 hover:underline">
            Submit a vendor or talent request
          </Link>{' '}
          after sign-in, or{' '}
          <Link to="/for-organizers" className="text-ink-brand underline-offset-2 hover:underline">
            contact us about organizer partnership
          </Link>
          .
        </p>
      </div>

      <Link
        to="/"
        className={cn(
          'mt-[26px] flex items-center justify-center gap-[6px]',
          'text-[14px] font-medium text-ink-secondary',
        )}
      >
        <ArrowLeftIcon size={14} />
        Keep browsing without an account
      </Link>
    </div>
  )
}
