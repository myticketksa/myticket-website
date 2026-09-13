import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { CloseIcon, FilterIcon } from '@/components/icons'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

export interface CatalogBodyProps {
  filters: ReactNode
  children: ReactNode
  /** Filter column width — Events 268, Talents/Vendors 252, Search 244. */
  filterWidth?: 268 | 252 | 244
  className?: string
}

function useIsLg() {
  const [isLg, setIsLg] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true,
  )

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setIsLg(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isLg
}

/** Body grid: filter sidebar + results column (gap 32). Below lg, filters open in a sheet. */
export function CatalogBody({
  filters,
  children,
  filterWidth = 268,
  className,
}: CatalogBodyProps) {
  const { t } = useTranslation('common')
  const isLg = useIsLg()
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    if (isLg) setFiltersOpen(false)
  }, [isLg])

  return (
    <div className={cn('flex w-full flex-col gap-lg', className)} data-filter-width={filterWidth}>
      <div className="flex lg:hidden">
        <Button
          variant="secondary"
          size="md"
          icon={<FilterIcon size={16} />}
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters-sheet"
          onClick={() => setFiltersOpen(true)}
        >
          {t('catalog.filters')}
        </Button>
      </div>

      <div className="flex w-full items-start gap-4xl">
        {isLg ? (
          <div className="shrink-0" style={{ width: filterWidth }}>
            <div className="[&>aside]:!w-full">{filters}</div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>

      {!isLg ? (
        <DialogPrimitive.Root open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-surface-inverse/55 backdrop-blur-[1.5px]" />
            <DialogPrimitive.Content
              id="catalog-filters-sheet"
              aria-describedby={undefined}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[min(92dvh,720px)] w-full flex-col rounded-t-[20px] border border-border-default bg-bg-page shadow-overlay outline-none sm:inset-y-0 sm:start-0 sm:end-auto sm:max-h-none sm:w-[min(100vw-2rem,360px)] sm:rounded-none sm:rounded-e-[20px]"
            >
              <div className="flex shrink-0 items-center justify-between gap-md border-b border-border-divider px-xl py-lg">
                <DialogPrimitive.Title className="text-[16px] font-bold text-ink-primary">
                  {t('catalog.filters')}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close asChild>
                  <Button variant="icon" size="sm" aria-label={t('a11y.closeFilters')}>
                    <CloseIcon size={18} />
                  </Button>
                </DialogPrimitive.Close>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-xl py-lg [&>aside]:!w-full [&>aside]:border-0 [&>aside]:bg-transparent [&>aside]:p-0">
                {filters}
              </div>

              <div className="shrink-0 border-t border-border-divider px-xl py-lg">
                <Button size="lg" className="w-full" onClick={() => setFiltersOpen(false)}>
                  {t('catalog.done')}
                </Button>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      ) : null}
    </div>
  )
}
