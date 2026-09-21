import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CheckIcon,
  MagnifyingGlassIcon,
  StorefrontIcon,
  UserIcon,
} from '@/components/icons'
import { Button } from '@/components/ui'
import { useLocale } from '@/i18n/locale'
import { PageSection } from '@/layouts'
import type { ReactNode } from 'react'

/** Become a business chooser — vendor & talent request paths only. */
export function BecomeBusinessPage() {
  const { t } = useTranslation('marketing')
  const { roleLabel } = useLocale()
  const vendor = roleLabel('vendor')
  const talent = roleLabel('talent')

  const talentPoints = t('becomeBusiness.talent.points', {
    returnObjects: true,
  }) as string[]
  const vendorPoints = t('becomeBusiness.vendor.points', {
    returnObjects: true,
  }) as string[]

  const PATHS: {
    title: string
    body: string
    points: string[]
    need: string
    href: string
    cta: string
    icon: ReactNode
  }[] = [
    {
      title: talent,
      body: t('becomeBusiness.talent.body'),
      points: Array.isArray(talentPoints) ? talentPoints : [],
      need: t('becomeBusiness.talent.need'),
      href: '/apply/talent',
      cta: t('becomeBusiness.submitCta', { role: talent }),
      icon: <UserIcon size={24} />,
    },
    {
      title: vendor,
      body: t('becomeBusiness.vendor.body'),
      points: Array.isArray(vendorPoints) ? vendorPoints : [],
      need: t('becomeBusiness.vendor.need'),
      href: '/apply/facilities',
      cta: t('becomeBusiness.submitCta', { role: vendor }),
      icon: <StorefrontIcon size={24} />,
    },
  ]

  return (
    <>
      <PageSection padTop={48} padBottom={0} className="text-center">
        <p className="text-[12px] font-bold tracking-[1.08px] text-ink-brand-mid uppercase">
          {t('becomeBusiness.eyebrow')}
        </p>
        <h1 className="mx-auto mt-[10px] max-w-[720px] text-[32px] leading-[1.03] font-extrabold tracking-[-1.75px] text-ink-primary sm:text-[44px] lg:text-[50px]">
          {t('becomeBusiness.title')}
        </h1>
        <p className="mx-auto mt-[14px] max-w-[620px] text-[17px] text-ink-secondary">
          {t('becomeBusiness.lede', { vendor, talent })}
        </p>
      </PageSection>

      <PageSection padTop={36} padBottom={96}>
        <div className="mx-auto grid max-w-[1040px] gap-[18px] md:grid-cols-2">
          {PATHS.map((path) => (
            <div
              key={path.title}
              className="flex flex-col rounded-[22px] border border-border-default bg-surface-default p-lg sm:p-[28px]"
            >
              <div className="flex size-[52px] items-center justify-center rounded-[16px] bg-bg-tint-brand text-ink-brand">
                {path.icon}
              </div>
              <h2 className="mt-[16px] text-[22px] font-extrabold tracking-[-0.44px] text-ink-primary">
                {path.title}
              </h2>
              <p className="mt-[6px] text-[14px] leading-[1.55] text-ink-secondary">{path.body}</p>
              <ul className="mt-[16px] flex flex-col gap-[7px]">
                {path.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-[9px] text-[13px] leading-[1.45] text-ink-secondary"
                  >
                    <CheckIcon size={13} weight="bold" className="mt-[2px] shrink-0 text-ink-muted" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-[18px]">
                <div className="h-px bg-border-divider" />
                <p className="mt-[14px] text-[12px] leading-normal text-ink-muted">
                  <span className="font-bold text-ink-primary">{t('becomeBusiness.youllNeed')}</span>{' '}
                  {path.need}
                </p>
                <Link to={path.href} className="mt-[12px] block">
                  <Button size="md" className="w-full">
                    {path.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-[20px] max-w-[1040px] rounded-[18px] border border-border-default bg-surface-default px-[26px] py-[22px]">
          <div className="flex flex-col gap-[16px] md:flex-row md:gap-[26px]">
            <p className="flex flex-1 gap-[12px] text-[13px] leading-[1.55] text-ink-secondary">
              <MagnifyingGlassIcon size={17} className="mt-[2px] shrink-0 text-ink-brand" />
              <span>
                <span className="font-bold text-ink-primary">
                  {t('becomeBusiness.adminReviewTitle')}
                </span>{' '}
                {t('becomeBusiness.adminReviewBody')}
              </span>
            </p>
            <p className="flex flex-1 gap-[12px] text-[13px] leading-[1.55] text-ink-secondary">
              <CheckIcon size={17} weight="bold" className="mt-[2px] shrink-0 text-ink-brand" />
              <span>
                <span className="font-bold text-ink-primary">
                  {t('becomeBusiness.vendorTalentTitle', {
                    defaultValue: 'Facility or talent?',
                  })}
                </span>{' '}
                {t('becomeBusiness.vendorTalentBody', {
                  defaultValue:
                    'Submit a short request from your guest account. We review and follow up outside the app.',
                })}
              </span>
            </p>
          </div>
        </div>

        <p className="mt-3xl text-center text-[14px] text-ink-secondary">
          {t('becomeBusiness.alreadyAccount')}{' '}
          <Link to="/sign-in" className="font-semibold text-ink-brand">
            {t('becomeBusiness.signIn')}
          </Link>
        </p>
      </PageSection>
    </>
  )
}
