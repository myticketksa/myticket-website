import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, HeartIcon, StarIcon } from '@/components/icons'
import { FilterChip } from '@/components/data-display'
import { Button } from '@/components/ui'
import { AccountPageHead, PageSection } from '@/layouts'
import { SAVED_ITEMS, type SavedItemFixture, type SavedKind } from '@/pages/_account/fixtures'
import { cn } from '@/lib/cn'
import { useDeleteFavoriteMutation, useGetFavoritesQuery } from '@/app/api/accountApis'

type SavedItem = SavedItemFixture & { favoriteId?: string | number }

function mapFavoriteKind(raw: unknown): SavedKind {
  const value = String(raw ?? 'event').toLowerCase()
  if (value.includes('experience')) return 'Experience'
  if (value.includes('talent')) return 'Talent'
  if (value.includes('vendor')) return 'Vendor'
  return 'Event'
}

function mapFavorite(record: Record<string, unknown>, index: number): SavedItem {
  const kind = mapFavoriteKind(record.type ?? record.kind ?? record.favoritable_type)
  const slug = record.slug ?? record.event_slug
  const href =
    String(record.href ?? record.url ?? '') ||
    (slug ? `/${kind === 'Event' ? 'events' : kind === 'Experience' ? 'experiences' : 'talents'}/${slug}` : '/events')
  const fallback = SAVED_ITEMS[index % SAVED_ITEMS.length]

  return {
    title: String(record.title ?? record.name ?? fallback.title),
    kind,
    when: String(record.when ?? record.date ?? record.starts_at ?? fallback.when),
    place: String(record.place ?? record.venue ?? record.location ?? fallback.place),
    price: String(record.price ?? record.price_from ?? fallback.price),
    cta: String(record.cta ?? fallback.cta),
    href,
    cover: String(record.cover ?? record.image ?? record.image_url ?? fallback.cover),
    favoriteId: (record.event_id ?? record.eventId ?? record.id ?? record.favoritable_id) as
      | string
      | number
      | undefined,
  }
}

const SEGMENTS = ['Favourites', 'Waitlists', 'Following'] as const
const FILTERS = ['All', 'Events', 'Experiences', 'Talents'] as const

/** Saved / favourites — Figma `207:8057`. Segments live below the head (not AccountTabBar). */
export function SavedPage() {
  const [segment, setSegment] = useState(0)
  const [filter, setFilter] = useState(0)
  const { data: favorites } = useGetFavoritesQuery()
  const [deleteFavorite] = useDeleteFavoriteMutation()

  const kindMap = ['All', 'Event', 'Experience', 'Talent'] as const
  const sourceItems = useMemo((): SavedItem[] => {
    if (favorites && favorites.length > 0) return favorites.map(mapFavorite)
    return SAVED_ITEMS.map((item) => ({ ...item }))
  }, [favorites])

  const items =
    filter === 0
      ? sourceItems.filter((item) => item.kind !== 'Vendor')
      : sourceItems.filter((item) => item.kind === kindMap[filter])

  return (
    <>
      <AccountPageHead
        eyebrow="Your account"
        title="Saved"
        subtitle="Everything you've hearted, the sold-out nights you're waiting on, and the people you follow."
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
          <div className="inline-flex gap-[6px] rounded-[26px] border-[1.5px] border-border-default bg-surface-default p-[5px]">
            {SEGMENTS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setSegment(index)}
                className={cn(
                  'h-[40px] rounded-[20px] px-3xl text-[14px] font-bold transition-colors',
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

        <div className="mt-[22px] grid gap-xl sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={`${item.title}-${item.favoriteId ?? item.href}`}
              className="flex flex-col overflow-hidden rounded-[20px] border border-border-default bg-surface-default"
            >
              <div className="relative h-[176px] shrink-0">
                <img src={item.cover} alt="" className="absolute inset-0 size-full object-cover" />
                <button
                  type="button"
                  aria-label="Remove from saved"
                  className="absolute top-[10px] right-[10px] flex size-[34px] items-center justify-center rounded-[17px] bg-surface-default text-ink-brand"
                  onClick={() => {
                    if (item.favoriteId != null) deleteFavorite(item.favoriteId)
                  }}
                >
                  <HeartIcon size={15} />
                </button>
                <span className="absolute bottom-[10px] left-[10px] rounded-[12px] bg-surface-inverse px-[10px] py-[5px] text-[11px] font-bold text-ink-inverse">
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
      </PageSection>
    </>
  )
}
