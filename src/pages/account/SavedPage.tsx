import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRightIcon, HeartIcon, StarIcon } from '@/components/icons'
import { FilterChip } from '@/components/data-display'
import { EmptyState } from '@/components/feedback'
import { Button } from '@/components/ui'
import { AccountPageHead, PageSection } from '@/layouts'
import { type SavedItemFixture, type SavedKind } from '@/pages/_account/fixtures'
import { cn } from '@/lib/cn'
import { useDeleteFavoriteMutation, useGetFavoritesQuery } from '@/app/api/accountApis'
import { localizedString } from '@/lib/api/locale'

type SavedItem = SavedItemFixture & { favoriteId?: string | number }

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function mapFavoriteKind(raw: unknown): SavedKind {
  const value = String(raw ?? 'event').toLowerCase()
  if (value.includes('experience')) return 'Experience'
  if (value.includes('talent')) return 'Talent'
  if (value.includes('vendor')) return 'Vendor'
  return 'Event'
}

function favoriteTargetId(record: Record<string, unknown>): string | number | undefined {
  const nested = asRecord(record.event ?? record.favoritable)
  const raw = record.event_id ?? record.eventId ?? record.favoritable_id ?? nested?.id
  if (typeof raw === 'string' || typeof raw === 'number') return raw
  return undefined
}

function mapFavorite(record: Record<string, unknown>): SavedItem {
  const nested = asRecord(record.event ?? record.favoritable)
  const kind = mapFavoriteKind(
    record.type ?? record.kind ?? record.favoritable_type ?? nested?.type,
  )
  const slug = record.slug ?? record.event_slug ?? nested?.slug
  const href =
    String(record.href ?? record.url ?? '') ||
    (slug
      ? `/${kind === 'Event' ? 'events' : kind === 'Experience' ? 'experiences' : 'talents'}/${slug}`
      : kind === 'Event'
        ? '/events'
        : kind === 'Experience'
          ? '/experiences'
          : '/talents')

  return {
    title: localizedString(
      record.title ?? record.name ?? nested?.title ?? nested?.name,
      'Saved item',
    ),
    kind,
    when: String(record.when ?? record.date ?? record.starts_at ?? nested?.startTime ?? ''),
    place: localizedString(
      record.place ?? record.venue ?? record.location ?? nested?.place ?? nested?.venue,
    ),
    price: String(record.price ?? record.price_from ?? nested?.priceFrom ?? ''),
    cta: String(
      record.cta ??
        (kind === 'Experience' ? 'Book a visit' : kind === 'Talent' ? 'View profile' : 'Get tickets'),
    ),
    href,
    cover: String(
      record.cover ?? record.image ?? record.image_url ?? nested?.cover ?? nested?.image ?? '',
    ),
    favoriteId: favoriteTargetId(record),
  }
}

const SEGMENTS = ['Favourites', 'Waitlists', 'Following'] as const
const FILTERS = ['All', 'Events', 'Experiences', 'Talents'] as const

/** Saved / favourites — Figma `207:8057`. Segments live below the head (not AccountTabBar). */
export function SavedPage() {
  const { t } = useTranslation(['account', 'common'])
  const navigate = useNavigate()
  const [segment, setSegment] = useState(0)
  const [filter, setFilter] = useState(0)
  const { data: favorites, isLoading } = useGetFavoritesQuery()
  const [deleteFavorite] = useDeleteFavoriteMutation()

  const kindMap = ['All', 'Event', 'Experience', 'Talent'] as const
  const sourceItems = useMemo((): SavedItem[] => {
    if (favorites && favorites.length > 0) return favorites.map(mapFavorite)
    return []
  }, [favorites])

  const items =
    filter === 0
      ? sourceItems.filter((item) => item.kind !== 'Vendor')
      : sourceItems.filter((item) => item.kind === kindMap[filter])

  const showFavouritesEmpty = segment === 0 && !isLoading && sourceItems.length === 0
  const showFavouritesFilterEmpty =
    segment === 0 && !isLoading && sourceItems.length > 0 && items.length === 0
  const showOtherSegmentEmpty = segment !== 0

  return (
    <>
      <AccountPageHead
        eyebrow={t('account:eyebrow')}
        title={t('account:saved.title')}
        subtitle={t('account:saved.subtitle')}
        className="border-b-0"
        actions={
          <Link to="/settings">
            <Button variant="secondary" size="md">
              Notification settings
            </Button>
          </Link>
        }
      />

      <PageSection padTop={0} padBottom={96}>
        <div className="pt-[10px]">
          <div className="flex w-full flex-wrap gap-[6px] rounded-[26px] border-[1.5px] border-border-default bg-surface-default p-[5px] sm:inline-flex sm:w-auto">
            {SEGMENTS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setSegment(index)}
                className={cn(
                  'h-[40px] flex-1 rounded-[20px] px-lg text-[13px] font-bold transition-colors sm:flex-none sm:px-3xl sm:text-[14px]',
                  segment === index
                    ? 'bg-brand-gradient text-ink-inverse'
                    : 'text-ink-secondary hover:text-ink-primary',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-[26px] flex flex-wrap gap-sm">
          {FILTERS.map((label, index) => (
            <FilterChip
              key={label}
              selected={filter === index}
              onClick={() => setFilter(index)}
              className="h-[38px] rounded-[19px] px-lg text-[13px] font-bold"
            >
              {label}
            </FilterChip>
          ))}
        </div>

        {showFavouritesEmpty && (
          <div className="mt-[22px] flex justify-center py-3xl">
            <EmptyState
              variant="firstUse"
              title={t('account:saved.emptyTitle')}
              body={t('account:saved.emptyBody')}
              ctaLabel={t('common:actions.browseEvents')}
              onCtaClick={() => navigate('/events')}
            />
          </div>
        )}

        {showFavouritesFilterEmpty && (
          <div className="mt-[22px] flex justify-center py-3xl">
            <EmptyState
              variant="filters"
              title={t('account:saved.filterEmptyTitle')}
              body={t('account:saved.filterEmptyBody')}
              ctaLabel={t('common:empty.clearFilters')}
              onCtaClick={() => setFilter(0)}
            />
          </div>
        )}

        {showOtherSegmentEmpty && (
          <div className="mt-[22px] flex justify-center py-3xl">
            <EmptyState
              variant="firstUse"
              title={
                segment === 1
                  ? t('account:saved.waitlistsEmptyTitle')
                  : t('account:saved.followingEmptyTitle')
              }
              body={
                segment === 1
                  ? t('account:saved.waitlistsEmptyBody')
                  : t('account:saved.followingEmptyBody')
              }
              ctaLabel={t('common:actions.browseEvents')}
              onCtaClick={() => navigate('/events')}
            />
          </div>
        )}

        {segment === 0 && items.length > 0 && (
        <div className="mt-[22px] grid gap-xl sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={`${item.title}-${item.favoriteId ?? item.href}`}
              className="flex flex-col overflow-hidden rounded-[20px] border border-border-default bg-surface-default"
            >
              <div className="relative h-[176px] shrink-0">
                {item.cover ? (
                  <img src={item.cover} alt="" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-placeholder-gradient" />
                )}
                <button
                  type="button"
                  aria-label={t('account:saved.removeAria')}
                  className="absolute top-[10px] end-[10px] flex size-[34px] items-center justify-center rounded-[17px] bg-surface-default text-ink-brand"
                  onClick={() => {
                    if (item.favoriteId != null) deleteFavorite(item.favoriteId)
                  }}
                >
                  <HeartIcon size={15} />
                </button>
                <span className="absolute bottom-[10px] start-[10px] rounded-[12px] bg-surface-inverse px-[10px] py-[5px] text-[11px] font-bold text-ink-inverse">
                  {item.kind}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-[7px] px-lg pt-[15px] pb-lg">
                <p
                  className={cn(
                    'text-[12px] font-extrabold tracking-[0.6px]',
                    item.kind === 'Experience' || item.kind === 'Talent'
                      ? 'text-ink-brand-mid'
                      : 'text-ink-brand',
                  )}
                >
                  {item.when}
                </p>
                <h2 className="text-[17px] leading-[1.22] font-bold tracking-[-0.255px] text-ink-primary">
                  {item.title}
                </h2>
                <p className="text-[13px] font-medium text-ink-secondary">{item.place}</p>
                <div className="mt-auto flex items-center justify-between border-t border-border-divider pt-md">
                  <p className="flex items-center gap-xs text-[18px] font-extrabold text-brand-identity-end">
                    {item.kind === 'Talent' && <StarIcon size={16} className="text-ink-brand" />}
                    {item.price}
                  </p>
                  <Link
                    to={item.href}
                    className="inline-flex items-center gap-[5px] text-[13px] font-bold text-ink-brand-mid hover:text-ink-brand"
                  >
                    {item.cta}
                    <ArrowRightIcon size={13} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        )}
      </PageSection>
    </>
  )
}
