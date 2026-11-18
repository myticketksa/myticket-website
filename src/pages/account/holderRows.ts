import type { OrderTicketSeatView } from '@/lib/api/mappers/orders'

/** A sports ticket's holder details as label/value rows (Ministry of Sport rules). */
export function holderRows(
  holder: OrderTicketSeatView['holder'],
  t: (key: string) => string,
): [string, string][] {
  if (!holder) return []
  const gender = holder.gender === 'female' ? t('catalog:detail.holderFemale') : holder.gender === 'male' ? t('catalog:detail.holderMale') : ''
  return ([
    [t('catalog:detail.holderNationality'), holder.nationality],
    [t('catalog:detail.holderResidence'), holder.residence],
    [t('catalog:detail.holderBirthDate'), holder.birthDate ?? ''],
    [t('catalog:detail.holderGender'), gender],
    [t('ticket.fieldPhone'), holder.phone ?? ''],
    [t('ticket.fieldEmail'), holder.email ?? ''],
  ] as [string, string][]).filter(([, value]) => Boolean(value))
}
