import { useTranslation } from 'react-i18next'
import { Divider, ImagePlaceholder } from '@/components/data-display'
import { StarFillIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

/**
 * Figma `TalentCard` Context=Home — node 207:3115.
 *
 * Discovery badge replaces the old verified icon when API `ownDiscovery === false`
 * (passed through as `verified` for call-site compatibility).
 */
export interface TalentCardProps {
  name: string
  /** e.g. "Singer · Arabic pop". */
  discipline: string
  rating: string
  /** Review count, rendered in parentheses. */
  reviews: string
  city: string
  /** The pill over the media, e.g. "Next · Thu 8 Oct". Omitted when absent. */
  nextLabel?: string
  /** Headline under the APPEARING NEXT rule. */
  nextEvent?: string
  /**
   * When true, shows “Myticket Discovery” on the media (API `ownDiscovery === false`).
   */
  verified?: boolean
  /** Public guest browse: avatar/media, name, discipline, rating only. */
  limited?: boolean
  image?: string
  className?: string
}

export function TalentCard({
  name,
  discipline,
  rating,
  reviews,
  city,
  nextLabel,
  nextEvent,
  verified = false,
  limited = false,
  image,
  className,
}: TalentCardProps) {
  const { t } = useTranslation('catalog')
  const showDiscovery = verified

  if (limited) {
    const filled = Math.max(0, Math.min(5, Math.round(Number.parseFloat(rating) || 0)))

    return (
      <article
        className={cn(
          'group flex flex-col items-center gap-md bg-transparent text-center',
          className,
        )}
      >
        <div className="size-[112px] overflow-hidden rounded-full bg-bg-skeleton sm:size-[128px]">
          {image ? (
            <img
              src={image}
              alt=""
              className="size-full object-cover transition-transform duration-slow ease-standard group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
            />
          ) : (
            <ImagePlaceholder ratio="fill" caption="" />
          )}
        </div>
        <h3 className="max-w-full text-[15px] font-bold text-balance text-ink-primary sm:text-[16px]">
          {name}
        </h3>
        <div
          className="flex items-center justify-center gap-[3px]"
          aria-label={t('talent.ratingOf5', { rating })}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <StarFillIcon
              key={i}
              size={14}
              className={i < filled ? 'text-brand-primary' : 'text-border-default'}
            />
          ))}
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-[20px] border border-border-default bg-surface-default',
        'transition-[transform,box-shadow] duration-normal ease-standard',
        'hover:-translate-y-0.5 hover:shadow-lift',
        'motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none',
        className,
      )}
    >
      <div className="relative h-[208px] w-full overflow-hidden">
        {image ? (
          <img
            src={image}
            alt=""
            className="size-full object-cover transition-transform duration-slow ease-standard group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
        ) : (
          <ImagePlaceholder ratio="fill" caption="Event imagery 16:10" />
        )}

        {showDiscovery && (
          <p className="absolute top-[10px] start-[10px] rounded-[12px] bg-surface-default px-[10px] py-[5px] text-[10px] font-bold tracking-[0.02em] text-ink-brand">
            {t('talent.discovery')}
          </p>
        )}

        {!showDiscovery && nextLabel && (
          <p className="absolute top-[10px] start-[10px] rounded-[12px] bg-surface-default px-[10px] py-[5px] text-[11px] font-bold text-ink-primary">
            {nextLabel}
          </p>
        )}
      </div>

      <div className="flex flex-col px-lg pt-[15px] pb-[17px]">
        <h3 className="text-[16px] font-bold text-ink-primary">{name}</h3>

        <p className="mt-[3px] text-[13px] font-medium text-ink-secondary">{discipline}</p>

        <div className="mt-[10px] flex w-full items-start justify-between">
          <span className="flex items-start gap-xs text-ink-primary">
            <StarFillIcon className="mt-[1px] shrink-0" />
            <span className="text-[13px] font-bold">{rating}</span>
            <span className="text-[13px] font-medium text-ink-muted">({reviews})</span>
          </span>
          <span className="text-[13px] font-medium text-ink-secondary">{city}</span>
        </div>

        {nextEvent && (
          <>
            <Divider className="my-[11px]" />
            <p className="text-[11px] font-bold tracking-[0.66px] text-brand-gradient-end uppercase">
              {t('talent.appearingNext')}
            </p>
            <p className="mt-[3px] text-[13px] font-semibold text-ink-primary">{nextEvent}</p>
          </>
        )}
      </div>
    </article>
  )
}

/**
 * Figma `TalentCard/Directory` — node 207:3139. Its own component, not a variant.
 */
export interface TalentDirectoryCardProps {
  name: string
  discipline: string
  /** e.g. "24.6k followers · 3 shows". */
  meta: string
  rating: string
  nextShow?: {
    headline: string
    detail: string
  }
  /** When true, shows “Myticket Discovery” (API ownDiscovery === false). */
  verified?: boolean
  image?: string
  onGetTickets?: () => void
  onFollow?: () => void
  limited?: boolean
  className?: string
}

export function TalentDirectoryCard({
  name,
  discipline,
  meta,
  rating,
  nextShow,
  verified = false,
  image,
  onGetTickets,
  onFollow,
  limited = false,
  className,
}: TalentDirectoryCardProps) {
  const { t } = useTranslation('catalog')
  const showDiscovery = verified

  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-[16px] border border-border-default bg-surface-default',
        className,
      )}
    >
      <div className="relative h-[214px] w-full overflow-hidden bg-bg-skeleton">
        {image && <img src={image} alt="" className="size-full object-cover" />}

        {showDiscovery && (
          <p className="absolute top-md start-md rounded-[13px] bg-bg-page/94 px-[10px] py-[5px] text-[10px] font-bold tracking-[0.02em] text-ink-brand">
            {t('talent.discovery')}
          </p>
        )}

        <span className="absolute top-md end-md flex items-center gap-[6px] rounded-[13px] bg-ink-primary/72 px-[10px] py-[5px] text-bg-page">
          <StarFillIcon size={12} className="shrink-0" />
          <span className="text-[12px] font-semibold">{rating}</span>
        </span>
      </div>

      <div className="flex grow flex-col px-lg pt-lg pb-[18px]">
        <h3 className="text-[18px] font-semibold text-ink-primary">{name}</h3>
        <p className="mt-[6px] text-[14px] text-ink-secondary">{discipline}</p>
        {!limited && meta ? (
          <p className="mt-[6px] text-[13px] text-ink-muted">{meta}</p>
        ) : null}

        {!limited && nextShow && (
          <div className="mt-[10px] rounded-[12px] border border-border-divider bg-bg-page px-md py-[11px]">
            <p className="text-[11px] font-bold tracking-[0.66px] text-ink-muted uppercase">
              {t('talent.nextShow')}
            </p>
            <p className="mt-xs text-[14px] font-semibold text-ink-primary">{nextShow.headline}</p>
            <p className="mt-[2px] text-[13px] text-ink-secondary">{nextShow.detail}</p>
          </div>
        )}

        {!limited && (
          <div className="mt-auto flex w-full gap-sm pt-md">
            <Button className="h-[40px] flex-1 rounded-[20px]" onClick={onGetTickets}>
              {t('talent.getTickets')}
            </Button>
            <Button
              variant="secondary"
              className="h-[40px] rounded-[20px] px-[14px]"
              onClick={onFollow}
            >
              {t('talent.follow')}
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}
