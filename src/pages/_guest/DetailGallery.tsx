import { ImagePlaceholder } from '@/components/data-display'
import { cn } from '@/lib/cn'

export interface DetailGalleryProps {
  category?: string
  flag?: string
  moreLabel?: string
  mainImage?: string
  thumbs?: readonly (string | undefined)[]
  className?: string
}

/** Detail hero gallery: main photo + 3 thumbs — Figma `207:4809`.
 * Category pill is `--bg-page` at 94% (not dark/translucent); flag is brand-end.
 * Below `lg`, thumbs become a horizontal strip under the main image.
 */
export function DetailGallery({
  category,
  flag,
  moreLabel = '+9 photos',
  mainImage,
  thumbs = [],
  className,
}: DetailGalleryProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-[14px] lg:h-[460px] lg:flex-row',
        className,
      )}
    >
      <div className="relative aspect-[16/10] min-w-0 overflow-hidden rounded-[14px] sm:rounded-[18px] lg:aspect-auto lg:h-full lg:flex-1">
        {mainImage ? (
          <img src={mainImage} alt="" className="size-full object-cover" />
        ) : (
          <ImagePlaceholder ratio="fill" caption="Event imagery 16:10" />
        )}
        <div className="absolute top-[12px] start-[12px] flex max-w-[calc(100%-24px)] flex-wrap gap-sm sm:top-[18px] sm:start-[18px]">
          {category && (
            <span className="rounded-[14px] bg-bg-page/94 px-[11px] py-[6px] text-[12px] font-semibold text-ink-primary">
              {category}
            </span>
          )}
          {flag && (
            <span className="rounded-[14px] bg-brand-gradient-end px-[11px] py-[6px] text-[12px] font-semibold text-ink-inverse">
              {flag}
            </span>
          )}
        </div>
      </div>

      <div className="flex h-[72px] w-full shrink-0 gap-md sm:h-[88px] sm:gap-[14px] lg:h-full lg:w-[421px] lg:flex-col">
        {[0, 1, 2].map((i) => {
          const src = thumbs[i]
          const isLast = i === 2
          return (
            <div
              key={i}
              className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-[14px]"
            >
              {src ? (
                <img src={src} alt="" className="size-full object-cover" />
              ) : (
                <ImagePlaceholder ratio="fill" caption="Gallery thumb" />
              )}
              {isLast && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink-primary/60">
                  <p className="text-[13px] font-semibold text-bg-page sm:text-[15px]">{moreLabel}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
