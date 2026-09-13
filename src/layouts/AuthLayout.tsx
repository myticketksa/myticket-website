import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation } from 'react-router-dom'
import checkIcon from '@/assets/auth/check-15.svg'
import registerHero from '@/assets/auth/register-hero.png'
import signInHero from '@/assets/auth/sign-in-hero.png'
import { Logo } from '@/components/navigation'
import { PageFade } from '@/components/motion'
import { cn } from '@/lib/cn'

/**
 * Pattern C — AuthLayout. Verified on Sign In `207:11907`.
 *
 * No header, no footer. Split is **702 / 738**, not 50/50. Form column centres a
 * 428-wide auth card (Register uses 452). Reset Password (`207:11297`) is a
 * centred full-bleed form with its own header, so that route skips the split.
 *
 * Default hero matches Sign In; Register swaps imagery and pitch via the path.
 */
export interface AuthLayoutProps {
  hero?: ReactNode
}

function AuthHeroPanel({
  image,
  headline,
  benefits,
  footer,
}: {
  image: string
  headline: string
  benefits: readonly string[]
  footer: string
}) {
  return (
    <div className="relative flex h-full min-h-dvh flex-col justify-between overflow-hidden px-[48px] py-[44px]">
      <img
        src={image}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[rgba(25,16,8,0.72)] via-[rgba(25,16,8,0.35)] via-[40%] to-[rgba(25,16,8,0.92)]"
      />
      <Link to="/" className="relative shrink-0">
        <Logo height={40} className="brightness-0 invert" />
      </Link>
      <div className="relative shrink-0">
        <h2 className="max-w-[460px] text-[46px] leading-[1.04] font-extrabold tracking-[-1.61px] text-bg-page">
          {headline}
        </h2>
        <ul className="mt-lg flex max-w-[420px] flex-col gap-md">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-[11px]">
              <img
                src={checkIcon}
                alt=""
                className="mt-[3px] size-[15px] shrink-0"
              />
              <span className="text-[15px] leading-[1.5] font-normal text-bg-page">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="relative shrink-0 text-[13px] text-bg-page">{footer}</p>
    </div>
  )
}

export function AuthLayout({ hero }: AuthLayoutProps) {
  const { pathname } = useLocation()
  const { t } = useTranslation('auth')
  const isReset = pathname === '/reset-password'
  const isRegister = pathname === '/register'

  if (isReset) {
    return (
      <div className="flex min-h-dvh w-full flex-col bg-bg-page">
        <PageFade>
          <Outlet />
        </PageFade>
      </div>
    )
  }

  const heroKey = isRegister ? 'register' : 'signIn'
  const benefits = t(`hero.${heroKey}.benefits`, {
    returnObjects: true,
  }) as string[]

  const defaultHero = (
    <AuthHeroPanel
      image={isRegister ? registerHero : signInHero}
      headline={t(`hero.${heroKey}.headline`)}
      benefits={Array.isArray(benefits) ? benefits : []}
      footer={t(`hero.${heroKey}.footer`)}
    />
  )

  return (
    <div className="flex min-h-dvh w-full bg-bg-page">
      <div className={cn('hidden w-[702px] shrink-0 bg-bg-warm lg:block')}>
        {hero ?? defaultHero}
      </div>
      <div
        className={cn(
          'flex w-full min-w-0 flex-1 items-center justify-center',
          'px-page-gutter py-[40px] sm:py-[56px] lg:w-[738px] lg:flex-none lg:px-[40px]',
        )}
      >
        <div className={cn('w-full', isRegister ? 'max-w-[452px]' : 'max-w-[428px]')}>
          <PageFade>
            <Outlet />
          </PageFade>
        </div>
      </div>
    </div>
  )
}
