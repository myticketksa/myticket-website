import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useAddFavoriteMutation,
  useDeleteFavoriteMutation,
  useGetFavoritesQuery,
} from '@/app/api/accountApis'
import { useAppSelector } from '@/app/hooks'
import { selectIsAuthenticated } from '@/features/auth/authSlice'

function favoriteEventId(record: Record<string, unknown>): string | undefined {
  const nested =
    record.event && typeof record.event === 'object'
      ? (record.event as Record<string, unknown>)
      : record.favoritable && typeof record.favoritable === 'object'
        ? (record.favoritable as Record<string, unknown>)
        : undefined
  const raw = record.event_id ?? record.eventId ?? record.favoritable_id ?? nested?.id
  return raw == null ? undefined : String(raw)
}

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
      const id = favoriteEventId(record)
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
