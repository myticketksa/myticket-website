import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AdImageCard } from '@/components/ads/AdImageCard'
import { AdVideoCard } from '@/components/ads/AdVideoCard'
import { FadeUp } from '@/components/motion'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/Carousel'
import { PageSection } from '@/layouts'
import { HomeSectionHeader } from '@/pages/home/HomeSectionHeader'

export type AdRecord = {
  id?: number | string
  title?: unknown
  description?: unknown
  image?: unknown
  video?: unknown
  [key: string]: unknown
}

function asText(value: unknown, fallback = '') {
  return value == null || value === '' ? fallback : String(value)
}

/** Home ads band — videos carousel first, then images. Hides empty groups. */
export function HomeAdsSection({ ads }: { ads?: AdRecord[] }) {
  const { t } = useTranslation('catalog')

  const { videos, images } = useMemo(() => {
    const list = ads ?? []
    return {
      videos: list.filter((ad) => Boolean(asText(ad.video))),
      images: list.filter((ad) => Boolean(asText(ad.image)) && !asText(ad.video)),
    }
  }, [ads])

  if (videos.length === 0 && images.length === 0) return null

  return (
    <>
      {videos.length > 0 ? (
        <PageSection padTop={56} padBottom={0}>
          <FadeUp>
            <HomeSectionHeader
              overline={t('home.adsVideosOverline', { defaultValue: 'Spotlight' })}
              heading={t('home.adsVideosHeading', { defaultValue: 'Watch what’s on' })}
              lede={t('home.adsVideosLede', {
                defaultValue: 'Short clips from events and moments around the Kingdom.',
              })}
            />
          </FadeUp>
          <div className="relative mt-[22px]">
            <Carousel opts={{ align: 'start', loop: videos.length > 2 }}>
              <CarouselContent>
                {videos.map((ad) => (
                  <CarouselItem
                    key={String(ad.id ?? ad.video)}
                    className="basis-[85%] sm:basis-1/2 lg:basis-1/3"
                  >
                    <AdVideoCard
                      title={asText(ad.title, 'Advertisement')}
                      description={asText(ad.description) || undefined}
                      video={asText(ad.video)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:inline-flex" />
              <CarouselNext className="hidden sm:inline-flex" />
            </Carousel>
          </div>
        </PageSection>
      ) : null}

      {images.length > 0 ? (
        <PageSection padTop={56} padBottom={0}>
          <FadeUp>
            <HomeSectionHeader
              overline={t('home.adsImagesOverline', { defaultValue: 'Promotions' })}
              heading={t('home.adsImagesHeading', { defaultValue: 'From the MyTicket board' })}
              lede={t('home.adsImagesLede', {
                defaultValue: 'Featured campaigns and seasonal highlights.',
              })}
            />
          </FadeUp>
          <div className="relative mt-[22px]">
            <Carousel opts={{ align: 'start', loop: images.length > 2 }}>
              <CarouselContent>
                {images.map((ad) => (
                  <CarouselItem
                    key={String(ad.id ?? ad.image)}
                    className="basis-[85%] sm:basis-1/2 lg:basis-1/3"
                  >
                    <AdImageCard
                      title={asText(ad.title, 'Advertisement')}
                      description={asText(ad.description) || undefined}
                      image={asText(ad.image)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:inline-flex" />
              <CarouselNext className="hidden sm:inline-flex" />
            </Carousel>
          </div>
        </PageSection>
      ) : null}
    </>
  )
}
