import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { ImagePlaceholder } from '@/components/data-display'
import { cn } from '@/lib/cn'
import { catalogLabel } from '@/lib/i18n/catalogLabels'

export interface DetailGalleryProps {
  category?: string
  flag?: string
  moreLabel?: string
  mainImage?: string
  thumbs?: readonly (string | undefined)[]
  /** Extra gallery images beyond main + thumbs (API / fixtures). */
  images?: readonly (string | undefined)[]
  className?: string
}

/** Detail hero gallery: main photo + 3 thumbs — Figma `207:4809`.
 * Category pill is `--bg-page` at 94% (not dark/translucent); flag is brand-end.
 * Below `lg`, thumbs become a horizontal strip under the main image.
 * Clicking any image opens a lightbox to browse the full set.
 */
export function DetailGallery({
  category,
  flag,
  moreLabel,
  mainImage,
  thumbs = [],
  images = [],
  className,
}: DetailGalleryProps) {
  const { t } = useTranslation('catalog')
  const [index, setIndex] = useState(-1)

  const slides = useMemo(() => {
    const seen = new Set<string>()
    const list: { src: string }[] = []
    for (const src of [mainImage, ...thumbs, ...images]) {
      if (!src || seen.has(src)) continue
      seen.add(src)
      list.push({ src })
    }
    return list
  }, [images, mainImage, thumbs])

  const openAt = (src: string | undefined, fallbackIndex: number) => {
    if (slides.length === 0) return
    const found = src ? slides.findIndex((slide) => slide.src === src) : -1
    setIndex(found >= 0 ? found : Math.max(0, Math.min(fallbackIndex, slides.length - 1)))
  }

  const remaining =
    slides.length > 4 ? slides.length - 3 : Math.max(0, slides.length - 1)
  const resolvedMoreLabel =
    moreLabel ??
    (remaining > 0 ? t('detail.morePhotos', { count: remaining }) : t('detail.viewGallery'))

  const categoryLabel = category ? catalogLabel(t, category) : undefined
  const flagLabel = flag ? catalogLabel(t, flag) : undefined

  return (
    <>
      <div
        className={cn(
          'flex w-full flex-col gap-[14px] lg:h-[460px] lg:flex-row',
          className,
        )}
      >
        <button
          type="button"
          className="relative aspect-[16/10] min-w-0 cursor-zoom-in overflow-hidden rounded-[14px] text-start lg:aspect-auto lg:h-full lg:flex-1 lg:rounded-[18px]"
          onClick={() => openAt(mainImage, 0)}
          aria-label={t('detail.openGallery')}
        >
          {mainImage ? (
            <img src={mainImage} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlaceholder ratio="fill" caption="Event imagery 16:10" />
          )}
          <div className="pointer-events-none absolute top-[12px] start-[12px] flex max-w-[calc(100%-24px)] flex-wrap gap-sm lg:top-[18px] lg:start-[18px]">
            {categoryLabel && (
              <span className="rounded-[14px] bg-bg-page/94 px-[11px] py-[6px] text-[12px] font-semibold text-ink-primary">
                {categoryLabel}
              </span>
            )}
            {flagLabel && (
              <span className="rounded-[14px] bg-brand-gradient-end px-[11px] py-[6px] text-[12px] font-semibold text-ink-inverse">
                {flagLabel}
              </span>
            )}
          </div>
        </button>

        <div className="flex h-[72px] w-full shrink-0 gap-md lg:h-full lg:w-[421px] lg:flex-col lg:gap-[14px]">
          {[0, 1, 2].map((i) => {
            const src = thumbs[i] ?? slides[i + 1]?.src
            const isLast = i === 2
            return (
              <button
                key={i}
                type="button"
                className="relative min-h-0 min-w-0 flex-1 cursor-zoom-in overflow-hidden rounded-[14px] text-start"
                onClick={() => openAt(src, i + 1)}
                aria-label={t('detail.openGalleryAt', { n: i + 2 })}
              >
                {src ? (
                  <img src={src} alt="" className="size-full object-cover" />
                ) : (
                  <ImagePlaceholder ratio="fill" caption="Gallery thumb" />
                )}
                {isLast && slides.length > 1 && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink-primary/60">
                    <p className="text-[13px] font-semibold text-bg-page sm:text-[15px]">
                      {resolvedMoreLabel}
                    </p>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <Lightbox
        open={index >= 0}
        index={Math.max(0, index)}
        close={() => setIndex(-1)}
        slides={slides}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  )
}
