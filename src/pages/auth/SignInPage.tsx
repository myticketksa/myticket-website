import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@/components/icons'
import { Divider } from '@/components/data-display'
import { Button, Checkbox, Field, TextInput } from '@/components/ui'
import { cn } from '@/lib/cn'

/**
 * Sign In — Figma `207:11907`. Form column only; hero lives in `AuthLayout`.
 */
export function SignInPage() {
  const [keepSignedIn, setKeepSignedIn] = useState(false)

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

      <form
        className="mt-[28px] flex flex-col"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex flex-col gap-[14px]">
          <Field label="Mobile number or email" htmlFor="sign-in-identity">
            <TextInput
              id="sign-in-identity"
              name="identity"
              type="text"
              placeholder="5X XXX XXXX"
              autoComplete="username"
              className="h-[50px]"
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
            htmlFor="sign-in-password"
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
              name="password"
              type="password"
              defaultValue="password123"
              autoComplete="current-password"
              className="h-[50px]"
            />
          </Field>
        </div>

        <Checkbox
          id="keep-signed-in"
          className="mt-[18px]"
          checked={keepSignedIn}
          onCheckedChange={(value) => setKeepSignedIn(value === true)}
          label="Keep me signed in on this device"
        />

        <Button
          type="submit"
          size="lg"
          className="mt-[22px] h-[52px] w-full rounded-[26px] text-[16px] font-semibold"
        >
          Sign in
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="mt-md h-[52px] w-full rounded-[26px] border border-border-default text-[16px] font-semibold"
        >
          Send me a one-time code instead
        </Button>
      </form>

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
          </Link>
          {' '}
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
