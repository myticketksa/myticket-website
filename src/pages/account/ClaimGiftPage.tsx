import { useMemo, useState, type FormEvent } from 'react'
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
      dispatch(toastPushed('error', 'Missing gift reference'))
      return
    }
    if (!token.trim()) {
      dispatch(toastPushed('error', 'Enter the claim token from your gift message'))
      return
    }

    try {
      await claimGift({
        giftTicketId,
        claim_token: token.trim(),
      }).unwrap()
      dispatch(toastPushed('success', 'Gift claimed — find it in My tickets'))
      navigate('/my-tickets')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not claim this gift')))
    }
  }

  return (
    <>
      <FunnelHeader label="Claim a gift" backHref="/my-tickets" backLabel="My tickets" />
      <PageSection padTop={44} padBottom={96}>
        <div className="mx-auto w-full max-w-[520px]">
          <h1 className="text-[42px] leading-[1.04] font-extrabold tracking-[-1.47px] text-ink-primary">
            Someone sent you a ticket.
          </h1>
          <p className="mt-[10px] text-[16px] text-ink-secondary">
            Enter the claim token from your gift email or SMS. Once claimed, the ticket and QR are
            yours.
          </p>

          <form
            className="mt-[28px] flex flex-col gap-[16px] rounded-[20px] border border-border-default bg-surface-default p-[26px]"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <Field label="Gift reference" htmlFor="gift-id">
              <TextInput id="gift-id" value={giftTicketId} readOnly className="bg-bg-page" />
            </Field>
            <Field label="Claim token" htmlFor="claim-token">
              <TextInput
                id="claim-token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Paste the token from your gift message"
                required
              />
            </Field>
            <Button type="submit" size="lg" loading={claimState.isLoading}>
              Claim ticket
            </Button>
            <p className="text-[13px] text-ink-muted">
              Need an account first?{' '}
              <Link to="/sign-in" className="font-semibold text-ink-brand">
                Sign in
              </Link>{' '}
              then come back to this link.
            </p>
          </form>
        </div>
      </PageSection>
    </>
  )
}
