import { QRCodeSVG } from 'qrcode.react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/navigation'
import type { OrderDetailView, OrderTicketSeatView } from '@/lib/api/mappers/orders'

/**
 * One ticket as it goes into the PDF: event, date, the ticket's fields and its
 * QR. Drawn off screen only while a download runs, then captured as an image —
 * an image keeps Arabic text and the site's fonts exactly as on screen, which
 * PDF text with built-in fonts can't.
 */
export const PrintableTicket = forwardRef<
  HTMLDivElement,
  { detail: OrderDetailView; seat: OrderTicketSeatView | undefined; ticketNo: string }
>(function PrintableTicket({ detail, seat, ticketNo }, ref) {
  const { t } = useTranslation('account')
  const fields = [
    [t('ticket.fieldName'), seat?.holderName],
    [t('ticket.fieldTicketNumber'), ticketNo],
    [t('ticket.fieldTicketType'), seat?.ticketTypeLabel],
    [t('ticket.fieldBlock'), seat?.block],
    [t('ticket.fieldRow'), seat?.row],
    [t('ticket.fieldSeat'), seat?.seat],
    [t('ticket.fieldGate'), seat?.gate],
  ].filter((field): field is [string, string] => Boolean(field[1]) && field[1] !== '—')

  return (
    <div
      ref={ref}
      className="flex w-[560px] flex-col gap-[22px] rounded-[20px] border border-border-default bg-white p-[28px] text-ink-primary"
    >
      <div className="flex items-center justify-between gap-md">
        <Logo height={30} alt="" />
        <span className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
          {t('ticket.label')}
        </span>
      </div>
      <div>
        <p className="text-[24px] leading-[1.15] font-extrabold">{detail.title}</p>
        <p className="mt-[6px] text-[15px] text-ink-secondary">
          {[detail.startTime, detail.city].filter((part) => part && part !== '—').join(' · ')}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-[14px] border-t border-dashed border-border-default pt-[18px]">
        {fields.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.77px] text-ink-muted uppercase">{label}</p>
            <p className="mt-[4px] text-[16px] font-semibold break-words">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-[10px] border-t border-dashed border-border-default pt-[22px]">
        <QRCodeSVG
          value={seat?.qrValue || ticketNo}
          size={240}
          level="M"
          marginSize={1}
          bgColor="#FFFFFF"
          fgColor="#0A0A0A"
        />
        <p className="text-[13px] font-semibold text-ink-secondary">
          {t('ticket.scanAtGate', { gate: seat?.gate && seat.gate !== '—' ? seat.gate : '—' })}
        </p>
      </div>
    </div>
  )
})

/** Captures each printable ticket and saves them as one PDF, a page apiece. */
export async function saveTicketsPdf(nodes: HTMLElement[], fileName: string): Promise<void> {
  // Loaded on demand: neither is needed until someone downloads.
  const [{ jsPDF }, { toPng }] = await Promise.all([import('jspdf'), import('html-to-image')])
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 40

  for (const [index, node] of nodes.entries()) {
    const image = await toPng(node, { pixelRatio: 2, backgroundColor: '#ffffff', cacheBust: true })
    const width = Math.min(pageWidth - margin * 2, node.offsetWidth)
    const height = Math.min(pageHeight - margin * 2, (width * node.offsetHeight) / node.offsetWidth)
    if (index > 0) pdf.addPage()
    pdf.addImage(image, 'PNG', (pageWidth - width) / 2, margin, width, height)
  }

  pdf.save(fileName)
}
