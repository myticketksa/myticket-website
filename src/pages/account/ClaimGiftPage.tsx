import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button, Field, TextInput } from '@/components/ui'
import { FunnelHeader, PageSection } from '@/layouts'
import { useClaimGiftTicketMutation } from '@/app/api/accountApis'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'

/**
 * Claim a gifted ticket — Postman `POST /gift-tickets/{giftTicketId}`
 * with `{ claim_token }`.
 *
 * Typical link: `/gift/claim/:giftTicketId?token=…`
 */
export function ClaimGiftPage() {
  const { t } = useTranslation(['account', 'common'])
  const { giftTicketId = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [claimGift, claimState] = useClaimGiftTicketMutation()

  const initialToken = useMemo(() => params.get('token') ?? params.get('claim_token') ?? '', [params])
  const [token, setToken] = useState(initialToken)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!giftTicketId) {
      dispatch(toastPushed('error', t('account:claim.missingRef')))
      return
    }
    if (!token.trim()) {
      dispatch(toastPushed('error', t('account:claim.missingToken')))
      return
    }

    try {
      await claimGift({
        giftTicketId,
        claim_token: token.trim(),
      }).unwrap()
      dispatch(toastPushed('success', t('account:claim.success')))
      navigate('/my-tickets')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('account:claim.error'))))
    }
  }

  return (
    <>
      <FunnelHeader
        label={t('account:claim.header')}
        backHref="/my-tickets"
        backLabel={t('account:tickets.title')}
      />
      <PageSection padTop={44} padBottom={96}>
        <div className="mx-auto w-full max-w-[520px]">
          <h1 className="text-[28px] leading-[1.04] font-extrabold tracking-[-1.47px] text-ink-primary sm:text-[36px] lg:text-[42px]">
            {t('account:claim.title')}
          </h1>
          <p className="mt-[10px] text-[16px] text-ink-secondary">
            {t('account:claim.subtitle')}
          </p>

          <form
            className="mt-[28px] flex flex-col gap-[16px] rounded-[20px] border border-border-default bg-surface-default p-[26px]"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <Field label={t('account:claim.giftRef')} htmlFor="gift-id">
              <TextInput id="gift-id" value={giftTicketId} readOnly className="bg-bg-page" />
            </Field>
            <Field label={t('account:claim.token')} htmlFor="claim-token">
              <TextInput
                id="claim-token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder={t('account:claim.tokenPlaceholder')}
                required
              />
            </Field>
            <Button type="submit" size="lg" loading={claimState.isLoading}>
              {t('account:claim.cta')}
            </Button>
            <p className="text-[13px] text-ink-muted">
              {t('account:claim.needAccount')}{' '}
              <Link to="/sign-in" className="font-semibold text-ink-brand">
                {t('common:actions.signIn')}
              </Link>{' '}
              then come back to this link.
            </p>
          </form>
        </div>
      </PageSection>
    </>
  )
}
