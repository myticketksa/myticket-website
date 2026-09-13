import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FunnelHeader, FunnelLayout, type FunnelHeaderProps } from './FunnelLayout'

/**
 * Ticket-action flow header — Logo · LABEL · Back to ticket.
 * Verified on Resell `207:9700`, Gift `207:9806`, Refund `207:9879`.
 */
export interface TicketActionHeaderProps {
  label: string
  backHref?: string
  backLabel?: string
  className?: string
}

export function TicketActionHeader({
  label,
  backHref,
  backLabel,
  className,
}: TicketActionHeaderProps) {
  const { t } = useTranslation('account')
  const { id = 'winter-nights' } = useParams()
  const href = backHref ?? `/my-tickets/${id}`

  return (
    <FunnelHeader
      label={label}
      backHref={href}
      backLabel={backLabel ?? t('ticket.backToTicket')}
      className={className}
    />
  )
}

/** Alias of FunnelLayout for Resell / Gift / Refund routes. */
export function TicketActionLayout() {
  return <FunnelLayout />
}

export { FunnelLayout, FunnelHeader, type FunnelHeaderProps }
