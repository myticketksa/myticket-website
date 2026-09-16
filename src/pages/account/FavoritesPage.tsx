import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRightIcon, HeartIcon, StarIcon } from '@/components/icons'
import { FilterChip } from '@/components/data-display'
import { EmptyState } from '@/components/feedback'
import { Button } from '@/components/ui'
import { AccountPageHead, PageSection } from '@/layouts'
import { cn } from '@/lib/cn'
import {
  useDeleteFavoriteMutation,
  useGetFavoritesQuery,
} from '@/app/api/accountApis'
import { useUnfavoriteExperienceMutation } from '@/app/api/experiencesApi'
import { useUnfavoriteTalentMutation } from '@/app/api/talentsApi'
import {
  mapFavoriteRecord,
  type MappedFavorite,
} from '@/lib/favorites/mapFavoriteRecord'
import { writeTalentFavoriteIds, readTalentFavoriteIds } from '@/lib/favorites/useTalentFavorites'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'

const FILTER_IDS = ['all', 'events', 'experiences', 'talents'] as const

/** Favorites — Figma `207:8057`. Lists GET /favorites `{ type, item }` rows. */
export function FavoritesPage() {
  const { t } = useTranslation(['account', 'common'])
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [filter, setFilter] = useState(0)
  const { data: favorites, isLoading } = useGetFavoritesQuery()
  const [deleteFavorite] = useDeleteFavoriteMutation()
  const [unfavoriteExperience] = useUnfavoriteExperienceMutation()
  const [unfavoriteTalent] = useUnfavoriteTalentMutation()

  const sourceItems = useMemo((): MappedFavorite[] => {
    const items: MappedFavorite[] = []
    const seen = new Set<string>()

    for (const record of favorites ?? []) {
      const mapped = mapFavoriteRecord(record)
      if (!mapped) continue
      const key = `${mapped.source}:${mapped.itemId}`
      if (seen.has(key)) continue
      seen.add(key)
      items.push(mapped)
    }

    return items
  }, [favorites])

  const kindMap = ['All', 'Event', 'Experience', 'Talent'] as const
  const items =
    filter === 0
      ? sourceItems
      : sourceItems.filter((item) => item.kind === kindMap[filter])

  const showEmpty = !isLoading && sourceItems.length === 0
  const showFilterEmpty = !isLoading && sourceItems.length > 0 && items.length === 0

  async function handleRemove(item: MappedFavorite) {
    try {
      if (item.source === 'experience') {
        await unfavoriteExperience(item.itemId).unwrap()
      } else if (item.source === 'talent') {
        await unfavoriteTalent(item.itemId).unwrap()
        const next = readTalentFavoriteIds()
        next.delete(item.itemId)
        writeTalentFavoriteIds(next)
      } else {
        await deleteFavorite(item.itemId).unwrap()
      }
      dispatch(toastPushed('success', t('account:favorites.removed')))
    } catch (error) {
      dispatch(
        toastPushed('error', apiErrorMessage(error, t('account:favorites.removeError'))),
      )
    }
  }

  return (
    <>
      <AccountPageHead
        eyebrow={t('account:eyebrow')}
        title={t('account:favorites.title')}
        subtitle={t('account:favorites.subtitle')}
        className="border-b-0"
        actions={
          <Link to="/settings">
            <Button variant="secondary" size="md">
              {t('account:favorites.notificationSettings')}
            </Button>
          </Link>
        }
      />

      <PageSection padTop={0} padBottom={96}>
        <div className="mt-[10px] flex flex-wrap gap-sm">
          {FILTER_IDS.map((id, index) => (
            <FilterChip
              key={id}
              selected={filter === index}
              onClick={() => setFilter(index)}
              className="h-[38px] rounded-[19px] px-lg text-[13px] font-bold"
            >
              {t(`account:favorites.filters.${id}`)}
            </FilterChip>
          ))}
        </div>

        {showEmpty && (
          <div className="mt-[22px] flex justify-center py-3xl">
            <EmptyState
              variant="firstUse"
              title={t('account:favorites.emptyTitle')}
              body={t('account:favorites.emptyBody')}
              ctaLabel={t('common:actions.browseEvents')}
              onCtaClick={() => navigate('/events')}
            />
          </div>
        )}

        {showFilterEmpty && (
          <div className="mt-[22px] flex justify-center py-3xl">
            <EmptyState
              variant="filters"
              title={t('account:favorites.filterEmptyTitle')}
              body={t('account:favorites.filterEmptyBody')}
              ctaLabel={t('common:empty.clearFilters')}
              onCtaClick={() => setFilter(0)}
            />
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-[22px] grid gap-xl sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <article
                key={`${item.source}-${item.itemId}`}
                className="flex flex-col overflow-hidden rounded-[20px] border border-border-default bg-surface-default"
              >
                <div className="relative h-[176px] shrink-0">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-placeholder-gradient" />
                  )}
                  <button
                    type="button"
                    aria-label={t('account:favorites.removeAria')}
                    className="absolute top-[10px] end-[10px] flex size-[34px] items-center justify-center rounded-[17px] bg-surface-default text-ink-brand"
                    onClick={() => void handleRemove(item)}
                  >
                    <HeartIcon size={15} />
                  </button>
                  <span className="absolute bottom-[10px] start-[10px] rounded-[12px] bg-surface-inverse px-[10px] py-[5px] text-[11px] font-bold text-ink-inverse">
                    {t(`account:favorites.kinds.${item.kind}`)}
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
                      {item.kind === 'Talent' && (
                        <StarIcon size={16} className="text-ink-brand" />
                      )}
                      {item.price}
                    </p>
                    <Link
                      to={item.href}
                      className="inline-flex items-center gap-[5px] text-[13px] font-bold text-ink-brand-mid hover:text-ink-brand"
                    >
                      {item.kind === 'Experience'
                        ? t('account:favorites.cta.visit')
                        : item.kind === 'Talent'
                          ? t('account:favorites.cta.profile')
                          : t('account:favorites.cta.tickets')}
                      <ArrowRightIcon size={13} className="rtl:rotate-180" />
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

/** @deprecated Use FavoritesPage — kept for import compatibility. */
export const SavedPage = FavoritesPage
