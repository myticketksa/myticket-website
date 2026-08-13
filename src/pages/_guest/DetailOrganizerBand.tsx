import { CheckGlyphIcon, StarFillIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

export interface DetailOrganizerBandProps {
  name: string
  /** e.g. "84 events ·" */
  eventsLabel: string
  rating: string
  sinceLabel: string
  bio: string
  avatar?: string
  onFollow?: () => void
  onAllEvents?: () => void
  className?: string
}

/**
 * Event-detail organizer strip — Figma `207:4948`.
 * Not `OrganizerCard` (tile/directory); this is the horizontal host band on detail pages.
 */
export function DetailOrganizerBand({
  name,
  eventsLabel,
  rating,
  sinceLabel,
  bio,
  avatar,
  onFollow,
  onAllEvents,
  className,
}: DetailOrganizerBandProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center gap-[18px] overflow-hidden rounded-[18px] border border-border-default bg-surface-default p-[22px]',
        className,
      )}
    >
      <div className="relative size-[72px] shrink-0 overflow-hidden rounded-[36px] bg-bg-skeleton">
        {avatar ? (
          <img src={avatar} alt="" className="size-full object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-[7px]">
          <p className="text-[19px] font-semibold text-ink-primary">{name}</p>
          <span className="flex size-[16px] items-center justify-center rounded-[8px] bg-state-success text-ink-inverse">
            <CheckGlyphIcon size={12} />
          </span>
        </div>
        <div className="mt-[3px] flex items-center gap-xs text-[14px] text-ink-secondary">
          <span>{eventsLabel}</span>
          <StarFillIcon size={14} className="text-ink-secondary" />
          <span>
            {rating} · {sinceLabel}
          </span>
        </div>
        <p className="mt-sm max-w-[560px] text-[14px] leading-[1.5] text-ink-body">{bio}</p>
      </div>

      <div className="flex shrink-0 flex-col gap-[9px]">
        <Button className="h-[40px] w-full rounded-[20px] px-xl" onClick={onFollow}>
          Follow
        </Button>
        <Button
          variant="secondary"
          className="h-[40px] rounded-[20px] border px-xl"
          onClick={onAllEvents}
        >
          All events
        </Button>
      </div>
    </div>
  )
}
