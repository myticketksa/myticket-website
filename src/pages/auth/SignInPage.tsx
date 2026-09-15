import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import { ArrowLeftIcon } from '@/components/icons'
import { Button, Checkbox, Field, TextInput } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useLoginMutation } from '@/app/api/authApi'
import { useAppDispatch } from '@/app/hooks'
import { credentialsSet } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'
import {
  createSignInSchema,
  toLoginIdentifier,
  type SignInValues,
} from '@/lib/validation/authSchemas'

/**
 * Sign In — email + password only; SSO (Apple, Google, Nafath) kept as entry points.
 */
export function SignInPage() {
  const { t } = useTranslation(['auth', 'validation', 'common'])
  const { t: tv } = useTranslation('validation')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextPath = searchParams.get('next') || '/'
  const dispatch = useAppDispatch()
  const [login, loginState] = useLoginMutation()

  const passwordResolver = useMemo(
    () => yupResolver(createSignInSchema((key) => tv(key))),
    [tv],
  )

  const passwordForm = useForm<SignInValues>({
    resolver: passwordResolver,
    defaultValues: { identifier: '', password: '', keepSignedIn: true },
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
      dispatch(toastPushed('success', t('auth:signIn.success')))
      navigate(nextPath.startsWith('/') ? nextPath : '/')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('auth:signIn.error'))))
    }
  }

  const busy = loginState.isLoading

  return (
    <div className="flex w-full flex-col">
      <div className="flex gap-[4px] rounded-[22px] border border-border-default bg-surface-default p-[5px]">
        <span className="flex h-[36px] flex-1 items-center justify-center rounded-[18px] bg-brand-gradient text-[14px] font-semibold text-ink-inverse">
          {t('auth:signIn.tab')}
        </span>
        <Link
          to="/register"
          className="flex h-[36px] flex-1 items-center justify-center rounded-[18px] text-[14px] font-semibold text-ink-secondary"
        >
          {t('auth:signIn.createAccount')}
        </Link>
      </div>

      <h1 className="mt-2xl text-[28px] leading-[1.05] font-extrabold tracking-[-1.47px] text-ink-primary sm:text-[36px] lg:text-[42px]">
        {t('auth:signIn.title')}
      </h1>
      <p className="mt-sm text-[15px] leading-[1.4] text-ink-secondary">
        {t('auth:signIn.subtitle')}
      </p>

      <form
        className="mt-[28px] flex flex-col"
        onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
      >
        <div className="flex flex-col gap-[14px]">
          <Field
            label={t('auth:signIn.email')}
            htmlFor="sign-in-email"
            error={passwordForm.formState.errors.identifier?.message}
          >
            <TextInput
              id="sign-in-email"
              type="email"
              placeholder={t('auth:signIn.emailPlaceholder')}
              autoComplete="email"
              className="h-[50px]"
              invalid={Boolean(passwordForm.formState.errors.identifier)}
              {...passwordForm.register('identifier')}
            />
          </Field>

          <Field
            label={t('auth:signIn.password')}
            htmlFor="sign-in-password"
            error={passwordForm.formState.errors.password?.message}
            labelAction={
              <Link to="/reset-password" className="text-[13px] font-medium text-ink-brand">
                {t('auth:signIn.forgot')}
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
        </div>

        <Checkbox
          id="keep-signed-in"
          className="mt-[18px]"
          checked={passwordForm.watch('keepSignedIn')}
          onCheckedChange={(value) => passwordForm.setValue('keepSignedIn', value === true)}
          label={t('auth:signIn.keepSignedIn')}
        />

        <Button
          type="submit"
          size="lg"
          loading={busy}
          className="mt-[22px] h-[52px] w-full rounded-[26px] text-[16px] font-semibold"
        >
          {t('auth:signIn.submit')}
        </Button>
      </form>

      <div className="mt-[28px] rounded-[14px] border border-border-default bg-bg-warm px-lg py-[14px]">
        <p className="text-[13px] leading-[1.5] text-ink-body">
          {t('auth:signIn.businessLead')}{' '}
          <Link to="/become-business" className="text-ink-brand underline-offset-2 hover:underline">
            {t('auth:signIn.vendorTalentLink')}
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
        {t('auth:signIn.keepBrowsing')}
      </Link>
    </div>
  )
}
