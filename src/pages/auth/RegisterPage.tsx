import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Divider } from '@/components/data-display'
import { Button, Checkbox, Field, TextInput } from '@/components/ui'
import { cn } from '@/lib/cn'

/**
 * Register — customer-only signup. Business paths (vendor/talent request, organizer
 * office partnership) happen after login via Become a business / marketing pages.
 */
export function RegisterPage() {
  const [acceptedTerms, setAcceptedTerms] = useState(false)

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
        Create your account
      </h1>
      <p className="mt-sm text-[15px] leading-[1.45] text-ink-secondary">
        Guest accounts buy tickets, save favourites and use the wallet. Business requests come after
        you sign in.{' '}
        <Link to="/sign-in" className="font-bold text-ink-brand">
          Sign in instead
        </Link>
        .
      </p>

      <form
        className="mt-[28px] flex flex-col"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex flex-col gap-[14px]">
          <Field label="Full name" htmlFor="register-name">
            <TextInput
              id="register-name"
              name="name"
              type="text"
              placeholder="Sara Alghamdi"
              autoComplete="name"
              className="h-[50px]"
            />
          </Field>

          <Field label="Mobile number or email" htmlFor="register-identity">
            <TextInput
              id="register-identity"
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

          <Field label="Password" htmlFor="register-password">
            <TextInput
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="h-[50px]"
            />
          </Field>
        </div>

        <Checkbox
          id="register-terms"
          className="mt-[18px]"
          checked={acceptedTerms}
          onCheckedChange={(value) => setAcceptedTerms(value === true)}
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

        <Button
          type="submit"
          size="lg"
          className="mt-[22px] h-[52px] w-full rounded-[26px] text-[16px] font-semibold"
        >
          Create account
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
