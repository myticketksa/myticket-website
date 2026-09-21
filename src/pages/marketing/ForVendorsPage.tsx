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

/** For vendors — submit request, admin review, contact outside platform. */
export function ForVendorsPage() {
  const { t } = useTranslation('marketing')
  const { roleLabel } = useLocale()
  const role = roleLabel('vendor')

  const stats = asArray(t('forVendors.stats', { returnObjects: true }) as RoleStat[])
  const benefits = asArray(t('forVendors.benefits', { returnObjects: true }) as RoleBenefit[])
  const steps = asArray(t('forVendors.steps', { returnObjects: true }) as RoleStep[])
  const moneyRows = asArray(t('forVendors.moneyRows', { returnObjects: true }) as RoleMoneyRow[])
  const needItems = asArray(t('forVendors.needItems', { returnObjects: true }) as string[])
  const faqs = asArray(t('forVendors.faqs', { returnObjects: true }) as RoleFaq[])

  return (
    <>
      <RoleLandingHero
        eyebrow={t('forRole.title', { role })}
        title={t('forVendors.title')}
        subtitle={t('forVendors.lede', { role })}
        primaryCta={{ label: t('forRole.submitRequest'), to: '/apply/facilities' }}
        secondaryCta={{ label: t('forRole.seeBusinessPaths'), to: '/become-business' }}
        stats={stats}
        imageryLabel={t('forVendors.imageryLabel')}
      />
      <RoleBenefitsSection items={benefits} />
      <RoleStepsSection steps={steps} />
      <RoleMoneyAndNeeds
        moneyRows={moneyRows}
        moneyFootnote={t('forVendors.moneyFootnote')}
        needItems={needItems}
        needNoteBody={t('forVendors.needNoteBody')}
      />
      <RoleFaqSection items={faqs} />
      <RoleClosingCta
        title={t('forVendors.closingTitle')}
        subtitle={t('forVendors.closingSubtitle')}
        buttonLabel={t('forVendors.closingCta')}
        buttonTo="/apply/facilities"
      />
    </>
  )
}
