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
    <div className={cn('flex h-[460px] w-full gap-[14px]', className)}>
      <div className="relative min-w-0 flex-1 overflow-hidden rounded-[18px]">
        {mainImage ? (
          <img src={mainImage} alt="" className="size-full object-cover" />
        ) : (
          <ImagePlaceholder ratio="fill" caption="Event imagery 16:10" />
        )}
        <div className="absolute top-[18px] left-[18px] flex gap-sm">
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

      <div className="flex h-full w-[421px] shrink-0 flex-col gap-[14px]">
        {[0, 1, 2].map((i) => {
          const src = thumbs[i]
          const isLast = i === 2
          return (
            <div
              key={i}
              className="relative min-h-0 flex-1 overflow-hidden rounded-[14px]"
            >
              {src ? (
                <img src={src} alt="" className="size-full object-cover" />
              ) : (
                <ImagePlaceholder ratio="fill" caption="Gallery thumb" />
              )}
              {isLast && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink-primary/60">
                  <p className="text-[15px] font-semibold text-bg-page">{moreLabel}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
