import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ComponentProps,
  type KeyboardEvent,
} from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'
import { useLocale } from '@/i18n/locale'
import { cn } from '@/lib/cn'
import { Button } from './Button'
import { useTranslation } from 'react-i18next'

type CarouselApi = UseEmblaCarouselType[1]

type CarouselContextValue = {
  api: CarouselApi
  canScrollPrev: boolean
  canScrollNext: boolean
  scrollPrev: () => void
  scrollNext: () => void
}

const CarouselContext = createContext<CarouselContextValue | null>(null)

function useCarousel() {
  const ctx = useContext(CarouselContext)
  if (!ctx) throw new Error('Carousel components must be used within <Carousel>')
  return ctx
}

export interface CarouselProps extends ComponentProps<'div'> {
  opts?: Parameters<typeof useEmblaCarousel>[0]
  setApi?: (api: CarouselApi) => void
}

/**
 * Embla carousel — slides align with the section title; prev/next sit just
 * outside the track so they don’t cover cards.
 */
export function Carousel({
  opts,
  setApi,
  className,
  children,
  onKeyDownCapture,
  ...props
}: CarouselProps) {
  const { locale } = useLocale()
  const [emblaRef, api] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    ...opts,
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback((instance: NonNullable<CarouselApi>) => {
    setCanScrollPrev(instance.canScrollPrev())
    setCanScrollNext(instance.canScrollNext())
  }, [])

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api])
  const scrollNext = useCallback(() => api?.scrollNext(), [api])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDownCapture?.(event)
      if (event.defaultPrevented) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        if (locale === 'ar') scrollNext()
        else scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        if (locale === 'ar') scrollPrev()
        else scrollNext()
      }
    },
    [locale, onKeyDownCapture, scrollNext, scrollPrev],
  )

  useEffect(() => {
    if (!api) return
    setApi?.(api)
    onSelect(api)
    api.on('reInit', onSelect)
    api.on('select', onSelect)
    return () => {
      api.off('reInit', onSelect)
      api.off('select', onSelect)
    }
  }, [api, onSelect, setApi])

  useEffect(() => {
    api?.reInit({ direction: locale === 'ar' ? 'rtl' : 'ltr' })
  }, [api, locale])

  return (
    <CarouselContext.Provider
      value={{ api, canScrollPrev, canScrollNext, scrollPrev, scrollNext }}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        className={cn('relative', className)}
        onKeyDownCapture={handleKeyDown}
        {...props}
      >
        <div ref={emblaRef} className="overflow-hidden">
          {children}
        </div>
      </div>
    </CarouselContext.Provider>
  )
}

export function CarouselContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex touch-pan-y gap-row-gap', className)} {...props} />
  )
}

export function CarouselItem({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn('min-w-0 shrink-0 grow-0 basis-full', className)}
      {...props}
    />
  )
}

export function CarouselPrevious({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const { canScrollPrev, scrollPrev } = useCarousel()
  const { t } = useTranslation('common')
  return (
    <Button
      type="button"
      variant="icon"
      size="sm"
      className={cn(
        'absolute top-1/2 z-10 start-0 rounded-full bg-surface-default/95 shadow-lift',
        // Fully outside the track (cards stay flush with the section title).
        '[transform:translate(calc(-100%-8px),-50%)] rtl:[transform:translate(calc(100%+8px),-50%)]',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      aria-label={t('pagination.previous')}
      {...props}
    >
      <ChevronLeftIcon size={18} />
    </Button>
  )
}

export function CarouselNext({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const { canScrollNext, scrollNext } = useCarousel()
  const { t } = useTranslation('common')
  return (
    <Button
      type="button"
      variant="icon"
      size="sm"
      className={cn(
        'absolute top-1/2 z-10 end-0 rounded-full bg-surface-default/95 shadow-lift',
        '[transform:translate(calc(100%+8px),-50%)] rtl:[transform:translate(calc(-100%-8px),-50%)]',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      aria-label={t('pagination.next')}
      {...props}
    >
      <ChevronRightIcon size={18} />
    </Button>
  )
}

export { useCarousel }
export type { CarouselApi }
