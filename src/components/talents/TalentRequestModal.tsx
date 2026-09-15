import { useState } from 'react'
import { FormDialog } from '@/components/feedback/FormDialog'
import { Button, Field, TextInput, Textarea } from '@/components/ui'
import { cn } from '@/lib/cn'

export type TalentRequestPayload = {
  more_than_month: boolean
  phone_number: string
  requested_date: string
  address: string
  request_reason: string
}

export interface TalentRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: TalentRequestPayload) => Promise<void>
  submitting?: boolean
}

const SA_PHONE = /^5\d{8}$/

function toApiDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-')
  if (!y || !m || !d) return isoDate
  return `${d}/${m}/${y}`
}

export function TalentRequestModal({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: TalentRequestModalProps) {
  const [moreThanMonth, setMoreThanMonth] = useState(false)
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [address, setAddress] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    const digits = phone.replace(/\D/g, '').replace(/^966/, '').replace(/^0/, '')
    if (!SA_PHONE.test(digits)) {
      setError('Enter a Saudi mobile number (5XXXXXXXX).')
      return
    }
    if (!date) {
      setError('Choose a requested date.')
      return
    }
    if (!address.trim()) {
      setError('Enter an address.')
      return
    }
    if (!reason.trim()) {
      setError('Add a short reason for your request.')
      return
    }
    await onSubmit({
      more_than_month: moreThanMonth,
      phone_number: digits,
      requested_date: toApiDate(date),
      address: address.trim(),
      request_reason: reason.trim(),
    })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Request this talent"
      description="Tell us when and where you need them. MyTicket will follow up."
      size="lg"
    >
      <form className="flex flex-col gap-lg" onSubmit={(e) => void handleSubmit(e)}>
        <div>
          <p className="mb-[8px] text-[13px] font-semibold text-ink-primary">Duration</p>
          <div className="flex flex-wrap gap-sm">
            <button
              type="button"
              className={cn(
                'rounded-[13px] border px-[12px] py-[6px] text-[12px] font-bold',
                !moreThanMonth
                  ? 'border-ink-brand bg-ink-brand/10 text-ink-brand'
                  : 'border-border-default text-ink-secondary',
              )}
              onClick={() => setMoreThanMonth(false)}
            >
              Less than a month
            </button>
            <button
              type="button"
              className={cn(
                'rounded-[13px] border px-[12px] py-[6px] text-[12px] font-bold',
                moreThanMonth
                  ? 'border-ink-brand bg-ink-brand/10 text-ink-brand'
                  : 'border-border-default text-ink-secondary',
              )}
              onClick={() => setMoreThanMonth(true)}
            >
              More than a month
            </button>
          </div>
        </div>

        <Field label="Saudi mobile" htmlFor="talent-request-phone">
          <TextInput
            id="talent-request-phone"
            inputMode="tel"
            placeholder="5XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>

        <Field label="Requested date" htmlFor="talent-request-date">
          <TextInput
            id="talent-request-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        <Field label="Address" htmlFor="talent-request-address">
          <TextInput
            id="talent-request-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="City, district, venue or full address"
          />
        </Field>

        <Field label="Reason" htmlFor="talent-request-reason">
          <Textarea
            id="talent-request-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="What are you requesting them for?"
          />
        </Field>

        {error ? <p className="text-[13px] text-state-danger">{error}</p> : null}

        <div className="flex flex-col gap-[10px]">
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Sending…' : 'Submit request'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </FormDialog>
  )
}
