import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { CloseIcon } from '@/components/icons'
import { TicketDetails } from './TicketPage'

/**
 * A ticket's details over My Tickets, as the original site opened them —
 * the same QR, fields and actions as the ticket page, which stays for links.
 */
export function TicketDetailsModal({
  id,
  onClose,
}: {
  id: string | null
  onClose: () => void
}) {
  const { t } = useTranslation(['account', 'common'])

  return (
    <DialogPrimitive.Root
      open={Boolean(id)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-surface-inverse/55 backdrop-blur-[1.5px]" />
        <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-y-auto rounded-t-[22px] bg-bg-page p-lg outline-none sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[90dvh] sm:max-w-[880px] sm:rounded-[22px] sm:p-xl">
          <div className="mb-md flex items-center justify-between gap-md">
            <DialogPrimitive.Title className="text-[13px] font-bold tracking-[0.84px] text-ink-muted uppercase">
              {t('account:ticket.label')}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {t('account:ticket.label')}
            </DialogPrimitive.Description>
            <DialogPrimitive.Close
              aria-label={t('common:actions.close')}
              className="shrink-0 rounded-full p-[6px] text-ink-secondary hover:text-ink-primary"
            >
              <CloseIcon size={18} />
            </DialogPrimitive.Close>
          </div>
          {id ? <TicketDetails id={id} onCancelled={onClose} headingLevel={2} /> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
