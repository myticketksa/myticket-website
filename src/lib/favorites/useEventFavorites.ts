import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useAddFavoriteMutation,
  useDeleteFavoriteMutation,
  useGetFavoritesQuery,
} from '@/app/api/accountApis'
import { useAppSelector } from '@/app/hooks'
import { selectIsAuthenticated } from '@/features/auth/authSlice'
import { favoriteItemId, favoriteRecordType } from '@/lib/favorites/mapFavoriteRecord'

function isNumericId(value: unknown): value is string | number {
  return value != null && /^\d+$/.test(String(value))
}

/** Shared favourite ids + toggle for event cards and the event detail save button. */
export function useEventFavorites() {
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const { data: favorites } = useGetFavoritesQuery(undefined, { skip: !isAuthenticated })
  const [addFavorite] = useAddFavoriteMutation()
  const [deleteFavorite] = useDeleteFavoriteMutation()

  const savedIds = useMemo(() => {
    const ids = new Set<string>()
    for (const record of favorites ?? []) {
      if (favoriteRecordType(record) !== 'event') continue
      const id = favoriteItemId(record)
      if (id) ids.add(id)
    }
    return ids
  }, [favorites])

  function isFavourite(eventId: unknown) {
    if (!isNumericId(eventId)) return false
    return savedIds.has(String(eventId))
  }

  async function toggleFavourite(eventId: unknown) {
    if (!isNumericId(eventId)) return false
    if (!isAuthenticated) {
      navigate(`/sign-in?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)
      return false
    }
    const id = String(eventId)
    if (savedIds.has(id)) {
      await deleteFavorite(id).unwrap()
      return true
    }
    await addFavorite(id).unwrap()
    return true
  }

  return { isFavourite, toggleFavourite, canFavourite: isNumericId }
}
