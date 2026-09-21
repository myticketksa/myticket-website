import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '@/components/feedback/FormDialog'
import { StarFillIcon } from '@/components/icons'
import { Button, Field, Textarea } from '@/components/ui'
import { cn } from '@/lib/cn'

export type ReviewEntityType = 'talent' | 'experience'

export type TalentReviewPayload = {
  type: ReviewEntityType
  id: number
  rating: number
  name: string
  comment?: string
}

export interface TalentReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  talentId?: number
  experienceId?: number
  entityType?: ReviewEntityType
  userName: string
  onSubmit: (payload: TalentReviewPayload) => Promise<void>
  submitting?: boolean
}

export function TalentReviewModal({
  open,
  onOpenChange,
  talentId,
  experienceId,
  entityType = talentId != null ? 'talent' : 'experience',
  userName,
  onSubmit,
  submitting,
}: TalentReviewModalProps) {
  const { t } = useTranslation(['catalog', 'common'])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const entityId = entityType === 'experience' ? experienceId : talentId

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    if (rating < 1 || rating > 5) {
      setError(t('talent.errorRatingRange'))
      return
    }
    if (entityId == null || !Number.isFinite(entityId)) {
      setError(t('talent.errorRatingUnavailable'))
      return
    }
    await onSubmit({
      type: entityType,
      id: entityId,
      rating,
      name: userName,
      comment: comment.trim() || undefined,
    })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('talent.reviewTitle')}
      description={t('talent.reviewDescription', { name: userName })}
    >
      <form className="flex flex-col gap-lg" onSubmit={(e) => void handleSubmit(e)}>
        <div>
          <p className="mb-[8px] text-[13px] font-semibold text-ink-primary">
            {t('talent.rating')}
          </p>
          <div className="flex gap-sm">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={t('talent.starsAria', { count: value })}
                onClick={() => setRating(value)}
                className={cn(
                  'rounded-[10px] p-[6px] transition-colors',
                  value <= rating ? 'text-brand-gradient-end' : 'text-ink-muted',
                )}
              >
                <StarFillIcon size={22} />
              </button>
            ))}
          </div>
        </div>

        <Field label={t('talent.commentOptional')} htmlFor="talent-review-comment">
          <Textarea
            id="talent-review-comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('talent.commentPlaceholder')}
          />
        </Field>

        {error ? <p className="text-[13px] text-state-danger">{error}</p> : null}

        <div className="flex flex-col gap-[10px]">
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? t('common:states.submitting') : t('talent.submitRating')}
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
