import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation(['catalog', 'common'])
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
      setError(t('talent.errorPhone'))
      return
    }
    if (!date) {
      setError(t('talent.errorDate'))
      return
    }
    if (!address.trim()) {
      setError(t('talent.errorAddress'))
      return
    }
    if (!reason.trim()) {
      setError(t('talent.errorReason'))
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
      title={t('talent.requestTitle')}
      description={t('talent.requestDescription')}
      size="lg"
    >
      <form className="flex flex-col gap-lg" onSubmit={(e) => void handleSubmit(e)}>
        <div>
          <p className="mb-[8px] text-[13px] font-semibold text-ink-primary">
            {t('talent.duration')}
          </p>
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
              {t('talent.lessThanMonth')}
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
              {t('talent.moreThanMonth')}
            </button>
          </div>
        </div>

        <Field label={t('talent.saudiMobile')} htmlFor="talent-request-phone">
          <TextInput
            id="talent-request-phone"
            inputMode="tel"
            placeholder={t('talent.phonePlaceholder')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>

        <Field label={t('talent.requestedDate')} htmlFor="talent-request-date">
          <TextInput
            id="talent-request-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        <Field label={t('talent.address')} htmlFor="talent-request-address">
          <TextInput
            id="talent-request-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t('talent.addressPlaceholder')}
          />
        </Field>

        <Field label={t('talent.reason')} htmlFor="talent-request-reason">
          <Textarea
            id="talent-request-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('talent.reasonPlaceholder')}
          />
        </Field>

        {error ? <p className="text-[13px] text-state-danger">{error}</p> : null}

        <div className="flex flex-col gap-[10px]">
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? t('talent.sending') : t('talent.submitRequest')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            {t('common:actions.cancel')}
          </Button>
        </div>
      </form>
    </FormDialog>
  )
}
