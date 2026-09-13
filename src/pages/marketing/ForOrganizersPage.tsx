import { useTranslation } from 'react-i18next'
import { useLocale } from '@/i18n/locale'
import {
  RoleBenefitsSection,
  RoleClosingCta,
  RoleFaqSection,
  RoleLandingHero,
  RoleMoneyAndNeeds,
  RoleStepsSection,
} from '@/pages/_account/MarketingShell'

type RoleStat = { value: string; label: string }
type RoleBenefit = { title: string; body: string }
type RoleStep = { title: string; body: string }
type RoleMoneyRow = { label: string; value: string }
type RoleFaq = { question: string; answer: string }

function asArray<T>(value: T[] | string): T[] {
  return Array.isArray(value) ? value : []
}

/** For organizers — office partnership; no self-serve apply wizard. */
export function ForOrganizersPage() {
  const { t } = useTranslation('marketing')
  const { roleLabel } = useLocale()
  const role = roleLabel('organizer')

  const stats = asArray(t('forOrganizers.stats', { returnObjects: true }) as RoleStat[])
  const benefits = asArray(t('forOrganizers.benefits', { returnObjects: true }) as RoleBenefit[])
  const steps = asArray(t('forOrganizers.steps', { returnObjects: true }) as RoleStep[])
  const moneyRows = asArray(t('forOrganizers.moneyRows', { returnObjects: true }) as RoleMoneyRow[])
  const needItems = asArray(t('forOrganizers.needItems', { returnObjects: true }) as string[])
  const faqs = asArray(t('forOrganizers.faqs', { returnObjects: true }) as RoleFaq[])

  return (
    <>
      <RoleLandingHero
        eyebrow={t('forRole.title', { role })}
        title={t('forOrganizers.title')}
        subtitle={t('forOrganizers.lede', { role })}
        primaryCta={{ label: t('forRole.contactPartnerships'), to: '/support/new' }}
        secondaryCta={{ label: t('forRole.howOnboarding'), to: '/apply/organizer' }}
        stats={stats}
        imageryLabel={t('forOrganizers.imageryLabel')}
      />
      <RoleBenefitsSection items={benefits} />
      <RoleStepsSection steps={steps} />
      <RoleMoneyAndNeeds
        moneyRows={moneyRows}
        moneyFootnote={t('forOrganizers.moneyFootnote')}
        needItems={needItems}
        needNoteBody={t('forOrganizers.needNoteBody')}
      />
      <RoleFaqSection items={faqs} />
      <RoleClosingCta
        title={t('forOrganizers.closingTitle')}
        subtitle={t('forOrganizers.closingSubtitle')}
        buttonLabel={t('forOrganizers.closingCta')}
        buttonTo="/support/new"
      />
    </>
  )
}
