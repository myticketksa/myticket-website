import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGetFavoritesQuery } from '@/app/api/accountApis'
import {
  useFavoriteTalentMutation,
  useUnfavoriteTalentMutation,
} from '@/app/api/talentsApi'
import { useAppSelector } from '@/app/hooks'
import { selectIsAuthenticated } from '@/features/auth/authSlice'
import { favoriteItemId, favoriteRecordType } from '@/lib/favorites/mapFavoriteRecord'

const STORAGE_KEY = 'myticket.talent_favorites'

export function readTalentFavoriteIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.map(String))
  } catch {
    return new Set()
  }
}

export function writeTalentFavoriteIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

function isNumericId(value: unknown): value is string | number {
  return value != null && /^\d+$/.test(String(value))
}

/** Talent favourite toggle — API list + localStorage mirror. */
export function useTalentFavorites() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const { data: favorites } = useGetFavoritesQuery(undefined, { skip: !isAuthenticated })
  const [favoriteTalent] = useFavoriteTalentMutation()
  const [unfavoriteTalent] = useUnfavoriteTalentMutation()
  const [localIds, setLocalIds] = useState<Set<string>>(() => readTalentFavoriteIds())

  const apiIds = useMemo(() => {
    const ids = new Set<string>()
    for (const record of favorites ?? []) {
      if (favoriteRecordType(record) !== 'talent') continue
      const id = favoriteItemId(record)
      if (id) ids.add(id)
    }
    return ids
  }, [favorites])

  useEffect(() => {
    if (apiIds.size === 0 && !favorites) return
    const merged = new Set([...readTalentFavoriteIds(), ...apiIds])
    writeTalentFavoriteIds(merged)
    setLocalIds(merged)
  }, [apiIds, favorites])

  const savedIds = useMemo(() => new Set([...localIds, ...apiIds]), [localIds, apiIds])

  const isFavourite = useCallback(
    (talentId: unknown) => {
      if (!isNumericId(talentId)) return false
      return savedIds.has(String(talentId))
    },
    [savedIds],
  )

  const toggleFavourite = useCallback(
    async (talentId: unknown) => {
      if (!isNumericId(talentId)) return false
      if (!isAuthenticated) {
        navigate(`/sign-in?next=${encodeURIComponent(location.pathname + location.search)}`)
        return false
      }
      const id = String(talentId)
      const next = new Set(savedIds)
      const removing = next.has(id)

      try {
        if (removing) {
          await unfavoriteTalent(id).unwrap()
          next.delete(id)
        } else {
          await favoriteTalent(id).unwrap()
          next.add(id)
        }
      } catch (error) {
        try {
          if (removing) {
            await favoriteTalent(id).unwrap()
            next.add(id)
          } else {
            await unfavoriteTalent(id).unwrap()
            next.delete(id)
          }
        } catch {
          throw error
        }
      }

      writeTalentFavoriteIds(next)
      setLocalIds(next)
      return true
    },
    [
      favoriteTalent,
      isAuthenticated,
      location.pathname,
      location.search,
      navigate,
      savedIds,
      unfavoriteTalent,
    ],
  )

  return { isFavourite, toggleFavourite, canFavourite: isNumericId }
}
