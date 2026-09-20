import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AdImageCard } from '@/components/ads/AdImageCard'
import { AdVideoCard } from '@/components/ads/AdVideoCard'
import { ImageIcon, PlayIcon } from '@/components/icons'
import { FadeUp } from '@/components/motion'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/Carousel'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

export type AdRecord = {
  id?: number | string
  title?: unknown
  description?: unknown
  image?: unknown
  video?: unknown
  [key: string]: unknown
}

export function asAdText(value: unknown, fallback = '') {
  return value == null || value === '' ? fallback : String(value)
}

export function partitionAds(ads?: AdRecord[]) {
  const list = ads ?? []
  return {
    videos: list.filter((ad) => Boolean(asAdText(ad.video))),
    images: list.filter((ad) => Boolean(asAdText(ad.image)) && !asAdText(ad.video)),
  }
}

function AdsSectionLabel({
  icon,
  children,
  className,
}: {
  icon: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-[8px]', className)}>
      <span className="inline-flex size-[28px] items-center justify-center rounded-[10px] bg-bg-tint-brand text-ink-brand">
        {icon}
      </span>
      <h2 className="text-[15px] font-bold tracking-[-0.01em] text-ink-primary">{children}</h2>
    </div>
  )
}

/** Image ads band — used when not embedded in the hero. */
export function HomeImageAdsSection({ ads }: { ads?: AdRecord[] }) {
  const { t } = useTranslation('catalog')
  const images = useMemo(() => partitionAds(ads).images, [ads])

  if (images.length === 0) return null

  return (
    <PageSection padTop={56} padBottom={0}>
      <FadeUp>
        <AdsSectionLabel icon={<ImageIcon size={14} weight="fill" />}>
          {t('home.adsImagesHeading')}
        </AdsSectionLabel>
      </FadeUp>
      <div className="relative mt-[16px]">
        <Carousel opts={{ align: 'start', loop: images.length > 2 }}>
          <CarouselContent>
            {images.map((ad) => (
              <CarouselItem
                key={String(ad.id ?? ad.image)}
                className="basis-[85%] sm:basis-1/2 lg:basis-1/3"
              >
                <AdImageCard
                  title={asAdText(ad.title, 'Advertisement')}
                  description={asAdText(ad.description) || undefined}
                  image={asAdText(ad.image)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:inline-flex" />
          <CarouselNext className="hidden sm:inline-flex" />
        </Carousel>
      </div>
    </PageSection>
  )
}

/** Video ads band — placed under Talents on home. */
export function HomeVideoAdsSection({ ads }: { ads?: AdRecord[] }) {
  const { t } = useTranslation('catalog')
  const videos = useMemo(() => partitionAds(ads).videos, [ads])

  if (videos.length === 0) return null

  return (
    <PageSection padTop={56} padBottom={0}>
      <FadeUp>
        <AdsSectionLabel icon={<PlayIcon size={14} weight="fill" />}>
          {t('home.adsVideosHeading')}
        </AdsSectionLabel>
      </FadeUp>
      <div className="relative mt-[16px]">
        <Carousel opts={{ align: 'start', loop: videos.length > 2 }}>
          <CarouselContent>
            {videos.map((ad) => (
              <CarouselItem
                key={String(ad.id ?? ad.video)}
                className="basis-[85%] sm:basis-1/2 lg:basis-1/3"
              >
                <AdVideoCard
                  title={asAdText(ad.title, 'Advertisement')}
                  description={asAdText(ad.description) || undefined}
                  video={asAdText(ad.video)}
                  poster={asAdText(ad.image) || undefined}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:inline-flex" />
          <CarouselNext className="hidden sm:inline-flex" />
        </Carousel>
      </div>
    </PageSection>
  )
}

/** @deprecated Prefer HomeVideoAdsSection / hero image ads. Kept for callers. */
export function HomeAdsSection({ ads }: { ads?: AdRecord[] }) {
  return (
    <>
      <HomeVideoAdsSection ads={ads} />
      <HomeImageAdsSection ads={ads} />
    </>
  )
}
