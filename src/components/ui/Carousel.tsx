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
import { cn } from '@/lib/cn'
import { Button } from './Button'

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
 * Embla carousel with arrow gutters: slides sit in an inset track (`sm:mx-12`),
 * prev/next sit in the outer gutter so they don’t overlap cards.
 */
export function Carousel({
  opts,
  setApi,
  className,
  children,
  onKeyDownCapture,
  ...props
}: CarouselProps) {
  const [emblaRef, api] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
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
        scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollNext()
      }
    },
    [onKeyDownCapture, scrollNext, scrollPrev],
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
        <div ref={emblaRef} className="overflow-hidden sm:mx-12">
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
  return (
    <Button
      type="button"
      variant="icon"
      size="sm"
      className={cn(
        'absolute top-1/2 start-0 z-10 -translate-y-1/2 rounded-full bg-surface-default/95 shadow-lift sm:start-1',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      aria-label="Previous slide"
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
  return (
    <Button
      type="button"
      variant="icon"
      size="sm"
      className={cn(
        'absolute top-1/2 end-0 z-10 -translate-y-1/2 rounded-full bg-surface-default/95 shadow-lift sm:end-1',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      aria-label="Next slide"
      {...props}
    >
      <ChevronRightIcon size={18} />
    </Button>
  )
}

export { useCarousel }
export type { CarouselApi }
