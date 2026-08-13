import { Skeleton, SkeletonStack } from '@/components/data-display'
import { cn } from '@/lib/cn'

/**
 * Figma `LoadingCard` — node 207:2920. The card-shaped loading placeholder.
 *
 * An 84px media block then two lines, stacked at `--space-row-gap` (10px), with an
 * optional footnote 12px below. All three blocks are real `Skeleton` instances — this is
 * one of the few places in the file where a card composes DS atoms instead of redrawing
 * them.
 *
 * The line widths are **70% and 45%**, which Figma resolves against the 320px specimen
 * as 224 and 144. They are proportions, so they are written as percentages and survive a
 * change of card width.
 *
 * The footnote in the source reads *"Skeletons mirror final layout. Loading-more appends
 * below existing content."* — that is documentation prose, not product copy, so it is not
 * defaulted here.
 *
 * Figma states twice that **no animation is specified** and that none was invented. The
 * shimmer travel comes from the `Skeleton` atom, where it is recorded as a deliberate
 * addition: a static highlight band reads as a rendering bug rather than as loading.
 *
 * The panel this sits in (radius 18, padding 20, a "Loading — skeleton" label) is a
 * `SpecPanel` and is not part of this component.
 */
export interface LoadingCardProps {
  footnote?: string
  className?: string
}

export function LoadingCard({ footnote, className }: LoadingCardProps) {
  return (
    <div className={cn('flex w-full flex-col gap-md', className)}>
      <SkeletonStack>
        <Skeleton />
        <Skeleton variant="line" className="w-[70%]" />
        <Skeleton variant="line" className="w-[45%]" />
      </SkeletonStack>

      {footnote && (
        <p className="text-[12px] leading-[1.5] font-medium text-ink-muted">{footnote}</p>
      )}
    </div>
  )
}
