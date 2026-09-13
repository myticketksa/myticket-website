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

/** For talents — submit request, admin review, contact outside platform. */
export function ForTalentsPage() {
  const { t } = useTranslation('marketing')
  const { roleLabel } = useLocale()
  const role = roleLabel('talent')

  const stats = asArray(t('forTalents.stats', { returnObjects: true }) as RoleStat[])
  const benefits = asArray(t('forTalents.benefits', { returnObjects: true }) as RoleBenefit[])
  const steps = asArray(t('forTalents.steps', { returnObjects: true }) as RoleStep[])
  const moneyRows = asArray(t('forTalents.moneyRows', { returnObjects: true }) as RoleMoneyRow[])
  const needItems = asArray(t('forTalents.needItems', { returnObjects: true }) as string[])
  const faqs = asArray(t('forTalents.faqs', { returnObjects: true }) as RoleFaq[])

  return (
    <>
      <RoleLandingHero
        eyebrow={t('forRole.title', { role })}
        title={t('forTalents.title')}
        subtitle={t('forTalents.lede', { role })}
        primaryCta={{ label: t('forRole.submitRequest'), to: '/apply/talent' }}
        secondaryCta={{ label: t('forRole.seeBusinessPaths'), to: '/become-business' }}
        stats={stats}
        imageryLabel={t('forTalents.imageryLabel')}
      />
      <RoleBenefitsSection items={benefits} />
      <RoleStepsSection steps={steps} />
      <RoleMoneyAndNeeds
        moneyRows={moneyRows}
        moneyFootnote={t('forTalents.moneyFootnote')}
        needItems={needItems}
        needNoteBody={t('forTalents.needNoteBody')}
      />
      <RoleFaqSection items={faqs} />
      <RoleClosingCta
        title={t('forTalents.closingTitle')}
        subtitle={t('forTalents.closingSubtitle')}
        buttonLabel={t('forTalents.closingCta')}
        buttonTo="/apply/talent"
      />
    </>
  )
}
